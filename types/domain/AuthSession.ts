import { User } from './User';

export interface ApiError {
  readonly code: string;
  readonly message: string;
}

export interface ApiErrorResponse {
  readonly authenticated: false;
  readonly error: ApiError;
}

export interface AuthSession {
  readonly authenticated: true;
  readonly token: string;
  readonly user: User;
}

export type AuthResponse = AuthSession | ApiErrorResponse;
