import { File } from 'expo-file-system';

import { apiClient } from './api-client';
import type {
  AssessmentResponse,
  CompleteSessionResponse,
  CreateSessionResponse,
  RetrieveSessionResponse,
  StartSessionResponse,
  SubmitTurnResponse,
} from '../../types/speaking';

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------
// All paths are relative to apiBaseUrl, which already includes /api/v1.
// E.g. with apiBaseUrl = 'http://192.168.100.127:8000/api/v1',
// path '/speaking/sessions/' resolves to
// http://192.168.100.127:8000/api/v1/speaking/sessions/

function sessionPath(sessionId: string, suffix = '') {
  return `/speaking/sessions/${sessionId}/${suffix}`;
}

interface StartSessionOptions {
  sourcePart3SessionId?: string;
}

// ---------------------------------------------------------------------------
// Public API — exact match with frozen sprint-5.1 backend
// ---------------------------------------------------------------------------

export const speakingApi = {
  /**
   * POST /api/v1/speaking/sessions/
   */
  async createSession(part: string): Promise<CreateSessionResponse> {
    return apiClient.request<CreateSessionResponse>('/speaking/sessions/', {
      body: { part },
      method: 'POST',
    });
  },

  /**
   * GET /api/v1/speaking/sessions/{session_id}/
   */
  async retrieveSession(sessionId: string): Promise<RetrieveSessionResponse> {
    return apiClient.request<RetrieveSessionResponse>(sessionPath(sessionId));
  },

  /**
   * POST /api/v1/speaking/sessions/{session_id}/start/
   */
  async startSession(
    sessionId: string,
    part: string,
    options?: StartSessionOptions,
  ): Promise<StartSessionResponse> {
    const body =
      part === 'part-4' && options?.sourcePart3SessionId
        ? { part, source_part3_session_id: options.sourcePart3SessionId }
        : { part };

    return apiClient.request<StartSessionResponse>(sessionPath(sessionId, 'start/'), {
      body,
      method: 'POST',
    });
  },

  /**
   * POST /api/v1/speaking/sessions/{session_id}/turns/
   *
   * Submits a candidate audio turn. Multipart: audio file + JSON metadata
   * as form-data entries.
   */
  async submitTurn(
    sessionId: string,
    part: string,
    turn: number,
    audio: { uri: string; name: string; mimeType: string; durationMs: number | null },
  ): Promise<SubmitTurnResponse> {
    const formData = new FormData();

    // expo-file-system File backs the native recording URI.  Expo's patched
    // FormData.append stores the File directly in _parts, and Expo's
    // convertFormDataAsync reads it via entry.bytes() — the only multipart
    // representation supported by this Expo 57 / RN 0.86 stack.  Name and
    // type are extracted from the File object in getFormDataPartHeaders.
    const file = new File(audio.uri);
    formData.append('audio', file);

    // JSON fields as form-data entries
    formData.append('part', part);
    formData.append('turn', String(turn));

    const metadata: Record<string, unknown> = {
      mime_type: audio.mimeType,
    };
    if (audio.durationMs !== null) {
      metadata.duration_ms = audio.durationMs;
    }
    formData.append('metadata', JSON.stringify(metadata));

    return apiClient.request<SubmitTurnResponse>(sessionPath(sessionId, 'turns/'), {
      body: formData,
      method: 'POST',
      timeoutMs: 60000,
    });
  },

  /**
   * POST /api/v1/speaking/sessions/{session_id}/complete/
   */
  async completeSession(
    sessionId: string,
    part: string,
    lastClientTurn: number,
  ): Promise<CompleteSessionResponse> {
    return apiClient.request<CompleteSessionResponse>(sessionPath(sessionId, 'complete/'), {
      body: { part, last_client_turn: lastClientTurn },
      method: 'POST',
      timeoutMs: 60000,
    });
  },

  /**
   * GET /api/v1/speaking/sessions/{session_id}/assessment/
   */
  async getAssessment(sessionId: string): Promise<AssessmentResponse> {
    return apiClient.request<AssessmentResponse>(sessionPath(sessionId, 'assessment/'));
  },
};
