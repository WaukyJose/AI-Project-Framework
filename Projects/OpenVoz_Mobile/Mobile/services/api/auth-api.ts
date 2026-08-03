import { apiClient } from './api-client';

export const authApi = {
  async login(body: { password: string; username: string }) {
    return apiClient.request<Response>('/auth/login/', {
      body,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      method: 'POST',
      responseType: 'response',
      timeoutMs: 10000,
    });
  },

  async logout(headers?: Record<string, string>) {
    return apiClient.request<Response>('/auth/logout/', {
      headers,
      method: 'POST',
      responseType: 'response',
      timeoutMs: 8000,
    });
  },

  async validate(headers?: Record<string, string>) {
    return apiClient.request<Response>('/auth/validate/', {
      headers,
      responseType: 'response',
      timeoutMs: 8000,
    });
  },
};
