# Reading Strategy Coach System Architecture

# Purpose

This document describes the high-level architecture of Reading Strategy Coach.

It defines the intended system boundaries, major component responsibilities, data flow, external integration points, and non-functional requirements. Technology selections are included only when they have been accepted in `ARCHITECTURE_DECISIONS.md`.

---

# System Overview

Reading Strategy Coach is an AI-powered mobile learning platform focused on reading comprehension, vocabulary acquisition, reading fluency, and strategic reading.

The platform is intended to provide interactive reading activities, personalized coaching, reading strategy training, progress tracking, and learner engagement features through a mobile application.

React Native and Expo are the confirmed mobile development technologies. Backend, data, AI provider, authentication, storage, analytics, and production infrastructure decisions remain under evaluation.

---

# High-Level Architecture

The architecture is organized around the mobile learning experience and the services required to support content, learner data, AI capabilities, and progress measurement.

```text
                    +----------------------+
                    |  Mobile Application  |
                    | React Native + Expo  |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |  Application Layer   |
                    | Mobile Workflows and |
                    | Learning Experience  |
                    +----------+-----------+
                               |
             +-----------------+-----------------+
             |                 |                 |
             v                 v                 v
    +----------------+ +----------------+ +----------------+
    |  AI Services   | | Backend        | | External APIs  |
    |     TODO       | | Services TODO  | |     TODO       |
    +----------------+ +-------+--------+ +----------------+
                              |
               +--------------+--------------+
               |              |              |
               v              v              v
       +--------------+ +--------------+ +--------------+
       | Database     | | Cloud Storage| | Analytics    |
       | TODO         | | TODO         | | TODO         |
       +--------------+ +--------------+ +--------------+

       Authentication: TODO — architecture and placement undecided
```

The diagram represents intended component responsibilities, not a finalized deployment topology.

---

# Major Components

## Mobile Application

The Mobile Application provides the learner-facing experience.

Responsibilities include:

- Present reading content and learning activities.
- Support reading strategy and vocabulary practice.
- Manage learner navigation and local settings.
- Display progress, feedback, recommendations, and achievements.
- Support planned offline behavior after synchronization requirements are defined.

The mobile application uses React Native with Expo. Supported platforms, Expo workflow, and native integration requirements require verification.

## Application Layer

The Application Layer coordinates mobile workflows and separates the learner interface from data, AI, and external-service interactions.

Responsibilities include:

- Coordinate reading sessions and learning activities.
- Apply client-side workflow and presentation rules.
- Route requests to approved service interfaces.
- Manage local application state.

> **TODO:** Define the boundary between mobile application logic and future backend responsibilities.

## AI Services

AI Services are intended to support the AI Reading Coach, personalized recommendations, vocabulary assistance, and reading feedback.

Responsibilities are expected to include:

- Process approved learner context.
- Generate reading guidance and feedback.
- Support vocabulary and reading-strategy assistance.
- Return responses for evaluation and presentation by the application.

> **TODO:** Select the AI provider and define service boundaries, evaluation requirements, safety controls, privacy requirements, and failure behavior.

## Backend Services

Backend Services would provide server-side capabilities that cannot or should not execute in the mobile application.

> **TODO:** Determine whether a backend is required and define its responsibilities, interfaces, runtime, deployment model, and operational ownership.

## Database

The Database would provide persistent storage for approved learner, content, progress, and application data.

> **TODO:** Define the data model, persistence requirements, database technology, retention rules, and offline synchronization relationship.

## Cloud Storage

Cloud Storage would store approved files or media that should not be packaged with or retained only on the mobile device.

> **TODO:** Define storage use cases, data classification, access rules, retention, and provider requirements.

## Analytics

Analytics would measure approved learner activity, progress, application performance, and learning outcomes.

> **TODO:** Define analytics audiences, events, metrics, consent requirements, retention rules, and technology selection.

## Authentication

Authentication would identify users and protect access to learner data if accounts are included in the approved product scope.

> **TODO:** Decide whether authentication is required and define identity, authorization, session, consent, and account-recovery requirements.

## External APIs

External APIs would provide approved capabilities that are not implemented within the mobile application or project-controlled services.

> **TODO:** Identify required runtime APIs only after their use cases, data flows, reliability needs, and security constraints are validated.

---

# External Integrations

## Confirmed

- **Expo:** Confirmed as the development platform for the React Native mobile application.

> **TODO:** Document which Expo development, build, update, notification, or distribution services are adopted after those decisions are approved.

## Under Evaluation

- AI provider and AI service APIs
- Authentication provider
- Backend platform
- Database service
- Cloud storage provider
- Analytics service
- Push notification service
- Content or educational APIs

No runtime external integration should be treated as selected until it is recorded in `ARCHITECTURE_DECISIONS.md`.

---

# Data Flow

The intended high-level flow is:

1. A learner starts a reading activity in the Mobile Application.
2. The Application Layer manages the activity and required local state.
3. The application retrieves approved content from local or remote sources.
4. When AI support is requested, approved context is sent through the selected AI service boundary.
5. AI feedback or recommendations are evaluated and presented to the learner.
6. Reading activity and progress data are stored according to the approved data architecture.
7. Approved analytics events are recorded according to consent, privacy, and retention requirements.
8. When offline support is enabled, local changes are synchronized according to the future synchronization design.

> **TODO:** Finalize this flow after backend, authentication, data, AI, analytics, and offline synchronization decisions are accepted.

---

# Non-Functional Requirements

## Performance

- Mobile interactions should remain responsive during reading and vocabulary activities.
- Network-dependent workflows should provide clear progress and failure states.
- AI response and content-loading targets must be measurable.

> **TODO:** Define performance budgets and response-time targets.

## Scalability

- Service boundaries should allow capacity to evolve with validated learner demand.
- Data and external-service usage should be measurable before scaling decisions are made.

> **TODO:** Define expected user volume, activity volume, and capacity targets.

## Reliability

- Core learning workflows should handle unavailable network and external services predictably.
- Learner progress should not be lost during recoverable application or network failures.
- Recovery and synchronization behavior should be testable.

> **TODO:** Define availability, recovery, backup, and synchronization requirements.

## Security

- Protect learner information in transit, at rest, and during local storage where applicable.
- Limit data access to approved users and services.
- Keep credentials and service secrets outside distributed mobile application code.
- Minimize data shared with external services.

> **TODO:** Define data classification, threat model, authentication controls, privacy requirements, and security review criteria.

## Maintainability

- Keep component responsibilities explicit.
- Isolate external integrations behind defined interfaces.
- Record material technology choices in Architecture Decision Records.
- Keep architecture, deployment, and operational documentation consistent with implemented behavior.

> **TODO:** Define maintainability measures and ownership after the implementation structure is established.

---

# Future Architecture

The architecture is expected to evolve incrementally as requirements and technology evaluations are validated.

Future architectural work may include:

- Defining backend and service boundaries.
- Selecting data persistence and storage approaches.
- Defining authentication and authorization.
- Selecting and evaluating an AI provider.
- Defining analytics and progress measurement.
- Designing offline persistence and synchronization.
- Defining push notification requirements.
- Establishing cloud infrastructure, deployment, monitoring, and operations.

These items are areas for evaluation, not implementation commitments. Each material selection must be documented through an Architecture Decision Record before it becomes part of the accepted architecture.

---

# Related Documents

- `Projects/ReadingStrategyCoach/PROJECT_BRIEF.md`
- `Projects/ReadingStrategyCoach/PROJECT_ROADMAP.md`
- `Projects/ReadingStrategyCoach/MOBILE_ARCHITECTURE.md`
- `Projects/ReadingStrategyCoach/AI_ARCHITECTURE.md`
- `Projects/ReadingStrategyCoach/DATA_MODEL.md`
- `Projects/ReadingStrategyCoach/ARCHITECTURE_DECISIONS.md`
