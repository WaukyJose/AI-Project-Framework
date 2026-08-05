# Part 1 Transport Authority & Contract Specification

## Executive Summary

This document establishes the official, frozen Django backend transport contract for the mobile application within the OpenVoz ecosystem. Following the backend authority audit (`BACKEND_AUTHORITY_AUDIT.md`), this phase verifies and documents the exact request payloads, response structures, authentication requirements, permissions, HTTP status codes, and error models for all authoritative mobile API endpoints.

The purpose of this specification is to freeze the JSON transport contract so that mobile client development (TypeScript interfaces, React Query hooks, API clients, and UI components) integrates against a stable, server-authoritative backend contract without guessing payload shapes.

---

## Verification Status

**Status:** ✅ **Verified** (Through static analysis of backend view handlers, serializers/dictionary builders, and test suites).

---

## Endpoint Inventory

| Endpoint | HTTP Method | View / Function | Authentication | Permissions | Purpose |
| --- | --- | --- | --- | --- | --- |
| `/api/v1/auth/login/` | POST | `chat.mobile_auth_views.mobile_login` | None (Public) | `@csrf_exempt`, `@require_POST` | Authenticate user credentials and issue a mobile DRF token. |
| `/api/v1/auth/logout/` | POST | `chat.mobile_auth_views.mobile_logout` | Token (Bearer) | `@csrf_exempt`, `@require_POST` | Invalidate mobile token and end session. |
| `/api/v1/auth/validate/` | GET | `chat.mobile_auth_views.mobile_validate` | Token (Bearer) | `@require_GET` | Validate existing token and return authenticated user context. |
| `/api/mobile/profile/` | GET | `chat.mobile_auth_views.mobile_profile` | Token (Bearer) | `@require_GET` | Retrieve authenticated user profile details. |
| `/api/mobile/subscription/` | GET | `chat.mobile_auth_views.mobile_subscription` | Token (Bearer) | `@require_GET` | Retrieve active subscription status and entitlement source. |
| `/api/mobile/dashboard/` | GET | `chat.mobile_auth_views.mobile_dashboard` | Token (Bearer) | `@require_GET` | Retrieve aggregated dashboard profile, subscription, and learning statistics. |

---

## Authentication

- **Mechanism:** Django REST Framework Token Authentication (`rest_framework.authtoken`).
- **Header Format:** `Authorization: Bearer <mobile-token>`
- **Exclusions:** Public authentication endpoints (`/api/v1/auth/login/`) require no credentials.
- **Session/Cookie Handling:** Mobile requests bypass Django session cookies; authentication is strictly stateless via the Bearer token.

---

## Permissions

- **Public Endpoints:** `/api/v1/auth/login/` (AllowAny / unauthenticated).
- **Protected Endpoints:** `/api/v1/auth/logout/`, `/api/v1/auth/validate/`, `/api/mobile/profile/`, `/api/mobile/subscription/`, `/api/mobile/dashboard/` require a valid, active token belonging to an active user (`user.is_active == True`).

---

## Request Contracts

### 1. `POST /api/v1/auth/login/`
- **Content-Type:** `application/json`
- **Body Schema:**
  ```json
  {
    "username": "string (required)",
    "password": "string (required)"
  }
  ```

### 2. `POST /api/v1/auth/logout/`
- **Content-Type:** `application/json` (optional/empty)
- **Headers:** `Authorization: Bearer <token>` (required)

### 3. `GET /api/v1/auth/validate/`
- **Headers:** `Authorization: Bearer <token>` (required)

### 4. `GET /api/mobile/profile/`
- **Headers:** `Authorization: Bearer <token>` (required)

### 5. `GET /api/mobile/subscription/`
- **Headers:** `Authorization: Bearer <token>` (required)

### 6. `GET /api/mobile/dashboard/`
- **Headers:** `Authorization: Bearer <token>` (required)

---

## Response Contracts

### 1. `POST /api/v1/auth/login/` (Success - 200 OK)
```json
{
  "authenticated": true,
  "token": "string",
  "user": {
    "id": 1,
    "identifier": "string",
    "display_name": "string | null",
    "email": "string | null",
    "is_staff": false
  }
}
```

### 2. `POST /api/v1/auth/logout/` (Success - 200 OK)
```json
{
  "authenticated": false,
  "logged_out": true
}
```

### 3. `GET /api/v1/auth/validate/` (Success - 200 OK)
Same schema as Login success response (`authenticated`, `token`, `user`).

### 4. `GET /api/mobile/profile/` (Success - 200 OK)
```json
{
  "id": 1,
  "username": "string",
  "first_name": "string",
  "last_name": "string",
  "full_name": "string",
  "email": "string"
}
```

### 5. `GET /api/mobile/subscription/` (Success - 200 OK)
```json
{
  "has_subscription": true,
  "status": "active",
  "source": "entitlement",
  "plan": {
    "code": "B2EXAMS_FULL",
    "name": "B2 Exams Full Access"
  },
  "provider": "paypal",
  "valid_until": "2026-09-03T10:00:00Z"
}
```

### 6. `GET /api/mobile/dashboard/` (Success - 200 OK)
```json
{
  "user": {
    "id": 1,
    "username": "string",
    "first_name": "string",
    "last_name": "string",
    "full_name": "string",
    "email": "string"
  },
  "subscription": {
    "has_subscription": true,
    "status": "active",
    "source": "entitlement",
    "plan": {
      "code": "B2EXAMS_FULL",
      "name": "B2 Exams Full Access"
    },
    "provider": "paypal",
    "valid_until": "2026-09-03T10:00:00Z"
  },
  "dashboard": {
    "stats": {
      "questions_answered": 0,
      "correct_answers": 0,
      "accuracy": 0,
      "study_minutes": 0,
      "streak": 0
    },
    "recent_activity": []
  }
}
```

---

## Error Contracts

All error responses from mobile API views (`chat/mobile_auth_views.py`) adhere to a uniform structure:

```json
{
  "authenticated": false,
  "error": {
    "code": "error_code_string",
    "message": "Human-readable description"
  }
}
```

### Authoritative Error Codes & Status Codes
- `400 Bad Request`:
  - `invalid_json`: `"Invalid JSON body."`
  - `missing_credentials`: `"Username and password are required."`
- `401 Unauthorized`:
  - `invalid_credentials`: `"Invalid username or password."`
  - `authentication_required`: `"Authentication required."`
  - `invalid_token`: `"Invalid authentication token."`
- `403 Forbidden`:
  - `inactive_account`: `"This account is inactive."`

---

## Field Dictionary

| Field Path | Data Type | Nullable | Required | Description |
| --- | --- | --- | --- | --- |
| `authenticated` | boolean | No | Yes | Indicates whether the request context is authenticated. |
| `token` | string | No | Yes | DRF Bearer token key for mobile authorization. |
| `user.id` | integer | No | Yes | Primary key of the Django user. |
| `user.identifier` | string | No | Yes | Username or primary login handle. |
| `user.display_name` | string | Yes | No | Full name or formatted display name. |
| `user.email` | string | Yes | No | User email address. |
| `user.is_staff` | boolean | No | Yes | Staff/admin status flag. |
| `profile.username` | string | No | Yes | User account username. |
| `profile.full_name` | string | No | Yes | Combined first and last name. |
| `subscription.has_subscription` | boolean | No | Yes | Active premium status indicator. |
| `subscription.status` | string | No | Yes | Status string (`active` or `inactive`). |
| `subscription.source` | string | Yes | No | Entitlement source (`entitlement` or `legacy_membership`). |
| `subscription.plan.code` | string | Yes | No | Unique plan/entitlement code. |
| `subscription.plan.name` | string | Yes | No | Display name of the subscription plan. |
| `subscription.provider` | string | Yes | No | Payment gateway provider (`paypal`, `dlocalgo`). |
| `subscription.valid_until` | string (ISO-8601) | Yes | No | Expiration timestamp of the subscription. |
| `dashboard.stats.*` | integer / float | No | Yes | Learning engagement metrics (currently placeholder values). |
| `dashboard.recent_activity` | array | No | Yes | Recent activity log (currently empty list). |

---

## Payload Examples

### Successful Login Request & Response
**Request:**
```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "username": "mobile-user",
  "password": "testpass123"
}
```
**Response (200 OK):**
```json
{
  "authenticated": true,
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 4,
    "identifier": "mobile-user",
    "display_name": "Mobile User",
    "email": "mobile@example.com",
    "is_staff": false
  }
}
```

---

## Version Information

- **API Version Path:** `/api/v1/` and `/api/mobile/`
- **Specification Release Date:** August 2026
- **Ecosystem Target:** OpenVoz Mobile Client / OpenVoz Django Backend

---

## Risks

1. **Placeholder Dashboard Metrics:** Dashboard stats return static zeros (`questions_answered: 0`), which will require future backend aggregation work when learner activity analytics are finalized.
2. **Manual Dictionary Payload Builders:** Because views construct JSON dicts manually rather than using DRF Serializers, automated OpenAPI/Swagger generation is not active for these mobile endpoints.

---

## Verification Matrix

| Endpoint | HTTP Method | Authentication | Verified Request | Verified Response | Status |
| --- | --- | --- | --- | --- | --- |
| `/api/v1/auth/login/` | POST | None | JSON body (`username`, `password`) | Auth JSON payload with token | ✅ Verified |
| `/api/v1/auth/logout/` | POST | Bearer Token | Bearer Authorization header | Logout confirmation payload | ✅ Verified |
| `/api/v1/auth/validate/` | GET | Bearer Token | Bearer Authorization header | Auth JSON payload with token | ✅ Verified |
| `/api/mobile/profile/` | GET | Bearer Token | Bearer Authorization header | User profile JSON object | ✅ Verified |
| `/api/mobile/subscription/` | GET | Bearer Token | Bearer Authorization header | Subscription status JSON object | ✅ Verified |
| `/api/mobile/dashboard/` | GET | Bearer Token | Bearer Authorization header | Aggregated dashboard JSON object | ✅ Verified |
