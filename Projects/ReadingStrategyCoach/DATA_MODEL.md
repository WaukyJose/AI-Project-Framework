# Reading Strategy Coach Data Model

# Purpose

This document defines the conceptual information managed by Reading Strategy Coach.

It describes the purpose of core entities, their relationships, the lifecycle of learning information, and privacy considerations. It does not define database tables, storage formats, field-level schemas, or a persistence technology.

---

# Design Principles

## Separation of Concerns

Keep learner identity, learning activity, content, assessment, feedback, progress, and application configuration conceptually distinct.

## Extensibility

Allow validated learning features and content types to evolve without redefining unrelated entities.

## Data Consistency

Define clear ownership and meaning for shared information so that progress, assessment, and recommendation records remain coherent.

## Privacy by Design

Collect, use, retain, and share only information required for approved educational and operational purposes.

## Scalability

Keep conceptual boundaries suitable for growth in learners, content, activities, and learning history without selecting a specific scaling technology.

## Minimal Redundancy

Avoid duplicate authoritative information. Derived summaries and reports should remain traceable to their approved source information.

---

# Core Entities

## User

Represents the learner or other authorized application participant.

Responsibilities include:

- Provide the ownership boundary for approved personal and learning information.
- Associate a participant with profiles, sessions, progress, assessments, achievements, recommendations, feedback, reports, and settings.
- Support identity-related workflows if authentication is adopted.

> **TODO:** Define supported user roles, identity requirements, account lifecycle, and whether anonymous or local-only use is permitted.

## User Profile

Represents approved information used to describe and personalize the learner's experience.

Responsibilities include:

- Represent learning goals, preferences, proficiency context, and accessibility needs.
- Provide approved context for personalization.
- Preserve learner control over editable profile information.

## Reading Session

Represents a bounded period of learner reading activity.

Responsibilities include:

- Group the passage, activities, strategies, vocabulary interactions, and assessments associated with one reading experience.
- Preserve session progress and completion state.
- Provide context for feedback and progress updates.

## Reading Passage

Represents reading content presented during a learning activity.

Responsibilities include:

- Provide the content context for reading, strategy, vocabulary, and assessment activities.
- Preserve educational classification and source information where required.
- Support approved accessibility and proficiency requirements.

> **TODO:** Define passage ownership, source attribution, licensing, proficiency classification, and content lifecycle.

## Reading Strategy

Represents an educational technique learners can study and apply during reading.

Responsibilities include:

- Describe the purpose of a reading strategy.
- Associate strategy instruction and practice with relevant activities.
- Support tracking of strategy use and learner development.

## Vocabulary Item

Represents a word, phrase, or approved vocabulary concept used in learning activities.

Responsibilities include:

- Connect vocabulary to relevant reading context.
- Support explanations, practice, and review.
- Provide the conceptual unit tracked by Vocabulary Progress.

## Vocabulary Progress

Represents a learner's development and practice history for a Vocabulary Item.

Responsibilities include:

- Summarize approved practice and performance.
- Support future review and recommendation decisions.
- Preserve traceability to relevant learning activities.

> **TODO:** Define vocabulary mastery states, evidence rules, update behavior, and retention.

## Reading Activity

Represents a structured learner interaction designed to support a reading objective.

Responsibilities include:

- Connect learning instructions, content, learner responses, and outcomes.
- Support comprehension, strategy, vocabulary, fluency, or engagement goals.
- Provide evidence for feedback, assessment, and progress.

## Assessment

Represents an evaluation of approved learner responses or reading outcomes.

Responsibilities include:

- Record the purpose and result of an evaluation.
- Connect assessment outcomes to the relevant activity or session.
- Support feedback, progress analysis, and learning recommendations.

> **TODO:** Define assessment types, scoring meaning, validation rules, confidence handling, and human review requirements.

## Achievement

Represents a validated learning or engagement milestone recognized by the application.

Responsibilities include:

- Associate recognition with defined achievement criteria.
- Support learner motivation without misrepresenting educational progress.
- Preserve the reason and learning context for an awarded achievement.

> **TODO:** Define achievement categories, award criteria, revocation behavior, and relationship to learning outcomes.

## Learning Recommendation

Represents a suggested next activity, strategy, vocabulary review, or learning action.

Responsibilities include:

- Connect a recommendation to approved learner context.
- State the educational reason for the recommendation.
- Support learner choice and future evaluation of recommendation usefulness.

## AI Feedback

Represents AI-generated guidance associated with a learner activity, assessment, or reading session.

Responsibilities include:

- Preserve the context and purpose of generated feedback.
- Distinguish AI-generated content from validated learner records.
- Support review, reporting, and quality evaluation.

> **TODO:** Define whether AI-generated content is retained, for how long, and which supporting context may be stored.

## Progress Report

Represents a summary of learner development across an approved period or set of activities.

Responsibilities include:

- Present comprehension, vocabulary, fluency, strategy, and engagement progress where supported by evidence.
- Remain traceable to source sessions, activities, and assessments.
- Support learner and approved educator review.

## Application Settings

Represents learner-controlled or application-required configuration.

Responsibilities include:

- Preserve approved preferences for the mobile experience.
- Support accessibility, content, notification, and offline behavior where adopted.
- Separate configuration from learning performance and assessment information.

> **TODO:** Define which settings are device-specific, user-specific, synchronized, or restricted by policy.

---

# Entity Relationships

The following diagram shows conceptual associations. It does not define storage ownership, cardinality, or database constraints.

```text
User
│
├── User Profile
├── Reading Sessions
├── Vocabulary Progress
├── Assessments
├── Achievements
├── Learning Recommendations
├── AI Feedback
├── Progress Reports
└── Application Settings

Reading Session
│
├── Reading Passage
├── Reading Activities
├── Reading Strategies
├── Vocabulary Items
├── Assessments
└── AI Feedback

Reading Activity
│
├── Reading Passage
├── Reading Strategies
├── Vocabulary Items
└── Assessment

Vocabulary Progress
└── Vocabulary Item

Progress Report
├── Reading Sessions
├── Vocabulary Progress
├── Assessments
└── Achievements
```

Learning Recommendations may use approved profile, progress, assessment, strategy, and vocabulary information. AI Feedback may relate to a Reading Session, Reading Activity, or Assessment.

> **TODO:** Define authoritative ownership, relationship cardinality, identity rules, and deletion behavior during logical data design.

---

# Data Lifecycle

## User Registration

If accounts are adopted, an approved registration or identity process establishes the User and associated User Profile and Application Settings.

> **TODO:** Define anonymous, authenticated, learner, and educator identity lifecycles after the authentication decision.

## Reading Session

1. The learner selects or receives a Reading Passage or Reading Activity.
2. A Reading Session groups the learner's approved activity state.
3. Strategy use, vocabulary interactions, responses, and completion are associated with the session.
4. Supported progress is preserved locally or remotely according to the approved data architecture.

## AI Analysis

1. Approved activity and learner context is prepared for an AI capability.
2. Only the minimum required information is shared through the approved AI service boundary.
3. The result is returned for application validation.
4. Retained AI Feedback is distinguished from authoritative learner and assessment information.

## Feedback Generation

Feedback may use approved Reading Activity, Assessment, Vocabulary Progress, Reading Strategy, and session context.

The application presents feedback with appropriate source, uncertainty, and learner-control behavior.

## Progress Updates

Validated activity and assessment outcomes update the relevant progress concepts. Progress Reports summarize source information without replacing it.

## Learning Analytics

Approved events and measures may support progress analysis, product quality, and educational evaluation.

> **TODO:** Define analytics purpose, consent, events, access, retention, aggregation, and separation from learner assessment.

---

# Privacy Considerations

## Personal Data

User identity and profile information must be limited to approved purposes and protected according to applicable requirements.

## Learning History

Reading sessions, activities, assessments, progress, and achievements may reveal learner performance and require appropriate access and retention controls.

## AI-Generated Content

AI Feedback and recommendations must remain identifiable as generated content. Stored prompts, context, and outputs must exclude unnecessary personal information.

## User Preferences

Application Settings and User Profile preferences should remain learner-controlled where appropriate and should not be used for unrelated purposes.

## Data Retention

> **TODO:** Define retention, deletion, export, correction, consent, account closure, and backup requirements for each data category.

Additional privacy requirements:

- Minimize collected and derived data.
- Define the purpose of each data category.
- Restrict access to approved users and services.
- Protect information in transit, at rest, and on the mobile device where applicable.
- Avoid sensitive information in logs and unapproved analytics.
- Document data shared with external AI or service providers.

---

# Future Data Extensions

The conceptual model may evolve to support validated future requirements such as:

- Social learning.
- Classroom support.
- Teacher dashboards.
- Offline synchronization.
- Multi-device synchronization.

> **TODO:** Create new conceptual entities and relationships only after these capabilities are approved. Record material persistence, ownership, privacy, and synchronization choices in Architecture Decision Records.

---

# Related Documents

- `Projects/ReadingStrategyCoach/PROJECT_BRIEF.md`
- `Projects/ReadingStrategyCoach/SYSTEM_ARCHITECTURE.md`
- `Projects/ReadingStrategyCoach/MOBILE_ARCHITECTURE.md`
- `Projects/ReadingStrategyCoach/AI_ARCHITECTURE.md`
- `Projects/ReadingStrategyCoach/ARCHITECTURE_DECISIONS.md`
