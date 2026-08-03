# CURRENT SPRINT

## Sprint

Sprint 5.0 — Mobile Conversation API Specification Adoption

## Status

Planned

## Objective

Implement the approved `Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md`.

Sprint 5.0 begins only after the conversation contract is treated as the durable interface between OpenVoz Django and OpenVoz Mobile.

## In Scope

- Apply the approved mobile conversation API specification to Sprint 5 implementation planning
- preserve functional parity with the Django Part 1 authority
- extend Sprint 4 shared speaking infrastructure into a turn-based workflow
- keep session lifecycle, completion behavior, and assessment retrieval aligned with the approved contract

## Out of Scope

- ad hoc API invention during implementation
- backend transport redesign outside the approved specification
- changes to Cambridge assessment rules
- UI redesign unrelated to mobile adaptation

## Definition of Done

Sprint 5.0 is complete when:

- implementation follows `Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md`
- mobile Part 1 uses the approved conversation session and turn model
- backend authority over transcript, timing, completion, and assessment is preserved
- documentation remains synchronized with any durable contract refinement

## Prerequisites

- `Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md`
- `Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`
- verified Django Part 1 implementation in the functional authority repository

## AI Working Rules

Before implementing:

1. Read `AI_CONTEXT.md`.
2. Read `Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md`.
3. Verify existing implementation.
4. Extend existing modules whenever possible.
5. Do not invent APIs outside the approved specification.

## Deliverables

- Sprint 5 implementation aligned to the approved conversation API contract
- updated mobile documentation where durable architecture changes occur
