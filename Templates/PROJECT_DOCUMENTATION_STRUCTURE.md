# Project Documentation Structure

## Purpose

This template defines the recommended documentation layout for projects managed with the AI Project Framework. It separates system design, assessments, repeatable instructions, and historical results so that each document has a clear purpose and lifecycle.

Use this structure as a starting point. Add subfolders only when the volume or complexity of documentation justifies them.

## Recommended Layout

```text
Docs/
│
├── Architecture/
├── Audits/
├── Procedures/
├── Reports/
└── README.md
```

## Folder Purposes

### `Docs/`

The central location for maintained project documentation that does not need to live at the repository root.

Use it to:

- Keep documentation separate from source code and generated outputs.
- Make project knowledge easy to discover.
- Apply consistent organization across projects.
- Provide one entry point through `Docs/README.md`.

Do not use `Docs/` as an unstructured storage area. Every document should belong to a defined category.

### `Docs/Architecture/`

Contains the authoritative description of how the system is designed and why.

Typical contents include:

- System context and boundaries.
- Component responsibilities and dependencies.
- Data models and data flows.
- Interfaces and integrations.
- Deployment topology.
- Security, reliability, scalability, and observability design.
- Current-state and approved future-state diagrams.
- Architecture Decision Records or links to their canonical location.

Example:

```text
Architecture/
├── SYSTEM_ARCHITECTURE.md
├── DATA_MODEL.md
├── AI_ARCHITECTURE.md
├── Diagrams/
└── Decisions/
    └── ADR-0001-example-decision.md
```

Architecture documents are living descriptions of approved design. They should be updated when the system's architecture changes.

### `Docs/Audits/`

Contains dated, evidence-based assessments of the project or system against defined criteria.

Typical contents include:

- Architecture audits.
- Security audits.
- Quality and maintainability audits.
- Accessibility or compliance audits.
- Technical debt assessments.
- Follow-up reviews of previous findings.

Example:

```text
Audits/
├── 2026-01-15_architecture_audit.md
├── 2026-03-01_security_audit.md
└── 2026-Q2_documentation_audit.md
```

Audits are point-in-time records. Preserve their original context and create a new audit when a fresh assessment is performed.

### `Docs/Procedures/`

Contains tested, repeatable instructions for performing project and operational tasks safely.

Typical contents include:

- Deployment and rollback procedures.
- Backup and recovery procedures.
- Environment setup procedures.
- Access-management procedures.
- Monitoring and maintenance procedures.
- Troubleshooting and incident-response procedures.

Example:

```text
Procedures/
├── DEPLOYMENT_PROCEDURE.md
├── BACKUP_RESTORE_PROCEDURE.md
├── USER_ACCESS_PROCEDURE.md
└── Troubleshooting/
    └── DATABASE_CONNECTION_FAILURE.md
```

Procedures are living documents. Review them after system changes, failed executions, incidents, or changes in responsibility.

### `Docs/Reports/`

Contains records of results from an event, activity, release, evaluation, investigation, or reporting period.

Typical contents include:

- Release and deployment reports.
- Incident reports.
- Evaluation and test reports.
- Milestone or status reports.
- Performance and operational reports.
- Completion and handoff reports when they are not maintained at the project root.

Example:

```text
Reports/
├── 2026-04_release_report.md
├── 2026-Q2_project_status_report.md
├── 2026-05-12_incident_report.md
└── 2026-06_evaluation_report.md
```

Reports preserve historical outcomes. Use a new report or addendum for later events instead of rewriting a finalized record.

### `Docs/README.md`

The entry point and index for project documentation.

It should:

- Explain the purpose of the `Docs/` directory.
- List important documents in each category.
- Identify canonical or required documents.
- Link to documentation stored elsewhere in the repository.
- Note ownership, review expectations, or naming conventions.
- Help a new contributor find the correct document quickly.

Recommended starting content:

```markdown
# Project Documentation

## Architecture

- [System Architecture](Architecture/SYSTEM_ARCHITECTURE.md)

## Audits

- [Architecture Audit](Audits/YYYY-MM-DD_architecture_audit.md)

## Procedures

- [Deployment Procedure](Procedures/DEPLOYMENT_PROCEDURE.md)

## Reports

- [Release Report](Reports/YYYY-MM_release_report.md)
```

Update `Docs/README.md` whenever an important document is added, moved, renamed, superseded, or archived.

## Placement Rules

Choose a document's folder by the primary question it answers:

| Folder | Primary Question |
|--------|------------------|
| `Architecture/` | How is the system designed, and why? |
| `Audits/` | What condition was observed against defined criteria? |
| `Procedures/` | How is a repeatable task performed safely? |
| `Reports/` | What happened, what was produced, or what is the result? |

A document should have one primary home. Use links instead of maintaining duplicate copies in multiple folders.

## Naming Guidance

Use clear uppercase names for canonical, living documents:

```text
SYSTEM_ARCHITECTURE.md
DEPLOYMENT_PROCEDURE.md
```

Use an ISO date or reporting period for point-in-time audits and reports:

```text
2026-01-15_architecture_audit.md
2026-Q2_status_report.md
```

## Implementation Checklist

- [ ] Create the `Docs/` directory.
- [ ] Create `Architecture/`, `Audits/`, `Procedures/`, and `Reports/`.
- [ ] Create and populate `Docs/README.md`.
- [ ] Move or link existing documentation into the appropriate category.
- [ ] Remove duplicate documents or identify one canonical version.
- [ ] Update the repository-level `PROJECT_INDEX.md`.
- [ ] Confirm that all internal links resolve.
