export interface ApiErrorDetail {
  readonly code: string;
  readonly message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(status: number, responseData: unknown): ApiError {
  let code = 'unknown_error';
  let message = 'An unexpected error occurred.';

  if (
    responseData &&
    typeof responseData === 'object' &&
    'error' in responseData &&
    responseData.error &&
    typeof responseData.error === 'object'
  ) {
    const errObj = responseData.error as Record<string, unknown>;
    if (typeof errObj.code === 'string') {
      code = errObj.code;
    }
    if (typeof errObj.message === 'string') {
      message = errObj.message;
    }
  }

  if (status === 401 && code === 'unknown_error') {
    code = 'authentication_required';
    message = 'Authentication required.';
  } else if (status === 403 && code === 'unknown_error') {
    code = 'inactive_account';
    message = 'This account is inactive.';
  } else if (status === 400 && code === 'unknown_error') {
    code = 'invalid_json';
    message = 'Invalid request payload.';
  }

  return new ApiError(status, code, message, responseData);
}
