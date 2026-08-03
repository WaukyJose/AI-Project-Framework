import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { AuthSession } from '../../types/auth';
import { logger } from '../../utils/logger';

const AUTH_SESSION_KEY = 'openvoz.mobile.auth.session';

function supportsSecureStore() {
  return Platform.OS !== 'web';
}

async function setWebValue(value: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (value === null) {
    window.sessionStorage.removeItem(AUTH_SESSION_KEY);
    return;
  }

  window.sessionStorage.setItem(AUTH_SESSION_KEY, value);
}

async function getWebValue() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem(AUTH_SESSION_KEY);
}

export const authStorage = {
  async clearSession() {
    if (supportsSecureStore()) {
      await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
      return;
    }

    await setWebValue(null);
  },

  async readSession() {
    const rawSession = supportsSecureStore()
      ? await SecureStore.getItemAsync(AUTH_SESSION_KEY)
      : await getWebValue();

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as AuthSession;
    } catch (error) {
      logger.warn('auth.storage.invalid_session', {
        message: error instanceof Error ? error.message : 'Unknown secure storage parse failure',
      });
      await authStorage.clearSession();
      return null;
    }
  },

  async writeSession(session: AuthSession) {
    const serializedSession = JSON.stringify(session);

    if (supportsSecureStore()) {
      await SecureStore.setItemAsync(AUTH_SESSION_KEY, serializedSession);
      return;
    }

    await setWebValue(serializedSession);
  },
};
