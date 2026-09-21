import { create } from 'zustand';

import { ApiError } from '../services/api';
import { authService } from '../services/auth/auth-service';
import { appQueryClient } from '../services/query/query-client';
import { AuthUser, LoginCredentials, RegistrationCredentials } from '../types/auth';

interface AuthStoreState {
  errorMessage: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoringSession: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: RegistrationCredentials) => Promise<void>;
  restoreSession: () => Promise<void>;
  user: AuthUser | null;
}

function getBackendErrorCode(error: ApiError) {
  if (!error.details || typeof error.details !== 'object') {
    return null;
  }

  const backendError = (error.details as { error?: { code?: unknown } }).error;
  const code = backendError?.code;
  return typeof code === 'string' ? code : null;
}

function getBackendErrorMessage(error: ApiError) {
  if (!error.details || typeof error.details !== 'object') {
    return null;
  }

  const backendError = (error.details as { error?: { message?: unknown } }).error;
  const message = backendError?.message;
  return typeof message === 'string' && message.trim() ? message.trim() : null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const backendCode = getBackendErrorCode(error);

    switch (backendCode) {
      case 'username_taken':
        return 'That username is already taken.';
      case 'invalid_email':
        return 'Enter a valid email address.';
      case 'password_mismatch':
        return 'The passwords do not match.';
      case 'invalid_password':
        return getBackendErrorMessage(error) ?? 'Choose a stronger password.';
      case 'missing_registration_fields':
        return 'Complete all fields to continue.';
    }

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
  async register(credentials) {
    set({
      errorMessage: null,
      isLoading: true,
    });

    try {
      const result = await authService.register(credentials);
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
