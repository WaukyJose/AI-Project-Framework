import { AuthService } from '../auth/AuthService';
import { handleApiError, ApiError } from './ErrorHandler';

const DEFAULT_TIMEOUT_MS = 20000;

export interface RequestOptions extends RequestInit {
  timeout?: number;
  requiresAuth?: boolean;
}

export const HttpClient = {
  getBaseUrl(): string {
    // Can be configured via environment or config constant
    return process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.openvoz.com';
  },

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      timeout = DEFAULT_TIMEOUT_MS,
      requiresAuth = true,
      headers = {},
      ...fetchOptions
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(headers as Record<string, string>),
    };

    if (requiresAuth) {
      const token = await AuthService.getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const url = `${this.getBaseUrl()}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let responseData: unknown = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        const apiError = handleApiError(response.status, responseData);
        if (response.status === 401) {
          await AuthService.removeToken();
        }
        throw apiError;
      }

      return responseData as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(408, 'request_timeout', 'The request timed out. Please try again.');
      }

      throw new ApiError(
        0,
        'network_error',
        error instanceof Error ? error.message : 'Network request failed.'
      );
    }
  },

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  async post<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
};
