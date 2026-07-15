# Project Governance

## Purpose

This document defines how the AI Project Framework is organized, maintained, and extended. It exists to keep the repository consistent as new templates, examples, operating rules, and reference materials are added.

## Repository Structure

The repository is organized into the following top-level areas:

- `Core/` - Foundational rules, principles, governance, and shared operating guidance.
- `Templates/` - Reusable project, prompt, workflow, and documentation templates.
- `Examples/` - Sample implementations or completed examples that demonstrate how templates and framework components are used.
- `Archive/` - Retired, superseded, or historical materials kept for reference.
- `PROJECT_INDEX.md` - The main navigation file for the repository.
- `README.md` - The public-facing overview of the project.

## Governance Principles

1. Keep the framework modular.
   Each file should have a clear purpose and should avoid duplicating guidance that belongs elsewhere.

2. Prefer durable guidance over temporary notes.
   Core documents should describe stable rules, standards, and decision patterns.

3. Make navigation explicit.
   Important files should be listed in `PROJECT_INDEX.md` when they are added, moved, renamed, or retired.

4. Preserve useful history without cluttering active areas.
   Outdated material should move to `Archive/` instead of being deleted when it may still provide context.

5. Keep examples separate from reusable templates.
   Examples may be specific and opinionated; templates should remain broadly reusable.

## File Naming Standards

- Use numbered prefixes for ordered foundational documents in `Core/`.
- Use clear, descriptive, uppercase names for major framework documents.
- Use Markdown files for human-readable guidance.
- Avoid vague names such as `notes.md`, `misc.md`, or `draft.md` in active framework areas.

## Change Process

When adding or changing framework materials:

1. Confirm the correct location for the file.
2. Create or update the file using the existing naming conventions.
3. Update `PROJECT_INDEX.md` so the file is discoverable.
4. Move superseded material to `Archive/` when appropriate.
5. Report all modified files after the change is complete.

## Index Maintenance

`PROJECT_INDEX.md` should remain the primary map of the repository. It should include:

- Active framework documents.
- Templates intended for reuse.
- Examples intended for reference.
- Archived materials when they are important enough to preserve visibly.

## Review Standard

Before considering a change complete, verify that:

- The file belongs in its chosen folder.
- The title and filename are aligned.
- The content does not duplicate another active document unnecessarily.
- `PROJECT_INDEX.md` reflects the current repository state.
- The modified files can be clearly reported.
