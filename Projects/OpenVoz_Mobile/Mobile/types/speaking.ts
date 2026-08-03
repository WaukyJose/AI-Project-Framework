export type SpeakingPartId = 'follow-up' | 'part-1' | 'part-2' | 'part-3' | 'part-4';

export type SpeakingSessionStatus =
  | 'idle'
  | 'draft'
  | 'ready'
  | 'recording'
  | 'recorded'
  | 'uploading'
  | 'uploaded'
  | 'assessment-requested'
  | 'evaluating'
  | 'evaluated'
  | 'error';

export type SpeakingAssessmentStatus =
  | 'idle'
  | 'pending'
  | 'processing'
  | 'complete'
  | 'failed';

export type SpeakingTimerStatus = 'completed' | 'idle' | 'paused' | 'running';

export type RecordingCapabilityStatus = 'blocked' | 'ready' | 'unsupported';

export type RecorderLifecycleStatus =
  | 'idle'
  | 'preparing'
  | 'ready'
  | 'recording'
  | 'recorded'
  | 'playing'
  | 'error';

export interface SpeakingDraftSession {
  createdAt: string;
  localSessionId: string;
  partId: SpeakingPartId;
  remoteSessionId: string | null;
  remoteSessionStatus: 'created' | 'not-created' | 'unknown';
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

export interface SpeakingRecorderState {
  capability: SpeakingCapabilityState;
  clip: SpeakingAudioClip | null;
  lifecycleStatus: RecorderLifecycleStatus;
}

export interface SpeakingAssessmentSummary {
  assessmentId: string | null;
  requestedAt: string;
  result: unknown;
  status: SpeakingAssessmentStatus;
}

export interface SpeakingSessionCreateResponse {
  id: string | null;
  raw: unknown;
}

export interface SpeakingAudioUploadResponse {
  accepted: boolean;
  raw: unknown;
}

export interface SpeakingAssessmentResponse {
  assessmentId: string | null;
  raw: unknown;
  status: SpeakingAssessmentStatus;
}
