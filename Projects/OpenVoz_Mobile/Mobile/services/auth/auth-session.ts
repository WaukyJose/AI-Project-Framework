import { AuthSession } from '../../types/auth';

export function isSessionExpired(session: AuthSession) {
  if (!session.expiresAt) {
    return false;
  }

  return new Date(session.expiresAt).getTime() <= Date.now();
}

export function createSessionCookieHeader(session: AuthSession) {
  return [session.csrfToken ? `csrftoken=${session.csrfToken}` : null, session.sessionCookie]
    .filter((value): value is string => Boolean(value))
    .join('; ');
}

export function sanitizeAuthSession(session: AuthSession) {
  return {
    environmentName: session.environmentName,
    expiresAt: session.expiresAt,
    hasCsrfToken: Boolean(session.csrfToken),
    hasSessionCookie: Boolean(session.sessionCookie),
    userIdentifier: session.user.identifier,
  };
}
