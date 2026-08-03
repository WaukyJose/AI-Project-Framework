# AI_CONTEXT Standard

## Purpose

This document defines the official standard for project-level `AI_CONTEXT.md` files in the AI Project Framework.

Its purpose is to ensure that every AI agent begins from a consistent, minimal, and reliable project entry point before inspecting or modifying a repository.

## Required Location

Each project must include its own AI context file at:

`ProjectRoot/AI_CONTEXT.md`

This file is the mandatory starting point for any AI agent working inside that project.

## Mandatory Sections

Every project `AI_CONTEXT.md` must include these sections:

1. `# AI_CONTEXT`
2. `## Project`
3. `## Purpose`
4. `## Read Order`
5. `## Project Structure`
6. `## Working Rules`

Additional sections may be added only when they improve clarity without turning the file into duplicated documentation.

## Writing Principles

- Keep the document concise and operational.
- Write factually and avoid speculative statements.
- Do not duplicate content that already exists in dedicated project documents.
- Summarize structure and expectations rather than rewriting full documentation.
- Use clear Markdown with stable section names.
- Prefer durable guidance over temporary notes.

## AI Reading Order

The project `AI_CONTEXT.md` must direct AI agents to read project materials in a defined order before code changes begin.

The expected reading flow is:

1. `AI_CONTEXT.md`
2. Project brief or project definition documents
3. Project index or repository map
4. Current handoff or status documents
5. Architecture documentation
6. Decision records
7. Planning or roadmap materials
8. Application or system source code

Projects may adapt the exact filenames or directories, but the order must remain explicit.

## Maintenance Rules

- Update `AI_CONTEXT.md` when project structure or canonical reading order changes.
- Keep it synchronized with the actual repository layout.
- Revise it when major architectural direction changes.
- Remove outdated references promptly.
- Treat the file as an entry point, not as a full project manual.
- `AI_CONTEXT.md` must remain stable. Sprint-specific and implementation-specific information belongs in `CURRENT_SPRINT.md` and `IMPLEMENTATION_STATUS.md`, respectively.
