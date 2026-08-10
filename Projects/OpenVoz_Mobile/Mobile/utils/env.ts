import Constants from 'expo-constants';

export type ApiEnvironmentName = 'development' | 'production' | 'staging';

export interface ApiEnvironment {
  apiBaseUrl: string;
  connectivityPath: string;
  label: string;
  name: ApiEnvironmentName;
  siteUrl: string;
  versionPath: string;
}

interface ApiEnvironmentMap {
  development: Omit<ApiEnvironment, 'name'>;
  production: Omit<ApiEnvironment, 'name'>;
  staging: Omit<ApiEnvironment, 'name'>;
}

interface OpenVozApiExtra {
  defaultEnvironment?: ApiEnvironmentName;
  environments?: Partial<ApiEnvironmentMap>;
}

function getExtraConfig(): OpenVozApiExtra {
  const extra = Constants.expoConfig?.extra as { openVozApi?: OpenVozApiExtra } | undefined;
  return extra?.openVozApi ?? {};
}

function getOverride(name: ApiEnvironmentName, key: 'apiBaseUrl' | 'siteUrl') {
  const overrideMap: Record<
    ApiEnvironmentName,
    Record<'apiBaseUrl' | 'siteUrl', string | undefined>
  > = {
    development: {
      apiBaseUrl: process.env.EXPO_PUBLIC_OPENVOZ_DEVELOPMENT_API_BASE_URL,
      siteUrl: process.env.EXPO_PUBLIC_OPENVOZ_DEVELOPMENT_SITE_URL,
    },
    production: {
      apiBaseUrl: process.env.EXPO_PUBLIC_OPENVOZ_PRODUCTION_API_BASE_URL,
      siteUrl: process.env.EXPO_PUBLIC_OPENVOZ_PRODUCTION_SITE_URL,
    },
    staging: {
      apiBaseUrl: process.env.EXPO_PUBLIC_OPENVOZ_STAGING_API_BASE_URL,
      siteUrl: process.env.EXPO_PUBLIC_OPENVOZ_STAGING_SITE_URL,
    },
  };

  return overrideMap[name][key];
}

const fallbackEnvironments: Record<ApiEnvironmentName, Omit<ApiEnvironment, 'name'>> = {
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
};

export function getApiEnvironment(name: ApiEnvironmentName): ApiEnvironment {
  const extra = getExtraConfig();
  const configured = extra.environments?.[name];
  const fallback = fallbackEnvironments[name];

  return {
    apiBaseUrl: getOverride(name, 'apiBaseUrl') ?? configured?.apiBaseUrl ?? fallback.apiBaseUrl,
    connectivityPath: configured?.connectivityPath ?? fallback.connectivityPath,
    label: configured?.label ?? fallback.label,
    name,
    siteUrl: getOverride(name, 'siteUrl') ?? configured?.siteUrl ?? fallback.siteUrl,
    versionPath: configured?.versionPath ?? fallback.versionPath,
  };
}

export function getCurrentApiEnvironmentName(): ApiEnvironmentName {
  return getExtraConfig().defaultEnvironment ?? 'production';
}

export function getCurrentApiEnvironment() {
  return getApiEnvironment(getCurrentApiEnvironmentName());
}

export function getAvailableApiEnvironments() {
  return (['development', 'staging', 'production'] as ApiEnvironmentName[]).map((name) =>
    getApiEnvironment(name)
  );
}

export function getAppName() {
  return Constants.expoConfig?.name ?? 'OpenVoz Mobile';
}
