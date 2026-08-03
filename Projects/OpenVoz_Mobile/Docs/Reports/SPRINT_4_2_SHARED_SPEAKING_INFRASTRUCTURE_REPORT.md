# Sprint 4.2 Shared Speaking Infrastructure Report

## Purpose

Sprint 4.2 completes the shared speaking infrastructure introduced in Sprint 4 and narrowed in Sprint 4.1.

This checkpoint focuses on infrastructure hardening only. It does not redesign the current workspace, add Part 1 task logic, or expand the UI beyond what is needed to make the shared infrastructure clearer and more reusable.

## Date

2026-08-03

## Scope Implemented

- strengthened shared assessment typing so infrastructure state can distinguish idle, pending, processing, complete, and failed outcomes
- improved speaking store transitions for assessment request, pending backend processing, complete evaluation, and failure handling
- reset stale assessment state when a new upload occurs so the workspace reflects the current infrastructure lifecycle more accurately
- improved speaking API assessment parsing so backend status values can be normalized without inventing undocumented contracts
- extended existing speaking cards to surface recorder state, remote session state, and evaluation connectivity more clearly
- preserved the existing placeholder workspace structure and route composition

## Files Updated

- `Projects/OpenVoz_Mobile/Mobile/types/speaking.ts`
- `Projects/OpenVoz_Mobile/Mobile/services/api/speaking-api.ts`
- `Projects/OpenVoz_Mobile/Mobile/store/speaking-store.ts`
- `Projects/OpenVoz_Mobile/Mobile/components/speaking/speaking-session-card.tsx`
- `Projects/OpenVoz_Mobile/Mobile/components/speaking/speaking-recording-card.tsx`
- `Projects/OpenVoz_Mobile/Mobile/components/speaking/speaking-integration-card.tsx`
- `Projects/OpenVoz_Mobile/Mobile/screens/practice/b2-speaking-part-placeholder-screen.tsx`
- `Projects/OpenVoz_Mobile/IMPLEMENTATION_STATUS.md`
- `Projects/OpenVoz_Mobile/CURRENT_SPRINT.md`

## Implementation Notes

### Shared Infrastructure Boundary

Sprint 4.2 keeps the existing shared workspace intact.

No part-specific prompt flow, Cambridge Part 1 behavior, or workspace redesign was introduced. The route structure remains shared across all speaking part placeholders.

### Lifecycle Hardening

The shared infrastructure now models assessment state more explicitly:

- `idle`
- `pending`
- `processing`
- `complete`
- `failed`

This allows the client to distinguish:

- request accepted but final result not yet confirmed
- backend still processing
- completed result returned
- explicit failure

### Backend Contract Handling

The assessment API adapter now normalizes common backend status shapes through documented keys such as `status`, `state`, and `assessment_status`.

This keeps backend uncertainty visible without inventing new endpoints or assuming synchronous completion.

### Reuse Over Expansion

Sprint 4.2 extends the existing speaking cards and feedback patterns instead of creating new component files.

This preserves the current architecture and follows the project rule that new files require justification.

## Verification

- `npm run typecheck`
- `npm run lint`

Both commands completed successfully on **Monday, August 3, 2026**.

## Known Limitations

- native Android and iOS recording still require an approved audio package
- backend speaking and assessment contracts are still only partially formalized for mobile
- assessment completion timing still depends on backend behavior and may remain asynchronous
- the workspace is intentionally generic and remains separate from Sprint 5 Part 1 implementation

## Outcome

Sprint 4 shared speaking infrastructure is now complete at the client-infrastructure level.

The mobile project now has:

- reusable speaking state
- reusable timer behavior
- reusable recording abstraction
- reusable upload and evaluation integration points
- clearer shared lifecycle and failure handling

Part-specific speaking implementation remains the next layer of work for Sprint 5.
