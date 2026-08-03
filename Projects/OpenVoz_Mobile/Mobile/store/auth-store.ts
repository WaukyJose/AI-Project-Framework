import { create } from 'zustand';

import { ApiError } from '../services/api';
import { authService } from '../services/auth/auth-service';
import { appQueryClient } from '../services/query/query-client';
import { AuthUser, LoginCredentials } from '../types/auth';

interface AuthStoreState {
  errorMessage: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoringSession: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  user: AuthUser | null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'The username or password is incorrect.';
    }

    return error.getUserMessage();
  }

  return 'An unexpected authentication error occurred.';
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  errorMessage: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoringSession: false,
  async login(credentials) {
    set({
      errorMessage: null,
      isLoading: true,
    });

    try {
      const result = await authService.login(credentials);
      set({
        errorMessage: null,
        isAuthenticated: true,
        isLoading: false,
        user: result.user,
      });
    } catch (error) {
      set({
        errorMessage: getErrorMessage(error),
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      throw error;
    }
  },
  async logout() {
    set({
      errorMessage: null,
      isLoading: true,
    });

    try {
      await authService.logout();
      appQueryClient.clear();
      set({
        errorMessage: null,
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    } catch (error) {
      set({
        errorMessage: getErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },
  async restoreSession() {
    set({
      errorMessage: null,
      isRestoringSession: true,
    });

    try {
      const session = await authService.restoreSession();
      set({
        errorMessage: null,
        isAuthenticated: Boolean(session),
        isRestoringSession: false,
        user: session?.user ?? null,
      });
    } catch (error) {
      set({
        errorMessage: getErrorMessage(error),
        isAuthenticated: false,
        isRestoringSession: false,
        user: null,
      });
      throw error;
    }
  },
  user: null,
}));
