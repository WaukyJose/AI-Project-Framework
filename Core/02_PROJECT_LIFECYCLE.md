# Project Lifecycle

## Purpose

This document defines the standard lifecycle for AI-assisted projects managed with the AI Project Framework. It describes how a project progresses from an initial idea to completion, maintenance, or archive.

The lifecycle is vendor-independent, repository-centered, and human-approved at each meaningful transition. AI may support the work, but it does not own project decisions.

## Lifecycle Principles

- Repository knowledge should be captured in durable project files before relying on conversation history.
- The human remains the decision maker throughout the lifecycle.
- AI should not surprise the human with unapproved structural or file changes.
- Each stage should create enough clarity to justify moving forward.
- Stage transitions require explicit human approval when they affect scope, structure, or repository files.

## Lifecycle Overview

Every AI-assisted project should move through the following stages:

1. Idea
2. Framing
3. Planning
4. Repository Setup
5. Development
6. Review
7. Documentation
8. Completion
9. Maintenance or Archive

The lifecycle may be iterative. A project can return to an earlier stage when scope, direction, or requirements change.

## Lifecycle Stage Format

Each lifecycle stage is defined by:

- Purpose
- Human responsibilities
- AI responsibilities
- Required repository artifacts
- Exit criteria

## Stage 1: Idea

### Purpose

Capture the initial project concept before deciding whether it deserves project structure.

### Human Responsibilities

- Describe the goal, problem, opportunity, or question.
- Decide whether the idea is worth exploring.
- Identify the desired outcome.

### AI Responsibilities

- Ask clarifying questions.
- Summarize the idea.
- Identify assumptions, risks, and possible project types.

### Required Repository Artifacts

No repository artifacts are required unless the idea is approved for framing.

### Exit Criteria

The human decides whether to abandon, defer, or move the idea to framing.

## Stage 2: Framing

### Purpose

Turn the idea into a clear project definition.

### Human Responsibilities

- Define purpose, audience, and success criteria.
- Decide project boundaries.
- Approve the initial scope.

### AI Responsibilities

- Draft project framing options.
- Identify missing decisions.
- Propose scope boundaries.
- Separate required work from optional work.

### Required Repository Artifacts

- `README.md` or project overview draft.
- `PROJECT_INDEX.md` if a repository is being initialized.
- Optional decision notes when useful.

### Exit Criteria

Project purpose, scope, and success criteria are clear enough to plan.

## Stage 3: Planning

### Purpose

Define the path from approved scope to development milestones.

### Human Responsibilities

- Approve milestones.
- Set priorities.
- Decide constraints, tools, and acceptable tradeoffs.
- Confirm what will not be done.

### AI Responsibilities

- Propose milestone sequence.
- Identify dependencies and risks.
- Suggest suitable repository structure.
- Surface unresolved questions.

### Required Repository Artifacts

- Project plan or milestone document.
- Updated `PROJECT_INDEX.md`.
- Optional requirements, architecture, or research notes.

### Exit Criteria

The first development milestone is approved, required artifacts are known, and open questions are either resolved or explicitly deferred.

## Stage 4: Repository Setup

### Purpose

Create or confirm the repository structure before implementation.

### Human Responsibilities

- Approve folder structure.
- Confirm the authoritative repository.
- Verify local and remote alignment when applicable.

### AI Responsibilities

- Propose structure before writing files.
- Create only approved files and folders.
- Update navigation documents.
- Report every file created, modified, renamed, or deleted.

### Required Repository Artifacts

- `PROJECT_INDEX.md`
- `README.md`
- Governance or workflow document when needed.
- Project-specific folders approved during planning.

### Exit Criteria

The repository can be understood from its index and overview, and the human confirms the structure is acceptable.

## Stage 5: Development

### Purpose

Produce the project's actual outputs, whether they are software, research, writing, teaching materials, analysis, or another approved deliverable.

### Human Responsibilities

- Approve meaningful changes before implementation.
- Review outputs.
- Make decisions when tradeoffs arise.
- Commit and push accepted work.

### AI Responsibilities

- Read repository context before proposing work.
- Propose scoped implementation steps.
- Write only approved changes.
- Keep documentation synchronized when needed.
- Report all file changes.

### Required Repository Artifacts

- Project outputs.
- Updated documentation when behavior, structure, or decisions change.
- Updated `PROJECT_INDEX.md` when files are added, moved, renamed, or retired.

### Exit Criteria

The approved milestone output is complete, repository changes are verified, and the human has enough information to review and commit.

### Implementation Phase Completion

Every completed implementation phase must end with:

1. Validation.
2. Documentation update.
3. Git commit.
4. Git push when the phase is approved.

An implementation phase is not complete until its changes have been validated, the repository documentation reflects the current state, and the accepted work has been recorded in Git. Unapproved work must not be pushed as a completed phase.

### Incremental Modernization

Major technical changes must advance through a sequence of validated checkpoints rather than as one uninterrupted activity. Each checkpoint should deliver a bounded change that can be implemented, validated, documented, verified, committed, and reviewed before modernization continues.

This principle applies to:

- Framework upgrades.
- Programming language upgrades.
- Database migrations.
- Infrastructure modernization.
- Dependency upgrades.
- SDK migrations.
- Authentication changes.
- Payment provider migrations.
- Large architectural changes.
- Any high-risk technical modernization.

The recommended checkpoint workflow is:

1. Implementation.
2. Validation.
3. Documentation update.
4. Repository verification.
5. Git commit.
6. Engineering review.
7. Next checkpoint.

A modernization checkpoint must not proceed to the next checkpoint until:

- The checkpoint implementation is complete.
- Validation succeeds.
- Relevant automated tests pass.
- Documentation reflects the current state.
- Repository integrity is verified.
- A dedicated Git commit records the checkpoint.

Validation establishes the checkpoint; Git records the validated state but does not replace validation. Once these conditions are met and the checkpoint is accepted through engineering review, it becomes the new stable baseline. Future modernization work must begin from that validated baseline. If a checkpoint fails validation or review, the project remains at the previous stable baseline until the issues are resolved.

## Stage 6: Review

### Purpose

Evaluate whether the work meets the approved goal.

### Human Responsibilities

- Review functionality, content, findings, or structure.
- Accept, reject, or request revisions.
- Verify repository status before commit.

### AI Responsibilities

- Summarize completed changes.
- Identify gaps, risks, or inconsistencies.
- Run or suggest relevant checks where applicable.
- Explain limitations clearly.

### Required Repository Artifacts

- Review notes only when useful.
- Updated documentation if review changes project direction.
- Test results, validation notes, or evidence where relevant.

### Exit Criteria

The human accepts the work or defines a revision milestone.

## Stage 7: Documentation

### Purpose

Make the project understandable and maintainable after the current conversation ends.

### Human Responsibilities

- Approve final documentation.
- Confirm that documentation reflects the actual project state.
- Decide what belongs in active docs versus archive.

### AI Responsibilities

- Update docs to match approved work.
- Remove stale references.
- Keep documentation concise and navigable.
- Keep `PROJECT_INDEX.md` synchronized.

### Required Repository Artifacts

- Updated `README.md`
- Updated `PROJECT_INDEX.md`
- Relevant project docs, notes, or references.

### Exit Criteria

A future human or AI assistant can understand the project from the repository.

## Stage 8: Completion

### Purpose

Close the active project or milestone.

### Human Responsibilities

- Confirm the objective is complete.
- Commit and push final accepted changes.
- Decide whether future maintenance is expected.

### AI Responsibilities

- Provide final change report.
- Confirm repository files were written successfully.
- Identify unresolved items or follow-up candidates.

### Required Repository Artifacts

- Final project documentation.
- Updated index.
- Optional completion summary or release notes.

### Exit Criteria

The human confirms completion, and the repository reflects the accepted final state.

## Stage 9: Maintenance or Archive

### Purpose

Decide whether the project remains active, evolves, or is retired.

### Human Responsibilities

- Decide whether to maintain, extend, or archive.
- Approve maintenance or archive changes.

### AI Responsibilities

- Propose maintenance structure when needed.
- Identify stale materials.
- Move only approved retired materials to archive.
- Preserve useful history without cluttering active areas.

### Required Repository Artifacts

- Maintenance notes, if active.
- Archive entries, if retired.
- Updated `PROJECT_INDEX.md`.

### Exit Criteria

Project status is clear: active, maintained, evolving, or archived.

## Lifecycle Transition Rules

- AI may propose transitions but should not assume them.
- Human approval is required before structural changes.
- Repository artifacts must be updated when project state changes.
- Every implementation phase must satisfy the implementation phase completion sequence before it is closed.
- Projects may move backward when scope changes.
- A stage is not complete until the repository reflects the current truth.

## Practical Standard

A project lifecycle stage is complete only when:

- The human understands and approves the state.
- The repository reflects the current truth.
- Required artifacts exist or are explicitly deferred.
- The next action is clear.
