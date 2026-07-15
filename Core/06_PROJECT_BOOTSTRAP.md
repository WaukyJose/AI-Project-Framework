# Project Bootstrap

## Purpose

This document defines the standard procedure for creating a new AI Project Framework project from scratch.

Bootstrap means turning a project idea into a working repository with a clear source of truth, a local Git repository, an optional remote mirror, an AI workspace connected to repository context, required first documents, and a repeatable workflow for future sessions.

## Design Principles

- Repository before conversation.
- Start minimal, then earn complexity.
- Use one authoritative repository.
- Human approves structure before files are created.
- Git history begins early.
- AI workspace supports the repository; it does not replace it.
- Vendor-specific tools may be used, but the procedure remains portable.

## Prerequisites

Before creating the project, the human should know:

- Project name.
- Primary project type.
- Project purpose.
- Intended audience or user.
- Expected outputs.
- Whether the project needs a remote repository.
- Whether an AI workspace will be used.
- Where the local repository should live.

Required tools:

- Local filesystem access.
- Git.
- Optional remote Git hosting account, such as GitHub.
- Optional AI workspace or assistant tool.

## Bootstrap Overview

The standard bootstrap sequence is:

1. Define the project.
2. Choose the primary project type.
3. Choose the local repository location.
4. Create the local project folder.
5. Initialize Git.
6. Create the initial repository structure.
7. Write required first documents.
8. Create or connect the remote repository if needed.
9. Connect the AI workspace if used.
10. Verify the structure.
11. Make the first commit.
12. Begin the daily working workflow.

## Step 1: Define the Project

### Purpose

Capture enough project context to create the repository intentionally.

### Human Responsibilities

- Name the project.
- State the project purpose.
- Identify the primary project type.
- Define expected outputs.
- Decide whether the project is exploratory or production-oriented.

### AI Responsibilities

- Ask clarifying questions.
- Summarize the project definition.
- Identify missing decisions.
- Propose initial structure only after the project is clear.

### Repository Artifacts

No repository artifacts are required yet unless the project folder already exists.

### Exit Criteria

The human approves moving to repository creation.

## Step 2: Create the Local Repository Folder

### Purpose

Create the authoritative local folder for the project.

### Rules

- The folder name should be clear and stable.
- The folder should not duplicate an existing project.
- The local folder is the working source of truth during bootstrap.
- Avoid creating parallel versions in multiple locations.

### Expected Action

Create a local folder named after the project.

## Step 3: Initialize Git

### Purpose

Start project history immediately.

### Guidance

- Initialize Git inside the local project folder.
- Confirm the repository root is correct.
- Check status before adding files.

### Expected Outcome

- The project folder is a Git repository.
- Git can track all future meaningful changes.

## Step 4: Create Initial Repository Structure

The minimum starting structure is:

```text
ProjectName/
├── Core/
├── Archive/
├── PROJECT_INDEX.md
└── README.md
```

Recommended optional folders may be added only when justified:

```text
Docs/
Research/
Decisions/
Outputs/
Templates/
Examples/
Assets/
Tools/
```

Rules:

- Do not create folders just because they might be useful someday.
- Add optional folders only when the project type or first milestone needs them.
- Every additional folder must be earned.

## Step 5: Create Required First Documents

Required first documents:

- `README.md`
- `PROJECT_INDEX.md`
- `Core/00_PROJECT_GOVERNANCE.md`

Optional first documents, depending on project maturity:

- `Core/01_PROJECT_OVERVIEW.md`
- `Core/02_PROJECT_WORKFLOW.md`
- Project plan or milestone document.
- Project-specific requirements document.

For a framework-created project, the first documents should establish:

- What the project is.
- How the repository is organized.
- How changes are approved.
- Which lifecycle stage the project is in.
- What the next milestone is.

## Step 6: Create GitHub Repository or Remote Mirror

### Purpose

Create a remote collaboration and backup layer without replacing the local repository as source of truth during active local work.

### Guidance

- Create a remote repository only after the local repository is intentional.
- The remote should mirror accepted committed work.
- Avoid creating a separate remote with different files.
- Connect the local repository to the remote.
- Push only after the first accepted commit.

GitHub is a common remote platform. Other Git hosting platforms may be used. The framework does not require GitHub specifically.

## Step 7: Connect AI Workspace

### Purpose

Allow the AI assistant to work from the repository context.

### Guidance

- Connect the AI workspace to the authoritative repository when possible.
- Make clear which folder or repository is authoritative.
- Give the AI the framework workflow rules.
- Require the AI to read `PROJECT_INDEX.md` at the start of each session.
- AI workspace memory does not replace repository documents.

Examples:

- AI workspace connected to the repository.
- Local coding assistant pointed at the repository folder.
- IDE assistant operating in the repository root.

## Step 8: Verify Bootstrap

Verification checklist:

- Project folder exists in the intended location.
- Git is initialized in the correct folder.
- `README.md` exists.
- `PROJECT_INDEX.md` exists.
- `Core/` exists.
- `Archive/` exists.
- Governance document exists.
- Optional folders are justified.
- `PROJECT_INDEX.md` lists important active files.
- AI workspace, if used, points to the correct repository.
- No duplicate authoritative repository exists.

## Step 9: First Commit

### Purpose

Record the first accepted project state.

### Guidance

- Review Git status.
- Confirm only intended files are staged.
- Commit the initial framework structure.
- Push to remote only after the commit is accepted.
- The human commits and pushes by default unless explicitly delegated.

Suggested commit message:

```text
Initialize AI Project Framework structure
```

## Daily Working Workflow

The default daily or session flow is:

1. Read `PROJECT_INDEX.md`.
2. Confirm active milestone.
3. Inspect relevant files.
4. Discuss changes.
5. Propose scoped update.
6. Human approves.
7. AI writes approved changes.
8. AI reports changed files.
9. Human verifies with Git status.
10. Human commits.
11. Human pushes when ready.

## Common Mistakes to Avoid

- Starting in chat instead of repository files.
- Creating multiple project folders.
- Connecting the AI workspace to the wrong folder.
- Creating a remote repository before deciding the local source of truth.
- Adding too many folders too early.
- Creating templates before defining rules.
- Letting tool conventions override framework structure.
- Forgetting to update `PROJECT_INDEX.md`.
- Treating AI memory as documentation.
- Committing unreviewed AI-generated changes.

## Practical Standard

A project is successfully bootstrapped when:

- There is exactly one authoritative local repository.
- Git is initialized and tracking the project.
- The initial structure is minimal and understandable.
- Required first documents exist.
- `PROJECT_INDEX.md` is accurate.
- Optional folders are justified.
- AI workspace points to the correct repository if used.
- The first commit records the accepted starting state.
- The next milestone is clear.
