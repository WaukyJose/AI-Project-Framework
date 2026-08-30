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

export function isApiEnvironmentSelectionEnabled() {
  return __DEV__;
}

function getExtraConfig(): OpenVozApiExtra {
  const extra = Constants.expoConfig?.extra as { openVozApi?: OpenVozApiExtra } | undefined;
  return extra?.openVozApi ?? {};
}

const fallbackEnvironment: Omit<ApiEnvironment, 'name'> = {
  apiBaseUrl: 'https://www.openvoz.com/api/v1',
  connectivityPath: '/usersvoicechat/login/',
  label: 'Production',
  siteUrl: 'https://www.openvoz.com',
  versionPath: '/api/version/',
};

export function getApiEnvironment(name: ApiEnvironmentName): ApiEnvironment {
  const effectiveName = isApiEnvironmentSelectionEnabled() ? name : 'production';
  const extra = getExtraConfig();
  const configured = extra.environments?.[effectiveName] ?? extra.environments?.production;
  const fallback = fallbackEnvironment;

  return {
    apiBaseUrl: configured?.apiBaseUrl ?? fallback.apiBaseUrl,
    connectivityPath: configured?.connectivityPath ?? fallback.connectivityPath,
    label: configured?.label ?? fallback.label,
    name: effectiveName,
    siteUrl: configured?.siteUrl ?? fallback.siteUrl,
    versionPath: configured?.versionPath ?? fallback.versionPath,
  };
}

export function getCurrentApiEnvironmentName(): ApiEnvironmentName {
  if (!isApiEnvironmentSelectionEnabled()) {
    return 'production';
  }

  return getExtraConfig().defaultEnvironment ?? 'production';
}

export function getCurrentApiEnvironment() {
  return getApiEnvironment(getCurrentApiEnvironmentName());
}

export function getAvailableApiEnvironments() {
  if (!isApiEnvironmentSelectionEnabled()) {
    return [getApiEnvironment('production')];
  }

  return (['development', 'staging', 'production'] as ApiEnvironmentName[]).map((name) =>
    getApiEnvironment(name)
  );
}

export function getAppName() {
  return Constants.expoConfig?.name ?? 'OpenVoz Mobile';
}
