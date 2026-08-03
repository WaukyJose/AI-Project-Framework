# Mobile Authentication API Specification

## Purpose

This document defines the dedicated authentication contract used by OpenVoz
Mobile.

It exists to separate mobile authentication from the browser-oriented Django
session and form-login flow while preserving the same user model and backend
authentication authority.

## Architectural Rules

- Browser authentication remains unchanged and continues to use Django sessions
  and cookies.
- Mobile authentication uses JSON endpoints under `/api/v1/auth/`.
- Mobile authentication reuses Django's existing `User` model.
- Mobile authentication reuses Django's existing authentication backend through
  `authenticate`, `login`, and `logout`.
- Mobile clients never parse HTML.
- Mobile clients never read `Set-Cookie`.
- Mobile clients never persist or manage Django session cookies.
- Mobile clients persist only the mobile authentication token.

## Implemented Endpoints

### `POST /api/v1/auth/login/`

Authenticates the supplied credentials through Django's existing authentication
backend and returns a mobile token.

Example success response:

```json
{
  "authenticated": true,
  "token": "<mobile-token>",
  "user": {
    "id": 1,
    "identifier": "username",
    "display_name": "Example User",
    "email": "user@example.com",
    "is_staff": false
  }
}
```

### `POST /api/v1/auth/logout/`

Requires:

```http
Authorization: Bearer <mobile-token>
```

Invalidates the supplied token and ends the associated mobile authentication
state.

### `GET /api/v1/auth/validate/`

Requires:

```http
Authorization: Bearer <mobile-token>
```

Validates the supplied token and returns the authenticated mobile user context.

## Token Model

The current implementation uses Django REST Framework's token authentication
model (`rest_framework.authtoken`).

This was selected because it is:

- a maintained, Django-supported authentication component;
- compatible with future API expansion;
- simpler and safer than building a custom token format for this sprint.

## Mobile Persistence Model

OpenVoz Mobile stores only:

- the authentication token;
- the minimal user/session metadata needed for UX continuity.

OpenVoz Mobile does not store:

- Django session ids;
- CSRF tokens;
- cookie headers.

## Validation Model

Application restart restoration uses:

- locally stored mobile token; then
- `GET /api/v1/auth/validate/` with `Authorization: Bearer <token>`.

If validation fails, the stored mobile session is cleared.
