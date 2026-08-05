import { UserDto } from './UserDto';

/**
 * Request body for POST /api/v1/auth/login/
 */
export interface LoginRequestDto {
  username: string;
  password: string;
}

/**
 * Successful auth response (login / validate).
 * authenticated is always true.
 */
export interface AuthSuccessDto {
  authenticated: true;
  token: string;
  user: UserDto;
}

/**
 * Error auth response envelope.
 * authenticated is always false.
 */
export interface AuthErrorDto {
  authenticated: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Union of all possible auth endpoint responses.
 */
export type AuthResponseDto = AuthSuccessDto | AuthErrorDto;

/**
 * Response body for POST /api/v1/auth/logout/
 */
export interface LogoutResponseDto {
  authenticated: false;
  logged_out: true;
}
