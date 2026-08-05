import { useQuery } from '@tanstack/react-query';
import { DashboardRepository } from '../services/repositories/DashboardRepository';
import { ApiError } from '../services/api/ErrorHandler';
import type { DashboardSummary } from '../types/domain/Dashboard';

/**
 * Stable query key for the aggregated mobile dashboard.
 * Used by useAuth for invalidation after login/logout.
 */
export const dashboardQueryKey = ['dashboard', 'summary'] as const;

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

/**
 * React Query hook for the aggregated mobile dashboard.
 *
 * Cache rules (PART1_API_CLIENT_ARCHITECTURE.md §8):
 * - Stale time: 5 minutes
 * - Retry: exponential backoff for idempotent reads; no retry on 4xx
 *
 * Returns DashboardSummary which composes UserProfile, SubscriptionStatus,
 * LearningStats, and ActivityItem[] into a single domain entity.
 */
export function useDashboard() {
  return useQuery<DashboardSummary, ApiError>({
    queryKey: dashboardQueryKey,
    queryFn: () => DashboardRepository.getDashboard(),
    staleTime: STALE_TIME_MS,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
