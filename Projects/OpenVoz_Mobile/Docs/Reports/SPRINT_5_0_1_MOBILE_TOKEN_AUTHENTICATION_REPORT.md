# Sprint 5.0.1 Mobile Token Authentication Report

## Date

Monday, August 3, 2026

## Objective

Replace the mobile Django session-cookie dependency used by OpenVoz Mobile with
a mobile authentication token while preserving the existing browser
authentication flow.

## Architecture Decisions

- Browser authentication remains unchanged and continues to use Django sessions
  and cookies.
- Mobile authentication now uses dedicated JSON endpoints under `/api/v1/auth/`.
- Mobile authentication continues to reuse Django's existing `User` model.
- Mobile authentication continues to reuse Django's existing authentication
  backend through `authenticate`, `login`, and `logout`.
- The mobile token implementation uses Django REST Framework token
  authentication (`rest_framework.authtoken`) instead of a custom token format.
- The mobile client stores only the token and no longer stores Django session
  cookies or CSRF state.

## Backend Implementation

Implemented endpoints:

- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/logout/`
- `GET /api/v1/auth/validate/`

Behavior:

- login authenticates credentials through Django and returns a mobile token;
- validate authenticates via `Authorization: Bearer <token>`;
- logout invalidates the token;
- browser login routes remain unchanged.

## Mobile Implementation

The mobile client now:

- stores only the mobile token in secure storage;
- restores session state through token validation;
- sends `Authorization: Bearer <token>` for authenticated API requests;
- no longer reads `Set-Cookie`;
- no longer persists `sessionCookie`;
- no longer uses cookie-based restore logic.

## Files Modified

### OpenVoz (Django)

- `voicechat/settings.py`
- `requirements.txt`
- `chat/mobile_auth_views.py`
- `chat/tests_mobile_auth.py`

### OpenVoz Mobile (Expo)

- `Mobile/types/auth.ts`
- `Mobile/services/api/api-client.ts`
- `Mobile/services/api/auth-api.ts`
- `Mobile/services/auth/auth-service.ts`
- `Mobile/services/auth/auth-session.ts`
- `Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`
- `Docs/Architecture/MOBILE_AUTHENTICATION_API_SPECIFICATION.md`
- `IMPLEMENTATION_STATUS.md`
- `CURRENT_SPRINT.md`

## Tests Executed

### Backend

- `python manage.py test chat.tests_mobile_auth`

Covered:

- successful login
- invalid credentials
- validate authenticated
- validate unauthenticated
- logout
- token invalidation

### Mobile

- `npm run typecheck`

The mobile login, restore-session, and logout flows were refactored to the new
token architecture and verified at compile time through the updated auth
service, storage, and API-client integration.

## Migration Notes

- Previous mobile sessions that depended on stored session-cookie metadata are
  obsolete.
- After deploying the backend and shipping the updated mobile client, users must
  log in again to obtain a mobile token.
- No browser-authentication migration is required.

## Remaining Risks

- DRF token authentication is stateful and database-backed; it is appropriate
  for this sprint but may later require explicit token-rotation policy if the
  mobile API surface expands.
- Existing mobile speaking endpoints were intentionally not changed in this
  sprint; when protected speaking endpoints are introduced, they must rely on
  the shared Bearer-token request path rather than reintroducing cookies.
