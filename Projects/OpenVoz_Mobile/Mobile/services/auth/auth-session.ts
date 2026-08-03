import { AuthSession } from '../../types/auth';

export function isSessionExpired(session: AuthSession) {
  if (!session.expiresAt) {
    return false;
  }

  return new Date(session.expiresAt).getTime() <= Date.now();
}

export function sanitizeAuthSession(session: AuthSession) {
  return {
    environmentName: session.environmentName,
    expiresAt: session.expiresAt,
    hasToken: Boolean(session.token),
    userIdentifier: session.user.identifier,
  };
}
