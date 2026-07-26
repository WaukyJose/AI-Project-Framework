# ReadingStrategyCoach Architecture Decisions

# Purpose

This document records verified architectural decisions for ReadingStrategyCoach and the context in which each decision applies.

Architecture Decision Records preserve why a technology or working model was selected, its consequences, and its relationship to the project architecture.

---

# How to Use This Document

Add a decision record when a proposed change affects system structure, component responsibilities, development workflow, external services, data management, deployment, security, or operations.

Each decision should:

- Describe the problem or constraint before recording the decision.
- Record only evidence-supported context and rationale.
- Identify alternatives that were actually evaluated.
- State operational and technical consequences.
- Use a unique sequential decision ID.
- Remain in the document after replacement.
- Link a replaced decision to the decision that supersedes it.
- Be updated only when its status or supporting evidence changes.

Do not use decision records for routine implementation details or speculative future work.

---

# Decision Record Format

## Decision ID

`ADR-NNN: Decision Title`

## Date

`YYYY-MM-DD`

## Status

`Proposed`, `Accepted`, `Superseded`, or `Deprecated`

## Context

TODO: Describe the verified problem, constraints, and architectural forces.

## Decision

TODO: State the selected architecture or technology.

## Alternatives Considered

- TODO: Record only alternatives that were actually evaluated.

## Consequences

- TODO: Record positive, negative, and operational consequences.

## Related Documents

- TODO: Link the architecture, deployment, operational, or incident documents affected by the decision.

---

# Current Decisions

## ADR-001: Use React Native as the Mobile Development Framework

- **Date:** TODO: Verify the decision date.
- **Status:** Accepted

### Context

ReadingStrategyCoach requires a framework for implementing its mobile application.

### Decision

Use React Native as the mobile development framework so the mobile application is implemented through a shared React Native project.

### Alternatives Considered

- TODO: No evaluated alternatives are recorded in the project documentation.

### Consequences

- Mobile application structure and implementation follow React Native conventions.
- Mobile architecture decisions must remain compatible with the React Native runtime.
- TODO: Document verified platform targets and native integration requirements.

### Related Documents

- `Projects/ReadingStrategyCoach/SYSTEM_ARCHITECTURE.md`
- `Projects/ReadingStrategyCoach/MOBILE_ARCHITECTURE.md`

## ADR-002: Use Expo as the Development Platform

- **Date:** TODO: Verify the decision date.
- **Status:** Accepted

### Context

The React Native application requires a development platform for running and maintaining the mobile development workflow.

### Decision

Use Expo as the development platform for the ReadingStrategyCoach mobile application.

### Alternatives Considered

- TODO: No evaluated alternatives are recorded in the project documentation.

### Consequences

- Development commands and project configuration follow the selected Expo workflow.
- Mobile dependencies and native capabilities must be evaluated for compatibility with Expo.
- TODO: Document the verified Expo workflow, SDK version, and build process.

### Related Documents

- `Projects/ReadingStrategyCoach/SYSTEM_ARCHITECTURE.md`
- `Projects/ReadingStrategyCoach/MOBILE_ARCHITECTURE.md`

## ADR-003: Adopt an AI-Assisted Development Workflow

- **Date:** TODO: Verify the decision date.
- **Status:** Accepted

### Context

ReadingStrategyCoach is developed as an AI-assisted project and requires a controlled workflow that keeps human review and project documentation authoritative.

### Decision

Use the AI Project Framework AI workflow for AI-assisted analysis, implementation, documentation, and verification.

### Alternatives Considered

- TODO: No evaluated alternatives are recorded in the project documentation.

### Consequences

- AI-assisted changes remain subject to human direction and review.
- Repository documentation records project context and verified decisions.
- Changes should remain focused, traceable, and consistent with framework standards.

### Related Documents

- `Projects/ReadingStrategyCoach/PROJECT_BRIEF.md`
- `Core/04_AI_WORKFLOW.md`

## ADR-004: Adopt the AI Project Framework for Project Governance

- **Date:** TODO: Verify the decision date.
- **Status:** Accepted

### Context

ReadingStrategyCoach requires a consistent governance model for project structure, documentation, decisions, quality, and lifecycle management.

### Decision

Use the AI Project Framework as the project governance model.

### Alternatives Considered

- TODO: No evaluated alternatives are recorded in the project documentation.

### Consequences

- Project artifacts follow the AI Project Framework repository structure and documentation standards.
- Architectural changes must be recorded from verified project experience.
- Governance, lifecycle, quality, and change-management practices remain aligned with framework documents.

### Related Documents

- `Projects/ReadingStrategyCoach/PROJECT_BRIEF.md`
- `Core/00_PROJECT_GOVERNANCE.md`
- `Core/02_PROJECT_LIFECYCLE.md`
- `Core/08_QUALITY_STANDARDS.md`

---

# Pending Decisions

The following architectural areas have not yet been finalized. Create a proposed ADR for each area when its requirements and alternatives are ready for evaluation.

- **Backend architecture:** TODO: Define whether the application requires a backend and select its responsibilities, interfaces, and runtime.
- **Database:** TODO: Define persistence requirements and select the database technology.
- **Authentication:** TODO: Define identity, session, authorization, and account-recovery requirements.
- **AI provider:** TODO: Define AI capabilities, data constraints, evaluation criteria, and provider selection.
- **Cloud infrastructure:** TODO: Define hosting, networking, environment, deployment, and operational requirements.
- **Storage:** TODO: Define storage requirements for application assets, user content, and generated files.
- **Push notifications:** TODO: Define notification use cases, delivery requirements, permissions, and provider selection.
- **Analytics:** TODO: Define approved events, privacy requirements, retention, and analytics tooling.
- **Offline synchronization:** TODO: Define offline behavior, local persistence, synchronization rules, and conflict resolution.

Do not implement a pending technology choice as an accepted architecture decision until the decision has been evaluated and recorded.

---

# References

- `Projects/ReadingStrategyCoach/PROJECT_BRIEF.md`
- `Projects/ReadingStrategyCoach/SYSTEM_ARCHITECTURE.md`
- `Projects/ReadingStrategyCoach/MOBILE_ARCHITECTURE.md`
- `Projects/ReadingStrategyCoach/AI_ARCHITECTURE.md`
