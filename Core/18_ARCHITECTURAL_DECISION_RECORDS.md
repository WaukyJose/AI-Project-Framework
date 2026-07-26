# Architectural Decision Records

# Purpose

This document defines how architectural decisions are proposed, evaluated, documented, maintained, and retired across projects managed with the AI Project Framework.

Architecture Decision Records preserve the engineering rationale behind significant choices. They improve long-term maintainability, help contributors understand the system, reduce repeated discussions, and make trade-offs visible after the original decision context has been forgotten.

ADRs keep durable decision knowledge in the repository instead of relying on chat history, individual memory, or implementation details alone.

---

# Scope

This standard applies to architectural decisions that materially affect the structure, operation, security, maintainability, or evolution of a framework-managed project.

Every production project within the AI Project Framework should maintain its own:

```text
ARCHITECTURE_DECISIONS.md
```

That document must follow this standard and contain project-specific decision records. Non-production projects should also use ADRs when a decision has significant long-term consequences or affects future contributors.

This Core document defines the reusable standard. It must not contain project-specific decisions.

---

# What Is an Architecture Decision Record?

An Architecture Decision Record is a concise, durable record of one significant architectural decision.

An ADR records:

- The problem being addressed.
- The context and constraints.
- The selected solution.
- The alternatives actually considered.
- The rationale for the selection.
- The expected consequences and risks.
- Supporting evidence and related documents.

System documentation describes what has been implemented. An ADR explains why a major choice was made and which trade-offs were accepted.

---

# When to Create an ADR

Create an ADR before implementing a material architectural choice when practical. If an existing decision was implemented without an ADR, document it only when its rationale can be verified.

Typical ADR subjects include:

- Selecting an application or development framework.
- Choosing a cloud or hosting provider.
- Selecting a database.
- Selecting an AI provider or model-serving approach.
- Defining an authentication and authorization strategy.
- Defining deployment architecture.
- Defining security architecture.
- Defining messaging or event architecture.
- Defining storage architecture.
- Selecting a monitoring and alerting strategy.
- Approving a major refactoring that changes architectural boundaries.
- Replacing a significant technology or external service.

An ADR is not normally required for:

- Routine maintenance.
- Small implementation details with no lasting architectural effect.
- Temporary experiments that have not been approved.
- Technology ideas that have not been evaluated.
- Changes already governed by an accepted ADR without altering its decision.

When uncertain, create an ADR if future contributors will need to understand why the choice was made.

---

# ADR Lifecycle

## Proposed

Use `Proposed` when a decision is under evaluation and has not been approved.

A proposed ADR may document the problem, constraints, alternatives, and preliminary recommendation. It must not describe the decision as adopted.

## Accepted

Use `Accepted` after the authorized project decision-maker approves the decision.

An accepted ADR represents the active architectural direction. Its rationale, consequences, and related documentation should be complete enough to guide implementation and future review.

## Superseded

Use `Superseded` when a newer accepted ADR replaces the decision.

Retain the original ADR as historical context. Link it to the replacement ADR, and link the replacement back to the original. Do not rewrite the earlier record to make it appear that the newer decision was always in effect.

## Deprecated

Use `Deprecated` when a decision should no longer guide new work but remains present temporarily or has not yet been replaced.

Document why the decision was deprecated and identify any required transition work. If another ADR replaces it, use `Superseded` instead.

---

# ADR Template

Use the following template for project decision records.

```markdown
## ADR-NNN: Decision Title

- **Decision ID:** ADR-NNN
- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded | Deprecated

### Context

Describe the verified technical, operational, business, and project constraints.

### Problem Statement

State the architectural problem that requires a decision.

### Decision

State the selected approach clearly.

### Alternatives Considered

- Alternative: Explain how it was evaluated.
- Alternative: Explain how it was evaluated.

### Rationale

Explain why the selected approach best satisfies the verified context and constraints.

### Consequences

- Positive consequence.
- Negative consequence or accepted trade-off.
- Operational or maintenance consequence.

### Risks

- Risk and planned mitigation.

### Related Documents

- Path to relevant project documentation.

### Related ADRs

- ADR-NNN: Relationship to this decision.
```

Remove unused example entries, but preserve every required heading. Use a TODO when required information is not yet known.

---

# Naming Convention

Assign ADR identifiers sequentially within each project:

```text
ADR-001
ADR-002
ADR-003
```

Rules:

- Begin with `ADR-001`.
- Use three digits with leading zeros.
- Assign the next unused number when creating a proposed ADR.
- Never reuse an identifier, including after rejection, deprecation, or supersession.
- Keep the identifier unchanged when the status changes.
- Use a concise descriptive title after the identifier.
- Maintain one project-specific sequence; identifiers do not need to be unique across the entire framework.

Gaps in the sequence are acceptable when they preserve historical traceability.

---

# Writing Guidelines

- Write objectively and use evidence-supported language.
- Document verified facts rather than personal opinions.
- Separate the problem, selected decision, and supporting rationale.
- Explain meaningful trade-offs and constraints.
- Record only alternatives that were actually considered.
- Avoid implementation details unless they affect the architectural decision.
- Keep each ADR focused on one decision.
- Keep records concise enough to review and maintain.
- Identify both positive and negative consequences.
- State risks and mitigations without concealing uncertainty.
- Use TODO notes instead of inventing dates, alternatives, or rationale.
- Update the ADR status when the decision evolves.
- Preserve the original decision history when a decision is replaced.
- Keep related architecture and operational documents consistent with accepted decisions.

---

# Example Workflow

```text
Problem Identified
        ↓
Alternatives Evaluated
        ↓
Decision Approved
        ↓
ADR Written
        ↓
Implementation
        ↓
Future Review
```

The workflow should operate as follows:

1. Identify a material architectural problem.
2. Gather verified requirements, constraints, and evidence.
3. Evaluate relevant alternatives and trade-offs.
4. Obtain approval from the authorized project decision-maker.
5. Write or finalize the ADR with status `Accepted`.
6. Implement the accepted decision.
7. Update related project documentation.
8. Review the ADR when requirements or architecture change.

A working ADR may be created with status `Proposed` during evaluation. It becomes authoritative only after approval and transition to `Accepted`.

---

# Relationship to Project Documentation

ADRs complement other project documents rather than replacing them.

## `PROJECT_BRIEF.md`

Defines the project purpose, users, goals, constraints, and success criteria. ADRs explain architectural choices made within that project context.

## `SYSTEM_ARCHITECTURE.md`

Describes the current system structure, components, responsibilities, and communication. ADRs explain why major architectural structures and technologies were selected.

## `DEPLOYMENT_GUIDE.md`

Describes how the system is deployed and configured. ADRs explain why significant deployment, hosting, networking, and infrastructure choices were made.

## `OPERATIONS_RUNBOOK.md`

Describes how the deployed system is operated and maintained. ADRs explain why operationally significant architecture and monitoring strategies were selected.

These project documents describe the active system. ADRs preserve the reasoning and trade-offs behind its major choices. When an accepted ADR changes the system, all affected documentation must be updated as part of the same approved milestone or explicitly tracked follow-up work.

---

# Best Practices

- Create ADRs early enough to inform implementation.
- Keep one architectural decision per record.
- Require human approval before marking an ADR `Accepted`.
- Include measurable constraints and decision criteria where available.
- Record alternatives fairly, including why they were not selected.
- Document operational, security, cost, data, and maintenance consequences when relevant.
- Link ADRs to requirements, architecture, deployment, operations, incidents, and related decisions.
- Review proposed ADRs before implementation begins.
- Review accepted ADRs during major architecture changes.
- Supersede records instead of deleting or silently rewriting them.
- Keep the project ADR index easy to scan in chronological or numerical order.
- Verify that implementation and current project documentation agree with accepted ADRs.
- Treat unresolved fields as explicit TODOs rather than filling gaps with assumptions.
- Use Git history to preserve reviewable changes to decision records.

---

# References

- `Core/00_PROJECT_GOVERNANCE.md`
- `Core/01_FRAMEWORK_PHILOSOPHY.md`
- `Core/02_PROJECT_LIFECYCLE.md`
- `Core/03_REPOSITORY_STRUCTURE.md`
- `Core/04_AI_WORKFLOW.md`
- `Core/07_TEMPLATES.md`
- `Core/08_QUALITY_STANDARDS.md`
- `Core/17_FRAMEWORK_EVOLUTION.md`
