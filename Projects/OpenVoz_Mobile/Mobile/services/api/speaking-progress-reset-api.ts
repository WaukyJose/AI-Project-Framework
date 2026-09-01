import { apiClient } from './api-client';

export interface SpeakingProgressResetResponse {
  ok: boolean;
}

export const speakingProgressResetApi = {
  async reset() {
    return apiClient.request<SpeakingProgressResetResponse>('../mobile/speaking-progress-reset/', {
      body: {},
      method: 'POST',
      timeoutMs: 8000,
    });
  },
};
