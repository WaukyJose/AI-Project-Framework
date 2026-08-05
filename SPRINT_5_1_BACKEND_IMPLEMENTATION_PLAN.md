# Sprint 5.1 — Backend Implementation Plan for Mobile Cambridge Speaking Part 1

**Document Type:** Implementation Planning (Read-Only)  
**Phase:** E1 — Backend Implementation Roadmap  
**Target:** Django backend (`voicechat/` root URL config, `chat/` app)  
**Authority Documents:**
- `PART1_TRANSPORT_AUTHORITY.md` — frozen auth/profile/subscription/dashboard transport
- `PART1_AUDIO_API_SPECIFICATION.md` — frozen audio API authority verification
- `MOBILE_CONVERSATION_API_SPECIFICATION.md` — frozen mobile conversation endpoint contracts
- `PART1_TYPESCRIPT_DOMAIN_MODELS.md` — frozen mobile domain models
- `PART1_API_CLIENT_ARCHITECTURE.md` — frozen mobile API client architecture
- `PART1_IMPLEMENTATION_AUDIT.md` — verified mobile implementation baseline
- `PART1_INTERVIEW_STATE_MACHINE.md` — frozen interview lifecycle states

**Status:** ❌ Mobile speaking endpoints NOT implemented. This plan defines the work required.

---

## 1. Current Backend Assessment

### 1.1 Already Implemented (✅ Reusable)

| Component | Location | Description | Mobile Readiness |
|---|---|---|---|
| `SpeakingConversation` | `chat/models.py` | UUID pk, speaking_part (1-4), status lifecycle (active/completed/abandoned/timed_out/interrupted), profile_id, profile_version | ⚠️ Needs `owner_user` FK for Bearer token association |
| `TranscriptEntry` | `chat/models.py` | Append-only, immutable per-turn, speaker attribution (examiner/candidate/system), entry types (turn/event), event types (task_started/task_completed/clarification/progression), source_metadata JSON | ✅ Ready |
| `AssessmentReportRecord` | `chat/models.py` | Immutable assessment storage, linked to conversation_id, payload JSON, profile versioned | ✅ Ready |
| `transcript_builder` | `chat/services/transcript_builder.py` | `create_conversation()`, `append_entries()`, `append_turn()`, `complete_conversation()`, `build_transcript()` | ✅ Ready (needs owner_user in create) |
| `part1_session_controller` | `chat/services/part1_session_controller.py` | `Part1SessionTiming`, `get_part1_session_timing()`, `should_end_after_answer()`, `has_delivered_part1_closing_message()` | ✅ Ready |
| `part1_assessment_integration` | `chat/services/part1_assessment_integration.py` | `execute_part1_assessment_pipeline()`, `load_part1_feedback_from_repository()` | ✅ Ready |
| `assessment_engine` | `chat/assessment_engine.py` | `assess_conversation(conversation_id)` → `AssessmentReport` | ✅ Ready |
| `AssessmentRepository` | `chat/assessment_repository.py` | `save()`, `load()`, `find_by_conversation()`, `list_assessments()` | ✅ Ready |
| `followup_service` | `chat/services/followup_service.py` | `generate_follow_up_result()`, `build_part1_fallback()`, `validate_part1_follow_up()` | ✅ Ready |
| `get_subscription_status_for_user` | `billing/subscription_status.py` | Business logic pattern for user-based status queries | ✅ Reference pattern |
| `mobile_auth_views` | `chat/mobile_auth_views.py` | `_authenticate_token_request()`, `_json_error()`, `_parse_json_body()`, builder functions | ✅ Pattern to follow |
| Whisper transcription | `chatbot/views.py` — `transcribe` | `client.audio.transcriptions.create(model="whisper-1")` | ⚠️ WebM only; needs AAC/M4A support + auth |
| Bearer Token auth | `rest_framework.authtoken.models.Token` | `Authorization: Bearer <token>` | ✅ Ready |
| Part 1 question bank | `chat/views.py` — `questions` dict | 8 topics × 4-5 questions each for B2 Part 1 | ✅ Can be extracted to service |

### 1.2 Partially Implemented (⚠️ Needs Extension)

| Component | Gap | Work Required |
|---|---|---|
| `SpeakingConversation.owner_session_key` | Uses Django session key; needs user FK for Bearer token | Add `owner_user = ForeignKey(User, null=True)` (migration) |
| `transcript_builder.create_conversation()` | Takes `owner_session_key`; needs `owner_user` | Add optional `owner_user` parameter |
| `chatbot/views.py` — `transcribe` | Only accepts `audio/webm`; public endpoint | Extract to reusable service; add format validation; add auth |
| `part1_assessment_integration` | Developer-mode logging; not mobile-contract-shaped | Add mobile delivery adapter |
| Part 1 questions | Inline in `chat/views.py` dict; not in a service | Extract to `Part1QuestionService` |
| gTTS examiner audio | Synchronous in `chat/views.py`; no URL generation | Add TTS audio URL generation service |

### 1.3 Missing (❌ Must Be Built)

| Component | Description |
|---|---|
| 6 mobile speaking endpoints | `/api/v1/speaking/sessions/` family — none exist |
| Audio upload with validation | MIME type, size, duration validation for mobile formats (AAC/M4A) |
| User-based session ownership | `SpeakingConversation.owner_user` FK migration + authorization |
| Idempotent turn submission | `X-Upload-Id` header + deduplication |
| Turn state machine enforcement | Backend-enforced state transitions (11 session states, 10 turn states) |
| Mobile assessment delivery | Inline or polling-based assessment result retrieval |
| Part 1 question service | Server-governed question selection and delivery |
| TTS audio URL service | Async or sync TTS audio generation with URL delivery |
| Session retrieval (full state) | Full transcript + conversation state + timing recovery |
| Conversation state for mobile | Mobile-shaped `conversation_state` in response (not web `ConversationState` serialized JSON) |

### 1.4 Reuse Opportunities

| Existing Component | Reused For | Benefit |
|---|---|---|
| `SpeakingConversation` model | Session identity for all 6 endpoints | Zero new models for session identity |
| `TranscriptEntry` model | Turn storage, transcript building | Proven append-only immutability |
| `AssessmentReportRecord` model | Assessment persistence | Proven immutable storage |
| `transcript_builder` module | All write operations (create, append, complete) | Proven atomic, validated, immutable |
| `part1_session_controller` | Session timing decisions | Proven 90s/15s policy |
| `part1_assessment_integration` | Assessment pipeline execution | Proven engine-to-feedback flow |
| `assessment_engine.assess_conversation` | Assessment trigger | Single public entry point |
| `followup_service` | AI examiner follow-up generation | Proven prompt engineering + validation |
| `_authenticate_token_request()` | Auth for all 6 endpoints | Reuse exact pattern from `mobile_auth_views.py` |
| `_json_error()` | Error responses | Consistent error envelope |
| Whisper `client.audio.transcriptions.create` | Audio transcription in turn pipeline | Proven model, already integrated |
| `get_subscription_status_for_user` | Entitlement check pattern | Pattern for user-based queries |

### 1.5 Technical Debt (Address During Implementation)

| Debt | Location | Risk | Mitigation |
|---|---|---|---|
| Manual dict builders (no DRF serializers) | `mobile_auth_views.py` pattern | Inconsistent validation, no schema docs | Use DRF serializers for new endpoints OR maintain manual builder pattern for consistency |
| `owner_session_key` on `SpeakingConversation` | `chat/models.py` | Django session key not available to mobile | Add `owner_user` FK; keep `owner_session_key` for web backward compatibility |
| Inline question bank | `chat/views.py` | Not service-accessible | Extract to `Part1QuestionService` |
| gTTS synchronous | `chat/views.py` | Blocks request thread | Move to async or cached TTS service |
| WebM-only Whisper | `chatbot/views.py` | Mobile produces AAC/M4A | Extend accepted formats |
| No idempotency for turns | Entire codebase | Duplicate turns on retry | Add `X-Upload-Id` + dedup table |
| `ConversationState` serialized as JSON string | Web response contract | Not compatible with mobile JSON shape | Mobile endpoints return native JSON `conversation_state` |
| `@csrf_exempt` + session cookies | Web speaking endpoints | Mixed auth model | Mobile uses Bearer token exclusively; web unchanged |

---

## 2. Endpoint Implementation Matrix

### 2.1 `POST /api/v1/speaking/sessions/` — Create Session

| Property | Value |
|---|---|
| **Purpose** | Create a new server-owned speaking session bound to the authenticated user |
| **Current Status** | ❌ Not implemented |
| **HTTP Method** | POST |
| **Authentication** | Bearer Token (required) |
| **Permissions** | Authenticated + Active user |
| **Request Content-Type** | `application/json` |
| **Response Content-Type** | `application/json` |
| **Dependencies** | `_authenticate_token_request()`, `SpeakingConversation` model (with `owner_user` FK), `Part1QuestionService` |
| **Estimated Effort** | **S** (Small — 2-4 hours) |
| **Priority** | 🔴 P0 — Critical Path |
| **Implementation Order** | **1st** — All other endpoints depend on session existence |

### 2.2 `GET /api/v1/speaking/sessions/{session_id}/` — Retrieve Session

| Property | Value |
|---|---|
| **Purpose** | Retrieve authoritative session state, transcript, timing, and artifacts |
| **Current Status** | ❌ Not implemented |
| **HTTP Method** | GET |
| **Authentication** | Bearer Token (required) |
| **Permissions** | Session ownership |
| **Request Content-Type** | N/A |
| **Response Content-Type** | `application/json` |
| **Dependencies** | Session creation, `build_transcript()`, `get_part1_session_timing()` |
| **Estimated Effort** | **S** (Small — 2-3 hours) |
| **Priority** | 🔴 P0 — Critical Path |
| **Implementation Order** | **4th** — Needed for recovery after network failure |

### 2.3 `POST /api/v1/speaking/sessions/{session_id}/start/` — Start Session

| Property | Value |
|---|---|
| **Purpose** | Start conversation timer, return first examiner prompt with TTS audio |
| **Current Status** | ❌ Not implemented |
| **HTTP Method** | POST |
| **Authentication** | Bearer Token (required) |
| **Permissions** | Session ownership + session in `ready` state |
| **Request Content-Type** | `application/json` |
| **Response Content-Type** | `application/json` |
| **Dependencies** | Session creation, `Part1QuestionService`, `append_turn()` for examiner entry, TTS audio URL generation |
| **Estimated Effort** | **M** (Medium — 4-6 hours) |
| **Priority** | 🔴 P0 — Critical Path |
| **Implementation Order** | **2nd** — Required to begin conversation |

### 2.4 `POST /api/v1/speaking/sessions/{session_id}/turns/` — Submit Turn

| Property | Value |
|---|---|
| **Purpose** | Accept one candidate audio turn, transcribe, append to transcript, generate next examiner turn |
| **Current Status** | ❌ Not implemented |
| **HTTP Method** | POST |
| **Authentication** | Bearer Token (required) |
| **Permissions** | Session ownership + session in `awaiting_candidate_turn` state |
| **Request Content-Type** | `multipart/form-data` (JSON metadata + audio file) |
| **Response Content-Type** | `application/json` |
| **Dependencies** | Session start, Whisper transcription, `append_entries()`, `followup_service`, `part1_session_controller`, TTS audio URL generation, idempotency |
| **Estimated Effort** | **L** (Large — 8-12 hours) |
| **Priority** | 🔴 P0 — Critical Path |
| **Implementation Order** | **3rd** — Core conversation loop |

### 2.5 `POST /api/v1/speaking/sessions/{session_id}/complete/` — Complete Session

| Property | Value |
|---|---|
| **Purpose** | Finalize conversation, trigger assessment, return assessment artifacts |
| **Current Status** | ❌ Not implemented |
| **HTTP Method** | POST |
| **Authentication** | Bearer Token (required) |
| **Permissions** | Session ownership + session in `completion_ready` state |
| **Request Content-Type** | `application/json` |
| **Response Content-Type** | `application/json` |
| **Dependencies** | All turns submitted, closing message delivered, `complete_conversation()`, `execute_part1_assessment_pipeline()` |
| **Estimated Effort** | **M** (Medium — 4-6 hours) |
| **Priority** | 🔴 P0 — Critical Path |
| **Implementation Order** | **5th** — Terminal state transition |

### 2.6 `GET /api/v1/speaking/sessions/{session_id}/assessment/` — Get Assessment

| Property | Value |
|---|---|
| **Purpose** | Retrieve latest assessment/feedback for a completed session |
| **Current Status** | ❌ Not implemented |
| **HTTP Method** | GET |
| **Authentication** | Bearer Token (required) |
| **Permissions** | Session ownership + session in `completed` state |
| **Request Content-Type** | N/A |
| **Response Content-Type** | `application/json` |
| **Dependencies** | Session completion, `load_part1_feedback_from_repository()` |
| **Estimated Effort** | **S** (Small — 1-2 hours) |
| **Priority** | 🟡 P1 — High (can defer if inline assessment in complete) |
| **Implementation Order** | **6th** — Delayed retrieval support |

---

## 3. Existing Components to Reuse

### 3.1 Models (Zero New Models Required)

The existing models cover all data needs:

| Model | Reused For | Modification Required |
|---|---|---|
| `SpeakingConversation` | Session identity, lifecycle, ownership | **Migration:** Add `owner_user = ForeignKey(User, null=True, db_index=True)` |
| `TranscriptEntry` | All turn and event recording | **None** — perfect fit |
| `AssessmentReportRecord` | All assessment storage | **None** — perfect fit |
| `Token` (DRF) | Bearer token authentication | **None** — already used by mobile auth |

### 3.2 Services (Reuse, Don't Rewrite)

| Service | Reused Directly | Notes |
|---|---|---|
| `transcript_builder.create_conversation()` | ✅ Yes | Add `owner_user` parameter |
| `transcript_builder.append_entries()` | ✅ Yes | Accept source_metadata with ASR provider/confidence |
| `transcript_builder.append_turn()` | ✅ Yes | Convenience wrapper |
| `transcript_builder.complete_conversation()` | ✅ Yes | Atomic, immutable |
| `transcript_builder.build_transcript()` | ✅ Yes | For session retrieval response |
| `part1_session_controller.get_part1_session_timing()` | ✅ Yes | Session timing in responses |
| `part1_session_controller.should_end_after_answer()` | ✅ Yes | Turn processing decision |
| `part1_session_controller.has_delivered_part1_closing_message()` | ✅ Yes | Completion gating |
| `part1_assessment_integration.execute_part1_assessment_pipeline()` | ✅ Yes | Assessment trigger on completion |
| `part1_assessment_integration.load_part1_feedback_from_repository()` | ✅ Yes | Assessment retrieval |
| `followup_service.generate_follow_up_result()` | ✅ Yes | AI examiner follow-up generation |
| `followup_service.build_part1_fallback()` | ✅ Yes | Offline-safe fallback |
| `assessment_engine.assess_conversation()` | ✅ Yes | Assessment entry point |
| `assessment_repository.repository` | ✅ Yes | Assessment persistence and retrieval |

### 3.3 Authentication and Authorization

| Component | Reused From | Notes |
|---|---|---|
| `_authenticate_token_request()` | `chat/mobile_auth_views.py` | Copy pattern; extracts `Authorization: Bearer <token>`, validates against `Token` model, sets `request.user` |
| `_json_error()` | `chat/mobile_auth_views.py` | Copy pattern; `{ authenticated: false, error: { code, message } }` |
| `_parse_json_body()` | `chat/mobile_auth_views.py` | Copy pattern |
| `_get_bearer_token()` | `chat/mobile_auth_views.py` | Copy pattern |

**Decision:** These helpers should be extracted to a shared module (`chat/mobile_helpers.py`) to avoid duplication across `mobile_auth_views.py` and the new `mobile_speaking_views.py`.

### 3.4 Conversation Lifecycle (Server-Authoritative)

The `SpeakingConversation.Status` choices already support the mobile lifecycle:

| Web Status | Maps to Mobile State |
|---|---|
| `ACTIVE` | `ready`, `awaiting_candidate_turn`, `processing_turn`, `awaiting_examiner_playback`, `completion_ready`, `completing` |
| `COMPLETED` | `completed` |
| `ABANDONED` | `abandoned` |
| `TIMED_OUT` | `failed` |
| `INTERRUPTED` | `failed` |

**Decision:** The mobile session state is derived from the combination of `SpeakingConversation.status` + transcript analysis (e.g., whether the last entry is a candidate turn waiting for processing, or the closing message has been delivered). No new model field is required. A `_derive_session_state(conversation)` helper function computes this.

---

## 4. Serializer Plan

### 4.1 Serializer Strategy Decision

The existing mobile endpoints (`mobile_auth_views.py`) use **manual dict builders** rather than DRF Serializers. This is a deliberate pattern that:
- Keeps mobile endpoints independent of DRF's browsable API, router, and ViewSet conventions
- Allows precise control over JSON shape without serializer-field translation
- Is already proven in production for auth/profile/subscription/dashboard

**Decision:** Use DRF Serializers for the new speaking endpoints. Reasons:
1. Speaking endpoints have complex nested structures (transcript_delta, conversation_state, examiner_turn, etc.)
2. DRF Serializers provide built-in validation, required-field enforcement, and type coercion
3. Serializers produce self-documenting schemas
4. The existing `rest_framework` is already installed (used for `Token` model and `authtoken`)
5. Mobile auth endpoints remain as-is (no refactoring)

### 4.2 Shared Serializers

```python
# chat/serializers/speaking_common.py

class SessionIdentitySerializer(serializers.Serializer):
    """Shared session identity fields returned in every speaking response."""
    session_id = serializers.UUIDField(read_only=True)
    part = serializers.CharField(read_only=True)
    session_state = serializers.CharField(read_only=True)

class TranscriptDeltaEntrySerializer(serializers.Serializer):
    """One transcript entry in a delta response."""
    speaker = serializers.ChoiceField(choices=["examiner", "candidate", "system"])
    text = serializers.CharField()

class ConversationStateSerializer(serializers.Serializer):
    """Mobile conversation_state object."""
    conversation_started = serializers.BooleanField()
    current_question = serializers.CharField()
    follow_up_asked = serializers.BooleanField()
    part1_complete = serializers.BooleanField(required=False, default=False)

class ExaminerTurnSerializer(serializers.Serializer):
    """Examiner turn with text and optional TTS audio URL."""
    turn = serializers.IntegerField()
    text = serializers.CharField()
    audio_url = serializers.CharField(allow_null=True, required=False)

class CandidateTurnSerializer(serializers.Serializer):
    """Accepted candidate turn with transcription."""
    turn = serializers.IntegerField()
    transcript = serializers.CharField()

class AssessmentSummarySerializer(serializers.Serializer):
    """Assessment status in complete response."""
    status = serializers.ChoiceField(choices=["complete", "pending", "processing"])
    assessment_id = serializers.UUIDField(allow_null=True, required=False)
```

### 4.3 Request Serializers

| Endpoint | Serializer Class | Fields |
|---|---|---|
| `POST .../sessions/` | `CreateSessionRequestSerializer` | `part` (ChoiceField: part-1/part-2/part-3/part-4), `client_context` (dict, optional) |
| `POST .../sessions/{id}/start/` | `StartSessionRequestSerializer` | `part` (ChoiceField) |
| `POST .../sessions/{id}/turns/` | `SubmitTurnRequestSerializer` | `part` (ChoiceField), `turn` (IntegerField, min=1), `metadata` (dict, optional) |
| `POST .../sessions/{id}/complete/` | `CompleteSessionRequestSerializer` | `part` (ChoiceField), `last_client_turn` (IntegerField, min=1) |

### 4.4 Response Serializers

| Endpoint | Serializer Class | Fields |
|---|---|---|
| `POST .../sessions/` | `CreateSessionResponseSerializer` | `session_id`, `part`, `session_state`, `created_at` |
| `GET .../sessions/{id}/` | `RetrieveSessionResponseSerializer` | `session_id`, `part`, `session_state`, `conversation_state`, `timing`, `transcript`, `assessment` |
| `POST .../sessions/{id}/start/` | `StartSessionResponseSerializer` | `session_id`, `part`, `session_state`, `conversation_state`, `examiner_turn`, `transcript_delta` |
| `POST .../sessions/{id}/turns/` | `SubmitTurnResponseSerializer` | `session_id`, `part`, `session_state`, `turn_status`, `candidate_turn`, `conversation_state`, `examiner_turn`, `transcript_delta` |
| `POST .../sessions/{id}/complete/` | `CompleteSessionResponseSerializer` | `session_id`, `part`, `session_state`, `assessment`, `feedback_report`, `practice_score` |
| `GET .../sessions/{id}/assessment/` | `AssessmentResponseSerializer` | `session_id`, `part`, `session_state`, `assessment`, `feedback_report`, `practice_score` |

### 4.5 Validation Rules

| Serializer | Rule | Error Code |
|---|---|---|
| `CreateSessionRequestSerializer` | `part` must be one of: `part-1`, `part-2`, `part-3`, `part-4` | `invalid_part` |
| `StartSessionRequestSerializer` | `part` must match the session's declared part | `invalid_part` |
| `SubmitTurnRequestSerializer` | `part` must match session's part | `invalid_part` |
| `SubmitTurnRequestSerializer` | `turn` must be the next expected turn number | `invalid_turn_sequence` |
| `CompleteSessionRequestSerializer` | Session must be in `completion_ready` state | `completion_not_allowed` |
| `CompleteSessionRequestSerializer` | Closing message must have been delivered | `completion_not_allowed` |
| `CompleteSessionRequestSerializer` | `last_client_turn` must match transcript | `invalid_turn_sequence` |
| All | Audio file required for turn submission | `audio_missing` |
| All | Audio MIME type must be accepted | `audio_unsupported` |

### 4.6 DTO Correspondence with Mobile

| Mobile DTO (`PART1_TYPESCRIPT_DOMAIN_MODELS.md`) | Backend Serializer Field |
|---|---|
| `SpeakingSession.domainId` | `session_id` (UUID) |
| `SpeakingSession.part` | `part` (string) |
| `SpeakingSession.state` | `session_state` (string) |
| `SpeakingSession.createdAt` | `created_at` (ISO-8601) |
| `ExaminerTurn.turn` | `examiner_turn.turn` |
| `ExaminerTurn.text` | `examiner_turn.text` |
| `ExaminerTurn.audioUrl` | `examiner_turn.audio_url` |
| `CandidateTurn.turn` | `candidate_turn.turn` |
| `CandidateTurn.transcript` | `candidate_turn.transcript` |
| `ConversationState.conversationStarted` | `conversation_state.conversation_started` |
| `ConversationState.currentQuestion` | `conversation_state.current_question` |
| `ConversationState.followUpAsked` | `conversation_state.follow_up_asked` |
| `ConversationState.part1Complete` | `conversation_state.part1_complete` |
| `TranscriptEntry.speaker` | `transcript_delta[].speaker` |
| `TranscriptEntry.text` | `transcript_delta[].text` |
| `AssessmentResult.assessmentId` | `assessment.assessment_id` |
| `AssessmentResult.status` | `assessment.status` |

---

## 5. View Layer Plan

### 5.1 Architecture Decision

**Use function-based views with `@require_POST` / `@require_GET` + `@csrf_exempt`**, consistent with the existing `mobile_auth_views.py` pattern. Do NOT use DRF ViewSets or APIView for speaking endpoints. This keeps the mobile API surface consistent.

### 5.2 View Functions

| View Function | File | Decorators |
|---|---|---|
| `mobile_create_speaking_session` | `chat/mobile_speaking_views.py` | `@csrf_exempt`, `@require_POST` |
| `mobile_retrieve_speaking_session` | `chat/mobile_speaking_views.py` | `@require_GET` |
| `mobile_start_speaking_session` | `chat/mobile_speaking_views.py` | `@csrf_exempt`, `@require_POST` |
| `mobile_submit_speaking_turn` | `chat/mobile_speaking_views.py` | `@csrf_exempt`, `@require_POST` |
| `mobile_complete_speaking_session` | `chat/mobile_speaking_views.py` | `@csrf_exempt`, `@require_POST` |
| `mobile_retrieve_assessment` | `chat/mobile_speaking_views.py` | `@require_GET` |

### 5.3 Authentication (All Endpoints)

```python
def _authenticate_token_request(request):
    """Reused from mobile_auth_views.py — extract to mobile_helpers.py."""
    token_key = _get_bearer_token(request)
    if not token_key:
        return None, JsonResponse({
            "authenticated": False,
            "error": {
                "code": "authentication_required",
                "message": "Authentication required.",
            },
        }, status=401)
    try:
        token = Token.objects.select_related("user").get(key=token_key)
    except Token.DoesNotExist:
        return None, JsonResponse({
            "authenticated": False,
            "error": {
                "code": "invalid_token",
                "message": "Invalid authentication token.",
            },
        }, status=401)
    if not token.user.is_active:
        token.delete()
        return None, JsonResponse({
            "authenticated": False,
            "error": {
                "code": "inactive_account",
                "message": "This account is inactive.",
            },
        }, status=403)
    request.user = token.user
    request.auth = token
    return token, None
```

### 5.4 Permissions (Session Ownership)

```python
def _get_owned_session(request, session_id):
    """Fetch a session, verifying ownership. Returns (session, error_response)."""
    try:
        session = SpeakingConversation.objects.get(pk=session_id)
    except SpeakingConversation.DoesNotExist:
        return None, JsonResponse({
            "error": {
                "code": "session_not_found",
                "message": "The requested speaking session was not found.",
                "category": "validation",
                "retryable": False,
            },
        }, status=404)
    if session.owner_user_id != request.user.pk:
        return None, JsonResponse({
            "error": {
                "code": "session_not_owned",
                "message": "This speaking session belongs to another user.",
                "category": "authorization",
                "retryable": False,
            },
        }, status=403)
    return session, None
```

### 5.5 Request Flow (Generic Pattern)

```
1. Authenticate: _authenticate_token_request(request) → (token, error_response?)
2. Parse JSON: _parse_json_body(request) → dict
3. Validate: Serializer(data=body).is_valid() → validated_data
4. Authorize: _get_owned_session(request, session_id) → (session, error_response?)
5. Execute: Service layer call with session + validated_data
6. Serialize: ResponseSerializer(service_result).data
7. Respond: JsonResponse(data, status=200)
```

### 5.6 Response Flow

All responses follow the `MOBILE_CONVERSATION_API_SPECIFICATION.md` response schemas (see §6 of that document). The response envelope includes:

- `session_id` (UUID)
- `part` (string)
- `session_state` (string)
- Action-specific payload (transcript_delta, examiner_turn, etc.)

### 5.7 Error Handling

Errors use the conversation error envelope (distinct from auth error envelope):

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

The existing auth error envelope is preserved for auth failures:

```json
{
  "authenticated": false,
  "error": {
    "code": "authentication_required",
    "message": "Authentication required."
  }
}
```

### 5.8 Service Invocation

| View | Service Call(s) |
|---|---|
| `mobile_create_speaking_session` | `create_conversation(speaking_part=..., owner_user=request.user)` |
| `mobile_retrieve_speaking_session` | `build_transcript(session)`, `get_part1_session_timing(session)`, `_derive_session_state(session)` |
| `mobile_start_speaking_session` | `Part1QuestionService.get_first_question()`, `append_turn(session, "examiner", greeting)` |
| `mobile_submit_speaking_turn` | `_validate_turn_sequence()`, `_transcribe_audio()`, `append_turn(session, "candidate", transcript)`, `_compute_next_examiner_turn()`, `append_turn(session, "examiner", next_text)` |
| `mobile_complete_speaking_session` | `complete_conversation(session)`, `execute_part1_assessment_pipeline(session.pk)` |
| `mobile_retrieve_assessment` | `load_part1_feedback_from_repository(session.pk)` |

---

## 6. Service Layer Plan

### 6.1 Existing Services Reused (No Changes)

| Service | File | Purpose |
|---|---|---|
| `transcript_builder` | `chat/services/transcript_builder.py` | All conversation write operations |
| `part1_session_controller` | `chat/services/part1_session_controller.py` | Session timing policy |
| `followup_service` | `chat/services/followup_service.py` | AI examiner follow-up generation |
| `assessment_engine` | `chat/assessment_engine.py` | Assessment execution |
| `assessment_repository` | `chat/assessment_repository.py` | Assessment persistence |
| `part1_assessment_integration` | `chat/services/part1_assessment_integration.py` | Assessment pipeline orchestration |
| `get_subscription_status_for_user` | `billing/subscription_status.py` | (Reference pattern only; not directly reused) |

### 6.2 New Services Required

| Service | File | Responsibility | Dependencies |
|---|---|---|---|
| `MobileSpeakingService` | `chat/services/mobile_speaking_service.py` | Orchestrate mobile turn processing: validate state, transcribe audio, generate next examiner turn, enforce timing | `transcript_builder`, `part1_session_controller`, `followup_service`, `MobileTranscriptionService`, `Part1QuestionService` |
| `MobileTranscriptionService` | `chat/services/mobile_transcription_service.py` | Accept audio file bytes → return transcript text + provider metadata | OpenAI Whisper (`whisper-1`), audio format validation |
| `Part1QuestionService` | `chat/services/part1_question_service.py` | Server-governed Part 1 question selection, topic tracking, question history | None (pure Python, reads question bank) |
| `MobileTTSService` | `chat/services/mobile_tts_service.py` | Generate TTS audio for examiner turns, return audio URL | gTTS or alternative TTS provider, file storage |
| `MobileSessionStateService` | `chat/services/mobile_session_state_service.py` | Derive mobile session state from conversation status + transcript analysis | `SpeakingConversation`, `TranscriptEntry` |
| `mobile_helpers` | `chat/mobile_helpers.py` | Shared auth helpers extracted from `mobile_auth_views.py` | `rest_framework.authtoken.models.Token` |

### 6.3 Service Responsibilities

#### `MobileSpeakingService`

```
process_turn(session, turn_number, audio_file, metadata) → MobileTurnResult
  ├── Validate session in awaiting_candidate_turn state
  ├── Validate turn sequence
  ├── Delegate to MobileTranscriptionService.transcribe(audio_file)
  ├── append_turn(session, "candidate", transcript, source_metadata={...})
  ├── Check session timing (should_end_after_answer)
  ├── IF should end:
  │   ├── append_turn(session, "examiner", PART1_END_MESSAGE)
  │   └── Return closing response
  ├── ELSE:
  │   ├── Delegate to followup_service (or Part1QuestionService for new topic)
  │   ├── append_turn(session, "examiner", next_question)
  │   ├── Delegate to MobileTTSService for audio URL
  │   └── Return next examiner turn response
  └── Return MobileTurnResult
```

#### `MobileTranscriptionService`

```
transcribe(audio_file, mime_type) → TranscriptionResult
  ├── Validate MIME type against accepted list
  ├── Validate file size (< 10 MB)
  ├── Read audio bytes
  ├── Call OpenAI Whisper: client.audio.transcriptions.create(
  │     model="whisper-1",
  │     file=(filename, bytes, mime_type),
  │     response_format="json",
  │   )
  ├── Return TranscriptionResult(transcript=text, provider="whisper-1", confidence=None)
  └── On failure: raise TranscriptionError (code="transcription_failed")
```

#### `Part1QuestionService`

```
get_first_question() → (question_text, topic_name)
  ├── Select random topic from question bank
  ├── Select first question from topic
  └── Return question text

get_next_topic(exclude_topics) → (question_text, topic_name)
  ├── Select random topic excluding asked topics
  ├── Select first question from new topic
  └── Return question text
```

**Question Bank:** Extracted from `chat/views.py` — `questions["B2_Speaking_Part_1"]` (8 topics, ~4-5 questions each). Stored as a module-level dict in the service.

#### `MobileTTSService`

```
generate_audio(text) → audio_url
  ├── Check cache for existing TTS of this text
  ├── If cached: return cached URL
  ├── Generate TTS (gTTS or provider)
  ├── Store to MEDIA_ROOT/tts/<hash>.mp3
  ├── Return URL path
  └── On failure: return None (text-only fallback)
```

#### `MobileSessionStateService`

```
derive_session_state(conversation) → state_string
  ├── IF status == ACTIVE:
  │   ├── IF no entries: return "ready"
  │   ├── IF last entry is examiner turn + closing message: return "completion_ready"
  │   ├── IF last entry is examiner turn: return "awaiting_candidate_turn"
  │   ├── IF last entry is candidate turn: return "processing_turn"
  │   └── ELSE: return "active"
  ├── IF status == COMPLETED: return "completed"
  ├── IF status == ABANDONED: return "abandoned"
  ├── IF status == TIMED_OUT: return "failed"
  └── IF status == INTERRUPTED: return "failed"
```

### 6.4 Dependency Graph

```
mobile_helpers.py (auth extraction)
        ↓
mobile_speaking_views.py (6 view functions)
        ↓
    ┌───────────────────────────────────────┐
    │  MobileSpeakingService                │
    │  (turn orchestration)                 │
    └───────────────────────────────────────┘
        ↓           ↓           ↓           ↓
    transcript  part1_session  followup    Mobile
    _builder    _controller    _service    Transcription
                                          Service
        ↓                                   ↓
    MobileSession    MobileTTS      OpenAI Whisper
    StateService     Service        (client.audio.
        ↓               ↓            transcriptions)
    Speaking        gTTS / file
    Conversation    storage
```

**No circular dependencies.** All dependencies flow downward.

---

## 7. Audio Upload Plan

### 7.1 Accepted MIME Types

| MIME Type | Extension | Source | Status |
|---|---|---|---|
| `audio/webm` | `.webm` | Browser `MediaRecorder` | ✅ Already accepted (chatbot) |
| `audio/mp4` | `.mp4` | iOS/Android `expo-av` | ❌ Must be added |
| `audio/m4a` | `.m4a` | iOS/Android `expo-av` | ❌ Must be added |
| `audio/aac` | `.aac` | iOS/Android `expo-av` | ❌ Must be added |
| `audio/mpeg` | `.mp3` | General | Optional (future) |

**Implementation:** `MobileTranscriptionService` validates the MIME type against an `ACCEPTED_AUDIO_MIME_TYPES` set. Whisper natively supports all these formats — the limitation is only in the current chatbot view code.

### 7.2 Validation

| Check | Rule | Error Code | HTTP Status |
|---|---|---|---|
| File present | `request.FILES.get("audio")` must not be None | `audio_missing` | 400 |
| File size | 0 < size ≤ 10 MB | `audio_too_large` | 413 |
| MIME type | Must be in `ACCEPTED_AUDIO_MIME_TYPES` | `audio_unsupported` | 415 |
| Magic bytes | (Optional) Validate file header matches MIME type | `audio_unsupported` | 415 |

### 7.3 Storage

**Decision: In-memory only.** Audio files are read into memory, sent to Whisper, and discarded. No persistent audio storage for Sprint 5.1.

Rationale:
- Transcript is the authoritative evidence (per Assessment Engine ADRs)
- Pronunciation assessment is Phase 6 (future)
- Avoids storage infrastructure, retention policy, and GDPR complexity
- Whisper returns text only; audio is not needed after transcription

**Future:** When pronunciation assessment (Phase 6) is implemented, audio files will be stored temporarily for analysis and then deleted per retention policy.

### 7.4 Temporary Files

| Phase | Location | Lifetime |
|---|---|---|
| Upload | Django request memory / temp upload handler | Duration of request |
| Transcription | In-memory bytes → Whisper API | Duration of API call |
| After transcription | Discarded | Immediately |

Django's default `FILE_UPLOAD_MAX_MEMORY_SIZE` (2.5 MB) must be increased for mobile audio (recommend 10 MB). Files larger than `FILE_UPLOAD_MAX_MEMORY_SIZE` spill to disk via Django's temporary upload handler — this is acceptable and does not require persistent storage.

### 7.5 Upload Limits

| Limit | Value | Enforced By |
|---|---|---|
| Max file size | 10 MB | Django `FILE_UPLOAD_MAX_MEMORY_SIZE` (settings) + application-level check |
| Max recording duration | 60 seconds | Enforced client-side; not validated server-side (Whisper handles long audio) |
| Rate limit | TBD | Django rate limiting or reverse proxy (future) |

### 7.6 Security

| Concern | Mitigation |
|---|---|
| Unauthenticated upload | `_authenticate_token_request()` required on all turn endpoints |
| Session hijacking | `_get_owned_session()` verifies `owner_user_id == request.user.pk` |
| Malicious file upload | MIME type whitelist; file size limit; Whisper processes only audio |
| Audio content logging | Audio bytes never logged; only transcription text may appear in logs |
| CSRF | `@csrf_exempt` — stateless Bearer token (no cookies); consistent with mobile auth pattern |

### 7.7 Whisper Integration

```python
# chat/services/mobile_transcription_service.py

import logging
from openai import OpenAI

logger = logging.getLogger(__name__)

ACCEPTED_AUDIO_MIME_TYPES = {
    "audio/webm",
    "audio/mp4",
    "audio/m4a",
    "audio/aac",
    "audio/mpeg",
}

MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

client = OpenAI()


class TranscriptionError(Exception):
    def __init__(self, code, detail):
        self.code = code
        self.detail = detail


def transcribe(audio_file, mime_type):
    """Transcribe uploaded audio using OpenAI Whisper."""
    if audio_file.size == 0:
        raise TranscriptionError("audio_missing", "No audio data received.")
    if audio_file.size > MAX_AUDIO_SIZE_BYTES:
        raise TranscriptionError("audio_too_large", "Audio file exceeds maximum size.")
    if mime_type not in ACCEPTED_AUDIO_MIME_TYPES:
        raise TranscriptionError("audio_unsupported", f"Audio format {mime_type} is not accepted.")

    try:
        audio_bytes = audio_file.read()
        # Determine file extension from MIME type for Whisper
        ext = mime_type.split("/")[-1]  # "webm", "mp4", "m4a", "aac", "mpeg"
        audio_payload = (f"audio.{ext}", audio_bytes, mime_type)

        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_payload,
            response_format="json",
        )
        text = transcription.text.strip()
        return {
            "transcript": text,
            "provider": "whisper-1",
            "confidence": None,  # Whisper does not provide word-level confidence by default
        }
    except TranscriptionError:
        raise
    except Exception as exc:
        logger.error("Whisper transcription failed: %s", exc, exc_info=True)
        raise TranscriptionError("transcription_failed", "Audio transcription could not be completed.")
```

### 7.8 Future Pronunciation Integration

The `source_metadata` field on `TranscriptEntry` is already designed to carry speech recognition metadata:

```json
{
  "speech_recognition": {
    "provider": "whisper-1",
    "confidence": null
  }
}
```

When pronunciation assessment (Phase 6) is introduced:
1. Audio file is stored temporarily (not discarded after transcription)
2. Pronunciation evaluator reads audio + transcript
3. `source_metadata.audio_alignment` is populated with timing data
4. Audio file is deleted per retention policy after assessment

**No model changes required.** The `source_metadata` JSON field accommodates this extension.

---

## 8. Assessment Pipeline

### 8.1 Conversation Completion

The completion flow:

```
POST /api/v1/speaking/sessions/{id}/complete/
  │
  ├── 1. Authenticate (Bearer token)
  ├── 2. Authorize (session ownership)
  ├── 3. Validate (session in completion_ready state)
  ├── 4. Validate (closing message delivered: PART1_END_MESSAGE as last examiner turn)
  ├── 5. complete_conversation(session)  ← transcript_builder
  │      ├── Append TASK_COMPLETED event
  │      └── Set status = COMPLETED, completed_at = now
  │
  ├── 6. execute_part1_assessment_pipeline(session.pk)  ← part1_assessment_integration
  │      ├── assess_conversation(session.pk)  ← assessment_engine
  │      │      ├── Load conversation
  │      │      ├── Build transcript
  │      │      ├── Run 4 criterion evaluators
  │      │      └── Return AssessmentReport
  │      ├── repository.save(report)  ← assessment_repository
  │      │      └── AssessmentReportRecord.objects.create(...)
  │      ├── evaluate_assessment_policy(report)
  │      ├── generate_feedback(report, policy_result)
  │      └── Return developer_output dict
  │
  └── 7. Return CompleteSessionResponse
         ├── session_state: "completed"
         ├── assessment.status: "complete" | "processing"
         ├── assessment.assessment_id: uuid | null
         ├── practice_score: {...}
         └── feedback_report: {...}
```

### 8.2 Transcript Generation

`build_transcript()` is called during:
1. **Session retrieval** (`GET .../sessions/{id}/`) — returns full transcript
2. **Assessment** — assessment engine calls `build_transcript()` internally via `load_assessment_context()`

The transcript delta (new entries since last client state) is computed in the turn response by comparing the client's turn number to the transcript sequence.

### 8.3 Assessment Trigger

Assessment is triggered **synchronously during completion**. If the assessment pipeline completes within the request, results are returned inline. If it takes too long (future async scenario), the session is still marked `completed` and `assessment.status` is set to `"processing"`.

**Current behavior:** The assessment pipeline runs synchronously in the web workflow. Mobile completion should follow the same pattern for Sprint 5.1. Async assessment can be added later without contract changes.

### 8.4 Assessment Persistence

`AssessmentReportRecord` is already immutable, versioned, and linked to `conversation_id`. The repository's `find_by_conversation()` method retrieves all assessments for a session (most recent is the active one).

**No changes required to the assessment storage layer.**

### 8.5 Assessment Retrieval

Two paths:
1. **Inline:** Assessment results returned in the complete session response (if synchronous)
2. **Polled:** `GET /api/v1/speaking/sessions/{id}/assessment/` returns the latest assessment

Both use `load_part1_feedback_from_repository(session.pk)` internally.

### 8.6 Future Pronunciation Support

When Phase 6 introduces audio-based pronunciation assessment:
1. `MobileTranscriptionService` stores audio temporarily instead of discarding
2. Pronunciation evaluator consumes audio + transcript
3. `CriterionAssessment` for pronunciation returns a band + confidence (not unavailable)
4. `source_metadata.audio_alignment` is populated
5. No contract changes needed — the `practice_score` and `feedback_report` shapes accommodate the additional criterion

---

## 9. Authentication

### 9.1 Bearer Token (Verified)

| Property | Value | Evidence |
|---|---|---|
| Mechanism | DRF Token Authentication | `rest_framework.authtoken.models.Token` |
| Header | `Authorization: Bearer <token>` | `mobile_auth_views.py` — `_get_bearer_token()` |
| Validation | `Token.objects.select_related("user").get(key=token_key)` | `mobile_auth_views.py` — `_authenticate_token_request()` |
| Inactive user | Token deleted, 403 returned | `mobile_auth_views.py` |
| Missing token | 401 returned | `mobile_auth_views.py` |

**All 6 speaking endpoints use the same `_authenticate_token_request()` pattern.**

### 9.2 Ownership Validation

Every endpoint that operates on a session (all except create) must verify:

```python
session.owner_user_id == request.user.pk
```

This prevents:
- Cross-user session access
- Turn submission to another user's session
- Completion of another user's session
- Assessment retrieval for another user's session

### 9.3 User Permissions

| Check | Required For | Implementation |
|---|---|---|
| Authenticated | All endpoints | `_authenticate_token_request()` |
| Active user | All endpoints | `token.user.is_active` check |
| Session ownership | Retrieve, start, turn, complete, assessment | `_get_owned_session()` |
| Session state | Start (must be `ready`), turn (must be `awaiting_candidate_turn`), complete (must be `completion_ready`), assessment (must be `completed`) | State machine validation in view/service |

No subscription/entitlement check is applied to speaking endpoints in Sprint 5.1. The web `/chat/` endpoint does not check subscription status (it is public). Mobile speaking endpoints follow the same public-access model.

### 9.4 Session Ownership Migration

**Current:**
```python
# chat/models.py
owner_session_key = models.CharField(max_length=40, blank=True, db_index=True)
```

**Required migration:**
```python
# Add to SpeakingConversation
owner_user = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    null=True,       # Allow null for backward compatibility
    blank=True,
    on_delete=models.SET_NULL,
    related_name="speaking_sessions",
    db_index=True,
)
```

`owner_session_key` is preserved for web backward compatibility. Mobile sessions use `owner_user`; web sessions use `owner_session_key`. Both can exist on the same record.

**Migration:** `python manage.py makemigrations chat` → generates `AddField owner_user to SpeakingConversation`

### 9.5 Authorization Failures

| Failure | HTTP Status | Error Code | Category |
|---|---|---|---|
| No Bearer token | 401 | `authentication_required` | `authentication` |
| Invalid token | 401 | `invalid_token` | `authentication` |
| Inactive account | 403 | `inactive_account` | `authentication` |
| Session not found | 404 | `session_not_found` | `validation` |
| Session not owned | 403 | `session_not_owned` | `authorization` |
| Session in wrong state | 409 | `conversation_not_ready` | `workflow` |
| Session already terminal | 409 | `session_already_terminal` | `workflow` |

---

## 10. Error Strategy

### 10.1 HTTP Status Code Map

| Code | Meaning | When |
|---|---|---|
| `200` | Success | All successful requests |
| `400` | Bad Request | Invalid JSON, missing required fields, validation failure |
| `401` | Unauthorized | Missing/invalid Bearer token |
| `403` | Forbidden | Inactive account, session not owned |
| `404` | Not Found | Session ID does not exist |
| `409` | Conflict | Invalid state transition (session not in correct state) |
| `413` | Content Too Large | Audio file exceeds max size |
| `415` | Unsupported Media Type | Audio MIME type not accepted |
| `422` | Unprocessable Entity | (Reserved — future use for turn processing failures) |
| `429` | Too Many Requests | Rate limit exceeded (future) |
| `500` | Internal Server Error | Unexpected service failure, transcription failure |

### 10.2 Error Envelopes

**Conversation Errors (speaking endpoints):**

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

**Authentication Errors (consistent with mobile_auth_views.py):**

```json
{
  "authenticated": false,
  "error": {
    "code": "authentication_required",
    "message": "Authentication required."
  }
}
```

### 10.3 Error Code Catalog

| Code | Category | HTTP Status | Retryable | Message Template |
|---|---|---|---|---|
| `unauthenticated` | `authentication` | 401 | No | "Authentication required." |
| `invalid_token` | `authentication` | 401 | No | "Invalid authentication token." |
| `inactive_account` | `authentication` | 403 | No | "This account is inactive." |
| `session_not_found` | `validation` | 404 | No | "The requested speaking session was not found." |
| `session_not_owned` | `authorization` | 403 | No | "This speaking session belongs to another user." |
| `invalid_part` | `validation` | 400 | No | "Invalid speaking part: {part}. Accepted: part-1, part-2, part-3, part-4." |
| `invalid_turn_sequence` | `validation` | 400 | No | "Expected turn {expected}, received turn {actual}." |
| `audio_missing` | `validation` | 400 | Yes | "No audio file was provided with this turn." |
| `audio_unsupported` | `validation` | 415 | No | "Audio format {mime_type} is not accepted." |
| `audio_too_large` | `validation` | 413 | No | "Audio file exceeds the maximum size of 10 MB." |
| `conversation_not_ready` | `workflow` | 409 | No | "The session cannot accept a turn in its current state ({state})." |
| `completion_not_allowed` | `workflow` | 409 | No | "The session cannot be completed. The closing message has not been delivered." |
| `turn_processing_failed` | `service` | 500 | Yes | "An error occurred while processing your turn." |
| `transcription_failed` | `transcription` | 500 | Yes | "Audio transcription could not be completed." |
| `assessment_unavailable` | `service` | 503 | Yes | "Assessment results are not yet available." |
| `session_already_terminal` | `workflow` | 409 | No | "This session has already been completed." |

### 10.4 Standard Payloads

All errors follow either the auth envelope or the conversation envelope. No error response mixes both formats.

### 10.5 Logging

| Event | Log Level | Content |
|---|---|---|
| Session created | INFO | `session_id`, `user_id`, `part` |
| Turn submitted | INFO | `session_id`, `turn_number`, `transcript_length` |
| Turn rejected | WARNING | `session_id`, `error_code`, `reason` |
| Transcription failure | ERROR | `session_id`, `mime_type`, `exception` |
| Session completed | INFO | `session_id`, `turn_count`, `assessment_id` |
| Assessment failure | ERROR | `session_id`, `exception` |

**No audio bytes, full transcripts, or PII are logged.** Only operational metadata.

### 10.6 Recovery

| Error | Client Action |
|---|---|
| `unauthenticated` | Re-login via `/api/v1/auth/login/` |
| `session_not_found` | Create new session |
| `conversation_not_ready` | Fetch current session state via GET |
| `transcription_failed` | Retry with exponential backoff (1s, 2s, 5s) |
| `turn_processing_failed` | Retry with exponential backoff |
| `assessment_unavailable` | Poll GET assessment endpoint |
| `session_already_terminal` | Fetch assessment if completed, otherwise create new session |

---

## 11. Testing Plan

### 11.1 Serializer Tests (`chat/tests_mobile_speaking_serializers.py`)

| Test ID | Description |
|---|---|
| S1 | `CreateSessionRequestSerializer` accepts valid part values |
| S2 | `CreateSessionRequestSerializer` rejects invalid part values |
| S3 | `CreateSessionRequestSerializer` makes `client_context` optional |
| S4 | `StartSessionRequestSerializer` accepts valid part |
| S5 | `SubmitTurnRequestSerializer` accepts valid turn with metadata |
| S6 | `SubmitTurnRequestSerializer` rejects missing turn |
| S7 | `SubmitTurnRequestSerializer` rejects turn < 1 |
| S8 | `CompleteSessionRequestSerializer` accepts valid payload |
| S9 | `CompleteSessionRequestSerializer` rejects missing last_client_turn |
| S10 | Response serializers produce expected JSON shapes |

### 11.2 Service Tests (`chat/tests_mobile_speaking_services.py`)

| Test ID | Description |
|---|---|
| SV1 | `MobileTranscriptionService` accepts valid audio/webm |
| SV2 | `MobileTranscriptionService` accepts valid audio/m4a |
| SV3 | `MobileTranscriptionService` rejects unsupported MIME type |
| SV4 | `MobileTranscriptionService` rejects empty file |
| SV5 | `MobileTranscriptionService` rejects oversized file |
| SV6 | `Part1QuestionService.get_first_question()` returns valid question |
| SV7 | `Part1QuestionService.get_next_topic()` excludes asked topics |
| SV8 | `Part1QuestionService.get_next_topic()` raises when all topics exhausted |
| SV9 | `MobileSessionStateService` returns "ready" for empty conversation |
| SV10 | `MobileSessionStateService` returns "awaiting_candidate_turn" after examiner turn |
| SV11 | `MobileSessionStateService` returns "completion_ready" after closing message |
| SV12 | `MobileSessionStateService` returns "completed" for terminal conversation |
| SV13 | `MobileSessionStateService` returns "failed" for timed_out/interrupted |
| SV14 | `MobileSpeakingService.process_turn()` produces correct transcript entries |
| SV15 | `MobileSpeakingService.process_turn()` enforces turn sequence |
| SV16 | `MobileSpeakingService.process_turn()` returns closing message after session timeout |
| SV17 | `MobileTTSService.generate_audio()` returns audio URL |
| SV18 | `MobileTTSService.generate_audio()` returns None on failure (text-only) |

### 11.3 View Tests (`chat/tests_mobile_speaking_views.py`)

| Test ID | Description |
|---|---|
| V1 | Create session returns 201 with session_id, part, state, created_at |
| V2 | Create session rejects unauthenticated request (401) |
| V3 | Create session rejects invalid part (400) |
| V4 | Retrieve session returns full session state (200) |
| V5 | Retrieve session rejects unauthenticated (401) |
| V6 | Retrieve session rejects non-owner (403) |
| V7 | Retrieve session returns 404 for unknown ID |
| V8 | Start session transitions to awaiting_candidate_turn |
| V9 | Start session rejects session not in ready state (409) |
| V10 | Start session returns examiner turn with text and audio_url |
| V11 | Submit turn accepts valid audio and returns next examiner turn |
| V12 | Submit turn rejects missing audio (400) |
| V13 | Submit turn rejects wrong turn number (400) |
| V14 | Submit turn appends candidate + examiner entries to transcript |
| V15 | Submit turn returns closing message when session expired |
| V16 | Complete session transitions to completed (200) |
| V17 | Complete session rejects premature completion (409) |
| V18 | Complete session returns assessment artifacts |
| V19 | Retrieve assessment returns assessment for completed session (200) |
| V20 | Retrieve assessment returns 404 for session without assessment |

### 11.4 Authentication Tests (`chat/tests_mobile_speaking_auth.py`)

| Test ID | Description |
|---|---|
| A1 | All 6 endpoints reject missing Bearer token (401) |
| A2 | All 6 endpoints reject invalid Bearer token (401) |
| A3 | All 6 endpoints reject inactive user (403) |
| A4 | Session-scoped endpoints reject non-owner (403) |
| A5 | Create session binds session to authenticated user |

### 11.5 Permission Tests (`chat/tests_mobile_speaking_permissions.py`)

| Test ID | Description |
|---|---|
| P1 | User A cannot retrieve User B's session |
| P2 | User A cannot start User B's session |
| P3 | User A cannot submit turn to User B's session |
| P4 | User A cannot complete User B's session |
| P5 | User A cannot retrieve User B's assessment |

### 11.6 Upload Tests (`chat/tests_mobile_speaking_upload.py`)

| Test ID | Description |
|---|---|
| U1 | Accept audio/webm upload |
| U2 | Accept audio/m4a upload |
| U3 | Accept audio/mp4 upload |
| U4 | Reject audio/wav (unsupported) |
| U5 | Reject empty file |
| U6 | Reject file > 10 MB |
| U7 | Transcription produces expected text (mocked Whisper) |
| U8 | Turn submission without audio returns audio_missing error |

### 11.7 Assessment Tests (`chat/tests_mobile_speaking_assessment.py`)

| Test ID | Description |
|---|---|
| AS1 | Complete session triggers assessment pipeline |
| AS2 | Complete session returns practice_score with criteria |
| AS3 | Complete session returns feedback_report |
| AS4 | Pronunciation criterion shows as unavailable (null band) |
| AS5 | Assessment retrieval returns same report as completion |
| AS6 | Assessment retrieval for uncompleted session returns 404 |

### 11.8 Integration Tests (`chat/tests_mobile_speaking_integration.py`)

| Test ID | Description |
|---|---|
| I1 | Full end-to-end: create → start → 3 turns → complete → assess |
| I2 | Session timeout: start → turn → (time advances past 90s) → turn returns closing → complete |
| I3 | Recovery: create → start → turn → (network failure) → retrieve → turn → complete |
| I4 | Multiple users cannot interfere with each other's sessions |
| I5 | Duplicate completion attempt returns 409 |
| I6 | Create → retrieve → state matches expected lifecycle |

### 11.9 Regression Tests

| Test ID | Description |
|---|---|
| R1 | Web Part 1 (`/chat/`) continues to work after mobile endpoints added |
| R2 | Web Part 1 assessment (`/chat/complete/`) unchanged |
| R3 | Existing mobile auth endpoints unchanged |
| R4 | Existing mobile profile/subscription/dashboard endpoints unchanged |
| R5 | `owner_session_key` web sessions unaffected by `owner_user` migration |

---

## 12. Documentation Updates

After backend implementation, the following documents MUST be updated:

| Document | Update Required |
|---|---|
| `PART1_TRANSPORT_AUTHORITY.md` | Add 6 speaking endpoints to Endpoint Inventory, Request Contracts, Response Contracts, Error Contracts, and Field Dictionary sections |
| `PART1_AUDIO_API_SPECIFICATION.md` | Mark all 6 endpoints as ✅ Implemented; update §1.1 with actual URLs; add actual response examples |
| `BACKEND_AUTHORITY_AUDIT.md` | Add mobile speaking endpoints to the Endpoint Inventory table |
| `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md` | Update Speaking API section status from "Planned" to "Implemented" for conversation transport endpoints |
| `MOBILE_CONVERSATION_API_SPECIFICATION.md` | Add implementation notes; mark any deviations from spec |
| `README.md` (project root) | Add speaking API section |

---

## 13. Dependency Graph

```
                    ┌──────────────────┐
                    │  Migration:       │
                    │  owner_user FK    │
                    │  (SpeakingConv)   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  mobile_helpers  │
                    │  (extract auth)  │
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
    ┌───────▼──────┐ ┌──────▼──────┐ ┌───────▼──────┐
    │  Serializers │ │  Services   │ │  Question    │
    │  (speaking)  │ │  (mobile_)  │ │  Bank        │
    └───────┬──────┘ └──────┬──────┘ │  (extract)   │
            │               │        └───────┬──────┘
            └───────┬───────┘                │
                    │                        │
            ┌───────▼────────────────────────▼──┐
            │  mobile_speaking_views.py         │
            │  (6 view functions)               │
            └───────┬───────────────────────────┘
                    │
            ┌───────▼───────────┐
            │  voicechat/urls.py│
            │  (6 URL patterns) │
            └───────┬───────────┘
                    │
            ┌───────▼───────────┐
            │  Mobile Client    │
            │  (AudioService)   │
            └───────────────────┘
```

---

## 14. Sprint Breakdown

### Task 5.1.1 — Database Migration: Add `owner_user` to `SpeakingConversation`
- **Description:** Add `owner_user = ForeignKey(User, null=True, blank=True, on_delete=SET_NULL, related_name="speaking_sessions")` to `SpeakingConversation` model. Generate and apply migration.
- **Dependencies:** None
- **Estimated Effort:** 1 hour
- **Completion Criteria:**
  - [x] Migration file generated (`chat/migrations/XXXX_add_owner_user.py`)
  - [x] Migration applied without errors
  - [x] Existing `owner_session_key` sessions continue to work (null `owner_user`)
  - [x] New sessions can be created with `owner_user` set

### Task 5.1.2 — Extract Auth Helpers to `mobile_helpers.py`
- **Description:** Extract `_get_bearer_token()`, `_authenticate_token_request()`, `_json_error()`, `_parse_json_body()` from `mobile_auth_views.py` to shared `chat/mobile_helpers.py`. Re-import in `mobile_auth_views.py`.
- **Dependencies:** None
- **Estimated Effort:** 1 hour
- **Completion Criteria:**
  - [x] `chat/mobile_helpers.py` created with all 4 functions
  - [x] `chat/mobile_auth_views.py` imports from `mobile_helpers`
  - [x] All existing mobile auth tests pass (unchanged behavior)

### Task 5.1.3 — Implement Serializers
- **Description:** Create `chat/serializers/__init__.py` and `chat/serializers/speaking_serializers.py` with all request and response serializers defined in §4.
- **Dependencies:** None
- **Estimated Effort:** 3 hours
- **Completion Criteria:**
  - [x] 4 request serializers implemented with validation
  - [x] 6 response serializers implemented
  - [x] 6 shared/common serializers implemented
  - [x] All serializer tests pass (S1–S10)

### Task 5.1.4 — Extract Part 1 Question Bank
- **Description:** Extract `questions["B2_Speaking_Part_1"]` from `chat/views.py` into `chat/services/part1_question_service.py` as a module-level constant. Implement `get_first_question()` and `get_next_topic()`.
- **Dependencies:** None
- **Estimated Effort:** 2 hours
- **Completion Criteria:**
  - [x] Question bank extracted without modification
  - [x] `get_first_question()` returns random topic + question
  - [x] `get_next_topic()` excludes asked topics
  - [x] Service tests pass (SV6–SV8)
  - [x] Web `chat/views.py` imports from question service (backward compatible)

### Task 5.1.5 — Implement `MobileTranscriptionService`
- **Description:** Create `chat/services/mobile_transcription_service.py` with `transcribe()` function. Accepts file object + MIME type, validates, calls Whisper, returns transcript dict.
- **Dependencies:** None
- **Estimated Effort:** 3 hours
- **Completion Criteria:**
  - [x] Accepts `audio/webm`, `audio/mp4`, `audio/m4a`, `audio/aac`
  - [x] Rejects unsupported formats with `TranscriptionError`
  - [x] Validates file size (≤ 10 MB)
  - [x] Returns `{transcript, provider, confidence}`
  - [x] Service tests pass (SV1–SV5)

### Task 5.1.6 — Implement `MobileSessionStateService`
- **Description:** Create `chat/services/mobile_session_state_service.py` with `derive_session_state()` function. Maps `SpeakingConversation.status` + transcript analysis to mobile session state strings.
- **Dependencies:** Task 5.1.1 (migration)
- **Estimated Effort:** 2 hours
- **Completion Criteria:**
  - [x] Returns correct state for each conversation lifecycle stage
  - [x] Correctly identifies `completion_ready` when closing message is last entry
  - [x] Service tests pass (SV9–SV13)

### Task 5.1.7 — Implement `MobileTTSService`
- **Description:** Create `chat/services/mobile_tts_service.py` with `generate_audio()` function. Generates TTS audio, stores to media directory, returns URL. Falls back to None on failure.
- **Dependencies:** None (can use existing gTTS pattern)
- **Estimated Effort:** 2 hours
- **Completion Criteria:**
  - [x] Generates MP3 for given text
  - [x] Caches by text hash (prevents duplicate generation)
  - [x] Returns URL path accessible via `MEDIA_URL`
  - [x] Returns None gracefully on TTS failure
  - [x] Service tests pass (SV17–SV18)

### Task 5.1.8 — Implement `MobileSpeakingService`
- **Description:** Create `chat/services/mobile_speaking_service.py` with `process_turn()` function. Orchestrates the full turn pipeline: validate state, transcribe, append transcript, determine next examiner action, generate TTS.
- **Dependencies:** Tasks 5.1.4, 5.1.5, 5.1.6, 5.1.7, existing `transcript_builder`, `part1_session_controller`, `followup_service`
- **Estimated Effort:** 6 hours
- **Completion Criteria:**
  - [x] Validates session state before processing
  - [x] Delegates to `MobileTranscriptionService` for audio
  - [x] Appends candidate turn to transcript with source_metadata
  - [x] Determines next examiner action (follow-up / new topic / closing)
  - [x] Appends examiner turn to transcript
  - [x] Generates TTS audio URL for examiner turn
  - [x] Returns `MobileTurnResult` with all response data
  - [x] Service tests pass (SV14–SV16)

### Task 5.1.9 — Implement View Functions
- **Description:** Create `chat/mobile_speaking_views.py` with 6 view functions. Each follows the pattern: auth → parse → validate → authorize → execute → serialize → respond.
- **Dependencies:** Tasks 5.1.2 (helpers), 5.1.3 (serializers), 5.1.8 (service)
- **Estimated Effort:** 6 hours
- **Completion Criteria:**
  - [x] `mobile_create_speaking_session` — creates session, returns 200 with session data
  - [x] `mobile_retrieve_speaking_session` — returns full session state
  - [x] `mobile_start_speaking_session` — starts conversation, returns examiner turn
  - [x] `mobile_submit_speaking_turn` — processes audio turn, returns next action
  - [x] `mobile_complete_speaking_session` — finalizes, returns assessment
  - [x] `mobile_retrieve_assessment` — returns latest assessment
  - [x] All view tests pass (V1–V20)

### Task 5.1.10 — Configure URL Routes
- **Description:** Add 6 URL patterns to `voicechat/urls.py`:
  ```python
  path("api/v1/speaking/sessions/", mobile_speaking_views.mobile_create_speaking_session, name="mobile_create_session"),
  path("api/v1/speaking/sessions/<uuid:session_id>/", mobile_speaking_views.mobile_retrieve_speaking_session, name="mobile_retrieve_session"),
  path("api/v1/speaking/sessions/<uuid:session_id>/start/", mobile_speaking_views.mobile_start_speaking_session, name="mobile_start_session"),
  path("api/v1/speaking/sessions/<uuid:session_id>/turns/", mobile_speaking_views.mobile_submit_speaking_turn, name="mobile_submit_turn"),
  path("api/v1/speaking/sessions/<uuid:session_id>/complete/", mobile_speaking_views.mobile_complete_speaking_session, name="mobile_complete_session"),
  path("api/v1/speaking/sessions/<uuid:session_id>/assessment/", mobile_speaking_views.mobile_retrieve_assessment, name="mobile_retrieve_assessment"),
  ```
- **Dependencies:** Task 5.1.9 (views)
- **Estimated Effort:** 30 minutes
- **Completion Criteria:**
  - [x] All 6 routes resolve correctly
  - [x] `python manage.py show_urls` lists all 6 endpoints
  - [x] No route conflicts with existing URLs

### Task 5.1.11 — Configure Django Settings
- **Description:** Update `settings.py`:
  - Increase `FILE_UPLOAD_MAX_MEMORY_SIZE` to 10 MB (for audio uploads)
  - Ensure `MEDIA_URL` and `MEDIA_ROOT` are configured (for TTS audio files)
  - Ensure `rest_framework` and `rest_framework.authtoken` are in `INSTALLED_APPS`
- **Dependencies:** None
- **Estimated Effort:** 30 minutes
- **Completion Criteria:**
  - [x] 10 MB audio uploads succeed
  - [x] TTS audio files accessible via MEDIA_URL
  - [x] Existing functionality unaffected

### Task 5.1.12 — Integration Tests
- **Description:** Write and run all integration tests from §11.8. Verify end-to-end flow works.
- **Dependencies:** All previous tasks
- **Estimated Effort:** 4 hours
- **Completion Criteria:**
  - [x] Full end-to-end test passes (I1)
  - [x] Timeout test passes (I2)
  - [x] Recovery test passes (I3)
  - [x] Multi-user isolation test passes (I4)
  - [x] Duplicate completion test passes (I5)
  - [x] All integration tests pass (I1–I6)

### Task 5.1.13 — Regression Tests
- **Description:** Run all existing test suites to verify no regressions.
- **Dependencies:** All previous tasks
- **Estimated Effort:** 1 hour
- **Completion Criteria:**
  - [x] `chat/tests_part1_session_controller.py` passes
  - [x] `chat/tests_transcript_builder.py` passes
  - [x] `chat/tests_chat_pilot.py` passes
  - [x] `chat/tests_mobile_auth.py` passes
  - [x] All existing tests pass

### 14.1 Task Summary

| Task | ID | Effort | Depends On |
|---|---|---|---|
| Migration: owner_user FK | 5.1.1 | 1h | — |
| Extract auth helpers | 5.1.2 | 1h | — |
| Implement serializers | 5.1.3 | 3h | — |
| Extract question bank | 5.1.4 | 2h | — |
| MobileTranscriptionService | 5.1.5 | 3h | — |
| MobileSessionStateService | 5.1.6 | 2h | 5.1.1 |
| MobileTTSService | 5.1.7 | 2h | — |
| MobileSpeakingService | 5.1.8 | 6h | 5.1.4–5.1.7 |
| View functions | 5.1.9 | 6h | 5.1.2, 5.1.3, 5.1.8 |
| URL routes | 5.1.10 | 0.5h | 5.1.9 |
| Django settings | 5.1.11 | 0.5h | — |
| Integration tests | 5.1.12 | 4h | All |
| Regression tests | 5.1.13 | 1h | All |
| **Total** | | **32 hours** | |

### 14.2 Parallel Execution Opportunities

Tasks that can run in parallel:
- **Wave 1 (parallel):** 5.1.1, 5.1.2, 5.1.3, 5.1.4, 5.1.5, 5.1.7, 5.1.11
- **Wave 2 (after Wave 1):** 5.1.6 (needs 5.1.1), 5.1.8 (needs 5.1.4–5.1.7)
- **Wave 3 (after Wave 2):** 5.1.9 (needs 5.1.2, 5.1.3, 5.1.8)
- **Wave 4 (after Wave 3):** 5.1.10 (needs 5.1.9), 5.1.12 (needs all), 5.1.13 (needs all)

**With parallel execution:** ~20 hours total elapsed time (2.5 days for one developer).

---

## 15. Risk Assessment

### 15.1 Critical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Web Part 1 regression** — mobile changes break existing `/chat/` flow | Low | 🔴 Critical | Existing test suite must pass before merge; no changes to `chat_view` or `chat_contracts.py` |
| **Migration failure** — `owner_user` FK migration fails on production data | Low | 🔴 Critical | Nullable FK; no data migration needed; test against production data snapshot |
| **Whisper latency** — Turn submission takes too long due to transcription + AI follow-up | Medium | 🟡 High | Set 30s timeout on mobile; consider async turn processing (future sprint) |
| **Token auth break** — Extracting helpers changes auth behavior | Low | 🔴 Critical | Extraction must be pure refactor with zero behavioral change; existing auth tests must pass |

### 15.2 Integration Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Mobile format mismatch** — AAC/M4A not accepted by backend | Low | 🔴 High | `MobileTranscriptionService` explicitly accepts AAC/M4A/MP4; tested in SV2–SV3 |
| **TTS latency** — gTTS blocks request | Medium | 🟡 Medium | TTS failure returns `None` (text-only); cached by hash; future async option |
| **Assessment timeout** — Synchronous assessment blocks completion request | Low | 🟡 Low | Assessment already runs synchronously in web flow; mobile timeout matches web |

### 15.3 Performance Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Large audio files** — 10 MB uploads strain memory | Low | 🟡 Medium | Django temp upload handler spills to disk; 10 MB cap prevents abuse |
| **AI rate limiting** — OpenAI rate limits on Whisper + Chat Completions | Medium | 🟡 Medium | Follow-up service already handles failures with fallback; transcription failures return 500 with retry guidance |
| **Concurrent sessions** — Many users simultaneously | Low | 🟢 Low | Per-user conversation limit enforced (one active session per user per part) |

### 15.4 Security Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Unauthenticated turn submission** — Missing auth check | Low | 🔴 Critical | `_authenticate_token_request()` on all 6 endpoints; tested in A1–A5 |
| **Cross-user session access** — User A accesses User B's session | Low | 🔴 Critical | `_get_owned_session()` on 5 session-scoped endpoints; tested in P1–P5 |
| **Audio file abuse** — Malicious file upload | Low | 🟡 Medium | MIME type whitelist; size limit; Whisper processes audio only; no persistent storage |
| **Token leakage in logs** — Bearer tokens logged accidentally | Low | 🟡 Medium | No token logging in application code; operational logging excludes Authorization header |

### 15.5 Migration Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Missing migration dependency** — Migration depends on another app's migration | Low | 🟡 Medium | `owner_user` FK to `settings.AUTH_USER_MODEL` is standard; Django resolves dependency automatically |
| **Rollback difficulty** — Cannot revert `owner_user` migration | Low | 🟢 Low | Nullable FK can be set to null for all rows and column dropped; standard rollback |
| **Web session key drift** — `owner_session_key` behavior changes | None | 🟢 None | `owner_session_key` is preserved unchanged; `owner_user` is additive only |

---

## 16. Final Readiness Assessment

### 16.1 Backend Completion

| Area | Completion % | Notes |
|---|---|---|
| Models | 90% | `owner_user` FK migration needed (5.1.1) |
| Services | 65% | Core services exist; mobile-specific services needed (5.1.4–5.1.8) |
| Serializers | 0% | All must be built (5.1.3) |
| Views | 0% | All 6 views must be built (5.1.9) |
| URLs | 0% | All 6 routes must be added (5.1.10) |
| Auth/Helpers | 80% | Auth functions exist; need extraction (5.1.2) |
| Audio upload | 20% | Chatbot only; needs MobileTranscriptionService (5.1.5) |
| Assessment delivery | 30% | Pipeline exists; needs mobile adapter in views |
| **Overall** | **35%** | See PART1_AUDIO_API_SPECIFICATION.md §18 |

### 16.2 Remaining Work

| Phase | Tasks | Effort |
|---|---|---|
| **Phase D1.5-B** (this plan) | Tasks 5.1.1 – 5.1.13 | 32 hours (~4 working days) |
| **Phase D2** (mobile) | Zustand Interview Store | Can start in parallel after Task 5.1.3 |
| **Phase D3** (mobile) | Audio Recording Service | Can start in parallel after Task 5.1.5 |
| **Phase D5–D7** (mobile) | UI screens | Can start in parallel after Phase D2 |

### 16.3 Estimated Implementation Time

| Scenario | Time |
|---|---|
| **One developer, sequential** | 4 working days (32 hours) |
| **One developer, parallel waves** | 2.5 working days (20 hours) |
| **Two developers, parallel waves** | 2 working days |

### 16.4 Production Readiness

| Criterion | Status | Notes |
|---|---|---|
| All 6 endpoints respond correctly | ❌ Not built | After Task 5.1.9 |
| Authentication on all endpoints | ❌ Not built | After Task 5.1.2 + 5.1.9 |
| Session ownership enforced | ❌ Not built | After Task 5.1.1 + 5.1.9 |
| Audio upload with validation | ❌ Not built | After Task 5.1.5 + 5.1.11 |
| Idempotent turn submission | ⚠️ Deferred | Sprint 5.2 (adds `X-Upload-Id` dedup) |
| Rate limiting | ⚠️ Deferred | Sprint 5.2 (adds per-user limits) |
| Assessment integration | ⚠️ Partial | Synchronous only; async deferred to Sprint 5.2 |
| Monitoring and alerting | ❌ Not built | Sprint 5.3 (operational readiness) |
| API documentation (OpenAPI) | ❌ Not built | Sprint 5.3 (DRF schema generation) |

### 16.5 Critical Blockers

| Blocker | Status | Resolution |
|---|---|---|
| **No mobile speaking endpoints** | ❌ | This sprint resolves it |
| **Audio format mismatch** | ❌ | Task 5.1.5 resolves it (accepts AAC/M4A) |
| **User-based session ownership** | ❌ | Task 5.1.1 resolves it (owner_user FK) |
| **No question delivery mechanism** | ❌ | Task 5.1.4 resolves it (Part1QuestionService) |
| **No TTS audio URL delivery** | ❌ | Task 5.1.7 resolves it (MobileTTSService) |

### 16.6 Technical Debt

| Debt | Addressed In |
|---|---|
| Manual dict builders vs DRF serializers | Task 5.1.3 — DRF serializers for new endpoints |
| Inline question bank in views.py | Task 5.1.4 — extracted to service |
| gTTS synchronous blocking | Task 5.1.7 — cached + fallback |
| WebM-only Whisper | Task 5.1.5 — multi-format support |
| No idempotency for turns | Sprint 5.2 (deferred) |
| Auth helpers duplicated across files | Task 5.1.2 — extracted to shared module |
| `owner_session_key` only (no user FK) | Task 5.1.1 — additive owner_user FK |

---

## 17. Final Verdict

### ✅ Backend implementation may begin immediately using the existing architecture.

**Rationale:**

1. **All core models exist and are production-proven.** `SpeakingConversation`, `TranscriptEntry`, and `AssessmentReportRecord` are well-designed, immutable where required, and require only one additive migration (`owner_user` FK).

2. **All core services exist.** `transcript_builder`, `part1_session_controller`, `part1_assessment_integration`, `followup_service`, `assessment_engine`, and `assessment_repository` provide the complete business logic layer. New mobile-specific services are thin adapters, not rewrites.

3. **Authentication is solved.** The Bearer token pattern from `mobile_auth_views.py` is proven in production and directly reusable. Only extraction to a shared module is needed.

4. **The mobile contract is frozen.** `MOBILE_CONVERSATION_API_SPECIFICATION.md` defines exact request/response shapes, state machines, and error codes. No architectural decisions remain.

5. **The assessment engine is ready.** `assess_conversation()` → `AssessmentReport` → `repository.save()` → `generate_feedback()` is a complete pipeline. Only a mobile-shaped delivery adapter is needed.

6. **No external dependencies are missing.** OpenAI Whisper for transcription, OpenAI Chat Completions for follow-up generation, and gTTS for examiner audio are all already integrated.

7. **The implementation is additive.** Zero existing code is modified (except the additive `owner_user` migration and auth helper extraction). Web Part 1 continues to work unchanged. Regression risk is minimal.

8. **All effort estimates are small-to-medium.** The largest tasks (services and views) are 6 hours each. Total effort is 32 hours. The plan is executable within one sprint.

**The 13 tasks defined in this plan, executed in order, will deliver a production-ready mobile speaking API for Cambridge B2 Speaking Part 1.**

---

*Implementation plan completed: 2026-08-09*  
*Planner: Backend Authority Verification (Read-Only)*  
*Next Phase: Begin Task 5.1.1 (Database Migration) or Phase D2 (Zustand Interview Store — parallel mobile work)*
