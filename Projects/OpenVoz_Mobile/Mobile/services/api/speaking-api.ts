import { apiClient } from './api-client';
import {
  SpeakingAssessmentStatus,
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

function normalizeAssessmentStatus(value: string | null): SpeakingAssessmentStatus {
  switch (value?.toLowerCase()) {
    case 'complete':
    case 'completed':
    case 'done':
    case 'ready':
      return 'complete';
    case 'failed':
    case 'error':
      return 'failed';
    case 'processing':
    case 'running':
    case 'in_progress':
      return 'processing';
    case 'pending':
    case 'queued':
    case 'requested':
    default:
      return 'pending';
  }
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
    const statusValue = extractString(raw, ['status', 'state', 'assessment_status']);

    return {
      assessmentId: extractString(raw, ['assessment_id', 'id']),
      raw,
      status: normalizeAssessmentStatus(statusValue),
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
