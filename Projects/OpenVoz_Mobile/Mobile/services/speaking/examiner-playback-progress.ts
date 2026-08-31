export function normalizeExaminerPlaybackProgress(
  currentTime: number,
  duration: number,
): number {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  const progress = currentTime / duration;
  return Math.max(0, Math.min(1, progress));
}

export function resolveExaminerPlaybackDuration(
  backendDuration: number | null | undefined,
  statusDuration: number,
  playerDuration: number,
): number {
  if (typeof backendDuration === 'number' && Number.isFinite(backendDuration) && backendDuration > 0) {
    return backendDuration;
  }

  if (Number.isFinite(statusDuration) && statusDuration > 0) {
    return statusDuration;
  }

  return Number.isFinite(playerDuration) && playerDuration > 0 ? playerDuration : 0;
}
