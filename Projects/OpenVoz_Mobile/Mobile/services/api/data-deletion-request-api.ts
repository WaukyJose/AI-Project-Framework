import { apiClient } from './api-client';

export interface DataDeletionRequestResponse {
  created: boolean;
  reason: string;
  status: 'requested' | 'processing' | 'completed' | 'rejected';
}

export const dataDeletionRequestApi = {
  async create(reason?: string) {
    return apiClient.request<Response>('/api/mobile/data-deletion-request/', {
      body: reason ? { reason } : {},
      method: 'POST',
      responseType: 'response',
      baseUrlType: 'site',
      timeoutMs: 8000,
    });
  },
};
