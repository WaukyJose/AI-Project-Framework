## Project Overview

- Name: OpenVoz Mobile
- Platform: React Native / Expo Mobile Application
- Purpose: Mandatory entry point and permanent knowledge base for AI agents working on OpenVoz Mobile.

## Architecture Principles

- API-first consumption of stable backend endpoints.
- Server-authoritative business rules, authentication, subscription enforcement, and assessment evaluation.
- Thin mobile client focused on native presentation, navigation, temporary workflow state, and device capability abstraction.

## Development Conventions

- Verify existing implementation before creating new code.
- Reuse existing modules and service layers.
- Do not invent APIs or backend behaviors.
- Keep documentation synchronized with implementation.

## Repository Structure

- `Docs/` -> Architecture, decisions, procedures, and reports.
- `Roadmap/` -> Planning and milestones.
- `Research/` -> Supporting research materials.
- `Archive/` -> Historical materials.
- `Mobile/` -> Expo application source code (`app/`, `components/`, `hooks/`, `screens/`, `services/`, `store/`, `types/`, `utils/`).

## Coding Standards

- TypeScript for type safety across mobile service contracts and application state.
- Zustand for lightweight client-side workflow and session state.
- React Query for backend-derived data caching and server state synchronization.

## Technology Stack

- React Native / Expo Router
- TypeScript
- Zustand / React Query
- Expo SecureStore for native token persistence

## AI Collaboration Guidelines

- Read authoritative project documentation before modifying code.
- Respect established architectural boundaries between client presentation and server authority.
- Ensure all changes preserve backend token authentication and API contract patterns.

## Important Architectural Decisions

- MAD-0001: Shared speaking infrastructure uses capability-based audio abstractions and client-side draft session states.
- Mobile authentication uses dedicated Django REST Framework token endpoints (`/api/v1/auth/`) while preserving existing browser session cookies.

## Known Constraints

- The mobile app never parses HTML or emulates browser login.
- Audio recording and evaluation logic remain backend-owned.
- Offline support is limited to secure token persistence and non-authoritative caching.

## References

- [Project Index](PROJECT_INDEX.md)
- [System Architecture](Docs/Architecture/OPENVOZ_MOBILE_SYSTEM_ARCHITECTURE.md)
- [Mobile Platform Architecture](Docs/Architecture/MOBILE_PLATFORM_ARCHITECTURE.md)
- [Decision Log](Docs/Decisions/DECISION_LOG.md)

## Project

- Project ID: OpenVoz_Mobile
- Application: `Mobile/`
- Type: React Native / Expo Mobile Application
- Status: Active Development

## Purpose

This document is the mandatory entry point for any AI agent working on this project. Read it before inspecting project files, proposing changes, or modifying implementation.

Its role is to direct AI agents to the authoritative project documents rather than duplicate them.

## Read Order

1. `PROJECT_BRIEF.md`
2. `PROJECT_INDEX.md`
3. `PROJECT_HANDOFF.md`
4. `IMPLEMENTATION_STATUS.md`
5. `Roadmap/`
6. `Docs/Architecture/`
7. `Docs/Decisions/`
8. `Mobile/`

## Project Structure

- `Docs/` -> architecture, decisions, procedures, reports
- `Roadmap/` -> planning and milestones
- `Research/` -> supporting research
- `Archive/` -> historical material
- `Mobile/` -> Expo application source code

## Current Development Focus

Current work is focused on the mobile application inside the `Mobile/` directory.

## Working Rules

- Verify implementation before creating new code.
- Prefer extending existing modules.
- Do not invent APIs.
- Keep documentation synchronized with implementation.
- Follow `Core/AI_CONTEXT_STANDARD.md`.
