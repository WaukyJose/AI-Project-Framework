import { useQuery } from '@tanstack/react-query';
import { ProfileRepository } from '../services/repositories/ProfileRepository';
import { ApiError } from '../services/api/ErrorHandler';
import type { UserProfile } from '../types/domain/UserProfile';

/**
 * Stable query key for the authenticated user's profile.
 * Used by useAuth for invalidation after login/logout.
 */
export const profileQueryKey = ['user', 'profile'] as const;

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes per §8

/**
 * React Query hook for the authenticated user's profile.
 *
 * Cache rules (PART1_API_CLIENT_ARCHITECTURE.md §8):
 * - Stale time: 5 minutes
 * - Retry: exponential backoff for idempotent reads; no retry on 4xx
 */
export function useProfile() {
  return useQuery<UserProfile, ApiError>({
    queryKey: profileQueryKey,
    queryFn: () => ProfileRepository.getProfile(),
    staleTime: STALE_TIME_MS,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
