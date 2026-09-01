const isReleaseProfile = ['preview', 'production'].includes(process.env.EAS_BUILD_PROFILE);

const developmentEnvironment = {
  label: 'Development',
  siteUrl:
    process.env.EXPO_PUBLIC_OPENVOZ_DEVELOPMENT_SITE_URL ?? 'http://192.168.100.135:8000',
  apiBaseUrl:
    process.env.EXPO_PUBLIC_OPENVOZ_DEVELOPMENT_API_BASE_URL ??
    'http://192.168.100.135:8000/api/v1',
  connectivityPath: '/usersvoicechat/login/',
  versionPath: '/api/version/',
};

const stagingEnvironment = {
  label: 'Staging',
  siteUrl: process.env.EXPO_PUBLIC_OPENVOZ_STAGING_SITE_URL ?? 'https://staging.openvoz.com',
  apiBaseUrl:
    process.env.EXPO_PUBLIC_OPENVOZ_STAGING_API_BASE_URL ?? 'https://staging.openvoz.com/api/v1',
  connectivityPath: '/usersvoicechat/login/',
  versionPath: '/api/version/',
};

const productionEnvironment = {
  label: 'Production',
  siteUrl: process.env.EXPO_PUBLIC_OPENVOZ_PRODUCTION_SITE_URL ?? 'https://www.openvoz.com',
  apiBaseUrl:
    process.env.EXPO_PUBLIC_OPENVOZ_PRODUCTION_API_BASE_URL ?? 'https://www.openvoz.com/api/v1',
  connectivityPath: '/usersvoicechat/login/',
  versionPath: '/api/version/',
};

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    package: 'com.openvoz.mobile',
  },
  extra: {
    ...config.extra,
    openVozApi: isReleaseProfile
      ? {
          defaultEnvironment: 'production',
          environments: {
            production: productionEnvironment,
          },
        }
      : {
          defaultEnvironment: 'development',
          environments: {
            development: developmentEnvironment,
            staging: stagingEnvironment,
            production: productionEnvironment,
          },
        },
  },
});
