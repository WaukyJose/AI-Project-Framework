import { useQuery } from '@tanstack/react-query';
import { SubscriptionRepository } from '../services/repositories/SubscriptionRepository';
import { ApiError } from '../services/api/ErrorHandler';
import type { SubscriptionStatus } from '../types/domain/Subscription';

/**
 * Stable query key for the authenticated user's subscription status.
 * Used by useAuth for invalidation after login/logout.
 */
export const subscriptionQueryKey = ['user', 'subscription'] as const;

const STALE_TIME_MS = 1 * 60 * 1000; // 1 minute per §8

/**
 * React Query hook for the authenticated user's subscription status.
 *
 * Cache rules (PART1_API_CLIENT_ARCHITECTURE.md §8):
 * - Stale time: 1 minute (subscriptions change more frequently)
 * - Retry: exponential backoff for idempotent reads; no retry on 4xx
 */
export function useSubscription() {
  return useQuery<SubscriptionStatus, ApiError>({
    queryKey: subscriptionQueryKey,
    queryFn: () => SubscriptionRepository.getSubscription(),
    staleTime: STALE_TIME_MS,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
