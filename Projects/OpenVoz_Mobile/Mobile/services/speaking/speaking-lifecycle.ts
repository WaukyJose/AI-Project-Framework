export type AppLifecycleState = 'active' | 'background' | 'inactive';

export interface SpeakingActivitySnapshot {
  isCreatingSession: boolean;
  isEvaluating: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  isStartingSession: boolean;
  isUploading: boolean;
  remoteSessionId: string | null;
}

export function normalizeAppLifecycleState(value: string | null | undefined): AppLifecycleState {
  return value === 'active' || value === 'background' || value === 'inactive'
    ? value
    : 'inactive';
}

export function hasSpeakingActivity(snapshot: SpeakingActivitySnapshot): boolean {
  return Boolean(
    snapshot.remoteSessionId ||
      snapshot.isCreatingSession ||
      snapshot.isEvaluating ||
      snapshot.isPlaying ||
      snapshot.isRecording ||
      snapshot.isStartingSession ||
      snapshot.isUploading,
  );
}

export function shouldFlagSpeakingInterruption(
  nextState: AppLifecycleState,
  previousState: AppLifecycleState,
  snapshot: SpeakingActivitySnapshot,
): boolean {
  return previousState === 'active' && nextState !== 'active' && hasSpeakingActivity(snapshot);
}
