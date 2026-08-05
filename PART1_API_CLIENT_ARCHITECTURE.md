# Part 1 API Client & Repository Architecture Specification

## 1. Executive Summary

The API client and repository architecture defines the boundary between the OpenVoz Django backend transport contract and the mobile application's UI domain. This architecture ensures that network operations, authentication state management, data transformation (mapping), and caching are handled in a structured, maintainable, and secure manner.

By enforcing strict separation of concerns between raw HTTP transport, Data Transfer Objects (DTOs), domain models, and React Query hooks, the mobile client remains resilient to backend changes and independent of network implementation details.

---

## 2. Overall Data Flow

The complete data flow pipeline from the backend server to the mobile UI component is structured as follows:

```text
Backend Django API
      ↓ (HTTP JSON / Snake_Case)
HTTP Client (fetch / Axios wrapper)
      ↓ (Network Response / DTO)
Authentication Layer (Bearer Token Injection / 401 Interception)
      ↓ (Transport DTOs)
Transport Mappers (snake_case ➔ camelCase, null safety, type casting)
      ↓ (Typed Domain Models)
Repository Layer (Data Access Abstraction)
      ↓ (Domain Entities)
React Query Hooks (caching, deduplication, background sync)
      ↓ (Optimized State)
UI Components / Screens (Render)
```

---

## 3. Folder Architecture

The recommended directory structure under `Projects/OpenVoz_Mobile/Mobile/` maintains clear domain boundaries:

```text
services/
├── api/                  # Low-level HTTP request wrappers and endpoint clients
├── repositories/         # Data access repositories abstracting API calls
├── mappers/              # Pure transformation functions (DTO ↔ Domain)
└── auth/                 # Authentication session management and token storage
types/
├── dto/                  # Transport-level TypeScript interfaces (snake_case)
└── domain/               # Domain-level TypeScript interfaces (camelCase)
hooks/                    # React Query hooks consuming repositories
```

### Folder Responsibilities:
- **`services/api/`**: Executes raw HTTP requests, attaches authorization headers, handles timeouts, and parses JSON responses into DTOs.
- **`services/repositories/`**: Exposes high-level data methods (`getProfile()`, `getSubscription()`, `getDashboard()`, `login()`) returning domain models.
- **`services/mappers/`**: Contains pure, stateless functions converting backend DTOs into domain models (and vice versa).
- **`services/auth/`**: Manages secure token persistence (`expo-secure-store`) and session validation.
- **`types/dto/`**: Mirrors the exact JSON shapes defined in `PART1_TRANSPORT_AUTHORITY.md`.
- **`types/domain/`**: Houses the clean domain models defined in `PART1_TYPESCRIPT_DOMAIN_MODELS.md`.

---

## 4. HTTP Client Responsibilities

The HTTP client wrapper manages communication with the Django backend:
- **Base URL:** Dynamically resolved per environment (Development, Staging, Production) via environment configuration.
- **Headers:** Automatically injects standard headers (`Content-Type: application/json`, `Accept: application/json`).
- **Authorization:** Injects `Authorization: Bearer <token>` for protected routes from secure storage.
- **Timeouts:** Configures strict request timeouts (e.g., 15–30 seconds) to prevent hanging requests.
- **Request Lifecycle:** Intercepts outgoing requests for logging and header enrichment.
- **Response Lifecycle:** Intercepts incoming responses to validate HTTP status codes, parse JSON, and handle global error events (e.g., triggering token invalidation on 401).

---

## 5. Authentication Strategy

- **Token Storage:** Authentication tokens are stored exclusively in secure device storage (`expo-secure-store`) using platform encryption. Session cookies are neither stored nor used.
- **Token Injection:** The API client retrieves the token from secure storage on every authenticated request and attaches it as a Bearer token.
- **Login Flow:** Submits user credentials to `POST /api/v1/auth/login/`, extracts the token and user payload, securely persists the token, and updates global authentication state.
- **Logout Flow:** Invokes `POST /api/v1/auth/logout/`, purges the token from secure storage, and resets client authentication state.
- **Token Validation:** On app startup, verifies local token validity via `GET /api/v1/auth/validate/`.
- **Unauthorized Handling (401):** Intercepts 401 Unauthorized responses, clears local credentials, and redirects the user to the login screen.

---

## 6. DTO Mapping Strategy

To isolate transport serialization details from application logic, mappers enforce strict transformation rules:
- **Case Conversion:** Translates snake_case transport fields (e.g., `display_name`) into camelCase domain properties (`displayName`).
- **Null Safety & Defaults:** Explicitly handles nullable fields (`null` to `null` or appropriate fallback defaults).
- **Enum / Type Casting:** Converts raw string statuses (e.g., `"active"`, `"entitlement"`) into strongly typed union types or enums.
- **Validation:** Validates that required DTO fields are present before constructing domain models, throwing structured mapping errors if contract drift occurs.

---

## 7. Repository Responsibilities

### Repositories SHOULD:
- Coordinate API client calls and DTO mappers.
- Expose clean, strongly typed asynchronous methods returning domain models.
- Abstract away HTTP transport details, headers, and endpoint URLs from consumers.

### Repositories SHOULD NOT:
- Manage local UI component state or navigation.
- Contain React hooks, Zustand store references, or JSX.
- Perform direct rendering or UI error alerts.

---

## 8. React Query Integration

- **Query Ownership:** React Query hooks manage server state caching, background refetching, and pagination.
- **Cache Boundaries:** Query keys are structured hierarchically (e.g., `['user', 'profile']`, `['user', 'subscription']`, `['dashboard', 'summary']`).
- **Invalidation Strategy:** Mutations (such as login, logout, or subscription updates) explicitly invalidate related query keys to ensure immediate UI synchronization.
- **Retry Policy:** Configures idempotent read queries with controlled exponential backoff; disables automatic retries for client errors (`4xx`).
- **Stale Time:** Defines appropriate cache stale times (e.g., 5 minutes for user profiles, 1 minute for subscriptions) to balance freshness and performance.

---

## 9. Error Handling Strategy

Errors are categorized and normalized into application-level error types:
- **Transport Errors:** Network disconnects or timeouts (handled via offline detection / retry prompts).
- **Authentication Failures (401/403):** Session expiry or inactive accounts (triggers session purge and forced re-authentication).
- **Validation Errors (400):** Form or request payload rejections (surfaced as user-friendly field or banner feedback).
- **Server Errors (5xx):** Backend outages or unhandled exceptions (surfaced as graceful fallback error states).
- **Offline Behavior:** Gracefully surfaces cached data where available while indicating offline status to the user.

---

## 10. Logging Strategy

- **Development Logging:** Verbose logging of request URLs, payloads, response times, and mapping outcomes.
- **Production Logging:** Strips payload bodies and logs only status codes, request durations, and error category codes.
- **Sensitive Data Rules:** Credentials, passwords, authorization tokens, and personally identifiable information (PII) must **never** be logged.
- **Token Masking:** Any debug log referencing authorization headers must mask tokens (e.g., `Bearer abcd...****`).

---

## 11. Testing Strategy

- **HTTP Layer:** Mock network responses using tools like MSW (Mock Service Worker) to test client behavior across 200, 400, 401, and 500 status codes.
- **DTO Mappers:** Unit test mapping functions with fixture JSON payloads to guarantee robust handling of snake_case conversion and missing/nullable fields.
- **Repositories:** Test repository methods against mocked API clients to verify correct data flow and domain model return types.
- **Authentication:** Test token injection, secure storage interaction, and 401 interceptor logout triggers.

---

## 12. Security Considerations

- **SecureStore Usage:** Tokens reside solely within encrypted secure storage containers.
- **Token Protection:** Tokens are never stored in AsyncStorage, local storage, or Redux/Zustand persistent state.
- **HTTPS Assumptions:** All production API communication requires secure TLS (HTTPS).
- **Sensitive Payloads:** Password fields and authentication credentials are transmitted over encrypted request bodies only and scrubbed from logs.
- **Immutable Domain Objects:** Domain models are defined using `readonly` modifiers to prevent accidental mutation.

---

## 13. Implementation Readiness Checklist

- [x] Backend transport contract frozen (`PART1_TRANSPORT_AUTHORITY.md`).
- [x] Domain models specified (`PART1_TYPESCRIPT_DOMAIN_MODELS.md`).
- [x] API client boundaries and interceptors defined.
- [x] Authentication token lifecycle and 401 handling documented.
- [x] DTO-to-Domain mapping strategy established.
- [x] Repository responsibilities and React Query caching rules defined.
- [x] Error handling, logging, and security policies confirmed.
