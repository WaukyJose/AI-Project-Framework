# Repository Structure

## Purpose

This document defines the standard repository architecture for projects created with the AI Project Framework.

The repository is the single source of truth. It stores durable project knowledge, makes the project understandable without relying on chat history, and supports human approval, AI assistance, Git history, and future maintenance.

The structure should remain vendor-independent. Tools may assist the project, but they should not define the project.

## Repository Design Principles

- Repository knowledge should be captured before relying on conversation history.
- Keep structure simple until complexity is justified.
- Every folder must have a clear purpose.
- Navigation must be explicit through `PROJECT_INDEX.md`.
- Active work, reusable materials, examples, outputs, and archived materials should remain separate.
- Development tools may operate on the repository, but they do not define the repository.

## Standard Repository Layout

A framework-managed project may use the following structure:

```text
ProjectName/
├── Core/
├── Docs/
├── Templates/
├── Examples/
├── Outputs/
├── Archive/
├── PROJECT_INDEX.md
└── README.md
```

Not every project must use every folder immediately. Mandatory files and folders should exist from the beginning. Optional folders should be added when the project needs them.

## Mandatory Root Files

Every framework-managed repository should include these root files:

### `README.md`

The public or human-facing overview of the project.

It should explain:

- What the project is.
- Why the project exists.
- How to understand or enter the project.
- What the current project status is when useful.

### `PROJECT_INDEX.md`

The primary navigation file for the repository.

It should list important active documents, templates, examples, outputs, and archived materials when relevant. It must be updated when important files are added, moved, renamed, or retired.

## Mandatory Folders

Every framework-managed repository should include these folders:

### `Core/`

Foundational rules, philosophy, lifecycle, workflow, architecture, and project-specific operating guidance.

`Core/` should contain durable guidance, not temporary notes.

### `Archive/`

Retired, superseded, or historical materials kept for reference.

`Archive/` prevents useful history from cluttering active project areas.

## Optional Folders

Optional folders should be added only when the project needs them.

The standard structure already provides eight common folders: `Core/`, `Docs/`, `Research/`, `Decisions/`, `Outputs/`, `Templates/`, `Examples/`, and `Archive/`. Every additional folder must be earned by a clear need that cannot be handled by the existing structure.

### `Docs/`

Project documentation, research notes, decisions, specifications, references, or planning material that is not core governance.

### `Templates/`

Reusable structures, prompts, workflows, checklists, or document patterns.

### `Examples/`

Completed examples or sample implementations that demonstrate how templates, methods, or outputs are used.

### `Outputs/`

Final or working deliverables such as reports, software artifacts, generated documents, datasets, lesson materials, or release assets.

### `Assets/`

Images, diagrams, media, source files, or supporting resources used by project documents or outputs.

### `Tools/`

Scripts, utilities, local automation, or helper files used to work on the project.

### `Research/`

Source material, literature notes, interview notes, analysis, or investigation logs for research-heavy projects.

### `Decisions/`

Decision records when a project needs explicit tracking of major choices.

## Folder Purpose Rules

Each folder should have:

- One clear responsibility.
- A stable name.
- Content that matches its purpose.
- An index entry when it contains important project materials.

A folder should not be added just because a tool expects it unless the human approves that tool-driven structure.

## Rules for Adding New Folders

Before adding a folder:

- Confirm the need cannot be met by an existing folder.
- Define the folder's purpose in one sentence.
- Confirm whether it is project-specific or reusable.
- Propose the folder before creating it.
- Update `PROJECT_INDEX.md` if the folder contains important navigable materials.
- Report the change after writing.

## Rules for Retiring Folders

Before retiring a folder:

- Confirm it is inactive, superseded, or no longer part of the active structure.
- Move useful historical material to `Archive/` when appropriate.
- Avoid deleting useful history unless explicitly approved.
- Update `PROJECT_INDEX.md`.
- Report moved, renamed, or deleted files.

## Root File Rules

Root files should be limited to files that help someone understand, enter, configure, or operate the project.

Examples include:

- `README.md`
- `PROJECT_INDEX.md`
- License file, if needed.
- Configuration files required by tools.
- Dependency or environment files when applicable.

Root files should not become a dumping ground for notes or drafts.

## Relationship to Git

Git records the project's change history.

Git history is the project's institutional memory.

- The repository working tree is where approved changes are written.
- Git status is used by the human to verify changes.
- Commits represent accepted project states.
- AI may report changes, but the human commits unless the workflow explicitly changes.
- Git history helps make file changes traceable.

## Relationship to GitHub

GitHub, or any remote hosting platform, is a mirror or collaboration layer, not a separate source of truth.

- The local repository remains authoritative during local development.
- The remote should reflect accepted committed work.
- No parallel untracked project version should become authoritative.
- GitHub-specific features may be useful but should not be required by the framework.

## Relationship to AI Workspaces

AI workspaces, chats, and assistant tools provide context and assistance, but they do not replace repository files.

- Chat history is temporary context.
- Durable decisions belong in repository documents.
- AI should read the repository before proposing structural changes.
- AI should not create or modify files without approval.
- AI-generated content becomes project material only after it is written into the approved repository.

## Relationship to Development Tools

Development tools may create files, folders, or configuration, but they do not define the framework structure by themselves.

- Tool-specific files are allowed when they serve the project.
- Generated folders should be ignored, documented, or isolated as appropriate.
- Tool conventions should be balanced against framework clarity.
- Vendor-specific tool structure should not replace core project architecture unless necessary.

## Minimal Starting Structure

A new framework-managed project should begin with:

```text
ProjectName/
├── Core/
├── Archive/
├── PROJECT_INDEX.md
└── README.md
```

Optional folders should be added as the lifecycle requires them.

## Practical Standard

A repository structure is acceptable when:

- A human can understand the project from `README.md` and `PROJECT_INDEX.md`.
- A future AI assistant can identify the active project materials.
- Every top-level folder has a clear purpose.
- The repository reflects the current project truth.
- Git can trace all meaningful changes.
