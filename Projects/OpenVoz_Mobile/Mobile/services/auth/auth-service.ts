import { AuthSession, AuthUser, LoginCredentials, LoginResult } from '../../types/auth';
import {
  ApiEnvironmentName,
  getApiEnvironment,
  getCurrentApiEnvironmentName,
} from '../../utils/env';
import { logger } from '../../utils/logger';
import { ApiError, apiClient } from '../api';
import { authStorage } from './auth-storage';
import { createSessionCookieHeader, isSessionExpired, sanitizeAuthSession } from './auth-session';

const LOGIN_PATH = '/usersvoicechat/login/';
const PASSWORD_RESET_PATH = '/members/accounts/password_reset/';

function extractCsrfToken(document: string) {
  const match = document.match(/name="csrfmiddlewaretoken"\s+value="([^"]+)"/i);
  return match?.[1] ?? null;
}

function extractCookieValue(setCookieHeader: string | null, cookieName: string) {
  if (!setCookieHeader) {
    return null;
  }

  const cookieSegments = setCookieHeader.split(/,(?=[^;,]+=)/);

  for (const segment of cookieSegments) {
    const match = segment.match(new RegExp(`${cookieName}=([^;]+)`));

    if (match) {
      return match[1];
    }
  }

  return null;
}

function buildCookieHeader(values: (string | null)[]) {
  return values.filter((value): value is string => Boolean(value)).join('; ');
}

function buildUser(identifier: string): AuthUser {
  return {
    displayName: null,
    identifier: identifier.trim(),
  };
}

function computeSessionExpiry(rememberMe: boolean) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + (rememberMe ? 30 : 7));
  return expiry.toISOString();
}

function classifyLoginFailure(responseBody: string, url: string) {
  if (responseBody.includes('csrfmiddlewaretoken')) {
    return new ApiError('Invalid credentials', {
      code: 'authentication_expired',
      details: {
        reason: 'invalid_credentials',
      },
      status: 401,
      url,
    });
  }

  return new ApiError('Authentication failed', {
    code: 'server_unavailable',
    details: {
      reason: 'unexpected_login_response',
    },
    status: 500,
    url,
  });
}

async function fetchLoginBootstrap(environmentName: ApiEnvironmentName) {
  const response = await apiClient.request<Response>(LOGIN_PATH, {
    credentials: 'include',
    environmentName,
    headers: {
      Accept: 'text/html,application/xhtml+xml',
    },
    responseType: 'response',
    timeoutMs: 10000,
  });
  const document = await response.text();
  const csrfToken = extractCsrfToken(document);
  const cookieHeader = response.headers.get('set-cookie');
  const csrfCookie = extractCookieValue(cookieHeader, 'csrftoken');

  if (!csrfToken) {
    throw new ApiError('Login bootstrap failed', {
      code: 'invalid_json',
      details: {
        reason: 'missing_csrf_token',
      },
      status: response.status,
      url: response.url,
    });
  }

  return {
    csrfCookie,
    csrfToken,
  };
}

export const authService = {
  async currentUser() {
    const session = await authStorage.readSession();
    return session?.user ?? null;
  },

  getPasswordResetUrl(environmentName = getCurrentApiEnvironmentName()) {
    const environment = getApiEnvironment(environmentName);
    return new URL(PASSWORD_RESET_PATH, `${environment.siteUrl}/`).toString();
  },

  async isAuthenticated() {
    const session = await authStorage.readSession();

    if (!session || isSessionExpired(session)) {
      return false;
    }

    return Boolean(session.sessionCookie || session.csrfToken);
  },

  async login(
    credentials: LoginCredentials,
    {
      environmentName = getCurrentApiEnvironmentName(),
      rememberMe = true,
    }: {
      environmentName?: ApiEnvironmentName;
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

    const bootstrap = await fetchLoginBootstrap(environmentName);
    const cookieHeader = buildCookieHeader([
      bootstrap.csrfCookie ? `csrftoken=${bootstrap.csrfCookie}` : null,
    ]);
    const payload = new URLSearchParams({
      csrfmiddlewaretoken: bootstrap.csrfToken,
      password: credentials.password,
      username: identifier,
    });

    if (rememberMe) {
      payload.append('remember_me', 'on');
    }

    const response = await apiClient.request<Response>(LOGIN_PATH, {
      body: payload,
      credentials: 'include',
      environmentName,
      headers: {
        Cookie: cookieHeader,
        Referer: new URL(LOGIN_PATH, `${getApiEnvironment(environmentName).siteUrl}/`).toString(),
        'X-CSRFToken': bootstrap.csrfToken,
      },
      method: 'POST',
      redirect: 'manual',
      responseType: 'response',
      timeoutMs: 12000,
    });
    const responseBody = await response.text();
    const setCookieHeader = response.headers.get('set-cookie');
    const sessionId = extractCookieValue(setCookieHeader, 'sessionid');
    const refreshedCsrfToken =
      extractCookieValue(setCookieHeader, 'csrftoken') ?? extractCsrfToken(responseBody);

    if (!sessionId && responseBody.includes('<title>Login</title>')) {
      throw classifyLoginFailure(responseBody, response.url);
    }

    const session: AuthSession = {
      csrfToken: refreshedCsrfToken ?? bootstrap.csrfCookie ?? bootstrap.csrfToken,
      environmentName,
      expiresAt: computeSessionExpiry(rememberMe),
      sessionCookie: sessionId ? `sessionid=${sessionId}` : null,
      user: buildUser(identifier),
    };

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

    if (!session.sessionCookie && !session.csrfToken) {
      await authStorage.clearSession();
      return null;
    }

    try {
      const response = await apiClient.request<Response>(LOGIN_PATH, {
        credentials: 'include',
        environmentName: session.environmentName,
        headers: {
          Cookie: createSessionCookieHeader(session),
        },
        responseType: 'response',
        timeoutMs: 8000,
      });
      const responseBody = await response.text();

      if (responseBody.includes('<title>Login</title>') && !session.sessionCookie) {
        logger.warn('auth.session.requires_reauthentication', sanitizeAuthSession(session));
        await authStorage.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      if (error instanceof ApiError && error.code === 'network_unavailable') {
        logger.warn('auth.session.restore_offline', sanitizeAuthSession(session));
        return session;
      }

      throw error;
    }
  },
};
