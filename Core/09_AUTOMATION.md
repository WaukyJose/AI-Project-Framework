# Automation

## Purpose

This document defines how automation is incorporated into the AI Project Framework while preserving repository as the source of truth, human decision making, Git traceability, incremental development, and explicit approval for structural changes.

Automation supports the framework but does not replace governance, review, or approval.

## Design Principles

- Automate repetition, not judgment.
- Human decisions remain authoritative.
- Automation must operate on repository truth.
- Automation should be visible, reviewable, and reversible where possible.
- Automation should produce traceable outputs.
- Structural changes require explicit approval.
- Start with simple automation before complex automation.
- Vendor-specific tools may implement automation, but the framework defines capabilities.

## Levels of Automation

### Level 1: Assisted Automation

AI or tools suggest, draft, summarize, or prepare work.

The human reviews before anything changes.

This is the default level for most framework activity.

### Level 2: Approved Automation

Automation performs a clearly approved task.

The scope is narrow and explicit. AI or tools may modify files after approval. Results must be reported and verified.

### Level 3: Controlled Autonomous Automation

Automation performs repeatable low-risk tasks under pre-approved rules.

The automation must have clear boundaries, must log or report results, and must not make structural, strategic, or destructive decisions.

## Tasks That May Be Fully Automated

Tasks may be fully automated when they are low-risk, reversible or non-destructive, and based on defined criteria.

Examples include:

- Checking whether required files exist.
- Checking whether `PROJECT_INDEX.md` links resolve.
- Formatting documents when the format is defined.
- Generating status reports from repository files.
- Running tests.
- Running validation checks.
- Detecting stale links or missing headings.
- Producing draft audit reports.
- Monitoring known conditions.
- Creating routine backups when approved.

## Tasks That Require Human Approval

The following tasks require explicit human approval:

- Creating, modifying, renaming, moving, or deleting repository files.
- Adding or retiring folders.
- Updating core framework rules.
- Changing project scope.
- Changing lifecycle stage.
- Creating templates.
- Committing or pushing changes.
- Deploying public outputs.
- Publishing content.
- Changing project type.
- Connecting a new external service.
- Running automation that changes persistent project state.

Approval must be explicit, scoped, and tied to the current milestone or task.

## Tasks That Should Never Be Automated

The following tasks should never be automated:

- Final project direction decisions.
- Human approval itself.
- Ownership of factual, academic, legal, ethical, or product claims.
- Silent destructive changes.
- Replacing repository truth with chat memory.
- Creating parallel authoritative project versions.
- Bypassing Git traceability.
- Publishing or deploying without human authorization.
- Removing useful history without approval.
- Expanding automation permissions without human approval.

Automation should never remove human accountability.

## Human-in-the-Loop Requirements

Human review is mandatory:

- Before structural repository changes.
- Before committing or pushing unless explicitly delegated.
- Before publishing, deploying, or sharing externally.
- Before accepting AI-generated conclusions.
- Before changing project rules.
- Before deleting, archiving, or retiring materials.

Human-in-the-loop workflow should include:

- Clear proposal.
- Explicit approval.
- Reported result.
- Verification opportunity.

## Repository Automation

Automation may help:

- Check required files and folders.
- Validate folder purpose alignment.
- Detect missing index entries.
- Detect duplicate or parallel structures.
- Generate repository summaries.
- Prepare proposed structure changes.

Automation must not:

- Create or restructure repository architecture without approval.
- Treat generated structure as authoritative until reviewed.

## Documentation Automation

Automation may help:

- Draft documentation from approved context.
- Check headings and required sections.
- Detect stale references.
- Suggest index updates.
- Summarize milestone changes.
- Generate quality audit drafts.

Automation must not:

- Treat generated documentation as approved truth without human review.
- Invent project decisions.
- Replace source documents with summaries.

## Git Automation

Automation may help:

- Run status checks.
- Summarize diffs.
- Identify changed files.
- Suggest commit messages.
- Detect unrelated changes.
- Prepare release notes from committed history.

Automation requires approval for:

- Staging.
- Committing.
- Pushing.
- Branch creation.
- Tagging.
- Resetting, reverting, or discarding changes.

Automation must never:

- Hide uncommitted changes.
- Commit unreviewed AI-generated work.
- Use destructive Git operations without explicit approval.

## AI Workspace Automation

Automation may help:

- Start sessions by reading `PROJECT_INDEX.md`.
- Remind the assistant of workflow rules.
- Summarize active milestones.
- Detect when repository context and chat context diverge.
- Prepare proposals based on repository files.
- Generate draft reports or checklists.

Automation must not:

- Treat AI workspace memory as source of truth.
- Modify repository files without approval.
- Assume approval from prior unrelated conversations.
- Create parallel project states inside the AI workspace.

## Project Bootstrap Automation

Automation may help:

- Ask bootstrap questions.
- Generate proposed initial structure.
- Create approved starter files.
- Verify required first documents.
- Check Git initialization.
- Confirm AI workspace points to the correct repository.

Automation requires approval for:

- Creating the project folder.
- Initializing repository structure.
- Creating remote repositories.
- Connecting external tools.
- Making the first commit or push.

## Testing and Validation Automation

Automation may help:

- Run tests.
- Validate links.
- Validate document structure.
- Check required sections.
- Verify generated outputs.
- Run linting or formatting.
- Produce quality audit reports.

Automation should report:

- What was checked.
- What passed.
- What failed.
- What could not be checked.
- Recommended next action.

## Deployment Automation

Automation may help:

- Build deployable artifacts.
- Run pre-deployment checks.
- Prepare deployment notes.
- Validate release packages.
- Report deployment readiness.

Deployment requires approval when:

- Outputs become public.
- Remote services are changed.
- Production environments are affected.
- Costs, access, or user-facing behavior may change.

Automation must not:

- Deploy public or production changes without authorization.
- Hide deployment failures.
- Skip validation steps required by the project.

## Monitoring and Maintenance Automation

Automation may help:

- Check for broken links.
- Detect stale documents.
- Monitor recurring quality conditions.
- Remind humans about maintenance reviews.
- Produce maintenance reports.
- Flag outdated dependencies or references.

Automation must:

- Report findings clearly.
- Avoid making silent changes.
- Require approval before persistent changes.

## Safety and Approval Rules

- Automation that changes repository files requires explicit approval.
- Automation that changes project structure requires explicit approval.
- Automation that affects external systems requires explicit approval.
- Automation that deletes, overwrites, publishes, deploys, commits, or pushes requires explicit approval.
- Automation must report what it did.
- Automation must preserve Git traceability.
- Automation must stop when scope is unclear.

## Automation Boundaries

Automation should not:

- Replace human judgment.
- Decide project direction.
- Invent approvals.
- Create hidden state.
- Create parallel source-of-truth locations.
- Hide errors.
- Remove history silently.
- Expand its own permissions.
- Treat vendor-specific behavior as framework law.

## Future Extensibility

The framework may later support:

- Bootstrap scripts.
- Quality audit scripts.
- Documentation consistency checks.
- Index validation tools.
- Project type scaffolding.
- Scheduled maintenance checks.
- Deployment readiness checks.
- AI workspace initialization prompts.

Extensibility rules:

- New automation must follow the same approval model.
- New automation should be documented before use.
- Automation should remain modular.
- Vendor-specific implementations should be replaceable.

## Practical Standard

Automation is acceptable when:

- It supports, rather than replaces, human judgment.
- It operates from repository truth.
- It is scoped, visible, and reviewable.
- It preserves Git traceability.
- It respects approval boundaries.
- It helps complete milestones incrementally.
- It can be explained to a future human or AI assistant.
