# Mobile Conversation API Specification

## Purpose

This document defines the durable public API contract for conversation-based speaking workflows between OpenVoz Mobile and the OpenVoz Django backend.

Its purpose is to specify the server-authoritative session, turn, completion, and assessment interfaces required for mobile delivery of Cambridge speaking experiences while preserving functional parity with the Django functional authority.

This document is architecture-level and contract-level guidance. It does not define Django implementation details, mobile UI design, examiner wording, or internal assessment logic.

## Non-goals

This specification does not define:

- Cambridge assessment rules
- examiner behavior
- prompt wording
- UI design
- mobile presentation
- internal Django implementation
- internal storage layout for transcripts, audio, or assessments
- model-provider selection for transcription or AI services

These remain the responsibility of the functional authority and the owning repository implementations.

## Architectural Principles

### Server Authority

The backend remains authoritative for:

- conversation identity
- transcript integrity
- session timing
- turn acceptance
- completion eligibility
- assessment execution
- feedback generation
- final session and assessment status

The mobile client must not decide whether a speaking part is complete, which examiner turn comes next, or what assessment result should be shown.

### Client Responsibility

The mobile client is responsible for:

- authenticated request execution
- local screen state
- audio capture
- audio playback
- upload initiation
- retry behavior within the approved contract
- rendering transcript and feedback returned by the backend

### Functional Parity

The mobile client must preserve the Django implementation's business behavior for conversation progression, completion gating, transcript authority, and assessment flow.

Where the mobile platform requires a different transport shape, the behavior must remain equivalent even if the capture mechanism differs.

### Transport Independence

The conversation API must remain independent of browser-specific speech recognition.

The same backend conversation rules must be callable from any client that can:

- authenticate
- submit speaking turns
- receive examiner responses
- complete the session
- retrieve feedback

### Generic Conversation Transport

The API must support a generic turn-submission boundary across speaking parts rather than a separate upload endpoint per part.

Part-specific behavior belongs in server-side workflow logic, not in duplicated transport endpoints.

## System Context

```text
OpenVoz Mobile
      ↓
Conversation API
      ↓
OpenVoz Django
      ↓
Conversation / Transcript / Assessment Services
      ↓
Supporting AI and Speech Services
```

The mobile client integrates only with the Django-owned API boundary.

## Conversation Lifecycle

The supported high-level lifecycle is:

1. Mobile creates a speaking session.
2. Mobile starts the conversation for one speaking part.
3. Backend returns the first examiner prompt.
4. Mobile records one candidate turn.
5. Mobile uploads the turn audio and metadata.
6. Backend transcribes and processes the turn.
7. Backend appends authoritative transcript entries.
8. Backend returns the next examiner turn or the closing message.
9. Mobile plays the examiner audio.
10. If the part is not complete, the cycle repeats.
11. After the closing examiner message has been delivered, mobile requests completion.
12. Backend finalizes the session and returns assessment artifacts when available.

This contract is intentionally turn-based. It does not model the speaking flow as one long recording followed by one final evaluation request.

## Session State Machine

The session state model must be server-authored and mobile-readable.

### Required session states

- `created`
- `ready`
- `active`
- `awaiting_candidate_turn`
- `processing_turn`
- `awaiting_examiner_playback`
- `completion_ready`
- `completing`
- `completed`
- `abandoned`
- `failed`

### State meanings

- `created`: session identity exists but the conversation has not started
- `ready`: session can be started for the requested speaking part
- `active`: conversation is in progress
- `awaiting_candidate_turn`: backend expects the next learner response
- `processing_turn`: backend has accepted a turn and is processing it
- `awaiting_examiner_playback`: backend has produced the next examiner turn and the client must deliver it
- `completion_ready`: the backend has already delivered the closing examiner message and the client may request completion
- `completing`: completion has been requested and the backend is finalizing artifacts
- `completed`: the session is terminal and feedback retrieval may proceed
- `abandoned`: the session was superseded or explicitly terminated without valid completion
- `failed`: the backend cannot continue without intervention

### Session rules

- Terminal states are `completed`, `abandoned`, and `failed`.
- The client must treat terminal sessions as immutable except for read-only retrieval.
- The backend may reject illegal transitions even if the client submits a request that assumes a different state.

## Turn State Machine

The turn state model exists to make audio-based transport explicit and recoverable.

### Required turn states

- `idle`
- `recording`
- `recorded`
- `uploading`
- `uploaded`
- `transcribing`
- `processing`
- `accepted`
- `rejected`
- `failed`

### Turn rules

- `recording` and `recorded` are client-local states.
- `uploaded`, `transcribing`, `processing`, `accepted`, `rejected`, and `failed` must be reflected by backend responses.
- A turn is not authoritative until the backend accepts it.
- The backend must validate turn ordering and reject out-of-sequence submissions.

## Endpoint Specifications

All endpoints below are conversation-specific API endpoints that extend the broader mobile API architecture.

### `POST /api/v1/speaking/sessions/`

Creates a new server-owned speaking session.

Purpose:

- establish durable session identity
- bind the session to the authenticated user
- declare the intended speaking part

### `GET /api/v1/speaking/sessions/{session_id}/`

Retrieves the current authoritative session view.

Purpose:

- restore state after interruption
- recover transcript history
- determine whether completion is already allowed
- retrieve session status and latest backend artifacts

### `POST /api/v1/speaking/sessions/{session_id}/start/`

Starts a speaking conversation for the requested part.

Purpose:

- begin the authoritative timer
- return the first examiner prompt
- transition the session into active conversation

### `POST /api/v1/speaking/sessions/{session_id}/turns/`

Submits one candidate turn for processing.

Purpose:

- accept one turn of learner evidence
- keep transport generic across speaking parts
- return the next examiner turn or closing response

This is the primary turn-based conversation boundary and replaces browser speech recognition as the mobile input mechanism.

### `POST /api/v1/speaking/sessions/{session_id}/complete/`

Requests session completion after the closing examiner message has already been delivered.

Purpose:

- finalize the authoritative transcript lifecycle
- execute completion-only backend actions
- return assessment artifacts when available

The backend must reject premature completion attempts.

### `GET /api/v1/speaking/sessions/{session_id}/assessment/`

Retrieves the latest assessment or feedback result associated with the session.

Purpose:

- support delayed retrieval
- support resumed sessions
- separate completion from later result access if needed

## Authentication

Conversation endpoints require authenticated access within the existing OpenVoz trust boundary.

### Authentication model

- the mobile client authenticates through the approved mobile authentication flow
- every conversation request is bound to the authenticated user identity
- session ownership is enforced server-side
- one user must not access another user's speaking session or transcript

### Authentication requirements

- unauthenticated requests must fail with a structured authentication error
- expired session or token state must be distinguishable from permission denial
- authorization checks must apply to session retrieval, turn submission, completion, and assessment access

This specification does not require a specific token or cookie mechanism. It requires only that the chosen mechanism be stable, mobile-safe, and enforceable by Django.

## Request Schemas

This section defines the required request shapes at the contract level. Exact implementation details may use JSON, multipart form data, or a mixed transport where file upload is required.

### Create session request

```json
{
  "part": "part-1",
  "client_context": {
    "platform": "ios",
    "app_version": "1.0.0"
  }
}
```

Rules:

- `part` is required
- `client_context` is optional

### Start session request

```json
{
  "part": "part-1"
}
```

Rules:

- `part` is required
- backend must reject part mismatches against the session definition

### Submit turn request

Contract shape:

```json
{
  "part": "part-1",
  "turn": 3,
  "metadata": {
    "duration_ms": 6400,
    "mime_type": "audio/m4a",
    "recorded_at": "2026-08-03T10:15:00Z"
  }
}
```

The audio payload accompanies this request through the approved upload transport.

Rules:

- `part` is required
- `turn` is required and client-visible
- `turn` is server-validated, not client-authoritative
- `metadata` is optional but recommended
- audio is required

### Complete session request

```json
{
  "part": "part-1",
  "last_client_turn": 3
}
```

Rules:

- backend must ignore or reject any request that conflicts with authoritative transcript state
- completion must remain gated by server rules, not by client timer state

## Response Schemas

### Common response fields

Conversation responses should use a stable envelope with:

- session identity
- part identity
- session state
- turn status where relevant
- transcript delta or transcript snapshot
- next action guidance

### Create session response

```json
{
  "session_id": "uuid",
  "part": "part-1",
  "session_state": "ready",
  "created_at": "2026-08-03T10:00:00Z"
}
```

### Start session response

```json
{
  "session_id": "uuid",
  "part": "part-1",
  "session_state": "awaiting_candidate_turn",
  "conversation_state": {
    "conversation_started": true,
    "current_question": "Tell me about your family.",
    "follow_up_asked": false
  },
  "examiner_turn": {
    "turn": 1,
    "text": "Hello there. Let's begin with B2 Speaking Part 1. Tell me about your family.",
    "audio_url": "https://..."
  },
  "transcript_delta": [
    {
      "speaker": "examiner",
      "text": "Hello there. Let's begin with B2 Speaking Part 1. Tell me about your family."
    }
  ]
}
```

### Submit turn response

```json
{
  "session_id": "uuid",
  "part": "part-1",
  "session_state": "awaiting_examiner_playback",
  "turn_status": "accepted",
  "candidate_turn": {
    "turn": 3,
    "transcript": "I usually spend time with my family."
  },
  "conversation_state": {
    "conversation_started": true,
    "current_question": "What do you enjoy doing together?",
    "follow_up_asked": true,
    "part1_complete": false
  },
  "examiner_turn": {
    "turn": 4,
    "text": "What do you enjoy doing together?",
    "audio_url": "https://..."
  },
  "transcript_delta": [
    {
      "speaker": "candidate",
      "text": "I usually spend time with my family."
    },
    {
      "speaker": "examiner",
      "text": "What do you enjoy doing together?"
    }
  ]
}
```

If the part is complete, the response must show that the closing examiner turn has already been produced.

### Complete session response

```json
{
  "session_id": "uuid",
  "part": "part-1",
  "session_state": "completed",
  "assessment": {
    "status": "complete",
    "assessment_id": "uuid"
  },
  "feedback_report": {},
  "practice_score": {}
}
```

If assessment processing is deferred, the response may return `pending` or `processing` instead of `complete`, but it must still reflect successful session completion.

## Error Model

Error responses must be structured and machine-readable.

### Standard error shape

```json
{
  "error": {
    "code": "conversation_not_ready",
    "message": "The session cannot accept a turn in its current state.",
    "category": "workflow",
    "retryable": false
  }
}
```

### Required error categories

- `authentication`
- `authorization`
- `validation`
- `workflow`
- `transcription`
- `service`
- `rate_limit`

### Required conversation error codes

- `unauthenticated`
- `session_not_found`
- `session_not_owned`
- `invalid_part`
- `invalid_turn_sequence`
- `audio_missing`
- `audio_unsupported`
- `conversation_not_ready`
- `turn_processing_failed`
- `transcription_failed`
- `completion_not_allowed`
- `assessment_unavailable`
- `session_already_terminal`

## Retry Semantics

Retry behavior must be explicit because mobile networks are unreliable and turn processing may involve upload and transcription.

### Retry principles

- safe reads may be retried automatically
- turn submission retries must be idempotent or explicitly deduplicated
- completion retries must not produce duplicate completion artifacts
- the client must distinguish transport failure from a confirmed backend rejection

### Required backend behavior

- support idempotency for turn submission and completion requests, or provide an equivalent deduplication strategy
- return stable session state after recoverable failures
- allow session retrieval after ambiguous network failures so the client can reconcile actual server state

### Client guidance

- after an uncertain turn upload failure, the client should fetch the session before resubmitting
- after an uncertain completion failure, the client should fetch the session and assessment state before retrying

## Completion Rules

Completion remains server-controlled.

The backend must enforce:

- the closing examiner message has already been delivered
- the session is in a completable state
- transcript evidence is authoritative
- duplicate completion does not create duplicate completion events or reports

The client must not infer completion solely from:

- local timer expiry
- the existence of a recorded clip
- a client-maintained turn counter

## Assessment Retrieval

Assessment retrieval must support both immediate and delayed availability.

### Required behavior

- session completion may return assessment artifacts immediately
- if not immediate, the session must still become `completed`
- the assessment endpoint must later expose the latest result
- the client must render backend-authored feedback only

### Required assessment fields

- `assessment_id`
- `status`
- `feedback_report` when available
- `practice_score` when available

This contract preserves the Django behavior in which assessment occurs only after valid completion.

## Versioning Strategy

This specification assumes explicit versioning under `/api/v1/`.

### Versioning rules

- breaking changes require a new API version
- additive non-breaking fields may be introduced within the same version
- deprecated fields should remain supported for an approved compatibility window
- the conversation API should evolve independently from internal Django refactors

## Future Extension for Parts 2–4

This specification is intentionally generic so that speaking Parts 2, 3, and 4 can reuse the same session and turn transport boundary.

Future parts may extend:

- accepted metadata fields
- transcript payload details
- examiner artifact shapes
- assessment retrieval details

Future parts must not require new transport endpoints solely because their business logic differs.

Part-specific rules remain server-owned and may vary without changing the generic transport model defined here.
