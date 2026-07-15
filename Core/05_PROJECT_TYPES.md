# Project Types

## Purpose

This document defines the standard project categories supported by the AI Project Framework and explains how the common framework adapts to different kinds of work.

The framework supports multiple project types through one shared operating model. Project type affects artifacts, outputs, and optional folders. Project type does not change governance, philosophy, lifecycle, repository-first behavior, approval rules, or Git workflow.

This document is vendor-independent.

## Design Principles

- One framework can support many project types.
- Shared governance comes before specialization.
- Reusable structure comes before custom structure.
- Project categories guide decisions; they do not create rigid silos.
- Every project type must remain repository-centered.
- AI supports project-specific work but does not own decisions.
- Additional folders must be earned by a clear need.

## Standard Project Categories

The framework initially supports these project categories:

1. Books
2. Research Papers
3. Software Applications
4. Mobile Applications
5. Websites
6. Data Science / NLP Projects
7. Educational Resources and Courses

Mixed projects are allowed. A project may belong to more than one category. When categories overlap, the human decides the primary type.

## Shared Framework Elements

All project types use the same:

- Governance model.
- Framework philosophy.
- Project lifecycle.
- Repository structure rules.
- AI workflow.
- Approval protocol.
- Git workflow.
- `README.md`.
- `PROJECT_INDEX.md`.
- Repository as source of truth.

Project type customizes the work, not the rules.

## Project Type Format

Each project type should be understood through:

- Characteristics
- Recommended repository additions
- Typical outputs
- Typical AI responsibilities
- Typical human responsibilities

## Books

### Characteristics

Books are long-form written works. They are often chapter-based and may involve research, outlines, drafts, revisions, and publication materials.

### Recommended Repository Additions

- `Docs/` for outlines, notes, and manuscript planning.
- `Research/` when source material is significant.
- `Outputs/` for draft exports, final manuscripts, or publishing packages.

### Typical Outputs

- Book outline.
- Chapter drafts.
- Research notes.
- Revision plans.
- Manuscript exports.
- Publication-ready files.

### Typical AI Responsibilities

- Help structure the book.
- Draft outlines and chapter plans.
- Summarize research.
- Identify gaps or inconsistencies.
- Help revise approved text.

### Typical Human Responsibilities

- Define thesis, audience, voice, and scope.
- Approve structure and drafts.
- Make editorial decisions.
- Verify factual claims.
- Approve final manuscript.

## Research Papers

### Characteristics

Research papers are evidence-based, argument-driven, or experimental written works. They require clear research questions, methods, sources, analysis, and citations.

### Recommended Repository Additions

- `Research/` for sources, notes, and literature review.
- `Docs/` for paper outline, methods, and drafts.
- `Outputs/` for submitted or exported versions.
- `Decisions/` if methodology choices need tracking.

### Typical Outputs

- Research question.
- Literature notes.
- Methodology description.
- Draft paper.
- Tables or figures.
- Submission-ready paper.

### Typical AI Responsibilities

- Help refine research questions.
- Summarize sources.
- Compare arguments.
- Identify missing evidence.
- Draft outlines or sections after approval.
- Help check clarity and structure.

### Typical Human Responsibilities

- Select research direction.
- Verify sources and citations.
- Approve methodology.
- Interpret findings.
- Own academic judgment and final claims.

## Software Applications

### Characteristics

Software applications are functional systems built from code. They may include backend, frontend, APIs, tests, documentation, and deployment workflows.

### Recommended Repository Additions

- `Docs/` for requirements, architecture, and technical notes.
- `Tools/` if helper scripts are needed.
- `Outputs/` only for generated deliverables or release artifacts.
- Project-specific code folders as approved by the human.

### Typical Outputs

- Source code.
- Application documentation.
- Tests.
- Configuration files.
- Build or release artifacts.
- Deployment notes.

### Typical AI Responsibilities

- Inspect existing code before changes.
- Propose implementation steps.
- Write approved code changes.
- Add or update tests when appropriate.
- Explain risks and tradeoffs.
- Keep documentation synchronized.

### Typical Human Responsibilities

- Approve features and architecture.
- Review functionality.
- Decide tradeoffs.
- Verify test results.
- Commit and push accepted work.

## Mobile Applications

### Characteristics

Mobile applications are software applications designed for mobile devices. They may include platform-specific constraints, UI flows, device permissions, app store requirements, and responsive interaction patterns.

### Recommended Repository Additions

- `Docs/` for product requirements, screen flows, and platform notes.
- `Assets/` for images, icons, and design resources when needed.
- `Tools/` for build or release helpers when needed.
- Project-specific app folders as approved.

### Typical Outputs

- Mobile app source code.
- Screen flow documentation.
- UI assets.
- Test results.
- Build artifacts.
- Release notes.

### Typical AI Responsibilities

- Help design flows and implementation steps.
- Modify approved code.
- Keep UI behavior consistent with requirements.
- Surface platform-specific risks.
- Help document setup, testing, and release steps.

### Typical Human Responsibilities

- Approve product direction and user experience.
- Decide supported platforms.
- Review builds on real or simulated devices.
- Approve permissions, publishing, and release decisions.

## Websites

### Characteristics

Websites are web-based experiences such as landing pages, dashboards, portals, documentation sites, or interactive tools. They may include design, content, frontend code, backend services, hosting, and analytics.

### Recommended Repository Additions

- `Docs/` for content strategy, requirements, sitemap, or design notes.
- `Assets/` for images, media, and brand resources.
- `Outputs/` for exports or release packages when relevant.
- Project-specific website folders as approved.

### Typical Outputs

- Website source code.
- Content drafts.
- Design notes.
- Pages or components.
- Deployment notes.
- Published site artifacts.

### Typical AI Responsibilities

- Propose structure and implementation plan.
- Draft approved content.
- Build approved pages or components.
- Check layout, responsiveness, and accessibility where possible.
- Keep documentation and index synchronized.

### Typical Human Responsibilities

- Approve audience, message, design direction, and content.
- Review site behavior.
- Decide hosting and publication.
- Verify final user-facing experience.

## Data Science / NLP Projects

### Characteristics

Data Science / NLP projects involve datasets, analysis, modeling, evaluation, language processing, or computational experiments. They require attention to data provenance, reproducibility, metrics, and interpretation.

### Recommended Repository Additions

- `Research/` for source notes and methodology.
- `Docs/` for experiment plans, data notes, and findings.
- `Outputs/` for reports, charts, model outputs, or exported results.
- `Tools/` for scripts or notebooks when approved.
- Data folders only when needed and explicitly governed.

### Typical Outputs

- Dataset notes.
- Analysis scripts or notebooks.
- Experiment logs.
- Evaluation metrics.
- Visualizations.
- Final report or model artifacts.

### Typical AI Responsibilities

- Help define analysis plans.
- Write approved scripts or notebooks.
- Explain methods and metrics.
- Identify data quality issues.
- Summarize findings.
- Document reproducibility steps.

### Typical Human Responsibilities

- Approve data sources and methods.
- Verify assumptions.
- Interpret results.
- Decide ethical and practical constraints.
- Approve final conclusions.

## Educational Resources and Courses

### Characteristics

Educational resources and courses are teaching-oriented materials such as syllabi, lesson plans, exercises, assessments, workshops, or full courses. They require learning objectives, audience awareness, sequencing, and evaluation.

### Recommended Repository Additions

- `Docs/` for curriculum plans, lesson outlines, and instructor notes.
- `Templates/` for reusable lesson, assessment, or activity formats.
- `Examples/` for sample completed lessons or exercises.
- `Outputs/` for final course packs, slides, handouts, or exports.

### Typical Outputs

- Course outline.
- Learning objectives.
- Lesson plans.
- Exercises.
- Assessments.
- Instructor guides.
- Student-facing materials.

### Typical AI Responsibilities

- Help structure curriculum.
- Draft lesson plans and activities.
- Align materials with learning objectives.
- Suggest examples, exercises, and assessment formats.
- Help revise for clarity and audience level.

### Typical Human Responsibilities

- Define learners, goals, and constraints.
- Approve pedagogy and sequencing.
- Verify accuracy and appropriateness.
- Review final teaching materials.

## Mixed or Evolving Projects

Some projects span categories or change category over time.

- Choose a primary project type for organization.
- Record secondary types when useful.
- Do not duplicate folder structures for each type.
- Use the shared repository architecture first.
- Add category-specific folders only when needed.
- Reassess project type when scope changes.

## Customization Rules

Project-specific customization is allowed when:

- The need is clear.
- Existing folders are insufficient.
- The human approves the change.
- The folder or artifact has a defined purpose.
- `PROJECT_INDEX.md` is updated when needed.
- The customization does not override governance, philosophy, lifecycle, repository structure, or AI workflow.

## Practical Standard

A project type is properly applied when:

- The project category helps clarify artifacts and outputs.
- The shared framework rules still govern the work.
- Required and optional repository additions are justified.
- Human and AI responsibilities are clear.
- The repository remains understandable from `README.md` and `PROJECT_INDEX.md`.
- The project can evolve without creating parallel structures.
