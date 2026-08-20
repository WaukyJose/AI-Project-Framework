import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { router } from 'expo-router';

import { ApiError } from '../services/api';
import { dashboardService } from '../services/dashboard/dashboard-service';
import { queryKeys } from '../services/query/query-keys';
import { useAuthStore } from '../store/auth-store';

export function useDashboardData(language: 'en' | 'es') {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const query = useQuery({
    enabled: isAuthenticated,
    queryFn: () => dashboardService.getDashboard(language),
    queryKey: queryKeys.dashboard(language),
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
