# Backend Authority Audit Report

## 1. Executive Summary

This read-only audit evaluates the Django backend authority for the mobile application in the OpenVoz ecosystem. Specifically, it examines whether the backend provides a stable, authoritative transport and data contract for features such as mobile authentication, subscription status, user profile, dashboard summaries, and structured learning/quiz capabilities (including C1 Advanced Reading Part 1 (`iquiz`) and speaking workflows (`chat`)).

The audit confirms that the backend utilizes **Django REST Framework Token Authentication** (`rest_framework.authtoken`) for mobile clients, structured JSON API endpoints under `/api/v1/auth/` and `/api/mobile/`, server-owned session and transcript logic, and entitlement-based billing (`billing`). However, there is a notable architectural divergence between the web application's legacy Django view/HTML patterns and the mobile app's dedicated JSON contracts (e.g., `chat` endpoints vs. `iquiz` and `mobile_auth_views`), and Django REST Framework serializers are largely absent in favor of custom dictionary and JSON serialization (`JsonResponse`).

**Final Authority Status:** ⚠ **Needs documentation** (with specific endpoint and serializer standardization recommendations required before mobile UI expansion).

---

## 2. Authority Chain

```text
Models (User, Token, MembershipPlan, UserEntitlement, Quiz, Question, SpeakingConversation)
↓
Business Logic / Services (get_subscription_status_for_user, transcript_builder, part1_session_controller, assessment_pipeline)
↓
Serializers (Missing / Custom JSON dict builders in views)
↓
Views / ViewSets (mobile_auth_views, iquiz.views, chat.views, billing.views)
↓
URLs / Endpoints (/api/v1/auth/*, /api/mobile/*, /iquiz/*, /chat/*)
↓
Authentication (Token authentication via Authorization: Bearer <key>, session/cookie fallback for web)
↓
Permissions (AllowAny, @login_required, IsAuthenticated, staff_required, PremiumAccessMiddleware)
```

---

## 3. Models

### Authoritative Models Involved

1. **`django.contrib.auth.models.User`** (`django.contrib.auth`)
   - **Purpose:** Core user identity and authentication base.
   - **Important Fields:** `username`, `email`, `first_name`, `last_name`, `is_staff`, `is_active`.
   - **Relationships:** One-to-One with `rest_framework.authtoken.models.Token`, `MemberProfile`; Foreign Key with `UserEntitlement`, `Attempt`, `DlocalGoCheckout`, `DlocalGoIntent`.
   - **Authoritative:** Yes (Django system authority).

2. **`rest_framework.authtoken.models.Token`** (`rest_framework.authtoken`)
   - **Purpose:** Mobile bearer token persistence.
   - **Important Fields:** `key` (primary key/token string), `user` (ForeignKey).
   - **Relationships:** One-to-One / Many-to-One with `User`.
   - **Authoritative:** Yes (Mobile auth authority).

3. **`UserEntitlement`** (`billing.models`)
   - **Purpose:** Primary subscription access authority.
   - **Important Fields:** `user`, `entitlement`, `valid_from`, `valid_until`, `active`, `provider`, `provider_ref`.
   - **Relationships:** FK to `User`, FK to `Entitlement`.
   - **Authoritative:** Yes (Source of truth for premium subscriptions).

4. **`MembershipSubscription`** (`members.models`)
   - **Purpose:** Legacy membership subscription tracking.
   - **Important Fields:** `member`, `plan`, `start_date`, `end_date`, `is_active`, `payment_id`, `payment_method`.
   - **Relationships:** FK to `MemberProfile`, FK to `MembershipPlan`.
   - **Authoritative:** Yes (Fallback source for legacy subscriptions).

5. **`Quiz` & `Question` / `QuestionAnswer` / `QuizQuestion` / `Attempt`** (`iquiz.models`)
   - **Purpose:** Structured quiz and C1 Reading Part 1 assessment engine.
   - **Important Fields:** `title`, `quiz_category`, `is_active`, `question_type`, `is_correct`, `score_percent`.
   - **Relationships:** `Quiz` through `QuizQuestion` to `Question`, `Question` has `QuestionAnswer`s, `Attempt` tracks user quiz performance.
   - **Authoritative:** Yes (Authoritative structure for digital quiz/reading tasks).

6. **`SpeakingConversation` & `TranscriptEntry`** (`chat.models`)
   - **Purpose:** Server-owned identity and append-only lifecycle/transcript for speaking tasks (Parts 1–4).
   - **Important Fields:** `id` (UUID), `speaking_part`, `status`, `sequence`, `speaker`, `content`, `event_type`.
   - **Relationships:** `SpeakingConversation` has many `TranscriptEntry` records.
   - **Authoritative:** Yes (Server-authoritative conversation state).

---

## 4. Business Logic

### Services & Helpers

1. **`billing.subscription_status.get_subscription_status_for_user(user)`** (`billing/subscription_status.py`)
   - **Responsibilities:** Centralized resolver checking active `UserEntitlement` first, then falling back to legacy `MembershipSubscription`. Returns uniform dictionary with subscription state, plan name/code, provider, and validity.
   - **Centralized:** Yes.

2. **`chat.services.transcript_builder` & `part1_session_controller`** (`chat/services/`)
   - **Responsibilities:** Manages speaking conversation state, sequence generation, immutable append validation, session timing, and completion gating.
   - **Centralized:** Yes for speaking conversation lifecycle.

3. **`chat.services.part1_assessment_integration` & `assessment_engine`** (`chat/services/`)
   - **Responsibilities:** Executes evaluation pipelines and generates feedback reports for completed conversations.
   - **Centralized:** Yes.

### Duplicated Logic / Observations

- Subscription and user profile serialization logic exists in `chat/mobile_auth_views.py` as standalone helper functions (`_build_profile_payload`, `_build_subscription_payload`, `_build_dashboard_payload`) rather than reusable REST Framework serializers.

---

## 5. Serializers

- **Status:** **Explicit Django REST Framework serializers are missing** for mobile endpoints (`chat/mobile_auth_views.py`).
- **Exposed Fields & Construction:** Instead of DRF serializers, the backend constructs JSON responses directly via Python dictionaries (`_build_user_payload`, `_build_profile_payload`, `_build_subscription_payload`, `_build_dashboard_payload`).
- **Validation Rules:** JSON body parsing is handled manually (`json.loads`) with basic type and presence checks.

---

## 6. Views / API Endpoints

| URL Path                             | HTTP Method | View / Function                              | Authentication         | Permissions                     | Serializer / Response Builder               | Service / Logic Used                             | Status Codes       |
| ------------------------------------ | ----------- | -------------------------------------------- | ---------------------- | ------------------------------- | ------------------------------------------- | ------------------------------------------------ | ------------------ |
| `/api/v1/auth/login/`                | POST        | `chat.mobile_auth_views.mobile_login`        | None (Public)          | `@csrf_exempt`, `@require_POST` | Manual dict (`_build_auth_payload`)         | `authenticate()`, `Token.objects.get_or_create`  | 200, 400, 401, 403 |
| `/api/v1/auth/logout/`               | POST        | `chat.mobile_auth_views.mobile_logout`       | Token (Bearer)         | `@csrf_exempt`, `@require_POST` | Manual dict                                 | Token deletion, `logout()`                       | 200, 401           |
| `/api/v1/auth/validate/`             | GET         | `chat.mobile_auth_views.mobile_validate`     | Token (Bearer)         | `@require_GET`                  | Manual dict (`_build_auth_payload`)         | Token lookup                                     | 200, 401, 403      |
| `/api/mobile/profile/`               | GET         | `chat.mobile_auth_views.mobile_profile`      | Token (Bearer)         | `@require_GET`                  | Manual dict (`_build_profile_payload`)      | User model fields                                | 200, 401, 403      |
| `/api/mobile/subscription/`          | GET         | `chat.mobile_auth_views.mobile_subscription` | Token (Bearer)         | `@require_GET`                  | Manual dict (`_build_subscription_payload`) | `get_subscription_status_for_user()`             | 200, 401, 403      |
| `/api/mobile/dashboard/`             | GET         | `chat.mobile_auth_views.mobile_dashboard`    | Token (Bearer)         | `@require_GET`                  | Manual dict (`_build_dashboard_payload`)    | Profile + Subscription + placeholder stats       | 200, 401, 403      |
| `/iquiz/quizzes/<id>/play/c1-part1/` | GET, POST   | `iquiz.views.quiz_play_c1_part1`             | Session / Cookie (Web) | Standard Django template view   | HTML Template (`iquiz/quiz_c1_part1.html`)  | `_validate_c1_part1_structure`, Attempt creation | 200, 302           |

---

## 7. Authentication

- **Authentication Classes:** Dual-mode architecture:
  1. **Web / Session Auth:** Standard Django session cookies (`django.contrib.sessions.middleware.SessionMiddleware`, `AuthenticationMiddleware`).
  2. **Mobile Token Auth:** Django REST Framework Token model (`rest_framework.authtoken`) with custom Bearer token header parsing in `_authenticate_token_request()` (`Authorization: Bearer <token>`).
- **Mobile Login Flow:**
  1. Client sends `POST /api/v1/auth/login/` with `username` and `password`.
  2. Backend authenticates via `authenticate()`, rotates/generates a DRF `Token`, and returns `{ authenticated: true, token: "...", user: {...} }`.
  3. Client stores the token securely (`expo-secure-store`).
  4. Subsequent requests attach `Authorization: Bearer <token>`.
- **Token Validation Flow:**
  - `GET /api/v1/auth/validate/` verifies the Bearer token against `Token.objects.select_related("user")` and confirms `user.is_active`.
- **Production Readiness:** ✅ Production ready for mobile authentication and subscription retrieval.

---

## 8. Permissions

- **Public Endpoints:** `/api/v1/auth/login/`, static assets, login/register pages.
- **Authenticated Endpoints:** `/api/v1/auth/logout/`, `/api/v1/auth/validate/`, `/api/mobile/profile/`, `/api/mobile/subscription/`, `/api/mobile/dashboard/` (require valid Bearer token).
- **Staff/Admin Restrictions:** `@staff_required` decorator on staff management endpoints (e.g., `iquiz` creation/editing views).
- **Premium Restrictions:** Enforced by `PremiumAccessMiddleware` on `/premium/` paths (checking `get_subscription_status_for_user`).
- **Inconsistencies:** Mobile JSON endpoints use manual function-level token decorators (`_authenticate_token_request`) rather than Django REST Framework's built-in `permission_classes` and `authentication_classes`.

---

## 9. Risks

1. **Manual JSON Serialization:** Absence of DRF serializers increases the risk of payload drift between mobile client type definitions and backend dictionary responses.
2. **Hybrid Authentication Architecture:** Mobile endpoints use custom function-level Bearer token checks (`chat/mobile_auth_views.py`), while DRF is installed primarily for token models (`rest_framework.authtoken`), bypassing DRF's standard permission and parser infrastructure.
3. **Placeholder Dashboard Metrics:** `/api/mobile/dashboard/` returns hardcoded static values for learning stats (`questions_answered: 0`, etc.) rather than aggregated database queries.
4. **Scattered Endpoint Patterns:** Web views rely on traditional Django HTML rendering and session cookies, while mobile routes rely on custom JSON views, requiring parallel maintenance of contract definitions.

---

## 10. Recommendations

1. **Introduce DRF Serializers:** Refactor mobile JSON responses in `chat/mobile_auth_views.py` into dedicated Django REST Framework `Serializer` classes to formalize the transport contract.
2. **Standardize DRF Authentication & Permissions:** Migrate mobile API views to use standard DRF `APIView` / `ModelViewSet` with `TokenAuthentication` and `IsAuthenticated` permission classes instead of manual header splitting and dictionary error responses.
3. **Implement Authoritative Dashboard Metrics:** Replace placeholder zeros in `_build_dashboard_payload` with real aggregated queries from `Attempt` and learning history models.
4. **Freeze JSON Transport Contract:** Document and lock response schemas for profile, subscription, and dashboard payloads in `OPENVOZ_MOBILE_API_SPECIFICATION.md`.

---

## 11. Final Authority Status

**Status:** ⚠ **Needs documentation** (Authoritative business logic and mobile auth contracts exist and are tested, but explicit DRF serializers and standardized DRF view permissions are missing).
