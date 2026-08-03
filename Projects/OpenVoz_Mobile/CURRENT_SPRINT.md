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
