import { ApiEnvironmentName, getApiEnvironment, getCurrentApiEnvironmentName } from '../../utils/env';
import { apiClient } from './api-client';

function buildProfileUrl(environmentName = getCurrentApiEnvironmentName()) {
  const environment = getApiEnvironment(environmentName);
  return `${environment.siteUrl}/api/mobile/profile/`;
}

export const profileApi = {
  async getProfile({
    environmentName,
    headers,
  }: {
    environmentName?: ApiEnvironmentName;
    headers?: Record<string, string>;
  } = {}) {
    return apiClient.request<Response>(buildProfileUrl(environmentName), {
      environmentName,
      headers,
      responseType: 'response',
      timeoutMs: 8000,
    });
  },
};
