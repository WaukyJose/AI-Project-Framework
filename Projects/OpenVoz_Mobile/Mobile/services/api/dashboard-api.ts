import { getApiEnvironment, getCurrentApiEnvironmentName } from '../../utils/env';
import { apiClient } from './api-client';

function buildDashboardUrl(language: 'en' | 'es') {
  const environment = getApiEnvironment(getCurrentApiEnvironmentName());
  return `${environment.siteUrl}/api/mobile/dashboard/?language=${language}`;
}

export const dashboardApi = {
  async getDashboard(language: 'en' | 'es') {
    return apiClient.request<Response>(buildDashboardUrl(language), {
      responseType: 'response',
      timeoutMs: 8000,
    });
  },
};
