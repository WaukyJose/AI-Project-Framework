import { apiClient } from './api-client';

function getSessionPath(sessionId: string) {
  return `/speaking/sessions/${sessionId}/`;
}

export const speakingApi = {
  async createSession() {
    return apiClient.request('/speaking/sessions/', {
      method: 'POST',
    });
  },
  async getAssessment(sessionId: string) {
    return apiClient.request(`${getSessionPath(sessionId)}assessment/`);
  },
  historyPath: '/speaking/history/',
  async requestAssessment(sessionId: string) {
    return apiClient.request(`${getSessionPath(sessionId)}assessment/submit/`, {
      method: 'POST',
    });
  },
  async uploadAudio(sessionId: string, formData: FormData) {
    return apiClient.request(`${getSessionPath(sessionId)}audio/`, {
      body: formData,
      method: 'POST',
    });
  },
};
