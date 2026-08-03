# OpenVoz Mobile

## Purpose

OpenVoz Mobile is the Expo application foundation for the future OpenVoz mobile client.

This project implements the application shell defined by the OpenVoz Mobile planning documents in the AI Project Framework. It provides the technical baseline for routing, shared providers, client infrastructure, linting, formatting, and long-term project structure without introducing business logic or product workflows prematurely.

## Architecture

The application foundation aligns with the architecture documented in:

- `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_PLATFORM_ARCHITECTURE.md`
- `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`
- `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_UX_MASTER_PLAN.md`

Current foundation decisions:

- Expo SDK 57 with TypeScript
- Expo Router for route-driven application structure
- React Query for remote data orchestration
- Zustand for lightweight client-side global state
- ESLint with `eslint-config-expo`
- Prettier for repository-consistent formatting

Sprint 1 infrastructure decisions:

- Environment-aware backend configuration for development, staging, and production
- Shared API client with timeouts, common headers, structured errors, and interceptor-style hooks
- Development-only structured logging for request diagnostics
- Connectivity diagnostics on the home screen before authentication work begins

Sprint 2 authentication decisions:

- Reuse of the existing Django-backed OpenVoz authentication flow
- Secure session persistence through `expo-secure-store` on native platforms
- Centralized authentication state in Zustand
- Session restoration during application bootstrap
- Query cache invalidation on logout

Sprint 4 speaking infrastructure decisions:

- Shared speaking workflow state in Zustand
- Reusable speaking workspace across all B2 speaking routes
- Capability-based recording and playback abstraction
- Backend integration for session creation, audio upload, and evaluation requests

Top-level application directories:

- `app/` - Expo Router entry points and route layouts
- `assets/` - application-owned static assets
- `components/` - reusable providers and UI components
- `navigation/` - navigation helpers and shared route metadata
- `screens/` - screen-level modules
- `services/` - API and service abstractions
- `hooks/` - shared application hooks
- `store/` - client-side global state containers
- `utils/` - shared helpers
- `types/` - shared TypeScript types
- `tests/` - future unit and integration tests

## Development Workflow

### Install dependencies

```bash
npm install
```

### Start the Expo development server

```bash
npm start
```

### Start platform-specific development

```bash
npm run android
npm run ios
npm run web
```

### Validate the foundation

```bash
npm run lint
npm run format:check
npx tsc --noEmit
```

## Current Scope

Current implementation intentionally excludes:

- part-specific speaking prompts and exam logic
- scoring algorithms
- feature business logic beyond the shared speaking infrastructure baseline
- subscription workflows
- profile editing

Current authentication scope includes:

- login
- logout
- session restoration
- secure session persistence

Those capabilities should be added only after their implementation work begins under the existing architecture documents.
