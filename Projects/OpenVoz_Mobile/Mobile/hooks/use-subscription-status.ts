import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { router } from 'expo-router';

import { ApiError } from '../services/api';
import { queryKeys } from '../services/query/query-keys';
import { subscriptionService } from '../services/subscription/subscription-service';
import { useAuthStore } from '../store/auth-store';

export function useSubscriptionStatus() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const query = useQuery({
    enabled: isAuthenticated,
    queryFn: () => subscriptionService.getAuthenticatedSubscription(),
    queryKey: queryKeys.subscription,
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
