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
