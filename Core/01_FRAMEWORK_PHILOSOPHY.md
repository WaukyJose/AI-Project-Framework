# Framework Philosophy

## Purpose

This document defines the conceptual foundation of the AI Project Framework. It explains the principles that guide how projects are created, organized, assisted by AI, reviewed, and maintained.

**Mission:** Create a durable operating system for AI-assisted research, software development, and knowledge management.

The framework exists to help humans use AI assistance without losing project clarity, ownership, or control.

## What This Framework Is

The AI Project Framework is a reusable system for managing AI-assisted projects through consistent structure, documentation, and workflows.

It is intended to provide:

- A clear repository-based source of truth.
- A repeatable way to start and manage projects.
- A shared operating model for human and AI collaboration.
- Durable documentation that survives beyond individual conversations.
- Vendor-independent guidance that can work across tools.

## What This Framework Is Not

The framework is not:

- A replacement for human judgment.
- A vendor-specific product workflow.
- A rigid methodology that every project must follow identically.
- A place for temporary notes that should live elsewhere.
- A substitute for version control, review, or explicit approval.

The framework should guide decisions, not make them automatically.

## Core Principles

### Simplicity Over Complexity

Project systems should be easy to understand, inspect, and maintain. A simple structure that is consistently used is better than a complex structure that creates confusion.

New files, folders, rules, or processes should be added only when they solve a real organizational problem.

### Reusable Before Specialized

Reusable guidance should be developed before project-specific variations. Specialized material belongs in examples, project-specific documents, or implementation notes, not in core framework rules unless it applies broadly.

### Repository Before Conversation

Project knowledge should be stored in repository documents rather than relying on conversation history.

Chats are temporary. Repositories are durable.

### Well Documented

Important decisions, structures, workflows, and expectations should be written down. Documentation should make the project easier to continue after time passes, tools change, or collaborators join.

Documentation should be direct, practical, and maintained as part of the project itself.

### Vendor Independent

The framework should not depend on one AI provider, coding assistant, hosting service, or software platform. Tools may help execute the workflow, but the repository structure and project rules should remain portable.

Vendor-specific instructions may exist when useful, but they should not replace the framework's general operating model.

### Human Remains the Decision Maker

AI may inspect, summarize, propose, draft, and implement approved changes. The human remains responsible for project direction, approval, verification, commits, and final decisions.

AI assistance should increase clarity and execution speed without weakening human control.

## Single Source of Truth

Every project has exactly one authoritative repository.

GitHub may mirror it. AI may read it. Humans may approve changes. But no parallel version should become authoritative by accident.

If a conversation and a repository file disagree, the repository should be treated as authoritative until explicitly changed through the approved workflow.

## Human and AI Collaboration Model

The framework assumes a collaborative relationship between the human and AI assistant:

- The human defines goals, approves changes, verifies outcomes, commits, and pushes.
- The AI reads repository context, identifies relevant files, proposes changes, and writes approved edits.
- Both should work incrementally, one meaningful milestone at a time.

This model keeps AI useful as an implementation and reasoning assistant while preserving human responsibility for project governance.

### Predictable AI Behavior

AI should never make structural project changes without proposing them first.

Every file modification should be explainable, reviewable, and traceable through Git.

## Repository-Centered Work

Every framework-managed project should be understandable from its repository. A new collaborator or AI assistant should be able to read the index, governance, and core documents to understand the current state of the project.

The repository should answer:

- What is this project?
- How is it organized?
- What rules govern changes?
- What stage is the project in?
- What artifacts are active, reusable, examples, or archived?

## Incremental Development

Framework development should proceed through small, approved milestones. Each milestone should have a clear purpose, limited scope, and reportable file changes.

This keeps the framework coherent and reduces the risk of creating documents, templates, or processes before their underlying rules are defined.

## Practical Standard

A framework component is useful when it helps a human or AI assistant do one or more of the following:

- Understand the project faster.
- Make a better decision.
- Reuse a proven structure.
- Avoid duplicated work.
- Preserve important context.
- Maintain consistency over time.

If a component does not support practical project work, it should be simplified, moved, or removed from the active framework.

## Framework Motto

Repository first. Human approves. AI implements. Git remembers.
