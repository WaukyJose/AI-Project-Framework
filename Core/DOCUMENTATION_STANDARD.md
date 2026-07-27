# Documentation Standard

## Purpose

This document defines the documentation philosophy for every project managed with the AI Project Framework. It establishes four primary documentation categories:

- Architecture
- Audits
- Procedures
- Reports

The standard keeps project knowledge durable, discoverable, current, and usable by both humans and AI agents. It applies regardless of project type, technology stack, hosting platform, or AI provider.

## Documentation Philosophy

The repository is the source of truth for durable project knowledge. Chat history, personal memory, dashboards, and external tools may support the work, but they do not replace maintained repository documentation.

Every document should:

- Have one clear purpose and one primary category.
- Be stored near the work or governance it describes.
- Identify its scope, owner, status, and relevant date or version when useful.
- Separate verified facts from assumptions, proposals, and unresolved questions.
- Link to related source documents instead of duplicating them.
- Be concise enough to remain maintainable.
- Use evidence appropriate to its claims.
- Avoid vendor-specific assumptions unless the project requires them.
- Be updated, superseded, archived, or removed when it is no longer accurate.

Documentation should help a new contributor understand the project without relying on previous conversations. It should record why the system exists, how it is designed, how recurring work is performed, what was assessed, and what outcomes occurred.

## Category Selection

Use the document's primary question to determine its category.

| Category | Primary Question | Typical Time Orientation | Primary Use |
|----------|------------------|--------------------------|-------------|
| Architecture | How is the system designed, and why? | Current and future state | Understanding and design decisions |
| Audits | What condition was observed against defined criteria? | Point in time | Assessment, risk identification, and recommendations |
| Procedures | How is a repeatable task performed safely? | Ongoing | Consistent execution and verification |
| Reports | What happened, what was produced, or what is the current result? | Period or event | Communication, evidence, and historical record |

A document may reference material from another category, but it should not absorb that category's responsibility. For example, an audit may recommend an architectural change, but the approved design belongs in architecture documentation. A deployment report may link to a deployment procedure, but it should not redefine the procedure.

---

## Architecture

### Purpose

Architecture documentation describes the structure, behavior, boundaries, constraints, and design rationale of a system. It provides the stable technical context needed to build, operate, review, and evolve the project.

### What Belongs in Architecture

- System context, boundaries, users, and external actors.
- Major components and their responsibilities.
- Interfaces, dependencies, integrations, and data flows.
- Data ownership, storage, lifecycle, and consistency models.
- Deployment topology and infrastructure design.
- Security, reliability, scalability, and observability design.
- AI model, orchestration, evaluation, and safety architecture when applicable.
- Current-state and approved future-state diagrams.
- Architectural constraints, principles, and quality attributes.
- Architecture Decision Records that explain significant choices and trade-offs.
- Migration architecture when moving between approved states.

### What Does Not Belong in Architecture

- Step-by-step operational instructions.
- One-time assessment findings.
- Sprint status or current task notes.
- Incident timelines or deployment results.
- Unapproved speculation presented as current design.

### Maintenance Standard

Architecture documents should change when the approved system design changes. They should identify whether content represents the current state, proposed state, or target state. Diagrams and component descriptions must agree with the implementation or clearly state known differences.

### Typical Files

```text
SYSTEM_ARCHITECTURE.md
DATA_MODEL.md
AI_ARCHITECTURE.md
MOBILE_ARCHITECTURE.md
ARCHITECTURE_DECISIONS.md
Decisions/
└── ADR-0001-example-decision.md
```

---

## Audits

### Purpose

Audit documentation records a structured, evidence-based assessment performed at a defined point in time. An audit compares the observed condition against explicit criteria and identifies findings, risks, technical debt, and recommendations.

### What Belongs in Audits

- Audit purpose, scope, exclusions, date, and participants.
- Evaluation criteria, controls, standards, or expected state.
- Evidence reviewed and assessment methodology.
- Current-state observations.
- Findings with severity, impact, and supporting evidence.
- Risks and technical debt identified during the assessment.
- Recommendations, priorities, owners, and proposed time horizons.
- Accepted risks and formal review or approval records.
- Follow-up status when the audit is revisited.

### What Does Not Belong in Audits

- Undocumented opinions presented as findings.
- The authoritative definition of the system architecture.
- Detailed steps for carrying out routine work.
- General progress summaries without assessment criteria.
- Silent edits that make a historical audit appear current.

### Maintenance Standard

An audit is a dated record and should remain historically accurate. Corrections should be identified, and follow-up work should update finding status without rewriting the original evidence or assessment context. A new assessment should normally create a new audit document.

### Typical Files

```text
Audits/
├── 2026-01-15_architecture_audit.md
├── 2026-03-01_security_audit.md
└── 2026-Q2_documentation_audit.md
```

---

## Procedures

### Purpose

Procedure documentation defines how to perform a repeatable task consistently, safely, and verifiably. Procedures translate policy and architecture into operational action.

### What Belongs in Procedures

- Purpose and intended outcome.
- Scope and conditions for use.
- Required roles, permissions, tools, and prerequisites.
- Ordered execution steps.
- Decision points and approval requirements.
- Safety checks and warnings.
- Expected results and verification steps.
- Rollback, recovery, or escalation instructions.
- Ownership, review date, and related references.
- Commands or examples that are safe, current, and clearly scoped.

### What Does Not Belong in Procedures

- A history of every time the procedure was performed.
- Architectural rationale that belongs in design documents or ADRs.
- Audit findings and risk ratings.
- Unverified troubleshooting guesses.
- Credentials, secrets, tokens, or sensitive access data.

### Maintenance Standard

Procedures are living documents. They should be tested when created and reviewed after material system changes, failed executions, incidents, or changes in responsibility. Steps must match the active environment, and destructive or irreversible actions must include explicit safeguards.

### Typical Files

```text
Procedures/
├── DEPLOYMENT_PROCEDURE.md
├── BACKUP_RESTORE_PROCEDURE.md
└── USER_ACCESS_PROCEDURE.md

Operations/
├── DEPLOYMENT_GUIDE.md
├── OPERATIONS_RUNBOOK.md
└── Troubleshooting/
    └── DATABASE_CONNECTION_FAILURE.md
```

---

## Reports

### Purpose

Report documentation communicates the result of an event, activity, period, test, release, or investigation. Reports provide traceable evidence of what occurred, what was learned, and what follow-up is required.

### What Belongs in Reports

- Reporting period, event, release, or activity covered.
- Audience, author, date, and status.
- Objectives and scope.
- Results, measurements, outputs, and supporting evidence.
- Variances from expected outcomes.
- Decisions made and actions completed.
- Issues, limitations, and unresolved items.
- Owners and due dates for follow-up actions.
- Links to relevant architecture, audits, procedures, and source artifacts.

### What Does Not Belong in Reports

- The permanent definition of system design.
- The canonical steps for repeatable work.
- Findings described as an audit when no criteria or evidence were used.
- Raw data without interpretation when the report is intended to support a decision.
- Future plans presented as completed results.

### Maintenance Standard

Reports should preserve the context and outcome of the period or event they cover. Final reports should not be continually rewritten to reflect later events. Corrections, addenda, or subsequent reports should be used when the historical record must be extended.

### Typical Files

```text
Reports/
├── 2026-04_release_report.md
├── 2026-Q2_project_status_report.md
├── 2026-05-12_incident_report.md
└── 2026-06_evaluation_report.md
```

## Directory Standards

Small projects may keep a limited number of high-value documents at the repository root. Larger or documentation-heavy projects should group dated artifacts into category directories. Directory structure should make the category and lifecycle of each document obvious.

### Minimal Project Example

```text
ProjectName/
├── README.md
├── PROJECT_INDEX.md
├── PROJECT_HANDOFF.md
├── SYSTEM_ARCHITECTURE.md
├── ARCHITECTURE_DECISIONS.md
├── DEPLOYMENT_GUIDE.md
├── OPERATIONS_RUNBOOK.md
├── Audits/
│   └── 2026-01-15_architecture_audit.md
├── Reports/
│   └── 2026-01_release_report.md
└── Archive/
```

### Expanded Project Example

```text
ProjectName/
├── Architecture/
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── AI_ARCHITECTURE.md
│   ├── Diagrams/
│   └── Decisions/
│       ├── ADR-0001-example-decision.md
│       └── ADR-0002-example-decision.md
├── Audits/
│   ├── Architecture/
│   ├── Security/
│   └── Quality/
├── Procedures/
│   ├── Deployment/
│   ├── Operations/
│   └── Recovery/
├── Reports/
│   ├── Releases/
│   ├── Incidents/
│   ├── Evaluations/
│   └── Status/
├── Templates/
├── Archive/
├── PROJECT_INDEX.md
└── README.md
```

### Framework Repository Example

```text
AI-Project-Framework/
├── Core/
│   └── DOCUMENTATION_STANDARD.md
├── Templates/
│   └── ARCHITECTURE_AUDIT_TEMPLATE.md
├── Operations/
│   ├── Deployment/
│   ├── Monitoring/
│   └── Troubleshooting/
├── Projects/
├── Archive/
└── PROJECT_INDEX.md
```

Projects should use the simplest structure that keeps their documentation clear. New directories should be introduced only when their contents justify the additional navigation.

## Naming and Metadata

Use descriptive Markdown filenames in uppercase for canonical, living documents:

```text
SYSTEM_ARCHITECTURE.md
DEPLOYMENT_PROCEDURE.md
OPERATIONS_RUNBOOK.md
```

Use an ISO date or reporting period for point-in-time audits and reports:

```text
2026-01-15_architecture_audit.md
2026-Q2_status_report.md
2026-05_release_report.md
```

When relevant, include:

- Title.
- Project or system.
- Owner or author.
- Date and last-updated date.
- Version or architecture baseline.
- Status.
- Scope.
- Review or approval record.

## Cross-Reference Rules

- Architecture documents should link to the ADRs that justify major decisions.
- Audits should link to the architecture, criteria, and evidence assessed.
- Procedures should link to the architecture or policy they implement.
- Reports should link to the procedure followed and any resulting audits, decisions, or changes.
- `PROJECT_INDEX.md` should list important active documentation.
- Superseded documents should identify their replacement and move to `Archive/` when historical value remains.

## Documentation Quality Checklist

Before approving a document, verify that:

- Its primary category is clear.
- Its filename and directory match its purpose.
- Its scope, status, and ownership are identifiable.
- Claims are supported by evidence or marked as assumptions.
- It does not duplicate another document's responsibility.
- Links and referenced paths are valid.
- Sensitive information is excluded.
- The content reflects the relevant point in time.
- Follow-up actions have owners when appropriate.
- `PROJECT_INDEX.md` is updated when the document is important to repository navigation.
