import {
  ApiEnvironmentName,
  getApiEnvironment,
  getCurrentApiEnvironmentName,
} from '../../utils/env';
import { logger } from '../../utils/logger';

export type HttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
export type ResponseType = 'json' | 'response' | 'text';

export type ApiErrorCode =
  | 'authentication_expired'
  | 'forbidden'
  | 'invalid_json'
  | 'network_unavailable'
  | 'server_error'
  | 'server_unavailable'
  | 'timeout'
  | 'unknown';

export interface ApiClientRequestOptions extends Omit<RequestInit, 'body' | 'headers' | 'method'> {
  body?: BodyInit | null | object;
  environmentName?: ApiEnvironmentName;
  headers?: Record<string, string>;
  method?: HttpMethod;
  responseType?: ResponseType;
  timeoutMs?: number;
}

export interface ApiClientContext {
  fullUrl: string;
  options: ApiClientRequestOptions;
}

export interface ApiInterceptor {
  onRequest?: (context: ApiClientContext) => ApiClientContext | Promise<ApiClientContext>;
  onResponse?: (response: Response, context: ApiClientContext) => Response | Promise<Response>;
  onError?: (error: ApiError, context: ApiClientContext) => ApiError | Promise<ApiError>;
}

export interface BackendDiagnostics {
  apiAvailable: boolean;
  apiBaseUrl: string;
  checkedAt: string;
  environment: string;
  latencyMs: number;
  siteAvailable: boolean;
  siteStatusCode: number | null;
  version: string | null;
  versionStatusCode: number | null;
}

type AuthTokenProvider = () => Promise<string | null> | string | null;

let authTokenProvider: AuthTokenProvider | null = null;

export function registerAuthTokenProvider(provider: AuthTokenProvider) {
  authTokenProvider = provider;
}

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly details?: unknown;
  readonly status?: number;
  readonly url: string;

  constructor(
    message: string,
    {
      code,
      details,
      status,
      url,
    }: {
      code: ApiErrorCode;
      details?: unknown;
      status?: number;
      url: string;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
    this.url = url;
  }

  getUserMessage() {
    switch (this.code) {
      case 'network_unavailable':
        return 'No internet connection is available.';
      case 'server_unavailable':
        return 'The OpenVoz backend is currently unavailable.';
      case 'timeout':
        return 'The request took too long and timed out.';
      case 'authentication_expired':
        return 'Your session is no longer valid.';
      case 'forbidden':
        return 'You do not have permission to access this resource.';
      case 'invalid_json':
        return 'The backend returned an invalid response.';
      case 'server_error':
        return 'The backend returned an unexpected server error.';
      default:
        return 'An unexpected error occurred while contacting the backend.';
    }
  }
}

function buildHeaders(responseType: ResponseType, headers?: Record<string, string>) {
  const baseHeaders: Record<string, string> = {
    Accept:
      responseType === 'json'
        ? 'application/json'
        : responseType === 'response'
          ? '*/*'
          : 'text/html,application/xhtml+xml',
    'X-Requested-With': 'OpenVozMobile',
  };

  return {
    ...baseHeaders,
    ...headers,
  };
}

async function withAuthHeader(headers: Record<string, string>) {
  if (!authTokenProvider || headers.Authorization) {
    return headers;
  }

  const token = await authTokenProvider();
  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

function serializeBody(body: ApiClientRequestOptions['body']) {
  if (
    !body ||
    typeof body !== 'object' ||
    body instanceof FormData ||
    body instanceof URLSearchParams
  ) {
    return body ?? null;
  }

  if ('password' in body && typeof body.password === 'string') {
    console.log('PASSWORD_DEBUG_BEFORE_JSON_SERIALIZE=', JSON.stringify(body.password));
  }

  return JSON.stringify(body);
}

function buildRequestUrl(path: string, baseUrl: string) {
  if (path.startsWith('http')) {
    return path;
  }

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.replace(/^\/+/, '');
  return new URL(normalizedPath, normalizedBaseUrl).toString();
}

function classifyFetchFailure(error: unknown, url: string) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return new ApiError('Request timed out', {
      code: 'timeout',
      url,
    });
  }

  if (error instanceof Error) {
    return new ApiError(error.message, {
      code: 'network_unavailable',
      details: error,
      url,
    });
  }

  return new ApiError('Unknown request failure', {
    code: 'unknown',
    details: error,
    url,
  });
}

function classifyStatusError(response: Response, url: string) {
  if (response.status === 401) {
    return new ApiError('Authentication expired', {
      code: 'authentication_expired',
      status: response.status,
      url,
    });
  }

  if (response.status === 403) {
    return new ApiError('Request forbidden', {
      code: 'forbidden',
      status: response.status,
      url,
    });
  }

  if (response.status >= 500) {
    return new ApiError('Server error', {
      code: 'server_error',
      status: response.status,
      url,
    });
  }

  if (response.status >= 400) {
    return new ApiError(`Request failed with status ${response.status}`, {
      code: 'server_unavailable',
      status: response.status,
      url,
    });
  }

  return null;
}

export class ApiClient {
  private readonly interceptors: ApiInterceptor[];
  private readonly timeoutMs: number;

  constructor({
    interceptors = [],
    timeoutMs = 10000,
  }: {
    interceptors?: ApiInterceptor[];
    timeoutMs?: number;
  } = {}) {
    this.interceptors = interceptors;
    this.timeoutMs = timeoutMs;
  }

  async request<T>(path: string, options: ApiClientRequestOptions = {}) {
    const environment = getApiEnvironment(
      options.environmentName ?? getCurrentApiEnvironmentName()
    );
    const baseUrl = options.responseType === 'text' ? environment.siteUrl : environment.apiBaseUrl;
    const fullUrl = buildRequestUrl(path, baseUrl);
    const responseType = options.responseType ?? 'json';
    let headers = buildHeaders(responseType, options.headers);

    if (
      options.body &&
      typeof options.body === 'object' &&
      !(options.body instanceof FormData) &&
      !(options.body instanceof URLSearchParams)
    ) {
      headers['Content-Type'] = 'application/json';
    }

    headers = await withAuthHeader(headers);
    const body = serializeBody(options.body);
    const context = await this.runRequestInterceptors({
      fullUrl,
      options: {
        ...options,
        body,
        headers,
        method: options.method ?? 'GET',
        responseType,
      },
    });
    const abortController = new AbortController();
    const timeoutId = setTimeout(
      () => abortController.abort(),
      context.options.timeoutMs ?? this.timeoutMs
    );

    logger.info('api.request.start', {
      environment: environment.name,
      method: context.options.method,
      responseType,
      url: context.fullUrl,
    });

    try {
      const response = await fetch(context.fullUrl, {
        ...context.options,
        body: context.options.body as BodyInit | null | undefined,
        headers: context.options.headers,
        signal: abortController.signal,
      });
      const processedResponse = await this.runResponseInterceptors(response, context);
      const statusError = classifyStatusError(processedResponse, context.fullUrl);

      if (statusError) {
        throw statusError;
      }

      logger.info('api.request.success', {
        status: processedResponse.status,
        url: context.fullUrl,
      });

      if (responseType === 'response') {
        return processedResponse as T;
      }

      if (responseType === 'text') {
        return (await processedResponse.text()) as T;
      }

      try {
        return (await processedResponse.json()) as T;
      } catch (error) {
        throw new ApiError('Invalid JSON response', {
          code: 'invalid_json',
          details: error,
          status: processedResponse.status,
          url: context.fullUrl,
        });
      }
    } catch (error) {
      const apiError = await this.runErrorInterceptors(
        classifyFetchFailure(error, context.fullUrl),
        context
      );
      logger.error('api.request.failure', {
        code: apiError.code,
        message: apiError.message,
        status: apiError.status ?? null,
        url: context.fullUrl,
      });
      throw apiError;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getBackendDiagnostics(environmentName?: ApiEnvironmentName): Promise<BackendDiagnostics> {
    const environment = getApiEnvironment(environmentName ?? getCurrentApiEnvironmentName());
    const startedAt = Date.now();
    let siteStatusCode: number | null = null;
    let versionStatusCode: number | null = null;
    let version: string | null = null;
    let siteAvailable = false;
    let apiAvailable = false;

    try {
      const responseText = await this.request<string>(environment.connectivityPath, {
        environmentName: environment.name,
        responseType: 'text',
        timeoutMs: 8000,
      });
      siteAvailable = responseText.length > 0;
      siteStatusCode = 200;
    } catch (error) {
      if (error instanceof ApiError) {
        siteStatusCode = error.status ?? null;
      }
    }

    try {
      const response = await this.request<{ api?: string; version?: string }>(
        environment.versionPath,
        {
          environmentName: environment.name,
          responseType: 'json',
          timeoutMs: 8000,
        }
      );
      version = response.version ?? response.api ?? null;
      versionStatusCode = 200;
      apiAvailable = true;
    } catch (error) {
      if (error instanceof ApiError) {
        versionStatusCode = error.status ?? null;
      }
    }

    return {
      apiAvailable,
      apiBaseUrl: environment.apiBaseUrl,
      checkedAt: new Date().toISOString(),
      environment: environment.name,
      latencyMs: Date.now() - startedAt,
      siteAvailable,
      siteStatusCode,
      version,
      versionStatusCode,
    };
  }

  private async runRequestInterceptors(context: ApiClientContext) {
    let current = context;

    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        current = await interceptor.onRequest(current);
      }
    }

    return current;
  }

  private async runResponseInterceptors(response: Response, context: ApiClientContext) {
    let current = response;

    for (const interceptor of this.interceptors) {
      if (interceptor.onResponse) {
        current = await interceptor.onResponse(current, context);
      }
    }

    return current;
  }

  private async runErrorInterceptors(error: ApiError, context: ApiClientContext) {
    let current = error;

    for (const interceptor of this.interceptors) {
      if (interceptor.onError) {
        current = await interceptor.onError(current, context);
      }
    }

    return current;
  }
}

export const apiClient = new ApiClient();
