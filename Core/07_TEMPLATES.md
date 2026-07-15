# Templates

## Purpose

This document defines the template system used by the AI Project Framework.

Templates standardize reusable project structures, help bootstrap projects faster, and provide consistent starting points for documents, workflows, prompts, and repositories.

Templates must remain adaptable to project type and human decisions. They support consistency but do not replace governance, approval, or review.

Templates are vendor-independent.

## Design Principles

- Reusable before specialized.
- Template after rule.
- Start from the shared framework before customizing.
- Templates should reduce repeated work.
- Templates should not create unnecessary complexity.
- Templates must be understandable from repository files.
- Human approval is required before applying or modifying a template.
- Existing projects should not break when templates evolve.

## What a Template Is

A template is a reusable starting structure, document, prompt, workflow, or repository pattern.

A template may provide:

- Suggested files.
- Suggested folders.
- Required sections.
- Reusable language.
- Checklist items.
- Workflow steps.
- Prompts or AI instructions.

A template is not:

- A final project.
- A substitute for human judgment.
- A source of truth above the active project repository.
- A reason to create files or folders that the project does not need.

## When to Use Templates

Use templates when:

- A repeated structure is useful across projects.
- A document type has predictable required sections.
- A workflow should be performed consistently.
- A new project needs a reliable starting point.
- A project type has common artifacts.

## When Not to Use Templates

Do not use templates when:

- The project need is unclear.
- The template would add unused folders or sections.
- The template conflicts with approved project structure.
- The template would override human decisions.
- A simpler one-off document would be better.
- The template would create vendor lock-in.

## Types of Templates

The framework supports these template types:

- Core framework templates.
- Project templates.
- Document templates.
- Prompt templates.
- Workflow templates.
- Repository templates.

## Core Framework Templates

Core framework templates are reusable materials for creating or extending AI Project Framework projects.

Examples include:

- Starter governance document.
- Starter project index.
- Starter README.
- Quality checklist.
- Bootstrap checklist.

Rules:

- Core framework templates must reflect approved core framework documents.
- Core framework templates should not introduce new rules without updating core guidance first.
- Core framework templates should remain broadly reusable.

## Project Templates

Project templates are reusable starting structures for specific project categories.

Examples include:

- Book project template.
- Research paper project template.
- Software application project template.
- Website project template.
- Course project template.

Rules:

- Project templates must align with `Core/05_PROJECT_TYPES.md`.
- Project templates should include only justified folders and documents.
- Project templates should identify optional additions clearly.
- Project templates should not assume one vendor, tool, or platform.

## Document Templates

Document templates are reusable structures for common project documents.

Examples include:

- Project overview.
- Milestone plan.
- Decision record.
- Research note.
- Quality audit.
- Completion report.

Rules:

- Document templates must define required sections.
- Document templates should be concise enough to maintain.
- Document templates should make placeholders obvious.
- Document templates should not contain project-specific assumptions unless clearly marked.

## Prompt Templates

Prompt templates are reusable instructions for AI collaboration.

Examples include:

- Session start prompt.
- Repository review prompt.
- Quality audit prompt.
- Bootstrap prompt.
- Documentation update prompt.

Rules:

- Prompt templates must preserve human approval.
- Prompt templates must direct AI to use repository truth.
- Prompt templates must not authorize unapproved file changes.
- Prompt templates should remain portable across AI tools when possible.

## Workflow Templates

Workflow templates are reusable step-by-step procedures for repeated work.

Examples include:

- New milestone workflow.
- Review workflow.
- Documentation update workflow.
- Archive workflow.
- Release workflow.

Rules:

- Workflow templates must define inputs, steps, outputs, and approval points.
- Workflow templates must include verification.
- Workflow templates must preserve incremental development.

## Repository Templates

Repository templates are reusable repository starting structures.

Examples include:

- Minimal framework repository.
- Research repository.
- Software application repository.
- Educational resource repository.

Rules:

- Repository templates must follow `Core/03_REPOSITORY_STRUCTURE.md`.
- Repository templates must include `README.md`, `PROJECT_INDEX.md`, `Core/`, and `Archive/`.
- Optional folders must be justified.
- Every additional folder must be earned.

## Naming Conventions

Template filenames should be clear and uppercase.

Use the `_TEMPLATE.md` suffix for Markdown templates. Use category prefixes when helpful. Avoid vague names such as `GENERAL_TEMPLATE.md` unless the purpose is truly general.

Template names should describe what they create or guide.

Examples:

```text
PROJECT_STARTER_TEMPLATE.md
README_TEMPLATE.md
MILESTONE_PLAN_TEMPLATE.md
QUALITY_AUDIT_TEMPLATE.md
BOOK_PROJECT_TEMPLATE.md
```

## Template Customization Rules

Customization is allowed when:

- The project need is clear.
- The human approves the customization.
- The customized result remains consistent with framework rules.
- Unused sections are removed or marked intentionally.
- Optional folders are justified.
- `PROJECT_INDEX.md` is updated when needed.

Customization should not:

- Override governance.
- Create hidden project structure.
- Add vendor-specific assumptions unnecessarily.
- Break traceability.
- Turn reusable templates into project-specific documents without marking them as such.

## Template Versioning

Templates may change as the framework improves.

Existing projects are not automatically invalidated by template updates. New projects should use the current approved template. Existing projects may adopt template improvements through explicit approval.

Major template changes should be documented when they affect future use.

Versioning guidance:

- Use Git history as the primary version record.
- Add visible version notes only when useful.
- Avoid complex versioning unless templates are distributed outside the repository.

## Template Lifecycle

Templates move through these lifecycle stages:

1. Proposed
2. Approved
3. Active
4. Revised
5. Deprecated
6. Archived

Stage definitions:

- Proposed: template idea exists but is not yet reusable.
- Approved: human has approved creation.
- Active: template is listed in `PROJECT_INDEX.md`.
- Revised: template changes through approved updates.
- Deprecated: template should no longer be used for new projects.
- Archived: template is moved to `Archive/` when useful history should be preserved.

## Relationship with Project Bootstrap

Templates support bootstrap by:

- Providing starter files.
- Reducing repeated setup work.
- Helping select project-type structures.
- Providing first-document patterns.
- Supporting verification and first commit preparation.

Templates must not:

- Replace bootstrap decisions.
- Create optional folders without justification.
- Bypass human approval.
- Assume the remote platform or AI workspace.

## Relationship with Project Types

Project templates should adapt to supported project categories:

- Books.
- Research papers.
- Software applications.
- Mobile applications.
- Websites.
- Data science / NLP projects.
- Educational resources and courses.

Mixed projects should start from the primary type and add only necessary secondary elements.

## Practical Standard

A template is acceptable when:

- It is reusable across more than one project or repeated workflow.
- It reflects approved framework rules.
- It reduces setup or documentation effort.
- It remains simple enough to customize.
- It does not create unnecessary folders or files.
- It preserves human approval and repository truth.
- Existing projects can continue even when the template evolves.
