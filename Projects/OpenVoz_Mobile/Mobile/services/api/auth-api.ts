import { apiClient } from './api-client';

export const authApi = {
  async fetchLoginPage() {
    return apiClient.request<Response>('/usersvoicechat/login/', {
      credentials: 'include',
      responseType: 'response',
      timeoutMs: 10000,
    });
  },
  async validateBackendSessionPage() {
    return apiClient.request<string>('/usersvoicechat/login/', {
      credentials: 'include',
      responseType: 'text',
      timeoutMs: 8000,
    });
  },
};
