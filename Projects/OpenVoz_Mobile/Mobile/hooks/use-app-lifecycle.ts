import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  hasSpeakingActivity,
  normalizeAppLifecycleState,
  shouldFlagSpeakingInterruption,
  type AppLifecycleState,
} from '../services/speaking/speaking-lifecycle';
import { useSpeakingReliabilityStore } from '../store/speaking-reliability-store';
import { useSpeakingStore } from '../store/speaking-store';

interface SpeakingLifecycleSnapshot {
  isCreatingSession: boolean;
  isEvaluating: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  isStartingSession: boolean;
  isUploading: boolean;
  remoteSessionId: string | null;
}

function getSpeakingSnapshot(): SpeakingLifecycleSnapshot {
  const state = useSpeakingStore.getState();
  return {
    isCreatingSession: state.isCreatingSession,
    isEvaluating: state.isEvaluating,
    isPlaying: state.isPlaying,
    isRecording: state.isRecording,
    isStartingSession: state.isStartingSession,
    isUploading: state.isUploading,
    remoteSessionId: state.session?.remoteSessionId ?? null,
  };
}

export function useAppLifecycle(): AppLifecycleState {
  const [lifecycleState, setLifecycleState] = useState<AppLifecycleState>(() =>
    normalizeAppLifecycleState(AppState.currentState),
  );
  const previousLifecycleStateRef = useRef<AppLifecycleState>(lifecycleState);

  useEffect(() => {
    previousLifecycleStateRef.current = lifecycleState;
  }, [lifecycleState]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const normalizedNextState = normalizeAppLifecycleState(nextState);
      const previousState = previousLifecycleStateRef.current;
      const snapshot = getSpeakingSnapshot();

      if (shouldFlagSpeakingInterruption(normalizedNextState, previousState, snapshot)) {
        useSpeakingReliabilityStore.getState().markInterruption(previousState);
      }

      setLifecycleState(normalizedNextState);
    });

    return () => subscription.remove();
  }, []);

  return lifecycleState;
}
