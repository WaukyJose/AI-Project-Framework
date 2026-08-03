# OpenVoz Mobile API Specification

## Purpose

This document defines the architectural API contract for OpenVoz Mobile.

Its purpose is to describe how the future OpenVoz mobile application should communicate with the existing OpenVoz backend and related shared services while preserving the architectural boundaries already established in the OpenVoz ecosystem.

This is an API specification document. It defines long-term communication responsibilities, endpoint categories, and service boundaries. It does not define implementation code, Django views, serializers, payload schemas, or mobile networking libraries.

This document is the authority for the general mobile API catalogue only. Speaking conversation transport is owned separately by `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md`.

## API Design Principles

- **API-first.** Mobile communication should occur through explicit backend service contracts rather than through direct coupling to web-specific behavior.
- **Reuse existing services.** Existing OpenVoz backend, authentication, assessment, and subscription capabilities should be reused whenever they already satisfy the mobile use case.
- **Stateless communication.** Each API request should carry the context required for secure processing, subject to the existing authentication model.
- **Versioned endpoints.** Mobile APIs should evolve through explicit versioning rather than silent breaking changes.
- **Secure authentication.** Protected endpoints should remain inside the existing OpenVoz trust boundary and use approved authentication mechanisms.
- **JSON payloads.** Structured request and response data should use consistent JSON-based contracts where file upload is not required.
- **Backward compatibility.** Mobile API evolution should preserve compatibility for supported clients whenever practical.
- **Server authority.** The backend remains authoritative for identity, workflow acceptance, conversation state, assessment records, and subscription status.

## System Context

OpenVoz Mobile communicates with the existing OpenVoz ecosystem through backend APIs.

```text
OpenVoz Mobile Application
            ↓
          REST API
            ↓
   OpenVoz Django Backend
            ↓
OpenVoz Assessment Platform
            ↓
   External AI Providers
```

Within this context:

- The mobile application is an API client.
- The Django backend remains the authoritative application boundary.
- The assessment platform remains a backend-owned subsystem, not a separate mobile integration target.
- External AI providers remain behind backend abstractions and are never called directly by the mobile client.

## Authentication APIs

OpenVoz Mobile should reuse the existing OpenVoz authentication system rather than introducing a separate mobile identity model.

As of Monday, August 3, 2026, the OpenVoz backend exposes a dedicated mobile JSON authentication contract that reuses Django's existing authentication backend while leaving the web login flow unchanged.

| Endpoint | Purpose | Current Status | Notes |
| --- | --- | --- | --- |
| `POST /api/v1/auth/login/` | Authenticate a user and start a mobile session | Implemented | Uses Django `authenticate()` and `login()` plus Django REST Framework token authentication for mobile token issuance. |
| `POST /api/v1/auth/logout/` | End the current authenticated session | Implemented | Invalidates the mobile token and calls Django `logout()` without changing the browser auth contract. |
| `POST /api/v1/auth/register/` | Create a new user account when self-registration is permitted | Future | Registration behavior may already exist in the web experience, but it is not documented as a reusable mobile API contract. |
| `POST /api/v1/auth/password-reset/request/` | Initiate password reset workflow | Future | Should reuse the existing account-recovery model rather than define a separate mobile flow. |
| `POST /api/v1/auth/password-reset/confirm/` | Complete password reset workflow | Future | Depends on the existing OpenVoz account-recovery implementation being exposed through an API. |
| `POST /api/v1/auth/refresh/` | Refresh session or token state for mobile continuity | Future | Required only if the token lifecycle later needs an explicit rotation or renewal contract. |
| `GET /api/v1/auth/validate/` | Confirm that the current session remains valid | Implemented | Validates the Bearer token and returns backend-authenticated user context for session restoration and protected-route entry checks. |

### Authentication Classification Notes

- **Requires Extension** means the underlying backend capability already exists conceptually, but the repository does not yet document a stable mobile API contract for it.
- **Future** means the capability may exist in some form in the web experience, but a reusable mobile API boundary is not yet documented and should not be assumed as available.

## User APIs

User-oriented APIs should expose learner data that the mobile client needs without moving account ownership or progress authority onto the device.

| Endpoint | Purpose | Current Status | Notes |
| --- | --- | --- | --- |
| `GET /api/v1/users/me/` | Retrieve the authenticated user's profile | Requires Extension | Mobile requires a clear profile contract independent of server-rendered pages. |
| `PATCH /api/v1/users/me/` | Update editable profile details | Future | Should be added only for fields the mobile application is authorized to edit. |
| `GET /api/v1/users/me/progress/` | Retrieve learner progress and performance summaries | Planned | OpenVoz already evaluates learning activity, but a mobile progress API should be defined explicitly. |
| `GET /api/v1/users/me/preferences/` | Retrieve user preferences | Planned | Needed for mobile personalization and device-level continuity. |
| `PATCH /api/v1/users/me/preferences/` | Update user preferences | Planned | Should remain limited to user-configurable preferences rather than system-owned settings. |
| `GET /api/v1/users/me/subscription/` | Retrieve subscription status and entitlements | Requires Extension | The subscription system exists, but a mobile-readable contract should be defined. |
| `GET /api/v1/users/me/usage/` | Retrieve usage statistics relevant to entitlements or learner activity | Planned | Useful for subscription and engagement visibility if supported by the existing backend. |

## Speaking APIs

Speaking conversation transport is intentionally excluded from this document.

The authoritative source for:

- speaking session creation
- session retrieval
- session start
- turn submission
- completion transport
- speaking assessment retrieval transport
- conversation request and response schemas
- session and turn state machines

is `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md`.

This document retains only the broader mobile API catalogue outside the speaking transport contract. Non-transport speaking history endpoints remain catalogued in the endpoint inventory below.

## Assessment APIs

Assessment APIs should expose the outputs of the shared OpenVoz assessment platform without moving assessment policy or scoring logic into the mobile client.

These APIs should remain consistent with:

- `Projects/OpenVoz/CAMBRIDGE_ASSESSMENT_ENGINE.md`
- `Projects/OpenVoz/ASSESSMENT_ENGINE_DECISIONS.md`

| Endpoint | Purpose | Current Status | Notes |
| --- | --- | --- | --- |
| `POST /api/v1/assessments/requests/` | Request assessment processing for completed evidence | Planned | May be unnecessary if speaking-session completion triggers assessment automatically. |
| `GET /api/v1/assessments/{assessment_id}/` | Retrieve one assessment result | Missing | Mobile needs a stable report-retrieval contract. |
| `GET /api/v1/assessments/{assessment_id}/feedback/` | Retrieve learner-facing coaching feedback | Planned | May be included in the main assessment response, but the contract should be explicit. |
| `GET /api/v1/assessments/{assessment_id}/scores/` | Retrieve criterion-level and overall scores | Planned | May be included in the main assessment response if the backend exposes a combined report. |
| `GET /api/v1/assessments/history/` | Retrieve assessment history for the current learner | Planned | Supports review, longitudinal visibility, and future progress views. |
| `GET /api/v1/assessments/{assessment_id}/status/` | Retrieve current assessment processing state | Planned | Useful when assessment is asynchronous. |

Assessment APIs should return backend-authored results only. The mobile client must not reinterpret incomplete evidence as a valid assessment.

## Content APIs

Content APIs should expose the reusable learning and assessment content required by the mobile application.

| Endpoint | Purpose | Current Status | Notes |
| --- | --- | --- | --- |
| `GET /api/v1/content/practice-materials/` | Retrieve practice content available to the learner | Planned | Needed if mobile extends current OpenVoz practice workflows. |
| `GET /api/v1/content/images/{image_id}/` | Retrieve referenced image assets | Planned | Useful for prompt-driven or task-driven speaking workflows. |
| `GET /api/v1/content/prompts/` | Retrieve prompts for speaking or guided practice | Planned | Should remain backend-controlled for consistency across clients. |
| `GET /api/v1/content/tasks/` | Retrieve task definitions for mobile workflows | Planned | Includes task identity, sequencing, and availability metadata. |
| `GET /api/v1/content/exams/metadata/` | Retrieve exam families, levels, or task metadata | Planned | Supports presentation without embedding exam definitions on device. |
| `GET /api/v1/content/question-sets/` | Retrieve question sets or structured task content | Planned | Needed where question progression is server-governed. |
| `GET /api/v1/content/downloads/` | Retrieve downloadable assets approved for device caching | Future | Relevant only if offline content packages are introduced. |

## Synchronization APIs

Synchronization APIs are required to support controlled offline resilience and recovery.

These APIs are forward-looking because the current OpenVoz repository documents server authority and evidence integrity, but not a dedicated mobile synchronization contract.

| Endpoint | Purpose | Current Status | Notes |
| --- | --- | --- | --- |
| `POST /api/v1/sync/queue/submit/` | Submit queued offline-capable actions after reconnect | Planned | Should be limited to actions that remain safe under deferred submission. |
| `GET /api/v1/sync/queue/{queue_id}/status/` | Retrieve processing state for queued work | Planned | Useful for retry visibility and recovery. |
| `POST /api/v1/sync/retry/` | Request retry of failed synchronizable actions | Planned | Must preserve idempotent backend behavior. |
| `GET /api/v1/sync/progress/` | Retrieve synchronized progress state after recovery | Planned | Supports reconciliation after offline activity. |
| `POST /api/v1/sync/conflicts/resolve/` | Resolve explicitly supported synchronization conflicts | Future | Should exist only if the backend defines a governed conflict workflow. |

Synchronization endpoints must preserve the server-authoritative model documented elsewhere in the mobile and assessment architecture.

## Notification APIs

Notification APIs are future support only.

| Endpoint | Purpose | Current Status | Notes |
| --- | --- | --- | --- |
| `GET /api/v1/notifications/` | Retrieve mobile-visible notifications | Future | Supports in-app notification display. |
| `PATCH /api/v1/notifications/{notification_id}/read/` | Mark a notification as read | Future | Client acknowledgment only; notification policy remains server-owned. |
| `GET /api/v1/notifications/preferences/` | Retrieve notification preferences | Future | Needed if notifications become user-configurable. |
| `PATCH /api/v1/notifications/preferences/` | Update notification preferences | Future | Should support reminders, subscription updates, and assessment availability preferences. |

Potential notification domains include practice reminders, subscription updates, and assessment availability.

## Error Handling

OpenVoz Mobile APIs should follow a consistent error-handling philosophy.

### HTTP Status Usage

- `2xx` responses indicate successful request acceptance or completion.
- `4xx` responses indicate client-visible issues such as validation errors, authentication failures, authorization failures, or unsupported actions.
- `5xx` responses indicate server-side failures or unavailable backend services.

### Standard Error Format

Error responses should use a consistent structured format that:

- identifies the general error category;
- provides a human-readable message suitable for controlled client display;
- includes machine-readable error codes where needed for client behavior;
- distinguishes validation problems from authentication or service failures.

### Validation Errors

Validation failures should identify which request fields or workflow conditions prevented acceptance without exposing internal server implementation detail.

### Authentication Failures

Authentication failures should clearly distinguish:

- unauthenticated requests
- expired or invalid session state
- authenticated requests lacking permission for the requested resource

### Network Failures

The mobile client should treat transport failure, timeout, and unreachable-service conditions separately from application-level error responses.

## Versioning Strategy

OpenVoz Mobile should use explicit API versioning.

The versioning strategy should preserve these principles:

- Mobile APIs should be introduced under a versioned path such as `/api/v1/`.
- Breaking changes should require a new API version rather than silent modification of an existing contract.
- Non-breaking additive changes may occur within an existing version when they do not invalidate supported clients.
- The backend should preserve supported versions long enough to allow controlled mobile client updates.
- Shared backend and assessment evolution should occur behind stable mobile-facing contracts whenever possible.

## Security Considerations

Security for mobile APIs should remain aligned with the existing OpenVoz trust boundary.

Key considerations include:

- **Authentication.** Protected APIs must use the existing OpenVoz authentication model.
- **Authorization.** Access to user, speaking, subscription, and assessment records must remain scoped to the authorized user and approved roles.
- **Transport security.** All API traffic must use secure transport.
- **Rate limiting.** Sensitive or expensive endpoints should support abuse protection and operational safeguards.
- **Privacy.** Personally identifiable information, transcripts, recordings, assessment outputs, and subscription data should be exposed only as required by the mobile workflow.

Security controls should protect both ordinary account endpoints and assessment-related endpoints, which may involve sensitive learner evidence and reports.

## Implemented Connectivity Baseline

Sprint 1 introduced the first implemented mobile communication layer in `Projects/OpenVoz_Mobile/Mobile/services/api/`.

The implemented baseline includes:

- `api-client.ts` as the shared request gateway
- `auth-api.ts`, `speaking-api.ts`, and `assessment-api.ts` as feature-specific API entry points
- environment-aware base URL selection through `utils/env.ts`
- timeout handling, common headers, response parsing, structured error normalization, and development-only logging

As verified against the live production deployment on **August 3, 2026**:

- `GET https://www.openvoz.com/usersvoicechat/login/` is reachable and can be used as a temporary backend reachability check.
- `GET https://www.openvoz.com/api/version/` is not currently exposed.
- `GET https://www.openvoz.com/api/v1/health/` is not currently exposed.

This means the mobile client can verify server reachability today, but a dedicated read-only JSON health or version endpoint still needs to be added in the backend repository for authoritative API diagnostics.

## Implemented Authentication Baseline

Sprint 2 introduced the first implemented authentication layer in `Projects/OpenVoz_Mobile/Mobile/services/auth/`.

The implemented baseline includes:

- CSRF bootstrap against the existing Django login page
- credential submission through the shared API client
- secure session persistence on native platforms through `expo-secure-store`
- session restoration during application launch
- centralized authentication state in `store/auth-store.ts`

This implementation is no longer transitional at the authentication boundary. The mobile client now authenticates through explicit token-based JSON endpoints under `/api/v1/auth/` and no longer depends on HTML login page parsing, CSRF token scraping, or Django session-cookie persistence.

## Implemented Shared Speaking Baseline

Sprint 4 introduced the first reusable speaking infrastructure in `Projects/OpenVoz_Mobile/Mobile/`.

The implemented baseline includes:

- a shared speaking workspace routed through `app/(app)/practice/[part].tsx`
- centralized speaking session state in `store/speaking-store.ts`
- reusable speaking components for timer, recording controls, and backend integration
- a capability-based recording abstraction in `services/speaking/speaking-recorder.ts`
- extended speaking API integration for session creation, audio upload, and assessment requests

As of **Monday, August 3, 2026**, the client implementation exposes two important constraints:

- Browser environments with `MediaRecorder` support can exercise the shared recording abstraction.
- Native mobile platforms still require an approved audio package before the same recording capability can become fully operational there.

This means the sprint implementation now covers the reusable client-side speaking framework, while backend endpoint payload alignment and native audio parity remain explicit follow-up items rather than hidden assumptions.

## Endpoint Inventory

| Service | Endpoint | Purpose | Current Status | Notes |
| --- | --- | --- | --- | --- |
| Authentication | `POST /api/v1/auth/login/` | Authenticate user | Implemented | Dedicated JSON API backed by Django authentication and DRF token issuance |
| Authentication | `POST /api/v1/auth/logout/` | End session | Implemented | Dedicated JSON API backed by token invalidation |
| Authentication | `POST /api/v1/auth/register/` | Register user | Future | Depends on approved self-registration support |
| Authentication | `POST /api/v1/auth/password-reset/request/` | Start password reset | Future | Reuse existing account recovery where present |
| Authentication | `POST /api/v1/auth/password-reset/confirm/` | Complete password reset | Future | Mobile API contract not yet documented |
| Authentication | `POST /api/v1/auth/refresh/` | Refresh session state | Future | Needed only if mobile session model requires it |
| Authentication | `GET /api/v1/auth/validate/` | Validate current session | Implemented | Used by the mobile client to restore validated backend token state |
| User | `GET /api/v1/users/me/` | Retrieve profile | Requires Extension | Profile data contract for mobile |
| User | `PATCH /api/v1/users/me/` | Update profile | Future | Limited editable profile fields only |
| User | `GET /api/v1/users/me/progress/` | Retrieve progress | Planned | Learner progress summary |
| User | `GET /api/v1/users/me/preferences/` | Retrieve preferences | Planned | Mobile continuity and personalization |
| User | `PATCH /api/v1/users/me/preferences/` | Update preferences | Planned | User-configurable preferences |
| User | `GET /api/v1/users/me/subscription/` | Retrieve subscription status | Requires Extension | Subscription system exists |
| User | `GET /api/v1/users/me/usage/` | Retrieve usage statistics | Planned | Entitlement and engagement visibility |
| Speaking | Conversation session, turn, completion, and assessment transport | See authoritative conversation contract | Authority lives in `MOBILE_CONVERSATION_API_SPECIFICATION.md` | This inventory does not duplicate speaking transport endpoints. |
| Speaking | `GET /api/v1/speaking/history/` | Retrieve speaking history | Planned | Learner review |
| Speaking | `GET /api/v1/speaking/history/{session_id}/` | Retrieve speaking session detail | Planned | One historical session |
| Assessment | `POST /api/v1/assessments/requests/` | Request assessment processing | Planned | May be redundant if session completion triggers assessment |
| Assessment | `GET /api/v1/assessments/{assessment_id}/` | Retrieve assessment result | Missing | Stable assessment report contract |
| Assessment | `GET /api/v1/assessments/{assessment_id}/feedback/` | Retrieve coaching feedback | Planned | May be embedded in main report |
| Assessment | `GET /api/v1/assessments/{assessment_id}/scores/` | Retrieve scores | Planned | May be embedded in main report |
| Assessment | `GET /api/v1/assessments/history/` | Retrieve assessment history | Planned | Longitudinal review |
| Assessment | `GET /api/v1/assessments/{assessment_id}/status/` | Retrieve processing status | Planned | Useful for async assessment |
| Content | `GET /api/v1/content/practice-materials/` | Retrieve practice materials | Planned | For mobile learning workflows |
| Content | `GET /api/v1/content/images/{image_id}/` | Retrieve image asset | Planned | Task- or prompt-related content |
| Content | `GET /api/v1/content/prompts/` | Retrieve prompts | Planned | Backend-controlled prompt delivery |
| Content | `GET /api/v1/content/tasks/` | Retrieve task definitions | Planned | Task identity and sequencing |
| Content | `GET /api/v1/content/exams/metadata/` | Retrieve exam metadata | Planned | Exam family, level, task metadata |
| Content | `GET /api/v1/content/question-sets/` | Retrieve question sets | Planned | Structured task content |
| Content | `GET /api/v1/content/downloads/` | Retrieve downloadable assets | Future | Only if offline content packaging is added |
| Synchronization | `POST /api/v1/sync/queue/submit/` | Submit queued actions | Planned | Offline-capable deferred submission |
| Synchronization | `GET /api/v1/sync/queue/{queue_id}/status/` | Retrieve queue status | Planned | Visibility after reconnect |
| Synchronization | `POST /api/v1/sync/retry/` | Retry failed sync work | Planned | Preserve idempotent backend behavior |
| Synchronization | `GET /api/v1/sync/progress/` | Retrieve synchronized progress | Planned | Reconciliation after recovery |
| Synchronization | `POST /api/v1/sync/conflicts/resolve/` | Resolve supported sync conflicts | Future | Only if governed conflict workflow exists |
| Notification | `GET /api/v1/notifications/` | Retrieve notifications | Future | In-app notification visibility |
| Notification | `PATCH /api/v1/notifications/{notification_id}/read/` | Mark notification as read | Future | Client acknowledgment only |
| Notification | `GET /api/v1/notifications/preferences/` | Retrieve notification preferences | Future | Needed if notifications are configurable |
| Notification | `PATCH /api/v1/notifications/preferences/` | Update notification preferences | Future | Reminder and status preferences |

## Future Expansion

Future API evolution may support:

- teacher-facing dashboards and review surfaces
- learner and institutional analytics
- controlled offline assessment workflows
- additional Cambridge levels and future assessment profiles
- additional AI providers behind the existing backend and assessment abstractions

Any expansion should preserve the current OpenVoz ownership boundaries for backend authority, assessment policy, identity, and protected learner data.

## Related Documents

- `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_PLATFORM_ARCHITECTURE.md`
- `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz/SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz/CAMBRIDGE_ASSESSMENT_ENGINE.md`
- `Projects/OpenVoz/ASSESSMENT_ENGINE_DECISIONS.md`
- `Projects/OpenVoz/ARCHITECTURE_DECISIONS.md`
