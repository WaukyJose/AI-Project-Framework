import { create } from 'zustand';

import { ApiError, speakingApi } from '../services/api';
import { speakingRecorder } from '../services/speaking/speaking-recorder';
import { getSpeakingPartDefinition } from '../services/speaking/speaking-parts';
import {
  SpeakingAssessmentSummary,
  SpeakingAudioClip,
  SpeakingCapabilityState,
  SpeakingDraftSession,
  SpeakingAssessmentStatus,
  SpeakingPartId,
  SpeakingRecorderState,
  SpeakingTimerStatus,
} from '../types/speaking';

const DEFAULT_DURATION_SECONDS = 120;

interface SpeakingStoreState {
  assessment: SpeakingAssessmentSummary | null;
  capability: SpeakingCapabilityState;
  clip: SpeakingAudioClip | null;
  discardRecording: () => void;
  errorMessage: string | null;
  initializePart: (partId: SpeakingPartId) => void;
  isEvaluating: boolean;
  isPlaying: boolean;
  isRecording: boolean;
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
  startSession: () => void;
  startTimer: () => void;
  stopPlayback: () => void;
  stopRecording: () => Promise<void>;
  tickTimer: () => void;
  timerDurationSeconds: number;
  timerStatus: SpeakingTimerStatus;
  togglePlayback: () => Promise<void>;
  uploadRecording: () => Promise<void>;
}

function createDraftSession(partId: SpeakingPartId): SpeakingDraftSession {
  const now = new Date().toISOString();

  return {
    createdAt: now,
    localSessionId: `local-${Date.now()}`,
    partId,
    remoteSessionId: null,
    remoteSessionStatus: 'not-created',
    status: 'draft',
    updatedAt: now,
  };
}

function getErrorMessage(error: unknown) {
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

function createAssessmentSummary(status: SpeakingAssessmentStatus, result: unknown = null) {
  return {
    assessmentId: null,
    requestedAt: new Date().toISOString(),
    result,
    status,
  } satisfies SpeakingAssessmentSummary;
}

async function buildAudioUploadFormData(clip: SpeakingAudioClip, partId: SpeakingPartId) {
  if (!clip.objectUrl) {
    throw new Error('No recording is available to upload.');
  }

  const response = await fetch(clip.objectUrl);
  const blob = await response.blob();
  const formData = new FormData();

  formData.append('audio', blob, clip.name);
  formData.append('part_id', partId);
  formData.append('mime_type', clip.mimeType);

  if (clip.durationMs !== null) {
    formData.append('duration_ms', String(clip.durationMs));
  }

  return formData;
}

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
        ? {
            ...state.session,
            status: 'ready',
            updatedAt: new Date().toISOString(),
          }
        : state.session,
    }));
  },
  errorMessage: null,
  initializePart(partId) {
    const part = getSpeakingPartDefinition(partId);
    speakingRecorder.stopPlayback();
    const recorder = getRecorderSnapshot();

    set({
      assessment: null,
      capability: recorder.capability,
      clip: null,
      errorMessage: null,
      isEvaluating: false,
      isPlaying: false,
      isRecording: false,
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
  isEvaluating: false,
  isPlaying: false,
  isRecording: false,
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
  async requestEvaluation() {
    const { session } = get();

    if (!session?.remoteSessionId) {
      set({
        errorMessage: 'Upload a speaking recording before requesting evaluation.',
      });
      return;
    }

    set({
      assessment: createAssessmentSummary('pending'),
      errorMessage: null,
      isEvaluating: true,
      session: {
        ...session,
        status: 'assessment-requested',
        updatedAt: new Date().toISOString(),
      },
    });

    try {
      await speakingApi.requestAssessment(session.remoteSessionId);
      set((state) => ({
        session: state.session
          ? {
              ...state.session,
              status: 'evaluating',
              updatedAt: new Date().toISOString(),
            }
          : state.session,
      }));

      const assessmentResult = await speakingApi.getAssessment(session.remoteSessionId);

      if (assessmentResult.status === 'failed') {
        throw new Error(
          'The backend reported that the assessment could not be completed.'
        );
      }

      set({
        assessment: {
          assessmentId: assessmentResult.assessmentId,
          requestedAt: new Date().toISOString(),
          result: assessmentResult.raw,
          status: assessmentResult.status,
        },
        errorMessage: null,
        isEvaluating: false,
        session: {
          ...session,
          status: assessmentResult.status === 'complete' ? 'evaluated' : 'evaluating',
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      set({
        assessment: createAssessmentSummary('failed'),
        errorMessage: getErrorMessage(error),
        isEvaluating: false,
        session: {
          ...session,
          status: 'error',
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
  resetError() {
    set({
      errorMessage: null,
    });
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
  async startRecording() {
    const session = get().session;

    if (!session) {
      get().startSession();
    }

      try {
      const capability = await speakingRecorder.startRecording();
      const recorder = getRecorderSnapshot();
      set((state) => ({
        capability,
        errorMessage: null,
        isPlaying: false,
        isRecording: true,
        recorderStatus: recorder.lifecycleStatus,
        session: state.session
          ? {
              ...state.session,
              status: 'recording',
              updatedAt: new Date().toISOString(),
            }
          : createDraftSession(state.partId),
      }));
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
  startSession() {
    set((state) => ({
      errorMessage: null,
      session: createDraftSession(state.partId),
      timerStatus: state.timerStatus === 'completed' ? 'idle' : state.timerStatus,
    }));
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
          ? {
              ...state.session,
              status: 'error',
              updatedAt: new Date().toISOString(),
            }
          : state.session,
      }));
    }
  },
  tickTimer() {
    set((state) => {
      if (state.timerStatus !== 'running') {
        return state;
      }

      const nextValue = Math.max(0, state.secondsRemaining - 1);

      return {
        secondsRemaining: nextValue,
        timerStatus: nextValue === 0 ? 'completed' : 'running',
      };
    });
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
  async uploadRecording() {
    const { clip, partId, session } = get();

    if (!clip) {
      set({
        errorMessage: 'Record a speaking response before uploading.',
      });
      return;
    }

    const activeSession = session ?? createDraftSession(partId);

    set({
      errorMessage: null,
      isUploading: true,
      session: {
        ...activeSession,
        status: 'uploading',
        updatedAt: new Date().toISOString(),
      },
    });

    try {
      let remoteSessionId = activeSession.remoteSessionId;
      let remoteSessionStatus = activeSession.remoteSessionStatus;

      if (!remoteSessionId) {
        const sessionResponse = await speakingApi.createSession();
        remoteSessionId = sessionResponse.id;
        remoteSessionStatus = remoteSessionId ? 'created' : 'unknown';
      }

      if (!remoteSessionId) {
        throw new Error(
          'The backend did not return a speaking session identifier. The mobile upload contract still needs backend alignment.'
        );
      }

      const formData = await buildAudioUploadFormData(clip, partId);
      await speakingApi.uploadAudio(remoteSessionId, formData);

      set({
        assessment: null,
        errorMessage: null,
        isUploading: false,
        session: {
          ...activeSession,
          remoteSessionId,
          remoteSessionStatus,
          status: 'uploaded',
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      set({
        errorMessage: getErrorMessage(error),
        isUploading: false,
        session: {
          ...activeSession,
          status: 'error',
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },
}));
