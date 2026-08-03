import { useEffect } from 'react';

import { useAppStore } from '../store/app-store';
import { useAuthStore } from '../store/auth-store';

export function useAppBootstrap() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const hasCompletedBootstrap = useAppStore((state) => state.hasCompletedBootstrap);
  const setHasCompletedBootstrap = useAppStore((state) => state.setHasCompletedBootstrap);

  useEffect(() => {
    if (hasCompletedBootstrap) {
      return;
    }

    let isActive = true;

    void restoreSession().finally(() => {
      if (isActive) {
        setHasCompletedBootstrap(true);
      }
    });

    return () => {
      isActive = false;
    };
  }, [hasCompletedBootstrap, restoreSession, setHasCompletedBootstrap]);

  return {
    isReady: hasCompletedBootstrap,
  };
}
