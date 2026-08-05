import { getApiEnvironment, getCurrentApiEnvironmentName } from '../../utils/env';
import { apiClient } from './api-client';

function buildDashboardUrl() {
  const environment = getApiEnvironment(getCurrentApiEnvironmentName());
  return `${environment.siteUrl}/api/mobile/dashboard/`;
}

export const dashboardApi = {
  async getDashboard() {
    return apiClient.request<Response>(buildDashboardUrl(), {
      responseType: 'response',
      timeoutMs: 8000,
    });
  },
};
