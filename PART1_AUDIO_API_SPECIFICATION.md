# Part 1 — Audio API Specification for Cambridge Speaking Part 1

**Document Type:** Backend Authority Verification (Read-Only)  
**Scope:** All audio recording, upload, evaluation, and feedback APIs for Cambridge Speaking Part 1  
**Status:** ❌ **Not Implemented** — Mobile conversation endpoints are specified but not yet built on the Django backend  
**Authority Documents Inspected:**
- `PART1_TRANSPORT_AUTHORITY.md` (frozen auth/profile/subscription/dashboard transport)
- `BACKEND_AUTHORITY_AUDIT.md` (backend authority assessment)
- `PART1_INTERVIEW_STATE_MACHINE.md` (frozen interview lifecycle)
- `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md` (mobile conversation API architecture)
- `Projects/OpenVoz/CAMBRIDGE_ASSESSMENT_ENGINE.md` (assessment engine architecture)
- `Projects/OpenVoz/ASSESSMENT_ENGINE_DECISIONS.md` (assessment engine ADRs)
- `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md` (mobile API catalogue)

**Backend Files Inspected:**
- `chat/models.py` — `SpeakingConversation`, `TranscriptEntry`, `AssessmentReportRecord`
- `chat/views.py` — `chat_view`, `complete_part1_assessment` (web-only, session-cookie based)
- `chat/urls.py` — web speaking routes (`/chat/`, `/chat/complete/`)
- `chat/services/transcript_builder.py` — conversation creation, append, completion, transcript building
- `chat/services/part1_session_controller.py` — session timing policy (90s total, 15s cutoff)
- `chat/services/part1_assessment_integration.py` — developer-mode assessment pipeline
- `chatbot/views.py` — `transcribe` (Whisper-based transcription, WebM only)
- `voicechat/urls.py` — root URL configuration (no `/api/v1/speaking/` routes exist)
- `chat/mobile_auth_views.py` — existing mobile auth/profile/subscription/dashboard endpoints

---

## 1. Endpoint Inventory

### 1.1 Currently Implemented Endpoints

| URL | HTTP Method | Authentication | Permissions | Purpose | Status |
|---|---|---|---|---|---|
| `/chat/` | GET, POST | Session Cookie | `@login_required` | B2 Part 1 web conversation (browser speech recognition, NO audio upload) | ✅ **Web only** |
| `/chat/complete/` | POST | Session Cookie | `@login_required` | Complete Part 1 and trigger developer-mode assessment | ✅ **Web only** |
| `/chatbot/api/transcribe/` | POST | None (Public) | `@csrf_exempt` | Accept audio/webm, return Whisper transcription text | ✅ **Public, chatbot only** |

### 1.2 Specified But Not Implemented Endpoints

These endpoints are defined in `MOBILE_CONVERSATION_API_SPECIFICATION.md` as the architectural target. **NONE exist on the Django backend.**

| URL | HTTP Method | Authentication | Purpose | Status |
|---|---|---|---|---|
| `POST /api/v1/speaking/sessions/` | POST | Bearer Token | Create a new server-owned speaking session | ❌ **Not implemented** |
| `GET /api/v1/speaking/sessions/{session_id}/` | GET | Bearer Token | Retrieve authoritative session view (state, transcript, artifacts) | ❌ **Not implemented** |
| `POST /api/v1/speaking/sessions/{session_id}/start/` | POST | Bearer Token | Start conversation, return first examiner prompt | ❌ **Not implemented** |
| `POST /api/v1/speaking/sessions/{session_id}/turns/` | POST | Bearer Token | Submit one candidate turn with audio + metadata | ❌ **Not implemented** |
| `POST /api/v1/speaking/sessions/{session_id}/complete/` | POST | Bearer Token | Finalize session after closing examiner message delivered | ❌ **Not implemented** |
| `GET /api/v1/speaking/sessions/{session_id}/assessment/` | GET | Bearer Token | Retrieve latest assessment/feedback for the session | ❌ **Not implemented** |

### 1.3 Assessment-Related Endpoints from API Catalogue

These are catalogued in `OPENVOZ_MOBILE_API_SPECIFICATION.md` as planned but not implemented:

| URL | Purpose | Status |
|---|---|---|
| `POST /api/v1/assessments/requests/` | Request assessment processing | Planned |
| `GET /api/v1/assessments/{assessment_id}/` | Retrieve one assessment result | Missing |
| `GET /api/v1/assessments/{assessment_id}/feedback/` | Retrieve coaching feedback | Planned |
| `GET /api/v1/assessments/{assessment_id}/scores/` | Retrieve criterion-level scores | Planned |
| `GET /api/v1/assessments/history/` | Retrieve assessment history | Planned |
| `GET /api/v1/assessments/{assessment_id}/status/` | Retrieve processing status | Planned |

---

## 2. Authentication

### 2.1 Confirmed Authentication Mechanism

| Property | Value | Evidence |
|---|---|---|
| **Mechanism** | Django REST Framework Token Authentication (`rest_framework.authtoken`) | `chat/mobile_auth_views.py` — `_authenticate_token_request()` parses `Authorization: Bearer <token>` |
| **Header Format** | `Authorization: Bearer <mobile-token>` | `PART1_TRANSPORT_AUTHORITY.md` § Authentication |
| **Token Storage** | `Token` model in `rest_framework.authtoken` | `BACKEND_AUTHORITY_AUDIT.md` § 7 |
| **Token Issuance** | `POST /api/v1/auth/login/` returns `{ authenticated: true, token: "...", user: {...} }` | `PART1_TRANSPORT_AUTHORITY.md` § Response Contracts #1 |
| **Token Validation** | `GET /api/v1/auth/validate/` verifies Bearer token against `Token.objects.select_related("user")` | `chat/mobile_auth_views.py` — `mobile_validate` |
| **CSRF** | NOT required for mobile — stateless Bearer token auth. Web endpoints use `@csrf_exempt` for JSON APIs. | `PART1_TRANSPORT_AUTHORITY.md` § Authentication |

### 2.2 Required Headers (for future mobile speaking endpoints)

| Header | Required | Value |
|---|---|---|
| `Authorization` | **Yes** | `Bearer <mobile-token>` |
| `Content-Type` | **Yes** (varies) | `application/json` for JSON bodies; `multipart/form-data` for turn submission with audio |
| `Accept` | No (optional) | `application/json` |

### 2.3 Unauthorized Response

Per `PART1_TRANSPORT_AUTHORITY.md` § Error Contracts and `mobile_auth_views.py`:

```json
{
  "authenticated": false,
  "error": {
    "code": "authentication_required",
    "message": "Authentication required."
  }
}
```

HTTP Status: `401 Unauthorized`

Additional auth error codes confirmed:
- `invalid_token` — `"Invalid authentication token."`
- `inactive_account` — `"This account is inactive."` (HTTP 403)

### 2.4 Token Expiry Behaviour

- DRF Token model tokens do not expire by default (they are persistent until deleted).
- Token is invalidated on `POST /api/v1/auth/logout/` (token deleted from database).
- On 401 response, `HttpClient` (mobile) calls `AuthService.removeToken()` — confirmed in `PART1_IMPLEMENTATION_AUDIT.md` § 8.
- No token refresh/rotation endpoint exists — listed as "Future" in `OPENVOZ_MOBILE_API_SPECIFICATION.md`.

---

## 3. Upload Contract

### 3.1 Current State: No Mobile Upload Endpoint Exists

There is **no** `POST /api/v1/speaking/sessions/{session_id}/turns/` or equivalent audio upload endpoint implemented on the Django backend.

### 3.2 Closest Existing Reference: Chatbot Transcription

The chatbot app has a working audio upload + transcription endpoint at `POST /chatbot/api/transcribe/`:

| Property | Value | Evidence |
|---|---|---|
| **URL** | `/chatbot/api/transcribe/` | `chatbot/views.py` — `transcribe` |
| **Method** | POST | `@csrf_exempt` |
| **Content-Type** | `multipart/form-data` | `request.FILES.get("audio")` |
| **Field Name** | `audio` | `audio_file = request.FILES.get("audio")` |
| **Accepted Format** | `audio/webm` only | Hardcoded in `audio_payload = ("audio.webm", audio_bytes, "audio/webm")` |
| **Processing** | Bytes read into memory → sent to OpenAI Whisper `whisper-1` model | `client.audio.transcriptions.create(model="whisper-1", file=audio_payload)` |
| **Response Shape** | `{"transcript": "..."}` or `{"error": "...", "detail": "..."}` | `chatbot/views.py` lines 684–710 |
| **Max Size** | Not explicitly enforced in view; limited by Django's `FILE_UPLOAD_MAX_MEMORY_SIZE` (default 2.5 MB) and any reverse proxy limits | Django settings |
| **Authentication** | None — public endpoint | No auth decorator |

### 3.3 Specified Upload Contract (from MOBILE_CONVERSATION_API_SPECIFICATION.md)

The turn submission endpoint, when implemented, should accept:

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

With the audio file as a **multipart form data** attachment. The specification says:

> The audio payload accompanies this request through the approved upload transport.
> Rules: `part` is required, `turn` is required and client-validated, `metadata` is optional but recommended, audio is required.

### 3.4 Field Name for Audio

| Source | Field Name | Evidence |
|---|---|---|
| Chatbot transcription | `audio` | `request.FILES.get("audio")` |
| MOBILE_CONVERSATION_API_SPECIFICATION | Not explicitly named | Says "The audio payload accompanies this request" |
| PART1_INTERVIEW_STATE_MACHINE | N/A (client-side only) | Refers to `audioUri` in state data |

**Recommendation:** Use `audio` as the multipart field name, consistent with the existing chatbot endpoint.

---

## 4. Audio Requirements

### 4.1 What the Backend Currently Accepts

| Property | Value | Evidence |
|---|---|---|
| **Accepted MIME type** | `audio/webm` only | Hardcoded in `chatbot/views.py` |
| **Maximum file size** | Not enforced in application code | Django default: 2.5 MB (`FILE_UPLOAD_MAX_MEMORY_SIZE`) |
| **Sample rate** | Not validated by backend | Determined by client `MediaRecorder` |
| **Bitrate** | Not validated by backend | Determined by client `MediaRecorder` |
| **Channels** | Not validated by backend | Determined by client `MediaRecorder` |
| **Encoding** | WebM container (likely Opus codec from browser `MediaRecorder`) | Browser default |
| **File extension** | `.webm` | Hardcoded filename in chatbot |

### 4.2 What the Mobile Client Will Produce (expo-av)

Per `PART1_INTERVIEW_STATE_MACHINE.md` § 6.2:

| Property | Target Value | Notes |
|---|---|---|
| **Format** | AAC or MP4 audio container | Standard for iOS/Android `expo-av` |
| **Sample rate** | 44100 Hz | CD-quality, widely supported |
| **Bit rate** | 128 kbps | Good quality for speech |
| **Channels** | Mono | Sufficient for speech assessment |
| **File extension** | `.m4a` | Standard AAC container |

### 4.3 Critical Gap: Format Mismatch

| Client produces | Backend currently accepts | Gap |
|---|---|---|
| AAC/MP4 (`.m4a`) | WebM (`.webm`) only | **Incompatible** |

The chatbot transcription endpoint hardcodes `audio/webm`. For mobile, the backend MUST be extended to accept `audio/mp4`, `audio/m4a`, and/or `audio/aac` MIME types. Whisper supports all these formats natively — the limitation is in the Django view code only.

### 4.4 Backend Audio Validation

**Currently:** No format validation, no size validation, no duration validation exists in the chatbot transcription endpoint beyond Django's default `FILE_UPLOAD_MAX_MEMORY_SIZE`.

**Required for mobile (per PART1_INTERVIEW_STATE_MACHINE.md § 7.1):**

| Check | Rule | Failure Code |
|---|---|---|
| File exists | Audio file must be present | `audio_missing` |
| File size | Must be > 0 bytes and < 10 MB | `audio_too_large` |
| Duration | Must be ≥ 2 seconds and ≤ 60 seconds | `audio_too_short` / `audio_too_long` |
| Format | Must be accepted MIME type | `audio_unsupported` |

---

## 5. Request Payload Schemas

### 5.1 Create Session Request (Specified, Not Implemented)

```json
{
  "part": "part-1",
  "client_context": {
    "platform": "ios",
    "app_version": "1.0.0"
  }
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `part` | string | **Yes** | `"part-1"`, `"part-2"`, `"part-3"`, `"part-4"` |
| `client_context` | object | No | Platform, app version metadata |
| `client_context.platform` | string | No | `"ios"` or `"android"` |
| `client_context.app_version` | string | No | SemVer |

### 5.2 Start Session Request (Specified, Not Implemented)

```json
{
  "part": "part-1"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `part` | string | **Yes** | Must match the session's declared part |

### 5.3 Submit Turn Request (Specified, Not Implemented)

**JSON metadata part:**

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

| Field | Type | Required | Notes |
|---|---|---|---|
| `part` | string | **Yes** | Speaking part identifier |
| `turn` | integer | **Yes** | Client-facing turn number; server-validated |
| `metadata` | object | No (recommended) | Recording metadata |
| `metadata.duration_ms` | integer | No (recommended) | Recording duration in milliseconds |
| `metadata.mime_type` | string | No (recommended) | MIME type of the audio file |
| `metadata.recorded_at` | string (ISO-8601) | No (recommended) | When recording was captured |

**Audio file part:** Multipart form data field `audio` containing the audio file.

### 5.4 Complete Session Request (Specified, Not Implemented)

```json
{
  "part": "part-1",
  "last_client_turn": 3
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `part` | string | **Yes** | Speaking part identifier |
| `last_client_turn` | integer | **Yes** | Client's last completed turn number |

---

## 6. Successful Response Schemas

### 6.1 Create Session Response (Specified, Not Implemented)

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "part": "part-1",
  "session_state": "ready",
  "created_at": "2026-08-03T10:00:00Z"
}
```

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `session_id` | string (UUID) | No | Server-generated conversation UUID |
| `part` | string | No | Speaking part identifier |
| `session_state` | string | No | `"ready"` |
| `created_at` | string (ISO-8601) | No | Session creation timestamp |

### 6.2 Start Session Response (Specified, Not Implemented)

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
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
    "audio_url": "https://api.openvoz.com/media/tts/abc123.mp3"
  },
  "transcript_delta": [
    {
      "speaker": "examiner",
      "text": "Hello there. Let's begin with B2 Speaking Part 1. Tell me about your family."
    }
  ]
}
```

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `session_id` | string (UUID) | No | Server-generated conversation UUID |
| `part` | string | No | Speaking part identifier |
| `session_state` | string | No | `"awaiting_candidate_turn"` |
| `conversation_state` | object | No | Current conversation progress |
| `conversation_state.conversation_started` | boolean | No | Whether the session timer has started |
| `conversation_state.current_question` | string | No | Current examiner question text |
| `conversation_state.follow_up_asked` | boolean | No | Whether a follow-up has been asked |
| `examiner_turn.turn` | integer | No | Turn number |
| `examiner_turn.text` | string | No | Examiner utterance text |
| `examiner_turn.audio_url` | string | Yes | URL to TTS audio of examiner turn (null if not generated) |
| `transcript_delta` | array | No | New transcript entries since last state |
| `transcript_delta[].speaker` | string | No | `"examiner"` or `"candidate"` |
| `transcript_delta[].text` | string | No | Utterance text |

### 6.3 Submit Turn Response (Specified, Not Implemented)

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
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
    "audio_url": "https://api.openvoz.com/media/tts/def456.mp3"
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

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `turn_status` | string | No | `"accepted"` when turn is validated and stored |
| `candidate_turn` | object | No | Accepted candidate turn data |
| `candidate_turn.turn` | integer | No | Authoritative turn number |
| `candidate_turn.transcript` | string | No | ASR transcription of the uploaded audio |
| `conversation_state.part1_complete` | boolean | No | Whether Part 1 closing message has been delivered |
| Other fields | — | — | Same as start session response |

### 6.4 Complete Session Response (Specified, Not Implemented)

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "part": "part-1",
  "session_state": "completed",
  "assessment": {
    "status": "complete",
    "assessment_id": "660e8400-e29b-41d4-a716-446655440001"
  },
  "feedback_report": {},
  "practice_score": {}
}
```

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `session_state` | string | No | `"completed"` — terminal state |
| `assessment.status` | string | No | `"complete"`, `"pending"`, or `"processing"` |
| `assessment.assessment_id` | string (UUID) | Yes | Null if assessment not yet available |
| `feedback_report` | object | Yes | Full feedback report (see §10) |
| `practice_score` | object | Yes | Practice score summary (see §10) |

### 6.5 Get Assessment Response (Specified, Not Implemented)

Returns the same `assessment`, `feedback_report`, and `practice_score` objects as the complete session response, but for delayed retrieval after completion.

---

## 7. Error Responses

### 7.1 Confirmed Error Codes (from existing mobile auth endpoints)

Per `PART1_TRANSPORT_AUTHORITY.md` § Error Contracts and `chat/mobile_auth_views.py`:

| HTTP Status | Code | Message | Recovery |
|---|---|---|---|
| `400` | `invalid_json` | `"Invalid JSON body."` | Fix request format |
| `400` | `missing_credentials` | `"Username and password are required."` | Auth only |
| `401` | `invalid_credentials` | `"Invalid username or password."` | Auth only |
| `401` | `authentication_required` | `"Authentication required."` | Re-authenticate |
| `401` | `invalid_token` | `"Invalid authentication token."` | Re-authenticate |
| `403` | `inactive_account` | `"This account is inactive."` | Contact support |

### 7.2 Specified Conversation Error Codes (from MOBILE_CONVERSATION_API_SPECIFICATION.md)

These error codes are specified but NOT yet implemented:

| HTTP Status | Code | Category | Retryable | Meaning |
|---|---|---|---|---|
| `401` | `unauthenticated` | `authentication` | No (re-login) | Missing or invalid Bearer token |
| `403` | `session_not_owned` | `authorization` | No | Session belongs to another user |
| `404` | `session_not_found` | `validation` | No | Session ID does not exist |
| `400` | `invalid_part` | `validation` | No | Part value not recognized |
| `400` | `invalid_turn_sequence` | `validation` | No | Turn number is out of order |
| `400` | `audio_missing` | `validation` | Yes | No audio file in request |
| `415` | `audio_unsupported` | `validation` | No (re-record) | Audio format not accepted |
| `409` | `conversation_not_ready` | `workflow` | No (fetch state) | Session in wrong state for action |
| `500` | `turn_processing_failed` | `service` | Yes | Backend error during turn processing |
| `500` | `transcription_failed` | `transcription` | Yes | ASR/Whisper error |
| `409` | `completion_not_allowed` | `workflow` | No (fetch state) | Completion prerequisites not met |
| `503` | `assessment_unavailable` | `service` | Yes | Assessment service unavailable |
| `409` | `session_already_terminal` | `workflow` | No | Session already completed/abandoned/failed |
| `429` | (rate limit) | `rate_limit` | Yes (back off) | Too many requests |

### 7.3 Standard Error Envelope

Per `MOBILE_CONVERSATION_API_SPECIFICATION.md`:

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

### 7.4 Additional Error Codes from Existing Infrastructure

From `chat/services/transcript_builder.py` — `TranscriptWriteError`:
- `"Terminal conversations cannot accept entries."` — raised when appending to completed/abandoned conversation
- `"Conversation already has a terminal state."` — raised on duplicate completion

---

## 8. Evaluation Workflow

### 8.1 Current Implementation: Text-Based, Synchronous (Web Only)

The existing Part 1 web workflow (`chat/views.py` — `chat_view`):

1. Browser captures speech via `webkitSpeechRecognition` (Web Speech API).
2. Recognized **text** is sent to `/chat/` as POST form data (`user_input`, `category`, `conversation_state`).
3. Backend generates examiner follow-up questions using OpenAI Chat Completions.
4. No audio is ever uploaded or stored.
5. On completion (`POST /chat/complete/`), the backend:
   - Calls `complete_conversation()` from `transcript_builder.py`
   - Calls `execute_part1_assessment_pipeline()` from `part1_assessment_integration.py`
   - Assessment runs against the **text transcript only** (no audio analysis)

### 8.2 Specified Mobile Workflow: Turn-Based, Asynchronous (Not Implemented)

Per `MOBILE_CONVERSATION_API_SPECIFICATION.md`:

1. Mobile creates session → backend returns examiner prompt with TTS audio.
2. Mobile records candidate audio → uploads with turn metadata.
3. Backend transcribes audio (Whisper) → appends transcript entries → generates next examiner turn.
4. Cycle repeats until closing message.
5. Mobile requests completion → backend finalizes → runs assessment → returns results.

### 8.3 Assessment Engine: Architecture Exists, Audio Assessment Is Future

From `CAMBRIDGE_ASSESSMENT_ENGINE.md`:

- **Implemented:** Text-based assessment for Grammar & Vocabulary, Discourse Management, Interactive Communication.
- **Limited:** Pronunciation assessment — "A transcript alone cannot provide sufficient evidence for a full pronunciation judgement."
- **Future (Phase 6):** "Audio Pronunciation Assessment — Add governed audio evidence and validated pronunciation analysis while preserving transcript-only operation when audio is unavailable."

### 8.4 Evaluation Delivery

Per `MOBILE_CONVERSATION_API_SPECIFICATION.md` § Assessment Retrieval:

- Session completion **may** return assessment artifacts immediately (inline).
- If not immediate, the session still becomes `completed`, and the assessment endpoint (`GET .../assessment/`) exposes the latest result.
- The `assessment.status` field indicates: `"complete"`, `"pending"`, or `"processing"`.

### 8.5 Assessment Lifecycle (from Assessment Engine ADRs)

| Stage | Description | Status |
|---|---|---|
| Conversation creation | Server generates UUID, binds profile | ✅ Model exists |
| Turn acceptance | Append-only transcript entries | ✅ Service exists |
| Conversation completion | Explicit server-recorded transition | ✅ Service exists |
| Transcript immutability | After completion, transcript is frozen | ✅ Enforced |
| Assessment execution | Runs against immutable transcript snapshot | ✅ Developer-mode |
| Assessment storage | Separate from transcript, traceable | ✅ `AssessmentReportRecord` model |
| Re-assessment | Creates new result, does not overwrite | ✅ Architecture supports |

---

## 9. Polling Contract

### 9.1 Current State

**No polling endpoint exists.** The web workflow is synchronous — assessment runs during the `/chat/complete/` request and results are returned inline (or logged as `PART1_ASSESSMENT_DEVELOPER_OUTPUT`).

### 9.2 Specified Polling Contract (Not Implemented)

Per `MOBILE_CONVERSATION_API_SPECIFICATION.md`:

| Property | Value |
|---|---|
| **Polling endpoint** | `GET /api/v1/speaking/sessions/{session_id}/assessment/` |
| **Poll interval** | 3 seconds (per `PART1_INTERVIEW_STATE_MACHINE.md` § 8.3) |
| **Max polls** | 20 (60 seconds total) |
| **Stop condition** | Response `assessment.status` is `"complete"` or `"failed"` |
| **Backoff** | None (fixed interval for predictable UX) |

### 9.3 Alternative: Status Endpoint

The API catalogue (`OPENVOZ_MOBILE_API_SPECIFICATION.md`) also lists:

`GET /api/v1/assessments/{assessment_id}/status/` — "Retrieve current assessment processing state"

This would allow polling by assessment ID rather than session ID once the assessment is created.

---

## 10. Evaluation Result Schema

### 10.1 Assessment Engine Output (Existing, Developer-Mode)

From `chat/services/part1_assessment_integration.py` — `_generate_developer_output()`:

```json
{
  "event": "part1_assessment_platform_completed",
  "conversation_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "assessment_uuid": "660e8400-e29b-41d4-a716-446655440001",
  "repository_save_status": "saved",
  "policy_status": "passed",
  "feedback_generation_status": "generated",
  "practice_score": {
    "score": 3.5,
    "maximum": 5,
    "display": "3.5 / 5",
    "star_rating": 4,
    "stars": "★★★★☆",
    "overall_confidence": "medium",
    "assessed_criterion_count": 4
  },
  "criteria": [
    {
      "criterion": "grammar_vocabulary",
      "band": 4,
      "confidence": "medium",
      "evidence_references": ["evidence-0002", "evidence-0004"]
    },
    {
      "criterion": "discourse_management",
      "band": 3,
      "confidence": "medium",
      "evidence_references": ["evidence-0003"]
    },
    {
      "criterion": "pronunciation",
      "band": null,
      "confidence": null,
      "evidence_references": [],
      "unavailable_code": "insufficient_evidence",
      "unavailable_detail": "Audio evidence is not yet available for pronunciation assessment."
    },
    {
      "criterion": "interactive_communication",
      "band": 4,
      "confidence": "high",
      "evidence_references": ["evidence-0001", "evidence-0003", "evidence-0005"]
    }
  ],
  "policy_notices": [],
  "feedback_report": {}
}
```

### 10.2 Complete Field Dictionary (Developer Output)

| Field Path | Type | Nullable | Notes |
|---|---|---|---|
| `conversation_uuid` | string (UUID) | No | The speaking session UUID |
| `assessment_uuid` | string (UUID) | No | Unique assessment record identifier |
| `repository_save_status` | string | No | `"saved"` or `"existing"` |
| `policy_status` | string | No | Assessment policy evaluation status |
| `feedback_generation_status` | string | No | `"generated"` |
| `practice_score` | object | No | Overall practice score (0–5 scale) |
| `practice_score.score` | number (float) | Yes | Null if no criteria could be assessed |
| `practice_score.maximum` | integer | No | Always 5 for B2 |
| `practice_score.display` | string | No | Human-readable score display |
| `practice_score.star_rating` | integer | Yes | 0–5 star rating |
| `practice_score.stars` | string | No | Unicode star display |
| `practice_score.overall_confidence` | string | Yes | `"low"`, `"medium"`, `"high"`, or null |
| `practice_score.assessed_criterion_count` | integer | No | Number of criteria that were successfully assessed |
| `criteria[]` | array | No | Per-criterion results |
| `criteria[].criterion` | string | No | Criterion identifier (e.g., `"grammar_vocabulary"`) |
| `criteria[].band` | integer | Yes | Awarded band (null if unavailable) |
| `criteria[].confidence` | string | Yes | `"low"`, `"medium"`, `"high"`, or null |
| `criteria[].evidence_references` | array of string | No | References to transcript evidence |
| `criteria[].unavailable_code` | string | Yes | Error code if criterion was not assessed |
| `criteria[].unavailable_detail` | string | Yes | Human-readable reason for unavailability |
| `policy_notices[]` | array | No | Policy engine messages |
| `feedback_report` | object | No | Full feedback report (see §10.3) |

### 10.3 Feedback Report Fields

The `feedback_report` is generated by the Feedback Engine (`chat/feedback_engine.py`). Per `CAMBRIDGE_ASSESSMENT_ENGINE.md` § Coaching Feedback, it includes:

- **Demonstrated strengths** — what the candidate did well
- **Priority improvements** — a small number of actionable improvements
- **Recommended practice** — aligned with identified priorities
- **Links to evidence** — each recommendation tied to observed evidence

The exact JSON structure of `feedback_report` is determined by the Feedback Engine implementation and is not yet frozen in a mobile-readable contract.

### 10.4 Assessment Criteria (B2 Speaking)

Per `CAMBRIDGE_ASSESSMENT_ENGINE.md`:

| Criterion | Identifier | Evidence Source | Audio Required? |
|---|---|---|---|
| Grammar & Vocabulary | `grammar_vocabulary` | Transcript | No |
| Discourse Management | `discourse_management` | Transcript | No |
| Pronunciation | `pronunciation` | **Audio required** | **Yes** — currently unavailable |
| Interactive Communication | `interactive_communication` | Transcript | No |

### 10.5 Scoring Scale

- **Practice score:** 0.0 – 5.0 (B2 practice scale, not official Cambridge band score)
- **Per-criterion bands:** Integer bands (scale determined by assessment profile)
- **Confidence levels:** `"low"`, `"medium"`, `"high"`

---

## 11. Transcript Contract

### 11.1 Transcript Structure (from transcript_builder.py)

The `build_transcript()` function returns:

```json
{
  "schema_version": "openvoz.transcript.v1",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "profile": {
    "id": "cambridge.b2-first.speaking",
    "version": "1.0.0"
  },
  "speaking_part": 1,
  "lifecycle": {
    "status": "completed",
    "completed_at": "2026-08-03T10:05:00Z"
  },
  "entries": [
    {
      "evidence_reference": "evidence-0001",
      "sequence": 1,
      "type": "turn",
      "speaker": "examiner",
      "content": "Hello there. Let's begin...",
      "event_type": null,
      "timestamp": "2026-08-03T10:00:00Z",
      "audio_alignment": null,
      "speech_recognition": null,
      "partner": null
    },
    {
      "evidence_reference": "evidence-0002",
      "sequence": 2,
      "type": "turn",
      "speaker": "candidate",
      "content": "I live in Madrid with my family.",
      "event_type": null,
      "timestamp": "2026-08-03T10:00:15Z",
      "audio_alignment": null,
      "speech_recognition": {
        "provider": "whisper-1",
        "confidence": 0.95
      },
      "partner": null
    }
  ],
  "validation": {
    "valid": true,
    "issues": []
  }
}
```

### 11.2 Transcript Field Dictionary

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `schema_version` | string | No | Always `"openvoz.transcript.v1"` |
| `conversation_id` | string (UUID) | No | Conversation UUID |
| `profile.id` | string | No | Assessment profile identifier |
| `profile.version` | string | No | Profile version used |
| `speaking_part` | integer | No | 1–4 |
| `lifecycle.status` | string | No | Conversation status |
| `lifecycle.completed_at` | string (ISO-8601) | Yes | Null if not completed |
| `entries[].evidence_reference` | string | No | Stable reference ID for assessment evidence |
| `entries[].sequence` | integer | No | Monotonically increasing, contiguous from 1 |
| `entries[].type` | string | No | `"turn"` or `"event"` |
| `entries[].speaker` | string | Yes | `"examiner"`, `"candidate"`, `"system"`, or null for events |
| `entries[].content` | string | No | Utterance text or event description |
| `entries[].event_type` | string | Yes | `"task_started"`, `"task_completed"`, `"clarification"`, `"progression"` |
| `entries[].timestamp` | string (ISO-8601) | Yes | Source timestamp |
| `entries[].audio_alignment` | any | Yes | Reserved for future audio alignment data |
| `entries[].speech_recognition` | object | Yes | ASR provider and confidence |
| `entries[].speech_recognition.provider` | string | No | e.g., `"whisper-1"` |
| `entries[].speech_recognition.confidence` | number | Yes | Confidence score if available |
| `entries[].partner` | any | Yes | Reserved for future partner-task data |

### 11.3 Transcript Properties

| Property | Value | Evidence |
|---|---|---|
| **Is transcript returned?** | Yes — as `transcript_delta` in turn/start responses; full transcript via session retrieval | Specified in `MOBILE_CONVERSATION_API_SPECIFICATION.md` |
| **Always?** | Delta on each turn; full transcript on session GET | Specified |
| **Language** | English (B2 First) | Assessment profile: `cambridge.b2-first.speaking` |
| **Confidence?** | Only for ASR entries (`speech_recognition.confidence`) | `transcript_builder.py` |
| **Word timestamps?** | Not currently supported | `audio_alignment` field is null — reserved for future |

---

## 12. Pronunciation Metrics

### 12.1 Current State: Not Available

Per `CAMBRIDGE_ASSESSMENT_ENGINE.md`:

> "A transcript alone cannot provide sufficient evidence for a full pronunciation judgement. Text may reveal recognition failures or clarification events, but these are indirect indicators and may have causes unrelated to pronunciation."
>
> "Until reliable audio analysis is available, the engine must state that pronunciation evidence is limited, avoid presenting transcript-only inference as direct observation, and assign an appropriately lower confidence level."

### 12.2 What the Backend Returns Today

For pronunciation criteria, the assessment returns:

```json
{
  "criterion": "pronunciation",
  "band": null,
  "confidence": null,
  "evidence_references": [],
  "unavailable_code": "insufficient_evidence",
  "unavailable_detail": "Audio evidence is not yet available for pronunciation assessment."
}
```

### 12.3 Future Pronunciation Metrics (Phase 6)

Per `CAMBRIDGE_ASSESSMENT_ENGINE.md` § Future Architecture:

| Metric | Status |
|---|---|
| Intelligibility | Future |
| Segmental clarity | Future |
| Word stress | Future |
| Sentence stress | Future |
| Rhythm | Future |
| Intonation | Future |
| Pace | Future |
| Pausing | Future |
| Fillers | Future |
| Confidence | Future |

**None of these are currently returned by the backend.**

---

## 13. Retry Behaviour

### 13.1 Current Backend Retry Support

**None.** The existing web workflow has no retry/idempotency support for conversation endpoints.

### 13.2 Specified Retry Requirements (from MOBILE_CONVERSATION_API_SPECIFICATION.md)

| Requirement | Status |
|---|---|
| **Safe reads may be retried automatically** | Not implemented |
| **Turn submission retries must be idempotent or explicitly deduplicated** | Not implemented |
| **Completion retries must not produce duplicate completion artifacts** | Not implemented |
| **Client must distinguish transport failure from confirmed backend rejection** | Not implemented |

### 13.3 Duplicate Upload Prevention

Per `PART1_INTERVIEW_STATE_MACHINE.md` § 7.6:

- Each upload attempt should generate a new `uploadId` (UUID v4).
- Backend should reject duplicate `uploadId` values with `409 Conflict`.
- Audio file should never be uploaded with the same `uploadId` twice.

**This mechanism is not yet implemented on the backend.**

### 13.4 Retry Recommendations for Mobile Client

Based on the specified error categories (not yet implemented):

| Error Category | Retry? | Strategy |
|---|---|---|
| `authentication` | No | Re-authenticate, then retry |
| `authorization` | No | Unrecoverable without backend change |
| `validation` | No (most) | Fix request before retry |
| `workflow` | No | Fetch current session state first |
| `transcription` | Yes | Exponential backoff (1s, 2s, 5s) |
| `service` | Yes | Exponential backoff (1s, 2s, 5s, 10s) |
| `rate_limit` | Yes | Respect Retry-After header |

---

## 14. Security

### 14.1 Bearer Token Usage

| Check | Finding | Evidence |
|---|---|---|
| Token storage | `expo-secure-store` (encrypted) on mobile | `PART1_IMPLEMENTATION_AUDIT.md` § 14.1 |
| Token transmission | `Authorization: Bearer <token>` header | `PART1_TRANSPORT_AUTHORITY.md` |
| Token in URL/query string | ❌ Never | Confirmed |
| Token in request body | ❌ Never | Confirmed |
| Token in logs | ❌ Not implemented in HttpClient | `PART1_IMPLEMENTATION_AUDIT.md` § 14.1 |

### 14.2 Upload Authorization

- Speaking session endpoints must be protected by Bearer token authentication.
- Session ownership is enforced server-side: users must not access another user's sessions.
- **Current state:** The web endpoints use Django session cookies, not Bearer tokens. Mobile endpoints are not yet implemented.

### 14.3 Temporary File Handling

Per `PART1_INTERVIEW_STATE_MACHINE.md` § 15.5:

| File Lifecycle | Action |
|---|---|
| Created | On recording stop |
| Read | On playback and upload |
| Deleted | On cancel, retake, reset, or successful upload |
| Location | `FileSystem.cacheDirectory + '/speaking/' + questionId + '.m4a'` |
| Permissions | App-private; not accessible to other apps |

### 14.4 Backend Storage

- `SpeakingConversation` and `TranscriptEntry` are stored in Django's database.
- `AssessmentReportRecord` stores assessment payloads as JSON in the database.
- Audio files uploaded to the backend would need a storage strategy (not yet defined for mobile — the web workflow does not upload audio).
- Transcript content is text only; no PII beyond candidate speech content.

### 14.5 Replay Protection

- Conversation IDs are server-generated UUIDs (not client-provided).
- `TranscriptEntry.save()` enforces immutability: `"Accepted transcript entries are immutable."`
- `AssessmentReportRecord.save()` enforces immutability: `"Persisted Assessment Reports are immutable."`
- Turn sequence numbers are validated for contiguity.
- Duplicate completion attempts are rejected: `"Conversation already has a terminal state."`

### 14.6 Maximum Upload Limits

| Limit | Value | Enforced By |
|---|---|---|
| Django `FILE_UPLOAD_MAX_MEMORY_SIZE` | 2.5 MB (default) | Django settings |
| Recommended mobile max | 10 MB | `PART1_INTERVIEW_STATE_MACHINE.md` § 7.1 |
| Recommended recording max | 60 seconds | `PART1_INTERVIEW_STATE_MACHINE.md` § 6.7 |

---

## 15. Mobile Integration Requirements

### 15.1 What the Mobile AudioService Must Implement

Based on the specified contract and existing infrastructure:

#### Upload API

| Requirement | Target | Notes |
|---|---|---|
| Endpoint | `POST /api/v1/speaking/sessions/{session_id}/turns/` | Not yet implemented |
| Method | POST | |
| Content-Type | `multipart/form-data` | |
| Audio field name | `audio` (recommended) | Consistent with chatbot endpoint |
| Metadata field name | JSON body part with `part`, `turn`, `metadata` | |
| Authentication | `Authorization: Bearer <token>` | |

#### Recording Format

| Requirement | Target | Notes |
|---|---|---|
| Container | MP4 / M4A | iOS/Android native via expo-av |
| Codec | AAC | Standard for speech |
| Sample rate | 44100 Hz | CD-quality |
| Bit rate | 128 kbps | Good speech quality |
| Channels | Mono | Sufficient for speech assessment |
| Extension | `.m4a` | |

**⚠️ Warning:** The backend currently only accepts `audio/webm`. The mobile client produces `audio/mp4`/`audio/m4a`. This format gap must be resolved before integration.

#### Headers

| Header | Value |
|---|---|
| `Authorization` | `Bearer <mobile-token>` |
| `Content-Type` | `multipart/form-data` |
| `X-Upload-Id` | UUID v4 (for idempotency/replay protection) |

#### Timeouts

| Phase | Timeout |
|---|---|
| Upload request | 30 seconds |
| Evaluation wait | 60 seconds |
| Session load | 15 seconds |

#### Retry Behaviour

| Scenario | Action |
|---|---|
| Upload network failure | Retry up to 3 times with new uploadId each time |
| Upload 4xx (except 409, 413, 415) | Do not retry — fix request |
| Upload 409 (duplicate) | Generate new uploadId, retry once |
| Upload 413 (too large) | Do not retry — re-record with shorter duration |
| Upload 415 (unsupported format) | Do not retry — re-record with correct format |
| Upload 5xx | Retry up to 3 times with exponential backoff |

#### Cancellation

- In-flight uploads are aborted via `AbortController`.
- Partial uploads are discarded by the server.
- Audio file is preserved locally until re-recording or session reset.

#### Progress Callbacks

- Upload progress (0–100%) reported to the Zustand interview store.
- Recording elapsed time reported during RECORDING state.
- Evaluation wait time optionally displayed during EVALUATING state.

#### Error Mapping

| Client Error | Backend Code | Recovery |
|---|---|---|
| No network | (client-side) | Queue for retry when online |
| Upload timeout | `request_timeout` (408) | Retry up to 3 times |
| Auth expired | `invalid_token` (401) | Re-authenticate, then retry |
| Server error | 5xx response | Retry with backoff |
| Format rejected | `audio_unsupported` (415) | Re-record in accepted format |

---

## 16. Contract Verification Matrix

| # | Requirement | Backend Evidence | Verified | Mobile Implication |
|---|---|---|---|---|
| 1 | Session creation endpoint exists | ❌ Not in `voicechat/urls.py` | ❌ **Not implemented** | Must be built before mobile integration |
| 2 | Turn submission with audio exists | ❌ Not in `voicechat/urls.py` | ❌ **Not implemented** | Must be built before mobile integration |
| 3 | Session completion endpoint exists | ❌ Not in `voicechat/urls.py` | ❌ **Not implemented** | Must be built before mobile integration |
| 4 | Assessment retrieval endpoint exists | ❌ Not in `voicechat/urls.py` | ❌ **Not implemented** | Must be built before mobile integration |
| 5 | Bearer token auth on speaking endpoints | ❌ Not implemented | ❌ **Not implemented** | Auth layer exists (`mobile_auth_views`); reusable |
| 6 | Audio upload field name | `audio` (chatbot ref) | ⚠️ **Only in chatbot** | Use `audio` for consistency |
| 7 | Accepted audio MIME types | `audio/webm` only (chatbot) | ⚠️ **WebM only** | Mobile produces AAC/MP4 — format gap |
| 8 | Conversation model exists | `SpeakingConversation` in `chat/models.py` | ✅ **Exists** | Reusable for mobile with owner association |
| 9 | Transcript model exists | `TranscriptEntry` in `chat/models.py` | ✅ **Exists** | Append-only, immutable — mobile-compatible |
| 10 | Transcript builder exists | `chat/services/transcript_builder.py` | ✅ **Exists** | Reusable for mobile |
| 11 | Session timing policy exists | `chat/services/part1_session_controller.py` | ✅ **Exists** (90s session) | Reusable; review mobile timing needs |
| 12 | Assessment engine exists | `chat/services/part1_assessment_integration.py` | ✅ **Exists** (dev mode) | Text-only assessment; pronunciation limited |
| 13 | Assessment report model exists | `AssessmentReportRecord` in `chat/models.py` | ✅ **Exists** | Immutable storage ready |
| 14 | Whisper transcription exists | `chatbot/views.py` — `transcribe` | ✅ **Exists** (public, chatbot) | Reusable pattern; needs auth + format expansion |
| 15 | Pronunciation assessment | `pronunciation` criterion returned as unavailable | ❌ **Not available** | Phase 6 (future); client must handle null |
| 16 | Retry/idempotency for turns | ❌ Not implemented | ❌ **Not implemented** | Must be added to backend |
| 17 | Duplicate upload prevention | ❌ Not implemented | ❌ **Not implemented** | `X-Upload-Id` header + backend dedup |
| 18 | Error envelope standard | `{ error: { code, message, category, retryable } }` | ⚠️ **Specified only** | Consistent with existing auth error format |
| 19 | Session state machine | Specified in `MOBILE_CONVERSATION_API_SPECIFICATION.md` | ⚠️ **Specified only** | 11 states defined; backend must enforce |
| 20 | Turn state machine | Specified in `MOBILE_CONVERSATION_API_SPECIFICATION.md` | ⚠️ **Specified only** | 10 states defined; backend must enforce |

---

## 17. Open Questions

These are questions that CANNOT be answered by inspecting the current backend. They require product/engineering decisions.

| # | Question | Context |
|---|---|---|
| **Q1** | What MIME types will the mobile speaking endpoint accept? | Current chatbot endpoint only accepts `audio/webm`. Mobile produces `audio/m4a`/`audio/mp4`. The backend MUST be extended. Which formats? |
| **Q2** | Will the mobile speaking endpoint use inline assessment (results in complete response) or async (polling required)? | Assessment engine currently runs synchronously during the web completion request. Mobile may need async for longer processing. |
| **Q3** | How will the `SpeakingConversation` model associate with a mobile user? | Currently uses `owner_session_key` (Django session key). Mobile needs `owner_user` (FK to User) or equivalent. |
| **Q4** | Where will uploaded audio files be stored? | The web workflow does not upload audio (uses browser speech recognition). Mobile will upload audio files. Storage strategy (S3, local filesystem, etc.) must be defined. |
| **Q5** | Will uploaded audio be retained after assessment? | Privacy/retention policy for audio files is not yet defined. Transcripts are retained per ADR #6. |
| **Q6** | What TTS service will generate examiner turn audio? | The web workflow uses gTTS (synchronous). Mobile responses include `audio_url` for examiner turns — which service generates these? |
| **Q7** | Will the Part 1 question set be server-governed or client-provided? | The web workflow has hardcoded questions in `chat/views.py`. Mobile needs an endpoint to fetch questions. |
| **Q8** | Will the mobile session timing match the web timing (90 seconds total, 15 second cutoff)? | `part1_session_controller.py` defines 90s session. The interview state machine defines per-question recording (60s max). These are different timing models. |
| **Q9** | How will the conversation state (follow-up logic) work for mobile? | The web workflow uses OpenAI to generate follow-up questions dynamically. Will mobile use the same AI examiner or a fixed question set? |
| **Q10** | Will there be a dedicated endpoint to fetch Part 1 questions (without starting a session)? | The interview state machine has a `LOADING` state that fetches questions. Is this separate from session creation? |
| **Q11** | What is the exact `feedback_report` JSON schema? | The Feedback Engine generates feedback but the mobile-readable contract is not frozen. |
| **Q12** | Will the backend support `X-Upload-Id` for idempotent uploads? | This is specified in the interview state machine but not in any backend code. |

---

## 18. Final Verdict

### ❌ Backend contract is incomplete. Resolve listed items before implementing AudioService.

### Backend Contract Completeness: **35 / 100**

| Layer | Status | Notes |
|---|---|---|
| **Models** | ✅ 80% | `SpeakingConversation`, `TranscriptEntry`, `AssessmentReportRecord` all exist and are well-designed |
| **Services** | ✅ 70% | Transcript builder, session controller, assessment integration exist; need mobile-specific adapters |
| **Web endpoints** | ✅ 60% | Part 1 web workflow works but uses browser speech recognition (no audio upload) |
| **Mobile endpoints** | ❌ 0% | **None of the 6 specified endpoints exist** |
| **Audio upload** | ⚠️ 20% | Only chatbot WebM transcription exists; no format validation, no size limits, no auth |
| **Assessment** | ⚠️ 50% | Text-based assessment works (dev mode); pronunciation assessment explicitly unavailable |
| **Error handling** | ⚠️ 40% | Auth error codes exist; conversation error codes are specified but not implemented |
| **Retry/Idempotency** | ❌ 0% | Not implemented anywhere in the conversation workflow |

### What Exists (Can Be Reused)

1. ✅ **Conversation model** (`SpeakingConversation`) — UUID-based, supports parts 1-4, lifecycle states
2. ✅ **Transcript model** (`TranscriptEntry`) — append-only, immutable, speaker-attributed
3. ✅ **Transcript builder** — create, append, complete, build with validation
4. ✅ **Session timing policy** — `Part1SessionTiming` with 90s total, 15s cutoff
5. ✅ **Assessment engine** — architecture, criterion evaluation, feedback generation (text-based)
6. ✅ **Assessment storage** — `AssessmentReportRecord` with immutable storage
7. ✅ **Bearer token auth** — implemented for profile/subscription/dashboard endpoints
8. ✅ **Whisper transcription** — working in chatbot (public, WebM only)
9. ✅ **Error envelope** — consistent `{ error: { code, message } }` format in auth endpoints

### What Must Be Built

1. ❌ **6 mobile speaking endpoints** under `/api/v1/speaking/`
2. ❌ **Audio upload handling** with format validation, size limits, and auth
3. ❌ **User-based session ownership** (migrate from session-key to user FK)
4. ❌ **Idempotent turn submission** with duplicate detection
5. ❌ **Mobile assessment delivery** (inline or polling)
6. ❌ **Audio format support** beyond WebM (add AAC/MP4/M4A)
7. ❌ **TTS audio URL generation** for examiner turns
8. ❌ **Question fetching endpoint** (server-governed Part 1 questions)
9. ❌ **Retry/deduplication headers** (`X-Upload-Id`)

### Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| **No mobile speaking endpoints exist** | 🔴 Critical | Backend must be built before AudioService can integrate. Use `MOBILE_CONVERSATION_API_SPECIFICATION.md` as the target contract. |
| **Audio format mismatch** | 🔴 Critical | Mobile produces AAC/M4A; backend only accepts WebM. Backend must be extended to accept mobile formats. |
| **Pronunciation assessment unavailable** | 🟡 Medium | Client must handle `band: null` for pronunciation criteria. Display "Pronunciation assessment coming soon" or equivalent. |
| **No question-fetching endpoint** | 🟡 Medium | Client needs interview questions. Either add endpoint or embed questions in session start response. |
| **Session ownership model** | 🟡 Medium | Current `owner_session_key` is Django-session-based. Must be extended to support Bearer token user identity. |
| **Assessment is text-only** | 🟡 Medium | Audio upload enables future pronunciation assessment but current engine cannot use it. |
| **No retry/idempotency** | 🟡 Medium | Network failures during upload could cause duplicate turns. Backend must implement deduplication. |
| **Feedback report schema undefined** | 🟢 Low | Developer output exists; mobile contract can be derived. |
| **TTS examiner audio** | 🟢 Low | gTTS exists in web workflow; mobile needs audio URL generation. |

### Recommended Next Phase

**Phase D1.5-B: Backend Mobile Speaking Endpoint Implementation**

Before the mobile `AudioService` can be built, the Django backend must implement the 6 mobile speaking endpoints specified in `MOBILE_CONVERSATION_API_SPECIFICATION.md`. This backend work:

1. Creates the `/api/v1/speaking/sessions/` endpoint family
2. Adds audio upload handling with multi-format support (WebM, M4A, MP4, AAC)
3. Extends `SpeakingConversation` to support Bearer token user ownership
4. Adds idempotent turn submission via `X-Upload-Id`
5. Integrates Whisper transcription into the turn processing pipeline
6. Exposes assessment results via the session assessment endpoint
7. Adds a question-fetching or question-embedding mechanism
8. Generates TTS audio URLs for examiner turns

Until this backend work is complete, the mobile `AudioService` cannot integrate against a real backend. The mobile client can proceed with:

- **Zustand interview store** (Phase D2) — implement against the specified contract shape using mock repositories
- **Audio recording service** (Phase D3) — implement `expo-av` wrapper producing AAC/M4A
- **UI screens** (Phase D5–D7) — build against the Zustand store with mock data

These can all be developed in parallel with the backend work, using the frozen contract specified in this document and `MOBILE_CONVERSATION_API_SPECIFICATION.md`.

---

*Backend inspection completed: 2026-08-07*  
*Inspector: Backend Authority Verification (Read-Only)*  
*Next Phase: Backend Mobile Speaking Endpoint Implementation (Phase D1.5-B) or Zustand Interview Store (Phase D2) with mock repositories*
