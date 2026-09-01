import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
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
  const wasFocused = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      wasFocused.current = false;
      return;
    }

    if (isFocused) {
      if (wasFocused.current) {
        void query.refetch();
      }
      wasFocused.current = true;
    }
  }, [isAuthenticated, isFocused, query.refetch]);

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
