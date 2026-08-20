import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { router } from 'expo-router';

import { ApiError } from '../services/api';
import { consentService, type ConsentStatus } from '../services/consent/consent-service';
import { useAuthStore } from '../store/auth-store';

const consentQueryKey = ['consent'] as const;

type ConsentType = 'analytics' | 'ai_improvement';

export function useConsent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const query = useQuery({
    enabled: isAuthenticated,
    queryFn: () => consentService.getConsent(),
    queryKey: consentQueryKey,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: ({ consentType, granted }: { consentType: ConsentType; granted: boolean }) =>
      consentService.updateConsent(consentType, granted),
  });

  useEffect(() => {
    if (!(query.error instanceof ApiError) || query.error.status !== 401) {
      return;
    }

    void logout().finally(() => {
      router.replace('/(auth)/login');
    });
  }, [logout, query.error]);

  async function updateConsent(consentType: ConsentType, granted: boolean) {
    return mutation.mutateAsync({ consentType, granted });
  }

  return {
    consent: (query.data ?? null) as ConsentStatus | null,
    error: query.error ?? mutation.error ?? null,
    isLoading: query.isLoading || mutation.isPending,
    updateConsent,
  };
}
