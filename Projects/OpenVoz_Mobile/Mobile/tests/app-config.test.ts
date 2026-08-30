/**
 * @jest-environment node
 */

type ExpoConfig = {
  extra?: {
    openVozApi?: {
      defaultEnvironment?: string;
      environments?: Record<string, unknown>;
    };
  };
};

const baseConfig = {
  extra: {
    router: {},
    eas: {
      projectId: 'fa079bb3-27c2-45ee-a262-7145a16edc7d',
    },
  },
  name: 'OpenVoz Mobile',
};

function loadConfig(profile?: string): ExpoConfig {
  if (profile === undefined) {
    delete process.env.EAS_BUILD_PROFILE;
  } else {
    process.env.EAS_BUILD_PROFILE = profile;
  }

  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const appConfig = require('../app.config.js');

  return appConfig({ config: baseConfig });
}

describe('app config openVozApi environments', () => {
  afterEach(() => {
    delete process.env.EAS_BUILD_PROFILE;
    jest.resetModules();
  });

  it('keeps release builds locked to production only', () => {
    const config = loadConfig('production');
    const openVozApi = config.extra?.openVozApi;

    expect(openVozApi?.defaultEnvironment).toBe('production');
    expect(Object.keys(openVozApi?.environments ?? {})).toEqual(['production']);

    const serialized = JSON.stringify(openVozApi);
    expect(serialized).toContain('https://www.openvoz.com');
    expect(serialized).not.toContain('192.168.100.135');
    expect(serialized).not.toContain('staging.openvoz.com');
  });

  it('keeps local development environments available outside release builds', () => {
    const config = loadConfig();
    const openVozApi = config.extra?.openVozApi;

    expect(openVozApi?.defaultEnvironment).toBe('development');
    expect(Object.keys(openVozApi?.environments ?? {})).toEqual([
      'development',
      'staging',
      'production',
    ]);
    expect(openVozApi?.environments?.development).toEqual(
      expect.objectContaining({
        apiBaseUrl: 'http://192.168.100.135:8000/api/v1',
        siteUrl: 'http://192.168.100.135:8000',
      })
    );
  });
});
