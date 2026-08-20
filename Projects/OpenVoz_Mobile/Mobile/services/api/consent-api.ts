import { getApiEnvironment, getCurrentApiEnvironmentName } from '../../utils/env';
import { apiClient } from './api-client';

function buildConsentUrl() {
  const environment = getApiEnvironment(getCurrentApiEnvironmentName());
  return `${environment.siteUrl}/api/mobile/consent/`;
}

export const consentApi = {
  async getConsent() {
    return apiClient.request<Response>(buildConsentUrl(), {
      responseType: 'response',
      timeoutMs: 8000,
    });
  },

  async updateConsent(body: { [key: string]: boolean }) {
    return apiClient.request<Response>(buildConsentUrl(), {
      body,
      method: 'PATCH',
      responseType: 'response',
      timeoutMs: 8000,
    });
  },
};
