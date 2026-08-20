import { getApiEnvironment, getCurrentApiEnvironmentName } from '../../utils/env';
import { apiClient } from './api-client';

function buildProgressUrl(language: 'en' | 'es') {
  const environment = getApiEnvironment(getCurrentApiEnvironmentName());
  return `${environment.siteUrl}/api/mobile/progress/?language=${language}`;
}

export const progressApi = {
  async getProgress(language: 'en' | 'es') {
    return apiClient.request<Response>(buildProgressUrl(language), {
      responseType: 'response',
      timeoutMs: 8000,
    });
  },
};

