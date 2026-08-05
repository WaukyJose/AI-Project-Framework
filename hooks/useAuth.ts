import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthRepository } from '../services/repositories/AuthRepository';
import { ApiError } from '../services/api/ErrorHandler';
import type { AuthSession } from '../types/domain/AuthSession';
import { profileQueryKey } from './useProfile';
import { subscriptionQueryKey } from './useSubscription';
import { dashboardQueryKey } from './useDashboard';

/**
 * Credentials shape accepted by the login mutation.
 * Mirrors LoginRequestDto without coupling to the transport layer.
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Stable query key for the current auth session (token validation).
 */
export const sessionQueryKey = ['auth', 'session'] as const;

/**
 * React Query hook for authentication operations.
 *
 * Exposes:
 * - session:    useQuery result for GET /api/v1/auth/validate/
 * - login:      useMutation for POST /api/v1/auth/login/
 * - logout:     useMutation for POST /api/v1/auth/logout/
 *
 * Invalidation strategy (PART1_API_CLIENT_ARCHITECTURE.md §8):
 * - On login success:  invalidates session, profile, subscription, dashboard
 * - On logout success: removes all cached queries
 *
 * Consumers should gate protected UI on `isAuthenticated`.
 */
export function useAuth() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery<AuthSession, ApiError>({
    queryKey: sessionQueryKey,
    queryFn: () => AuthRepository.validate(),
    // Never retry 4xx on session validation — missing/invalid token is expected
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    // Always re-check session validity on mount
    staleTime: 0,
  });

  const loginMutation = useMutation<AuthSession, ApiError, LoginCredentials>({
    mutationFn: (credentials) => AuthRepository.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKey });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const logoutMutation = useMutation<void, ApiError, void>({
    mutationFn: () => AuthRepository.logout(),
    onSuccess: () => {
      queryClient.removeQueries();
    },
  });

  return {
    /** Current session query (token validation). data is AuthSession on success. */
    session: sessionQuery,
    /** Login mutation. Call mutate(credentials) to authenticate. */
    login: loginMutation,
    /** Logout mutation. Call mutate() to end the session. */
    logout: logoutMutation,
    /** Derived: true when the session query has resolved with a valid token. */
    isAuthenticated: sessionQuery.data?.authenticated === true,
    /** Derived: the authenticated User, or null when not logged in. */
    user: sessionQuery.data?.user ?? null,
  } as const;
}
