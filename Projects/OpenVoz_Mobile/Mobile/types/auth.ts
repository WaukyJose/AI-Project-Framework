import { ApiEnvironmentName } from '../utils/env';

export interface AuthUser {
  displayName: string | null;
  identifier: string;
}

export interface AuthSession {
  csrfToken: string | null;
  environmentName: ApiEnvironmentName;
  expiresAt: string | null;
  sessionCookie: string | null;
  user: AuthUser;
}

export interface LoginCredentials {
  password: string;
  username: string;
}

export interface LoginResult {
  session: AuthSession;
  user: AuthUser;
}
