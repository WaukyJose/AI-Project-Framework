import { create } from 'zustand';

import { getCurrentApiEnvironment } from '../utils/env';
import { ApiError, speakingApi } from '../services/api';
import { speakingRecorder } from '../services/speaking/speaking-recorder';
import { getSpeakingPartDefinition } from '../services/speaking/speaking-parts';
import type {
  AssessmentResponse,
  CompleteSessionResponse,
  SpeakingAssessmentSummary,
  SpeakingAudioClip,
  SpeakingCapabilityState,
  SpeakingDraftSession,
  SpeakingPartId,
  SpeakingRecorderState,
  SpeakingSessionStatus,
  SpeakingTimerStatus,
} from '../types/speaking';

const DEFAULT_DURATION_SECONDS = 120;

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface SpeakingStoreState {
  assessment: SpeakingAssessmentSummary | null;
  capability: SpeakingCapabilityState;
  clip: SpeakingAudioClip | null;
  discardRecording: () => void;
  errorMessage: string | null;
  examinerAudioUrl: string | null;
  examinerText: string | null;
  initializePart: (partId: SpeakingPartId) => void;
  isCreatingSession: boolean;
  isEvaluating: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  isStartingSession: boolean;
  isUploading: boolean;
  partDescription: string;
  partId: SpeakingPartId;
  partTitle: string;
  pauseTimer: () => void;
  recorderStatus: SpeakingRecorderState['lifecycleStatus'];
  requestEvaluation: () => Promise<void>;
  resetError: () => void;
  resetTimer: () => void;
  secondsRemaining: number;
  session: SpeakingDraftSession | null;
  setDurationSeconds: (seconds: number) => void;
  startRecording: () => Promise<void>;
  startSession: () => Promise<void>;
  startTimer: () => void;
  stopPlayback: () => void;
  stopRecording: () => Promise<void>;
  tickTimer: () => void;
  timerDurationSeconds: number;
  timerStatus: SpeakingTimerStatus;
  togglePlayback: () => Promise<void>;
  uploadRecording: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createDraftSession(partId: SpeakingPartId): SpeakingDraftSession {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    part1Complete: false,
    lastExaminerAudioUrl: null,
    lastExaminerText: null,
    lastTurnNumber: 0,
    localSessionId: `local-${Date.now()}`,
    partId,
    remoteSessionId: null,
    remoteSessionStatus: 'not-created',
    status: 'draft',
    updatedAt: now,
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.getUserMessage();
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected speaking error occurred.';
}

function getRecorderSnapshot() {
  return speakingRecorder.getState();
}

function buildAssessmentSummary(
  response: AssessmentResponse | CompleteSessionResponse | null,
  status: 'complete' | 'failed' | 'pending' | 'processing',
): SpeakingAssessmentSummary {
  return {
    assessmentId: response?.assessment?.assessment_id ?? null,
    feedbackReport: response?.feedback_report,
    practiceScore: response?.practice_score,
    requestedAt: new Date().toISOString(),
    result: response ?? null,
    status,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSpeakingStore = create<SpeakingStoreState>((set, get) => ({
  assessment: null,
  capability: getRecorderSnapshot().capability,
  clip: null,

  discardRecording() {
    speakingRecorder.discardRecording();
    const recorder = getRecorderSnapshot();
    set((state) => ({
      capability: recorder.capability,
      clip: null,
      errorMessage: null,
      isPlaying: false,
      isRecording: false,
      recorderStatus: recorder.lifecycleStatus,
      session: state.session
        ? { ...state.session, status: 'ready', updatedAt: new Date().toISOString() }
        : state.session,
    }));
  },

  errorMessage: null,
  examinerAudioUrl: null,
  examinerText: null,

  initializePart(partId) {
    const part = getSpeakingPartDefinition(partId);
    speakingRecorder.stopPlayback();
    const recorder = getRecorderSnapshot();

    set({
      assessment: null,
      capability: recorder.capability,
      clip: null,
      errorMessage: null,
      examinerAudioUrl: null,
      examinerText: null,
      isCreatingSession: false,
      isEvaluating: false,
      isPlaying: false,
      isRecording: false,
      isStartingSession: false,
      isUploading: false,
      partDescription: part.description,
      partId,
      partTitle: part.title,
      recorderStatus: recorder.lifecycleStatus,
      secondsRemaining: DEFAULT_DURATION_SECONDS,
      session: null,
      timerDurationSeconds: DEFAULT_DURATION_SECONDS,
      timerStatus: 'idle',
    });
  },

  isCreatingSession: false,
  isEvaluating: false,
  isPlaying: false,
  isRecording: false,
  isStartingSession: false,
  isUploading: false,

  partDescription: getSpeakingPartDefinition('part-1').description,
  partId: 'part-1',
  partTitle: getSpeakingPartDefinition('part-1').title,

  pauseTimer() {
    set((state) => ({
      timerStatus: state.timerStatus === 'running' ? 'paused' : state.timerStatus,
    }));
  },

  recorderStatus: getRecorderSnapshot().lifecycleStatus,

  // -----------------------------------------------------------------------
  // Evaluation
  // -----------------------------------------------------------------------

  async requestEvaluation() {
    const { session, partId } = get();

    if (!session?.remoteSessionId) {
      set({ errorMessage: 'Start a session and submit a recording before requesting evaluation.' });
      return;
    }

    // Guard: backend must have declared Part 1 complete
    if (!session?.part1Complete) {
      set({ errorMessage: 'Complete the conversation before requesting evaluation.' });
      return;
    }

    const lastTurn = session.lastTurnNumber;
    if (lastTurn < 1) {
      set({ errorMessage: 'Submit at least one recording before requesting evaluation.' });
      return;
    }

    set({
      errorMessage: null,
      isEvaluating: true,
      session: activeSession(session, 'assessment-requested'),
    });

    try {
      // Step 1: Complete the session
      const completeResult = await speakingApi.completeSession(
        session.remoteSessionId,
        partId,
        lastTurn,
      );

      const interimStatus: SpeakingSessionStatus =
        completeResult.assessment?.status === 'complete' ? 'evaluated' : 'evaluating';

      set({
        session: {
          ...session,
          remoteSessionStatus: completeResult.session_state,
          status: interimStatus,
          updatedAt: new Date().toISOString(),
        },
      });

      // Step 2: Fetch the final assessment
      const assessmentResult = await speakingApi.getAssessment(session.remoteSessionId);

      const isFailed =
        assessmentResult.assessment?.status !== 'complete' &&
        assessmentResult.assessment?.status !== 'pending' &&
        assessmentResult.assessment?.status !== 'processing';

      set({
        assessment: buildAssessmentSummary(
          assessmentResult,
          assessmentResult.assessment?.status === 'complete' ? 'complete' : 'pending',
        ),
        isEvaluating: false,
        session: {
          ...session,
          remoteSessionStatus: assessmentResult.session_state,
          status: assessmentResult.assessment?.status === 'complete' ? 'evaluated' : 'evaluating',
          updatedAt: new Date().toISOString(),
        },
      });

      if (isFailed) {
        set({ errorMessage: 'The backend could not complete the assessment.' });
      }
    } catch (error) {
      set({
        assessment: buildAssessmentSummary(null, 'failed'),
        errorMessage: getErrorMessage(error),
        isEvaluating: false,
        session: activeSession(session, 'error'),
      });
    }
  },

  resetError() {
    set({ errorMessage: null });
  },

  resetTimer() {
    set((state) => ({
      secondsRemaining: state.timerDurationSeconds,
      timerStatus: 'idle',
    }));
  },

  secondsRemaining: DEFAULT_DURATION_SECONDS,
  session: null,

  setDurationSeconds(seconds) {
    set({
      secondsRemaining: seconds,
      timerDurationSeconds: seconds,
      timerStatus: 'idle',
    });
  },

  // -----------------------------------------------------------------------
  // Recording
  // -----------------------------------------------------------------------

  async startRecording() {
    const { session, partId } = get();

    // Block recording after Part 1 is complete
    if (session?.part1Complete) {
      set({ errorMessage: 'Part 1 is complete. Request evaluation to see your results.' });
      return;
    }

    // Auto-create local session if none exists
    const active = session ?? createDraftSession(partId);

    try {
      const capability = await speakingRecorder.startRecording();
      const recorder = getRecorderSnapshot();
      set({
        capability,
        errorMessage: null,
        isPlaying: false,
        isRecording: true,
        recorderStatus: recorder.lifecycleStatus,
        session: { ...active, status: 'recording', updatedAt: new Date().toISOString() },
      });
    } catch (error) {
      const recorder = getRecorderSnapshot();
      set({
        capability: recorder.capability,
        errorMessage: getErrorMessage(error),
        isRecording: false,
        recorderStatus: recorder.lifecycleStatus,
      });
    }
  },

  // -----------------------------------------------------------------------
  // Session lifecycle (aligned with frozen backend)
  // -----------------------------------------------------------------------

  async startSession() {
    const { partId, session } = get();

    // Prevent duplicate creation
    if (session?.remoteSessionId) {
      set({ errorMessage: 'A session is already active. Discard and start fresh if needed.' });
      return;
    }

    set({
      errorMessage: null,
      isCreatingSession: true,
      session: createDraftSession(partId),
    });

    try {
      // Step 1: Create session on server
      const created = await speakingApi.createSession(partId);

      const draft = ensureSession(get().session, partId);
      set({
        isCreatingSession: false,
        isStartingSession: true,
        session: {
          ...draft,
          remoteSessionId: created.session_id,
          remoteSessionStatus: created.session_state,
          status: 'ready',
          updatedAt: new Date().toISOString(),
        },
      });

      // Step 2: Start the conversation
      const started = await speakingApi.startSession(created.session_id, partId);

      const s = ensureSession(get().session, partId);
      set({
        examinerAudioUrl: started.examiner_turn.audio_url,
        examinerText: started.examiner_turn.text,
        isStartingSession: false,
        session: {
          ...s,
          lastExaminerAudioUrl: started.examiner_turn.audio_url,
          lastExaminerText: started.examiner_turn.text,
          remoteSessionStatus: started.session_state,
          status: 'ready',
          updatedAt: new Date().toISOString(),
        },
      });

        // Automatically play the examiner's opening prompt aloud
        const rawUrl = started.examiner_turn.audio_url;
        if (rawUrl) {
          const siteUrl = getCurrentApiEnvironment().siteUrl.replace(/\/$/, '');
          speakingRecorder.playExaminerAudio(`${siteUrl}${rawUrl}`);
        }
    } catch (error) {
      set({
        errorMessage: getErrorMessage(error),
        isCreatingSession: false,
        isStartingSession: false,
        session: activeSession(ensureSession(get().session, partId), 'error'),
      });
    }
  },

  startTimer() {
    set((state) => ({
      timerStatus: state.secondsRemaining > 0 ? 'running' : 'completed',
    }));
  },

  stopPlayback() {
    speakingRecorder.stopPlayback();
    const recorder = getRecorderSnapshot();
    set({
      isPlaying: false,
      recorderStatus: recorder.lifecycleStatus,
    });
  },

  async stopRecording() {
    try {
      const clip = await speakingRecorder.stopRecording();
      const recorder = getRecorderSnapshot();
      set((state) => ({
        clip: clip ?? null,
        errorMessage: null,
        isRecording: false,
        recorderStatus: recorder.lifecycleStatus,
        session: state.session
          ? {
              ...state.session,
              status: clip ? 'recorded' : 'ready',
              updatedAt: new Date().toISOString(),
            }
          : state.session,
      }));
    } catch (error) {
      const recorder = getRecorderSnapshot();
      set((state) => ({
        errorMessage: getErrorMessage(error),
        isRecording: false,
        recorderStatus: recorder.lifecycleStatus,
        session: state.session
          ? { ...state.session, status: 'error', updatedAt: new Date().toISOString() }
          : state.session,
      }));
    }
  },

  tickTimer() {
    set((state) => {
      if (state.timerStatus !== 'running') return state;
      const nextValue = Math.max(0, state.secondsRemaining - 1);
      const isCompleted = nextValue === 0;
      return {
        secondsRemaining: nextValue,
        timerStatus: isCompleted ? 'completed' : 'running',
      };
    });

    const { secondsRemaining, isRecording, stopRecording } = get();
    if (secondsRemaining === 0 && isRecording) {
      void stopRecording();
    }
  },

  timerDurationSeconds: DEFAULT_DURATION_SECONDS,
  timerStatus: 'idle',

  async togglePlayback() {
    try {
      const isPlaying = await speakingRecorder.togglePlayback();
      const recorder = getRecorderSnapshot();
      set({
        errorMessage: null,
        isPlaying,
        recorderStatus: recorder.lifecycleStatus,
      });
    } catch (error) {
      const recorder = getRecorderSnapshot();
      set({
        errorMessage: getErrorMessage(error),
        isPlaying: false,
        recorderStatus: recorder.lifecycleStatus,
      });
    }
  },

  // -----------------------------------------------------------------------
  // Upload / submit turn
  // -----------------------------------------------------------------------

  async uploadRecording() {
    const { clip, partId, session, isUploading } = get();

    if (isUploading) {
      return;
    }

    if (!clip?.objectUrl) {
      set({ errorMessage: 'Record a speaking response before uploading.' });
      return;
    }

    if (!session?.remoteSessionId) {
      set({ errorMessage: 'Start a session before uploading a recording.' });
      return;
    }

    // Guard: no uploads after Part 1 is complete
    if (session?.part1Complete) {
      set({ errorMessage: 'Part 1 is complete. Request evaluation to see your results.' });
      return;
    }

    const nextTurn = session.lastTurnNumber + 1;

    set({
      errorMessage: null,
      isUploading: true,
      session: activeSession(session, 'uploading'),
    });

    try {
      const result = await speakingApi.submitTurn(
        session.remoteSessionId,
        partId,
        nextTurn,
        {
          durationMs: clip.durationMs,
          mimeType: clip.mimeType,
          name: clip.name,
          uri: clip.objectUrl,
        },
      );

      const s = ensureSession(get().session, partId);
      set({
        clip: null,
        examinerAudioUrl: result.examiner_turn.audio_url,
        examinerText: result.examiner_turn.text,
        isUploading: false,
        session: {
          ...s,
          part1Complete: result.conversation_state.part1_complete === true,
          lastExaminerAudioUrl: result.examiner_turn.audio_url,
          lastExaminerText: result.examiner_turn.text,
          lastTurnNumber: nextTurn,
          remoteSessionStatus: result.session_state,
          status: 'uploaded',
          updatedAt: new Date().toISOString(),
        },
      });

        // Automatically play the examiner's response aloud
        const rawUrl = result.examiner_turn.audio_url;
        if (rawUrl) {
          const siteUrl = getCurrentApiEnvironment().siteUrl.replace(/\/$/, '');
          speakingRecorder.playExaminerAudio(`${siteUrl}${rawUrl}`);
        }
    } catch (error) {
      set({
        errorMessage: getErrorMessage(error),
        isUploading: false,
        session: activeSession(ensureSession(get().session, partId), 'error'),
      });
    }
  },
}));

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function activeSession(
  session: SpeakingDraftSession,
  status: SpeakingSessionStatus,
): SpeakingDraftSession {
  return { ...session, status, updatedAt: new Date().toISOString() };
}

function ensureSession(
  session: SpeakingDraftSession | null,
  partId: SpeakingPartId,
): SpeakingDraftSession {
  return session ?? createDraftSession(partId);
}
