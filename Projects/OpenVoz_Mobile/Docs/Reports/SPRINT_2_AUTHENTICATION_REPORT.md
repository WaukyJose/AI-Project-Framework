# Sprint 2 Authentication Report

## Purpose

Sprint 2 transforms the Expo application foundation into an authenticated OpenVoz mobile client without introducing mobile-owned identity logic.

The sprint reuses the existing OpenVoz authentication boundary and adds the client-side session infrastructure required for future speaking, assessment, and learner workflows.

## Implemented Features

- A dedicated authentication service layer in `services/auth/`
- Secure session persistence through `expo-secure-store` on supported native platforms
- Session restoration during application bootstrap
- Centralized authentication state in `store/auth-store.ts`
- Authenticated routing that directs users to either the login screen or dashboard shell
- Login form validation and user-facing authentication error handling
- Query cache invalidation during logout

## Authentication Flow

The implemented Sprint 2 flow was the original transitional version of the existing server-owned OpenVoz model:

1. The mobile client requested the existing Django login page.
2. The client extracted the CSRF token required for form submission.
3. The client submitted credentials back to the same server-owned login endpoint.
4. The backend remained authoritative for session acceptance or rejection.
5. The mobile client stored only session continuity metadata required for later requests and restart recovery.
6. On application launch, the client attempted to restore the stored session before routing the user.

## Historical Status

This report now describes the superseded Sprint 2 baseline only.

As of Monday, August 3, 2026:

- the backend exposes `POST /api/v1/auth/login/`, `POST /api/v1/auth/logout/`, and `GET /api/v1/auth/validate/`;
- the mobile client no longer depends on HTML parsing or CSRF scraping for authentication;
- backend session validation is explicit rather than heuristic.

## Architecture Decisions

- Authentication remains backend-owned. The mobile client does not define a separate identity model.
- The service layer owns CSRF bootstrap, session persistence, and session restoration concerns.
- UI components do not contain authentication networking or storage logic.
- The authentication store is the single client-side source of truth for login state.
- Logout clears cached remote data so later authenticated features do not retain stale protected responses.

## Tested Behavior

- Application bootstrap with unauthenticated state
- Login form validation
- Authentication state transition after successful service resolution
- Logout state reset and query cache clearing
- Session restoration from stored session metadata
- Graceful handling for:
  - invalid credentials
  - no network
  - server unavailability
  - expired local session metadata

## Known Limitations

- Password recovery remains routed to the existing backend-owned workflow and is not yet opened inside the app shell.
- Registration and authenticated profile retrieval still require separate documented mobile API contracts.

## Future Work

- Add authenticated user profile retrieval once a reusable API contract exists.
- Add protected route groups for dashboard, speaking, assessment, and history features.
- Extend the documented mobile auth family only where durable backend requirements exist beyond login, logout, and validation.
