import { AuthSession, LoginCredentials, LoginResult } from '../../types/auth';
import { getApiEnvironment, getCurrentApiEnvironmentName } from '../../utils/env';
import { logger } from '../../utils/logger';
import { ApiError, registerAuthTokenProvider } from '../api';
import { authApi } from '../api/auth-api';
import { authStorage } from './auth-storage';
import { isSessionExpired, sanitizeAuthSession } from './auth-session';

const LOGIN_PATH = '/auth/login/';
const PASSWORD_RESET_PATH = '/members/accounts/password_reset/';

interface MobileAuthResponse {
  authenticated: boolean;
  token?: string;
  user: {
    display_name: string | null;
    email: string | null;
    id: number;
    identifier: string;
    is_staff: boolean;
  } | null;
}

function computeSessionExpiry(rememberMe: boolean) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + (rememberMe ? 30 : 7));
  return expiry.toISOString();
}

function buildSession(
  payload: MobileAuthResponse,
  token: string,
  environmentName: AuthSession['environmentName'],
  rememberMe: boolean
): AuthSession {
  if (!payload.user) {
    throw new ApiError('Authentication response did not include a user', {
      code: 'invalid_json',
      details: payload,
      url: LOGIN_PATH,
    });
  }

  return {
    environmentName,
    expiresAt: computeSessionExpiry(rememberMe),
    token,
    user: {
      displayName: payload.user.display_name,
      identifier: payload.user.identifier,
    },
  };
}

registerAuthTokenProvider(async () => {
  const session = await authStorage.readSession();
  return session?.token ?? null;
});

export const authService = {
  async currentUser() {
    const session = await authStorage.readSession();
    return session?.user ?? null;
  },

  getPasswordResetUrl(environmentName = getCurrentApiEnvironmentName()) {
    return new URL(
      PASSWORD_RESET_PATH,
      `${getApiEnvironment(environmentName).siteUrl}/`
    ).toString();
  },

  async isAuthenticated() {
    const session = await authStorage.readSession();

    if (!session || isSessionExpired(session)) {
      return false;
    }

    return Boolean(session.token);
  },

  async login(
    credentials: LoginCredentials,
    {
      environmentName = getCurrentApiEnvironmentName(),
      rememberMe = true,
    }: {
      environmentName?: AuthSession['environmentName'];
      rememberMe?: boolean;
    } = {}
  ): Promise<LoginResult> {
    const identifier = credentials.username.trim();

    if (!identifier || !credentials.password.trim()) {
      throw new ApiError('Username and password are required', {
        code: 'authentication_expired',
        details: {
          reason: 'missing_credentials',
        },
        status: 400,
        url: LOGIN_PATH,
      });
    }

    let response: Response;

    try {
      response = await authApi.login(
        {
          password: credentials.password,
          username: identifier,
        }
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw new ApiError('Invalid credentials', {
          code: 'authentication_expired',
          details: {
            reason: 'invalid_credentials',
          },
          status: 401,
          url: LOGIN_PATH,
        });
      }

      throw error;
    }

    const payload = (await response.json()) as MobileAuthResponse;
    const token = payload.token?.trim();

    if (!payload.authenticated || !payload.user || !token) {
      throw new ApiError('Authentication failed', {
        code: 'server_unavailable',
        details: payload,
        status: response.status,
        url: response.url,
      });
    }

    const session = buildSession(payload, token, environmentName, rememberMe);

    await authStorage.writeSession(session);
    logger.info('auth.login.success', sanitizeAuthSession(session));

    return {
      session,
      user: session.user,
    };
  },

  async logout() {
    const session = await authStorage.readSession();

    if (session) {
      logger.info('auth.logout', sanitizeAuthSession(session));

      try {
        await authApi.logout({
          Authorization: `Bearer ${session.token}`,
        });
      } catch (error) {
        logger.warn('auth.logout.backend_failed', {
          error,
          session: sanitizeAuthSession(session),
        });
      }
    }

    await authStorage.clearSession();
  },

  async refreshSession() {
    return authService.restoreSession();
  },

  async restoreSession() {
    const session = await authStorage.readSession();

    if (!session) {
      return null;
    }

    if (isSessionExpired(session)) {
      logger.warn('auth.session.expired', sanitizeAuthSession(session));
      await authStorage.clearSession();
      return null;
    }

    if (!session.token) {
      await authStorage.clearSession();
      return null;
    }

    try {
      const response = await authApi.validate({
        Authorization: `Bearer ${session.token}`,
      });
      const payload = (await response.json()) as MobileAuthResponse;

      if (!payload.authenticated || !payload.user || !payload.token) {
        await authStorage.clearSession();
        return null;
      }

      const refreshedSession: AuthSession = {
        ...session,
        token: payload.token,
        user: {
          displayName: payload.user.display_name,
          identifier: payload.user.identifier,
        },
      };
      await authStorage.writeSession(refreshedSession);
      return refreshedSession;
    } catch (error) {
      if (error instanceof ApiError && error.code === 'network_unavailable') {
        logger.warn('auth.session.restore_offline', sanitizeAuthSession(session));
        return session;
      }

      if (error instanceof ApiError && error.code === 'authentication_expired') {
        await authStorage.clearSession();
        return null;
      }

      throw error;
    }
  },
};
