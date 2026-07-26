# Repository Structure

## Purpose

This document defines the standard repository architecture for projects created with the AI Project Framework.

The repository is the single source of truth. It stores durable project knowledge, makes the project understandable without relying on chat history, and supports human approval, AI assistance, Git history, and future maintenance.

Repository documentation should distinguish between stable architectural documentation and living operational documentation. Architecture documents describe the system and its design. Operational documents describe the current engineering state and guide the continuation of active work.

The structure should remain vendor-independent. Tools may assist the project, but they should not define the project.

## Repository Design Principles

- Repository knowledge should be captured before relying on conversation history.
- Keep structure simple until complexity is justified.
- Every folder must have a clear purpose.
- Navigation must be explicit through `PROJECT_INDEX.md`.
- Stable architecture and living operational state should be documented separately.
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
├── README.md
├── PROJECT_HANDOFF.md
├── PROJECT_BRIEF.md
├── PROJECT_ROADMAP.md
├── SYSTEM_ARCHITECTURE.md
├── MOBILE_ARCHITECTURE.md
├── AI_ARCHITECTURE.md
├── DATA_MODEL.md
├── ARCHITECTURE_DECISIONS.md
├── DEPLOYMENT_GUIDE.md
├── OPERATIONS_RUNBOOK.md
└── CHANGELOG.md
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

### `PROJECT_HANDOFF.md`

The primary continuity document for the current engineering state.

Its purpose is to:

- Record the current engineering status.
- Enable seamless transition between development sessions.
- Support collaboration between human developers and AI agents.
- Identify exactly where implementation work should continue.

`PROJECT_HANDOFF.md` is a concise, living operational document that should be updated frequently as meaningful implementation work is completed. It should reference architecture documents rather than duplicate their stable system descriptions.

Typical contents include:

- Current phase and milestone.
- Active and recently completed work.
- The next priority.
- Known blockers.
- Stable components.
- A short technical debt summary.
- Notes for the next development session.

### `PROJECT_INDEX.md`

The primary navigation file for the repository.

It should list important active documents, templates, examples, outputs, and archived materials when relevant. It must be updated when important files are added, moved, renamed, or retired.

## Standard Project Documents

Every framework-managed project should include the following top-level project documents:

```text
README.md
PROJECT_HANDOFF.md
PROJECT_BRIEF.md
PROJECT_ROADMAP.md
SYSTEM_ARCHITECTURE.md
MOBILE_ARCHITECTURE.md
AI_ARCHITECTURE.md
DATA_MODEL.md
ARCHITECTURE_DECISIONS.md
DEPLOYMENT_GUIDE.md
OPERATIONS_RUNBOOK.md
CHANGELOG.md
```

Documents that do not apply to the current implementation should remain concise and state why they are not applicable. This preserves a predictable repository standard without requiring speculative content.

## Document Roles and Lifecycles

Project documents serve different purposes and should not duplicate one another.

| Document | Primary Purpose | Update Frequency |
| --- | --- | --- |
| `README.md` | Project entry point | Rare |
| `PROJECT_HANDOFF.md` | Current engineering state and continuity | Frequent |
| `PROJECT_BRIEF.md` | Project definition and scope | Rare |
| `PROJECT_ROADMAP.md` | Long-term planning and milestones | Occasional |
| `SYSTEM_ARCHITECTURE.md` | Stable system design | Rare |
| `CHANGELOG.md` | Historical record of delivered changes | Per release |

Architecture documents explain how the system is designed. `PROJECT_HANDOFF.md` explains what is happening now. `CHANGELOG.md` records what was delivered. These documents should reference one another when useful, but their responsibilities should remain distinct.

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
- `PROJECT_HANDOFF.md`
- Standard project definition, planning, architecture, operations, and history documents.
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
- Current implementation state belongs in `PROJECT_HANDOFF.md`.
- AI should read the repository before proposing structural changes.
- AI should not create or modify files without approval.
- AI-generated content becomes project material only after it is written into the approved repository.

### Repository Reading Order for AI Agents

AI agents should use the repository in approximately this order:

1. Read `README.md` to understand the project entry point.
2. Read `PROJECT_HANDOFF.md` to identify the current engineering state and next priority.
3. Read `PROJECT_BRIEF.md` to confirm the project definition and scope.
4. Read the architecture and operational documents relevant to the active task.
5. Inspect the implementation before proposing or performing work.

This sequence provides current operational context without treating temporary conversation history as project truth.

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
├── README.md
├── PROJECT_HANDOFF.md
├── PROJECT_BRIEF.md
├── PROJECT_ROADMAP.md
├── SYSTEM_ARCHITECTURE.md
├── MOBILE_ARCHITECTURE.md
├── AI_ARCHITECTURE.md
├── DATA_MODEL.md
├── ARCHITECTURE_DECISIONS.md
├── DEPLOYMENT_GUIDE.md
├── OPERATIONS_RUNBOOK.md
└── CHANGELOG.md
```

Optional folders should be added as the lifecycle requires them.

## Practical Standard

A repository structure is acceptable when:

- A human can understand the project from `README.md`, `PROJECT_INDEX.md`, and the standard project documents.
- A future human or AI agent can identify the current engineering state from `PROJECT_HANDOFF.md`.
- Architecture documentation describes stable system design without duplicating operational status.
- Every top-level folder has a clear purpose.
- The repository reflects the current project truth.
- Git can trace all meaningful changes.
