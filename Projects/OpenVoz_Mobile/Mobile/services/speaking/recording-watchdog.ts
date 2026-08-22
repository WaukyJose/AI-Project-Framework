export type RecordingWarningLevel = 'normal' | 'long_recording' | 'very_long_recording';

export const RECORDING_WARNING_THRESHOLDS_SECONDS = {
  longRecording: 45,
  veryLongRecording: 90,
} as const;

export function getRecordingWarningLevel(elapsedSeconds: number): RecordingWarningLevel {
  if (elapsedSeconds >= RECORDING_WARNING_THRESHOLDS_SECONDS.veryLongRecording) {
    return 'very_long_recording';
  }

  if (elapsedSeconds >= RECORDING_WARNING_THRESHOLDS_SECONDS.longRecording) {
    return 'long_recording';
  }

  return 'normal';
}

export function getRecordingWatchdogMessage(
  warningLevel: RecordingWarningLevel,
  elapsedSeconds: number,
): string | null {
  if (warningLevel === 'normal') {
    return null;
  }

  const minutes = Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
  const timeLabel = `${minutes}:${seconds}`;

  return warningLevel === 'very_long_recording'
    ? `You have been recording for ${timeLabel}. Consider stopping soon.`
    : `You have been recording for ${timeLabel}.`;
}
