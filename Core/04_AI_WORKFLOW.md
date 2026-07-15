# AI Workflow

## Purpose

This document defines the standard collaboration workflow between the human and the AI assistant throughout an AI Project Framework project.

The workflow keeps the human in control, keeps the repository as the source of truth, makes AI behavior predictable, supports every lifecycle stage, and remains vendor-independent.

## Guiding Principles

- Repository first.
- Human approves.
- AI proposes before changing files.
- Work one milestone at a time.
- Every file change must be explainable.
- Git records accepted project history.
- Communication should be clear, concise, and traceable.

## Human Responsibilities

The human is responsible for:

- Defining goals and priorities.
- Approving milestones, structure, and file changes.
- Making tradeoff decisions.
- Verifying repository status.
- Reviewing AI output.
- Committing and pushing accepted work unless explicitly delegated.
- Deciding when a project stage is complete.

## AI Responsibilities

The AI assistant is responsible for:

- Reading repository context before proposing changes.
- Following `PROJECT_INDEX.md` as the navigation map.
- Proposing changes before writing files.
- Keeping work scoped to the approved milestone.
- Writing only approved repository changes.
- Updating `PROJECT_INDEX.md` when required.
- Reporting every file created, modified, renamed, or deleted.
- Surfacing risks, assumptions, and unresolved questions.

## Standard Working Session

A standard working session should follow this sequence:

1. Read `PROJECT_INDEX.md`.
2. Identify the active milestone or user request.
3. Inspect relevant repository files.
4. Summarize current context when useful.
5. Propose a scoped change.
6. Wait for explicit approval before modifying repository files.
7. Write approved changes.
8. Verify changes were written successfully.
9. Report modified files and remaining status.
10. Human verifies with Git.
11. Human commits and pushes.

The standard pattern is:

```text
Discuss.
Propose.
Approve.
Implement.
Review.
Commit.
Repeat.
```

## Approval Protocol

Explicit approval is required before:

- Creating files.
- Modifying files.
- Renaming files.
- Deleting files.
- Moving files.
- Adding folders.
- Retiring folders.
- Changing repository structure.
- Updating framework rules.
- Committing or pushing, unless the human explicitly delegates.

Approval should be clear, written in the current conversation, and tied to the milestone or change being approved.

Approval for one milestone does not imply approval for unrelated changes.

## Repository Update Protocol

When repository files are changed, the AI assistant should:

- Confirm the approved scope.
- Write only the approved files.
- Prefer modifying existing files over creating new ones when appropriate.
- Keep `PROJECT_INDEX.md` synchronized.
- Preserve useful history through `Archive/` when retiring material.
- Verify the files after writing.
- Report every file created, modified, renamed, or deleted.

Chat content becomes durable project knowledge only when written into the repository.

Repository documents override conversation memory when they conflict.

## Git Workflow

Git records the project's accepted change history.

Git history is the project's institutional memory.

- Git status is used to verify changes.
- The AI reports changes; the human verifies, commits, and pushes by default.
- Commits represent accepted project states.
- Remote platforms are mirrors or collaboration layers, not separate sources of truth.
- AI should not commit, push, reset, or discard changes unless explicitly instructed.

## Communication Principles

AI communication should be:

- Clear.
- Scoped.
- Practical.
- Traceable to repository files.
- Honest about uncertainty.
- Explicit about assumptions.
- Direct about risks and unresolved questions.

Human communication should provide:

- Goals.
- Constraints.
- Approval or rejection.
- Priority decisions.
- Corrections when the AI misunderstands the project.

## Error Handling and Recovery

When an error occurs, the AI assistant should:

- Stop and report the issue clearly.
- Identify affected files.
- Avoid hiding or silently overwriting mistakes.
- Avoid reverting user changes without explicit approval.
- Propose a recovery plan before making corrective edits.
- Use Git status and repository files to understand the current state.
- Preserve useful work when possible.
- Escalate to the human when the correct recovery path is unclear.

Examples of errors include:

- Wrong file changed.
- Wrong folder used.
- Approval scope exceeded.
- Documentation and index out of sync.
- Tool-generated structure conflicts with framework structure.
- Conversation context conflicts with repository content.

## Lifecycle Integration

The AI workflow supports each lifecycle stage:

- Idea: AI asks questions and summarizes.
- Framing: AI proposes scope and success criteria.
- Planning: AI proposes milestones and structure.
- Repository Setup: AI proposes then writes approved structure.
- Development: AI implements approved work.
- Review: AI summarizes, checks, and identifies gaps.
- Documentation: AI keeps docs and index synchronized.
- Completion: AI reports final status and unresolved items.
- Maintenance or Archive: AI proposes updates or retirement steps.

## Boundaries

By default, AI should not:

- Make unapproved repository changes.
- Treat chat history as more authoritative than repository files.
- Create parallel project versions.
- Add tool-specific structure without approval.
- Delete or overwrite useful history.
- Assume a lifecycle transition without human confirmation.
- Commit or push without explicit instruction.

## Practical Standard

A workflow session is successful when:

- The human understands what changed or what is proposed.
- The repository reflects the approved current truth.
- Every file change is reported.
- `PROJECT_INDEX.md` is synchronized when needed.
- Git can trace the accepted state.
- The next action is clear.
