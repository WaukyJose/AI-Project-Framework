# CURRENT SPRINT

## Sprint

Sprint 5.0.1 — Mobile Token Authentication

## Status

Completed

## Objective

Replace the mobile Django session-cookie dependency with a mobile
authentication token while preserving the existing browser authentication flow.

## In Scope

- dedicated JSON authentication endpoints for mobile;
- token-based mobile login, logout, and validation;
- secure storage of the mobile token only;
- removal of cookie-based mobile session persistence logic;
- documentation updates for the new authentication model.

## Out of Scope

- browser authentication redesign;
- speaking workflow changes;
- permission redesign;
- user-management redesign;
- Cambridge Part 1 transport changes.

## Definition of Done

Sprint 5.0.1 is complete when:

- browser authentication remains unchanged;
- mobile authentication uses the implemented token API;
- the mobile client stores only the token;
- mobile session restoration uses token validation;
- obsolete cookie-emulation code is removed;
- documentation is synchronized with the implemented token architecture.

## Deliverables

- token-based mobile authentication implementation across both repositories;
- updated architecture and implementation-status documents;
- `SPRINT_5_0_1_MOBILE_TOKEN_AUTHENTICATION_REPORT.md`.

# Current Sprint

Resolving specification ambiguities and synchronizing conversation contracts before implementing Cambridge B2 First Speaking Part 1.

## Objective

- Align the mobile implementation with the verified backend specifications.

## Current Phase

- Cambridge Speaking Part 1 implementation

## Current Milestone

- Specification reconciliation and transport alignment

## Active Tasks

- Synchronize older mobile architecture specifications with current API and functional specifications.
- Reconcile legacy mobile transport documentation with server-authoritative workflows.
- `TODO: Verify` remaining backend integration details before client-side implementation.

## Current Blockers

- Verified backend transport and workflow authority is incomplete in current repository documentation.
- Older architecture documents describe superseded per-part transport endpoints.

## Recently Completed

- Sprint 5.0.1 - Mobile Token Authentication (replaced mobile session cookies with DRF Bearer tokens).
- Sprint 4.2 - Shared Speaking Infrastructure Hardening.

## Next Immediate Action

- Resolve specification ambiguities between conversation API specs and legacy API documents before client-side code changes.

## Definition of Done

- Obsolete mobile conversation API specs updated or deprecated.
- Speaking Part 1 mobile client implements the turn-based session and audio upload protocol.
- Automated tests or type checks pass successfully.
- Implementation report added to `Docs/Reports/`.

## Last Updated

- 2026-08-03

## References

- [Implementation Status](IMPLEMENTATION_STATUS.md)
- [AI Context](AI_CONTEXT.md)
- [Project Index](PROJECT_INDEX.md)
