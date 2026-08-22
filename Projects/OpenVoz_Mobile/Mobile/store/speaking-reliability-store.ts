import { create } from 'zustand';

import type { AppLifecycleState } from '../services/speaking/speaking-lifecycle';
import type { RecordingWarningLevel } from '../services/speaking/recording-watchdog';

interface SpeakingReliabilityState {
  appInterruptionDetected: boolean;
  clearRecordingWatchdog: () => void;
  interruptedAt: string | null;
  recordingElapsedSeconds: number;
  recordingStartedAt: string | null;
  recordingWarningLevel: RecordingWarningLevel;
  beginRecordingWatchdog: (
    recordingStartedAt: string,
    recordingElapsedSeconds?: number,
    recordingWarningLevel?: RecordingWarningLevel,
  ) => void;
  updateRecordingWatchdog: (
    recordingElapsedSeconds: number,
    recordingWarningLevel?: RecordingWarningLevel,
  ) => void;
  previousLifecycleState: AppLifecycleState | null;
  clearInterruption: () => void;
  markInterruption: (previousLifecycleState: AppLifecycleState) => void;
}

export const useSpeakingReliabilityStore = create<SpeakingReliabilityState>((set) => ({
  appInterruptionDetected: false,
  beginRecordingWatchdog(recordingStartedAt, recordingElapsedSeconds = 0, recordingWarningLevel = 'normal') {
    set({
      recordingElapsedSeconds,
      recordingStartedAt,
      recordingWarningLevel,
    });
  },
  clearRecordingWatchdog() {
    set({
      recordingElapsedSeconds: 0,
      recordingStartedAt: null,
      recordingWarningLevel: 'normal',
    });
  },
  clearInterruption() {
    set({
      appInterruptionDetected: false,
      interruptedAt: null,
      previousLifecycleState: null,
    });
  },
  interruptedAt: null,
  recordingElapsedSeconds: 0,
  recordingStartedAt: null,
  recordingWarningLevel: 'normal',
  updateRecordingWatchdog(recordingElapsedSeconds, recordingWarningLevel) {
    set({
      recordingElapsedSeconds,
      recordingWarningLevel: recordingWarningLevel ?? 'normal',
    });
  },
  markInterruption(previousLifecycleState) {
    set({
      appInterruptionDetected: true,
      interruptedAt: new Date().toISOString(),
      previousLifecycleState,
    });
  },
  previousLifecycleState: null,
}));
