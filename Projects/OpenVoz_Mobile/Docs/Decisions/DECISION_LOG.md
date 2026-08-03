# OpenVoz Mobile Decision Log

## Purpose

This document establishes the architectural decision log for the OpenVoz Mobile project.

Its purpose is to provide a consistent method for recording approved platform-level decisions that affect the shared mobile foundation, its boundaries, and its reusable technical direction.

This log does not record product-specific mobile application decisions unless those decisions are explicitly promoted into shared platform guidance.

## Usage Guidelines

- Use this log to register approved architectural decisions for the shared mobile platform.
- Record decisions only after the relevant rationale, scope, and approval are clear enough to preserve as durable project knowledge.
- Keep platform-level decisions separate from future product-level mobile application decisions.
- Reference supporting architecture, roadmap, research, or product documents where needed rather than duplicating them.
- Add new decision entries in numerical order.
- Do not use this document for draft options, informal notes, or unresolved discussions.

## Decision Numbering Convention

Decisions should use the format `MAD-0001`, where:

- `MAD` means Mobile Architecture Decision.
- The numeric portion is a zero-padded sequence that increases by one for each new approved decision.

Example sequence:

- `MAD-0001`
- `MAD-0002`
- `MAD-0003`

## Decision Template

Use the following structure for each approved decision entry:

```text
## MAD-0001 - Decision Title

### Status

Approved

### Date

YYYY-MM-DD

### Context

Describe the architectural problem, constraint, or boundary that required a decision.

### Decision

State the approved decision clearly and directly.

### Rationale

Explain why this decision was selected instead of the main alternatives.

### Consequences

Describe the expected effects, trade-offs, and follow-on implications.

### Related Documents

- Relevant architecture, roadmap, research, or product references
```

## MAD-0001 - Shared Speaking Infrastructure Uses Capability-Based Audio and Draft Client Sessions

### Status

Approved

### Date

2026-08-03

### Context

Sprint 4 requires reusable speaking infrastructure for all Cambridge speaking modules, including session lifecycle, timer behavior, recording controls, upload integration, and evaluation integration. The current repository already contains the mobile shell, API layer, and authentication baseline, but it does not yet include an approved native audio package or a fully documented backend payload contract for all speaking endpoints.

### Decision

The mobile client will implement shared speaking infrastructure around:

- a client-side draft session state that manages workflow continuity before a remote speaking session is confirmed;
- capability-based recording and playback abstractions that use supported browser APIs where available;
- explicit unsupported-state messaging on platforms where approved native audio functionality is not yet present;
- backend integration through the existing service layer for session creation, audio upload, and evaluation requests.

### Rationale

This preserves the documented architecture by extending existing modules, keeping backend authority explicit, and avoiding invented hidden platform behavior. It also allows the sprint to deliver reusable speaking infrastructure immediately while keeping unresolved backend and native audio gaps visible and governable.

### Consequences

- Shared speaking screens can reuse one workflow foundation across future speaking parts.
- Native mobile recording remains a known gap until an approved audio dependency is added.
- Backend session and upload contracts remain centralized in the service layer, making later contract refinement easier.
- The application can report unsupported capability or backend contract issues directly instead of masking them with duplicate logic.

### Related Documents

- `Projects/OpenVoz_Mobile/CURRENT_SPRINT.md`
- `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`
