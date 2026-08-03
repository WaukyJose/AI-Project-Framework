export type SpeakingPartId = 'follow-up' | 'part-1' | 'part-2' | 'part-3' | 'part-4';

export type SpeakingSessionStatus =
  | 'draft'
  | 'ready'
  | 'recording'
  | 'recorded'
  | 'uploading'
  | 'uploaded'
  | 'evaluating'
  | 'evaluated'
  | 'error';

export type SpeakingTimerStatus = 'completed' | 'idle' | 'paused' | 'running';

export type RecordingCapabilityStatus = 'blocked' | 'ready' | 'unsupported';

export interface SpeakingDraftSession {
  createdAt: string;
  localSessionId: string;
  partId: SpeakingPartId;
  remoteSessionId: string | null;
  status: SpeakingSessionStatus;
  updatedAt: string;
}

export interface SpeakingAudioClip {
  durationMs: number | null;
  id: string;
  mimeType: string;
  name: string;
  objectUrl: string | null;
  sizeBytes: number;
}

export interface SpeakingCapabilityState {
  playbackSupported: boolean;
  recordingMessage: string;
  recordingStatus: RecordingCapabilityStatus;
}

export interface SpeakingAssessmentSummary {
  assessmentId: string | null;
  requestedAt: string;
  result: unknown;
  status: 'complete' | 'failed' | 'pending';
}
