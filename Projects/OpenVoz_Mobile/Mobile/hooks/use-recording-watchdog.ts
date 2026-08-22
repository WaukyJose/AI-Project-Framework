import { useEffect, useRef } from 'react';

import { getRecordingWarningLevel } from '../services/speaking/recording-watchdog';
import { useSpeakingReliabilityStore } from '../store/speaking-reliability-store';
import { useSpeakingStore } from '../store/speaking-store';

export function useRecordingWatchdog() {
  const isRecording = useSpeakingStore((state) => state.isRecording);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const reliabilityStore = useSpeakingReliabilityStore.getState();

    if (!isRecording) {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      reliabilityStore.clearRecordingWatchdog();
      return undefined;
    }

    const startedAt = Date.now();

    reliabilityStore.beginRecordingWatchdog(new Date(startedAt).toISOString(), 0, 'normal');
    reliabilityStore.updateRecordingWatchdog(0);

    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
    }

    recordingTimer.current = setInterval(() => {
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      const warningLevel = getRecordingWarningLevel(elapsedSeconds);
      useSpeakingReliabilityStore.getState().updateRecordingWatchdog(elapsedSeconds, warningLevel);
    }, 1000);

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    };
  }, [isRecording]);
}
