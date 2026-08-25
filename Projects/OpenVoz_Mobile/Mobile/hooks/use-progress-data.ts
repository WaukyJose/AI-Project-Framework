import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { router, useIsFocused } from 'expo-router';

import { ApiError } from '../services/api';
import { progressService } from '../services/progress/progress-service';
import { queryKeys } from '../services/query/query-keys';
import { useAuthStore } from '../store/auth-store';

export function useProgressData(language: 'en' | 'es') {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const isFocused = useIsFocused();

  const query = useQuery({
    enabled: isAuthenticated && isFocused,
    queryFn: () => progressService.getProgress(language),
    queryKey: queryKeys.progress(language),
    retry: false,
  });

  useEffect(() => {
    if (!(query.error instanceof ApiError) || query.error.status !== 401) {
      return;
    }

    void logout().finally(() => {
      router.replace('/(auth)/login');
    });
  }, [logout, query.error]);

  return query;
}
