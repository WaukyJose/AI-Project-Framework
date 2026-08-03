import { useEffect } from 'react';

import { useSpeakingStore } from '../store/speaking-store';

export function useSpeakingTimer() {
  const tickTimer = useSpeakingStore((state) => state.tickTimer);
  const timerStatus = useSpeakingStore((state) => state.timerStatus);

  useEffect(() => {
    if (timerStatus !== 'running') {
      return undefined;
    }

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [tickTimer, timerStatus]);
}
