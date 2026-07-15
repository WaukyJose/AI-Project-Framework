# Quality Standards

## Purpose

This document defines the measurable quality standards every AI Project Framework project must satisfy before a milestone is considered complete.

Quality applies to all project types. It is evaluated against repository state, documentation, workflow, review, traceability, and maintainability. Standards should be objective whenever possible.

A milestone is not complete just because files were created. It is complete when the repository reflects approved, reviewable, usable work.

## Design Principles

- Quality must be visible in the repository.
- Standards should be measurable whenever possible.
- Completion requires verification.
- Documentation and project artifacts must agree.
- AI output must be reviewed by the human.
- Git history should preserve accepted project states.
- Reusable work should be separated from project-specific work.
- Simplicity is a quality standard.

## Repository Quality Standards

Repository quality requires:

- `README.md` exists.
- `PROJECT_INDEX.md` exists.
- `Core/` exists.
- `Archive/` exists.
- Important active files are listed in `PROJECT_INDEX.md`.
- Every top-level folder has a defined purpose.
- No unnecessary folders exist without clear justification.
- No duplicate authoritative project versions exist.
- Repository structure matches the approved lifecycle stage and project type.

Measurable checks:

- Required files are present.
- Index links resolve.
- Folder names match the approved structure.
- New folders were explicitly approved.

## Documentation Quality Standards

Documentation quality requires:

- Documentation is accurate.
- Documentation reflects the current repository state.
- File titles match file purposes.
- Important decisions are written in repository files.
- Temporary chat context is not treated as durable documentation.
- Documents are concise enough to be maintained.
- Related documents do not contradict each other.

Measurable checks:

- Each active document has a clear heading.
- `PROJECT_INDEX.md` includes new, moved, renamed, or retired files.
- No placeholder sections remain unless intentionally marked.
- Required sections for the document type are present.

## AI Collaboration Quality Standards

AI collaboration quality requires:

- AI reads relevant repository context before proposing changes.
- AI proposes changes before writing files.
- AI stays within the approved milestone.
- AI reports all files created, modified, renamed, or deleted.
- AI surfaces assumptions, risks, and unresolved questions.
- AI does not treat chat memory as more authoritative than repository files.

Measurable checks:

- Approval exists in the conversation before edits.
- Changed files match the approved scope.
- Final report lists all repository changes.
- No unapproved structural changes were made.

## Human Review Standards

Human review quality requires:

- Human reviews proposed changes before implementation.
- Human approves file changes explicitly.
- Human verifies repository status before commit.
- Human decides when a milestone is complete.
- Human owns final project direction and tradeoff decisions.

Measurable checks:

- Approval was given for the milestone.
- Review occurred before commit.
- Git status was checked before commit.
- Open questions were resolved or explicitly deferred.

## Git and Version Control Standards

Git and version control quality requires:

- Git is initialized in the authoritative repository.
- Git status is used to verify changes.
- Commits represent accepted project states.
- Unreviewed AI-generated changes are not committed.
- Remote repositories mirror accepted work.
- Destructive Git actions require explicit approval.

Measurable checks:

- Git status shows expected changes before commit.
- Commit contains only intended files.
- No unrelated changes are included in a milestone commit.
- Remote state is updated only after accepted local work is committed.

## Project Consistency Standards

Project consistency requires:

- Governance, philosophy, lifecycle, repository structure, workflow, project type, and bootstrap rules agree.
- Project type does not override shared framework rules.
- Folder usage matches documented folder purposes.
- Milestone work matches the current lifecycle stage.
- Naming conventions are consistent.

Measurable checks:

- New files are placed in the correct folder.
- Filenames match established naming patterns.
- Core documents use numbered prefixes.
- The index reflects the current core sequence.

## Traceability Standards

Traceability requires:

- Important changes can be traced to approval, file edits, and Git history.
- Project decisions are documented when they affect future work.
- AI reports are specific enough for human verification.
- Retired materials are archived rather than silently lost when useful.

Measurable checks:

- Each milestone has a clear approved scope.
- Changed files are reported.
- Index updates accompany navigational changes.
- Archived materials remain discoverable when relevant.

## Maintainability Standards

Maintainability requires:

- Documents are easy to update.
- Structure avoids unnecessary complexity.
- Content avoids duplication across active documents.
- Future humans or AI assistants can understand the project from the repository.
- Tool-specific files do not obscure the framework structure.

Measurable checks:

- Each document has one clear purpose.
- Repeated guidance is minimized.
- Root folder is not cluttered with temporary notes.
- Generated files are isolated, ignored, or documented when needed.

## Reusability Standards

Reusability requires:

- Reusable materials are separated from examples and project-specific outputs.
- Templates are created only after governing rules exist.
- Reusable artifacts are general enough to apply across projects.
- Specialized materials stay in examples, docs, outputs, or project-specific folders.

Measurable checks:

- Templates live in `Templates/`.
- Examples live in `Examples/`.
- Outputs live in `Outputs/` when that folder is used.
- Reusable documents avoid project-specific assumptions unless clearly marked.

## Completion Checklist

A milestone can be considered complete only when:

- Approved scope was followed.
- Required files were created or updated.
- `PROJECT_INDEX.md` is synchronized when needed.
- Documentation matches the repository state.
- Changed files were verified after writing.
- All created, modified, renamed, or deleted files were reported.
- Open questions are resolved or explicitly deferred.
- Human has enough information to verify with Git.
- No unapproved structural changes remain.
- The next action is clear.

## Quality Audit Procedure

Use this procedure to audit milestone quality:

1. Read `PROJECT_INDEX.md`.
2. Identify the approved milestone.
3. Review changed files against the approved scope.
4. Check required repository files and folders.
5. Verify index synchronization.
6. Check documentation consistency.
7. Confirm AI followed approval protocol.
8. Confirm human review requirements are satisfied.
9. Check Git status.
10. Identify unresolved issues.
11. Classify result as pass, pass with deferred items, or fail.
12. Report findings and required corrections.

Audit result categories:

- `Pass`: all required standards met.
- `Pass with deferred items`: incomplete items are explicitly documented and approved for later.
- `Fail`: required standards are unmet or repository state is unclear.

## Practical Standard

A milestone meets the quality standard when:

- The repository reflects the approved current truth.
- Required artifacts exist and are discoverable.
- The work is reviewable, traceable, and maintainable.
- Human approval and AI actions are aligned.
- Git can preserve the accepted state.
- A future human or AI assistant can continue from the repository without relying on chat history.
