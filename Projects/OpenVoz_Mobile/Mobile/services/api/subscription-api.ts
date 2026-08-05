import { getApiEnvironment, getCurrentApiEnvironmentName } from '../../utils/env';
import { apiClient } from './api-client';

function buildSubscriptionUrl() {
  const environment = getApiEnvironment(getCurrentApiEnvironmentName());
  return `${environment.siteUrl}/api/mobile/subscription/`;
}

export const subscriptionApi = {
  async getSubscription() {
    return apiClient.request<Response>(buildSubscriptionUrl(), {
      responseType: 'response',
      timeoutMs: 8000,
    });
  },
};
