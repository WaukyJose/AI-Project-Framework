/**
 * @jest-environment node
 */

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        openVozApi: {
          defaultEnvironment: 'production',
          environments: {
            production: {
              apiBaseUrl: 'https://example.com/api/v1',
              connectivityPath: '/usersvoicechat/login/',
              label: 'Production',
              siteUrl: 'https://example.com',
              versionPath: '/api/version/',
            },
          },
        },
      },
    },
  },
}));

jest.mock('../services/profile/profile-service', () => ({
  profileService: {
    getAuthenticatedProfile: jest.fn().mockResolvedValue({
      displayName: 'Mobile User',
      email: 'mobile@example.com',
      firstName: 'Mobile',
      fullName: 'Mobile User',
      id: 1,
      identifier: 'mobile-user',
      lastName: 'User',
      username: 'mobile-user',
    }),
  },
}));

jest.mock('../services/auth/auth-storage', () => ({
  authStorage: {
    clearSession: jest.fn(),
    readSession: jest.fn().mockResolvedValue(null),
    writeSession: jest.fn(),
  },
}));

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

import { apiClient, registerAuthTokenProvider } from '../services/api/api-client';
import { authService } from '../services/auth/auth-service';

describe('auth api/client behavior', () => {
  const originalFetch = global.fetch;
  const originalWarn = console.warn;
  const originalError = console.error;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    registerAuthTokenProvider(() => null);
    jest.restoreAllMocks();
    console.warn = originalWarn;
    console.error = originalError;
  });

  it('does not attach Authorization to login requests', async () => {
    registerAuthTokenProvider(() => 'stale-token');

    const fetchMock = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          authenticated: true,
          token: 'fresh-token',
          user: {
            display_name: 'Mobile User',
            email: 'mobile@example.com',
            id: 1,
            identifier: 'mobile-user',
            is_staff: false,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    global.fetch = fetchMock as typeof fetch;

    await apiClient.request('/auth/login/', {
      body: { password: 'testpass123', username: 'mobile-user' },
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      method: 'POST',
      responseType: 'response',
      skipAuthHeader: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, requestInit] = fetchMock.mock.calls[0];
    const headers = new Headers((requestInit as RequestInit).headers);
    expect(headers.get('Authorization')).toBeNull();
  });

  it('preserves backend invalid_credentials for login failures', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          authenticated: false,
          error: {
            code: 'invalid_credentials',
            message: 'Invalid username or password.',
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    );
    global.fetch = fetchMock as typeof fetch;

    await expect(
      authService.login({ username: 'mobile-user', password: 'wrong' })
    ).rejects.toMatchObject({
      code: 'invalid_credentials',
      message: 'Invalid credentials',
      status: 401,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps protected endpoint 401 responses to authentication_expired', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'authentication_required',
            message: 'Authentication required.',
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    );
    global.fetch = fetchMock as typeof fetch;

    await expect(
      apiClient.request('/mobile/dashboard/', {
        method: 'GET',
        responseType: 'json',
      })
    ).rejects.toMatchObject({
      code: 'authentication_expired',
      message: 'Authentication expired',
      status: 401,
    });
  });

  it('returns a usable Response for successful responseType=response requests', async () => {
    const response = new Response('{"ok":true}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    const fetchMock = jest.fn().mockResolvedValue(response);
    global.fetch = fetchMock as typeof fetch;

    const result = await apiClient.request<Response>('/auth/login/', {
      body: { password: 'testpass123', username: 'mobile-user' },
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      method: 'POST',
      responseType: 'response',
      skipAuthHeader: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(response);
    expect(await result.text()).toBe('{"ok":true}');
  });

  it('logs expected 4xx API failures as warn and keeps 5xx as error', async () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const fourXFetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'invalid_credentials',
            message: 'Invalid username or password.',
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    );
    global.fetch = fourXFetch as typeof fetch;

    await expect(
      apiClient.request('/auth/login/', {
        body: { password: 'wrong', username: 'mobile-user' },
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        method: 'POST',
        responseType: 'response',
        skipAuthHeader: true,
      })
    ).rejects.toMatchObject({
      code: 'invalid_credentials',
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('"event":"api.request.failure"')
    );
    expect(errorSpy).not.toHaveBeenCalled();

    warnSpy.mockClear();
    errorSpy.mockClear();

    const fiveXFetch = jest.fn().mockResolvedValue(
      new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      })
    );
    global.fetch = fiveXFetch as typeof fetch;

    await expect(
      apiClient.request('/mobile/dashboard/', {
        method: 'GET',
        responseType: 'json',
      })
    ).rejects.toMatchObject({
      code: 'server_error',
      status: 500,
    });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('"event":"api.request.failure"')
    );
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
  });
});
