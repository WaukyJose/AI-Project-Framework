# OpenVoz Mobile Architecture

## 1. Purpose

This document defines the current high-level architecture of OpenVoz Mobile as
implemented through the Sprint 5 baseline.

Its purpose is to give contributors one concise entry point for understanding:

- what the mobile app is;
- how it is structured;
- how it authenticates and communicates with Django;
- which responsibilities belong to the device and which remain backend-owned.

This document is an architecture overview. It summarizes the current mobile
system and points to deeper authority documents instead of duplicating them.

Authoritative companion documents:

- `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`
- `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_UX_MASTER_PLAN.md`
- `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md`

## 2. System Architecture

OpenVoz Mobile is a thin Expo/React Native client over the existing OpenVoz
Django backend.

Current system relationship:

```text
OpenVoz Mobile
      ↓
  REST / JSON
      ↓
OpenVoz Django Backend
      ↓
Billing, Auth, Assessment, Speaking, and Future AI Services
```

The mobile app does not own:

- authentication rules;
- subscription or entitlement rules;
- assessment logic;
- payment processing;
- authoritative learner records.

The mobile app does own:

- native presentation and navigation;
- secure local session persistence;
- request orchestration;
- temporary local state;
- device capabilities such as future audio capture abstractions.

Current client architecture layers:

- `Presentation`: screens, route layouts, shared UI components.
- `Application`: route coordination, bootstrap, authenticated flow handling.
- `Services`: API clients, auth service, dashboard/profile/subscription services,
  speaking abstractions.
- `State`: Zustand for auth and workflow state; React Query for cached backend
  data.
- `Persistence`: secure token storage through `expo-secure-store` on native
  platforms.

## 3. Folder Structure

The implementation lives in `Projects/OpenVoz_Mobile/Mobile/`.

Primary folders:

- `app/`: Expo Router routes, route groups, and layouts.
- `assets/`: app-owned fonts and images.
- `components/`: reusable UI, provider, and speaking components.
- `hooks/`: React Query hooks and application bootstrap hooks.
- `screens/`: screen-level modules for auth, dashboard, profile, practice, and
  settings.
- `services/`: API gateways and backend-facing service abstractions.
- `store/`: Zustand stores for auth, connectivity, speaking, and app state.
- `types/`: shared TypeScript contracts for auth, dashboard, and subscription
  data.
- `utils/`: environment selection, logging, and shared helpers.
- `tests/`: future automated mobile tests.

Current service organization:

- `services/api/`: transport-level endpoint wrappers.
- `services/auth/`: login, logout, restore-session, and secure token handling.
- `services/profile/`: authenticated profile retrieval.
- `services/subscription/`: subscription status retrieval.
- `services/dashboard/`: aggregated mobile dashboard retrieval.
- `services/speaking/`: reusable speaking capability abstractions.
- `services/query/`: React Query client and cache keys.

## 4. Authentication Flow

OpenVoz Mobile uses token-based authentication through dedicated Django JSON
endpoints while preserving the existing browser login flow unchanged.

Current mobile authentication flow:

1. The user submits credentials on the mobile login screen.
2. The app calls `POST /api/v1/auth/login/`.
3. Django authenticates through the existing backend authentication system and
   returns a mobile token.
4. The mobile app stores only the token and session metadata in secure storage.
5. On app launch, the app restores the session with
   `GET /api/v1/auth/validate/`.
6. Protected routes are guarded by authenticated route layouts.
7. Logout calls `POST /api/v1/auth/logout/`, clears local session state, and
   returns the user to the login route.

Important constraints:

- the mobile app never parses HTML;
- the mobile app never reads `Set-Cookie`;
- the mobile app never emulates browser login;
- the backend remains authoritative for auth decisions.

## 5. API Endpoints

The mobile app currently depends on dedicated JSON endpoints in Django.

Implemented authentication endpoints:

- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/logout/`
- `GET /api/v1/auth/validate/`

Implemented mobile data endpoints:

- `GET /api/mobile/profile/`
- `GET /api/mobile/subscription/`
- `GET /api/mobile/dashboard/`

Current endpoint roles:

- `profile`: returns the authenticated user's profile details.
- `subscription`: returns effective subscription state backed by existing
  entitlement logic.
- `dashboard`: returns an aggregated dashboard payload containing user,
  subscription, and dashboard data in one response.

The mobile app should prefer aggregated endpoints where that reduces duplicate
requests, while keeping smaller endpoints available for other screens and future
reuse.

## 6. State Management

OpenVoz Mobile uses two complementary state patterns.

### Zustand

Zustand owns lightweight client-side state such as:

- authenticated session presence;
- current authenticated user in local session state;
- session restoration state;
- logout/login loading state;
- speaking workflow state;
- connectivity and app-level selections.

### React Query

React Query owns backend-derived cached data such as:

- dashboard payloads;
- subscription payloads;
- future assessment, history, and progress queries.

This split keeps the mobile client thin:

- local workflow state stays local;
- backend-owned data is fetched, cached, and invalidated through React Query.

## 7. Navigation

Navigation is implemented with Expo Router and route groups.

Current high-level route model:

- `app/(auth)/`: unauthenticated routes such as login.
- `app/(app)/`: authenticated shell.
- `app/(app)/(tabs)/`: tabbed authenticated areas including dashboard, practice,
  progress, profile, and settings.

Navigation behavior:

- unauthenticated users are redirected to `/(auth)/login`;
- authenticated users are redirected away from auth screens into the app shell;
- logout clears auth state and replaces the route stack back to login;
- protected route access depends on backend-backed auth state, not on local-only
  assumptions.

## 8. Subscription System

The mobile app does not implement its own subscription model.

Canonical backend subscription authority remains in Django:

- primary source: `billing.UserEntitlement`
- backward-compatible fallback: `members.MembershipSubscription`

The mobile endpoint `GET /api/mobile/subscription/` exposes the effective
subscription state already recognized by the backend.

This preserves one business rule for:

- premium access middleware;
- mobile subscription display;
- future entitlement-aware mobile features.

The mobile app only reads subscription status. It does not process payments or
modify entitlement behavior.

## 9. Dashboard Data

The dashboard is now designed around one aggregated backend call:

- `GET /api/mobile/dashboard/`

Current dashboard payload includes:

- authenticated user profile data;
- subscription status;
- a stable dashboard schema for learner stats and recent activity.

Current data classification:

- real backend data: user and subscription sections;
- placeholder backend values: dashboard stats and recent activity where no
  canonical backend metrics exist yet.

This design keeps the response schema stable so real learning metrics can be
added later without redesigning the mobile dashboard contract.

## 10. Voice AI Integration

Voice and speaking capabilities remain backend-centered.

Current architectural position:

- the mobile app may capture and upload audio;
- speaking session lifecycle and evaluation remain server-owned;
- AI providers remain behind Django/backend abstractions;
- the mobile app must not embed scoring or provider-specific AI logic.

The deeper authority for speaking transport and conversation contracts belongs
to:

- `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md`

Current mobile code already includes reusable speaking infrastructure under:

- `Mobile/services/speaking/`
- `Mobile/store/speaking-store.ts`
- `Mobile/components/speaking/`

## 11. Offline Storage

Offline storage is intentionally limited.

Currently implemented:

- secure persistence of the mobile auth token and session metadata;
- web fallback to session storage when secure native storage is unavailable.

Not currently authoritative on device:

- subscription state;
- learner progress;
- dashboard metrics;
- assessment results;
- premium access rights.

Future offline support may add:

- cached read models;
- queued safe-to-retry actions;
- temporary audio draft handling.

Any offline extension must preserve backend authority and must not create
parallel business logic on the device.

## 12. Deployment

OpenVoz Mobile is currently an Expo-managed application with environment-aware
backend configuration.

Current environment model:

- development
- staging
- production

Environment configuration controls:

- `apiBaseUrl`
- `siteUrl`
- related connectivity paths

Current production backend target remains:

- `https://www.openvoz.com/api/v1`

Current development backend can target a local Django server through the local
network IP, which supports simulator/device access during development.

Deployment responsibilities are split:

- mobile distribution belongs to the Expo/mobile release workflow;
- application authority remains in the deployed Django backend.

## 13. Future Roadmap

This architecture is intentionally staged.

Near-term extension areas include:

- real dashboard metrics from canonical backend data;
- learner progress and history APIs;
- profile editing once a governed backend contract exists;
- broader speaking-session and assessment result integration;
- notification and preference APIs;
- controlled offline synchronization for approved workflows.

Non-goals for future mobile work unless separately approved:

- separate mobile identity ownership;
- duplicated entitlement logic;
- mobile-side scoring or assessment policy;
- mobile-side payment processing redesign.

The governing direction remains unchanged: OpenVoz Mobile should continue to
grow as a thin client over the existing OpenVoz backend and platform services.
