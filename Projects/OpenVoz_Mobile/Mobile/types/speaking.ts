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

export type Part2Phase = 'long_turn' | 'follow_up' | 'complete';

export type Part3Phase = 'discussion' | 'decision' | 'complete';

export type Part4Phase = 'not_started' | 'awaiting_response' | 'complete';

export type RecordingCapabilityStatus = 'blocked' | 'ready' | 'unsupported';

export type RecorderLifecycleStatus =
  | 'idle'
  | 'preparing'
  | 'ready'
  | 'recording'
  | 'recorded'
  | 'playing'
  | 'error';

// ---------------------------------------------------------------------------
// Backend-aligned types (matches frozen sprint-5.1 serializers)
// ---------------------------------------------------------------------------

export interface ExaminerTurn {
  turn: number;
  text: string;
  audio_url: string | null;
  audio_duration_seconds?: number | null;
}

export interface CandidateTurn {
  turn: number;
  transcript: string;
}

export interface ConversationState {
  conversation_started: boolean;
  current_question: string;
  follow_up_asked: boolean;
  part1_complete?: boolean;
  part2_phase?: Part2Phase | null;
  part2_complete?: boolean;
  part3_complete?: boolean;
  part3_phase?: Part3Phase | null;
  part3_comment_index?: number;
  part3_scenario_id?: string;
  part4_complete?: boolean;
  part4_phase?: Part4Phase | null;
  source_part3_session_id?: string | null;
  part4_set_id?: string | null;
  part4_question_id?: string | null;
  part4_question_index?: number | null;
  part4_progression_pending?: boolean;
}

export interface TranscriptDeltaEntry {
  speaker: 'examiner' | 'candidate' | 'system';
  text: string;
}

export interface SessionTiming {
  session_duration_seconds: number;
  remaining_seconds: number;
  new_topic_cutoff_seconds: number;
}

export interface AssessmentStatus {
  status: 'complete' | 'pending' | 'processing';
  assessment_id: string | null;
}

export interface CreateSessionResponse {
  session_id: string;
  part: string;
  session_state: string;
  created_at: string;
}

export interface RetrieveSessionResponse {
  session_id: string;
  part: string;
  session_state: string;
  conversation_state: ConversationState;
  timing: SessionTiming;
  transcript: TranscriptDeltaEntry[];
  assessment: AssessmentStatus | null;
}

export interface StartSessionResponse {
  session_id: string;
  part: string;
  session_state: string;
  conversation_state: ConversationState;
  examiner_turn: ExaminerTurn;
  transcript_delta: TranscriptDeltaEntry[];
  photo?: Part2PhotoPrompt;
}

export interface SubmitTurnResponse {
  session_id: string;
  part: string;
  session_state: string;
  turn_status: 'accepted' | 'rejected' | 'uploaded' | 'transcribing' | 'processing' | 'closing';
  candidate_turn: CandidateTurn;
  conversation_state: ConversationState;
  examiner_turn: ExaminerTurn;
  transcript_delta: TranscriptDeltaEntry[];
}

export interface CompleteSessionResponse {
  session_id: string;
  part: string;
  session_state: string;
  assessment: AssessmentStatus;
  feedback_report: Record<string, unknown>;
  practice_score: Record<string, unknown>;
}

export interface AssessmentResponse {
  session_id: string;
  part: string;
  session_state: string;
  assessment: AssessmentStatus;
  feedback_report: Record<string, unknown>;
  practice_score: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Mobile session state
// ---------------------------------------------------------------------------

export interface Part2PhotoPrompt {
  id: string;
  photoUrl: string;
  specificInstruction: string;
  taskInstruction: string;
}

// Part 3 scenarios use the same mapped photo/task shape exposed by the
// backend start response. Keeping this as an alias preserves Part 2's type
// without duplicating a structurally identical model.
export type Part3Scenario = Part2PhotoPrompt;

export interface SpeakingPart2TimerConfig {
  followUpSeconds: number;
  longTurnSeconds: number;
}

export interface SpeakingDraftSession {
  createdAt: string;
  localSessionId: string;
  part1Complete: boolean;
  partId: SpeakingPartId;
  remoteSessionId: string | null;
  remoteSessionStatus: string;
  status: SpeakingSessionStatus;
  updatedAt: string;
  lastExaminerText: string | null;
  lastExaminerAudioUrl: string | null;
  lastTurnNumber: number;
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
  feedbackReport?: Record<string, unknown>;
  practiceScore?: Record<string, unknown>;
}
