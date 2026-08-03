import { apiClient } from './api-client';
import {
  SpeakingAssessmentResponse,
  SpeakingAudioUploadResponse,
  SpeakingSessionCreateResponse,
} from '../../types/speaking';

function getSessionPath(sessionId: string) {
  return `/speaking/sessions/${sessionId}/`;
}

function extractString(
  payload: unknown,
  keys: string[]
): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

export const speakingApi = {
  async createSession(): Promise<SpeakingSessionCreateResponse> {
    const raw = await apiClient.request('/speaking/sessions/', {
      method: 'POST',
    });

    return {
      id: extractString(raw, ['id', 'session_id', 'uuid']),
      raw,
    };
  },
  async getAssessment(sessionId: string): Promise<SpeakingAssessmentResponse> {
    const raw = await apiClient.request(`${getSessionPath(sessionId)}assessment/`);

    return {
      assessmentId: extractString(raw, ['assessment_id', 'id']),
      raw,
    };
  },
  historyPath: '/speaking/history/',
  async requestAssessment(sessionId: string) {
    return apiClient.request(`${getSessionPath(sessionId)}assessment/submit/`, {
      method: 'POST',
    });
  },
  async uploadAudio(sessionId: string, formData: FormData): Promise<SpeakingAudioUploadResponse> {
    const raw = await apiClient.request(`${getSessionPath(sessionId)}audio/`, {
      body: formData,
      method: 'POST',
    });

    return {
      accepted: raw !== null && typeof raw !== 'undefined',
      raw,
    };
  },
};
