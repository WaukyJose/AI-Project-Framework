/**
 * @jest-environment node
 */

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        openVozApi: {
          defaultEnvironment: 'staging',
          environments: {
            development: {
              apiBaseUrl: 'http://192.168.100.132:8000/api/v1',
              connectivityPath: '/usersvoicechat/login/',
              label: 'Development',
              siteUrl: 'http://192.168.100.132:8000',
              versionPath: '/api/version/',
            },
            production: {
              apiBaseUrl: 'https://www.openvoz.com/api/v1',
              connectivityPath: '/usersvoicechat/login/',
              label: 'Production',
              siteUrl: 'https://www.openvoz.com',
              versionPath: '/api/version/',
            },
            staging: {
              apiBaseUrl: 'https://staging.openvoz.com/api/v1',
              connectivityPath: '/usersvoicechat/login/',
              label: 'Staging',
              siteUrl: 'https://staging.openvoz.com',
              versionPath: '/api/version/',
            },
          },
        },
      },
    },
  },
}));

function loadModules(isDevelopmentBuild: boolean) {
  (globalThis as { __DEV__?: boolean }).__DEV__ = isDevelopmentBuild;

  let env: typeof import('../utils/env');
  let connectivityStore: typeof import('../store/connectivity-store');

  jest.isolateModules(() => {
    env = require('../utils/env');
    connectivityStore = require('../store/connectivity-store');
  });

  return {
    connectivityStore: connectivityStore!,
    env: env!,
  };
}

describe('api environment selection', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('forces release builds onto production only', () => {
    const { connectivityStore, env } = loadModules(false);

    expect(env.getCurrentApiEnvironmentName()).toBe('production');
    expect(env.getAvailableApiEnvironments()).toEqual([
      expect.objectContaining({
        name: 'production',
        apiBaseUrl: 'https://www.openvoz.com/api/v1',
        siteUrl: 'https://www.openvoz.com',
      }),
    ]);
    expect(env.getApiEnvironment('development')).toEqual(
      expect.objectContaining({
        name: 'production',
        apiBaseUrl: 'https://www.openvoz.com/api/v1',
        siteUrl: 'https://www.openvoz.com',
      })
    );
    expect(env.getApiEnvironment('staging')).toEqual(
      expect.objectContaining({
        name: 'production',
        apiBaseUrl: 'https://www.openvoz.com/api/v1',
        siteUrl: 'https://www.openvoz.com',
      })
    );

    const store = connectivityStore.useConnectivityStore;
    expect(store.getState().selectedEnvironment).toBe('production');

    store.getState().setSelectedEnvironment('development');
    expect(store.getState().selectedEnvironment).toBe('production');

    store.getState().setSelectedEnvironment('staging');
    expect(store.getState().selectedEnvironment).toBe('production');
  });

  it('keeps development builds switchable across environments', () => {
    const { connectivityStore, env } = loadModules(true);

    expect(env.getCurrentApiEnvironmentName()).toBe('staging');
    expect(env.getAvailableApiEnvironments().map((item) => item.name)).toEqual([
      'development',
      'staging',
      'production',
    ]);
    expect(env.getApiEnvironment('development')).toEqual(
      expect.objectContaining({
        name: 'development',
        apiBaseUrl: 'http://192.168.100.132:8000/api/v1',
        siteUrl: 'http://192.168.100.132:8000',
      })
    );

    const store = connectivityStore.useConnectivityStore;
    expect(store.getState().selectedEnvironment).toBe('staging');

    store.getState().setSelectedEnvironment('development');
    expect(store.getState().selectedEnvironment).toBe('development');

    store.getState().setSelectedEnvironment('production');
    expect(store.getState().selectedEnvironment).toBe('production');
  });
});
