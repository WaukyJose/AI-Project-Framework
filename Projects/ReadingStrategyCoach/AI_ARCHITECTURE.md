# Reading Strategy Coach AI Architecture

# Purpose

This document defines the role of Artificial Intelligence within Reading Strategy Coach.

It describes the intended AI capabilities, logical system components, data inputs, outputs, personalization boundaries, and safety principles. It does not select an AI provider, model, algorithm, or deployment topology unless that decision has been accepted in `ARCHITECTURE_DECISIONS.md`.

---

# AI Vision

The long-term vision is for AI to serve as an adaptive reading coach that personalizes instruction, provides relevant and understandable feedback, and continuously supports learner improvement.

AI should help learners understand reading challenges, select appropriate strategies, strengthen vocabulary, and reflect on progress. It should support educational goals without replacing learner agency, teacher judgment, or validated assessment practices.

---

# AI Principles

## Learner-Centered AI

AI behavior should support the learner's reading goals, proficiency, context, and current activity.

## Explainable Feedback

Feedback should be understandable, actionable, and connected to observable reading performance or learning activity.

## Personalization

Personalization should use approved learner information to adjust guidance while avoiding unsupported assumptions about ability or intent.

## Privacy by Design

AI features should minimize data collection, limit data sharing, and use learner information only for approved educational purposes.

## Human Oversight

Learners, teachers, and project decision-makers should retain control over educational goals, important interpretations, and the use of AI-generated guidance.

## Continuous Improvement

AI behavior should be evaluated against verified learning, safety, quality, and user-experience criteria. Improvements should be based on evidence rather than model output alone.

---

# AI Functional Areas

## Reading Comprehension Coaching

Support learners in understanding a text through appropriate questions, hints, explanations, and reflection.

## Reading Strategy Recommendations

Recommend relevant reading strategies based on the current activity, learner performance, and approved learning goals.

## Vocabulary Support

Provide contextual vocabulary explanations, practice guidance, and review recommendations.

## Personalized Feedback

Provide actionable feedback based on approved learner activity and performance information.

## Difficulty Adaptation

Adjust the challenge presented to the learner according to validated progress and performance signals.

## Progress Analysis

Interpret approved learning history to identify progress, recurring challenges, and areas requiring additional practice.

## Motivation and Engagement

Provide constructive encouragement that supports learning without misrepresenting performance.

## Learning Recommendations

Recommend suitable reading activities, strategies, or vocabulary practice based on current goals and verified learner information.

> **TODO:** Define acceptance criteria, evidence requirements, and educational review procedures for each AI functional area.

---

# AI System Components

The following diagram represents logical responsibilities rather than a finalized service or deployment topology.

```text
                         +------------------+
                         |     Learner      |
                         +--------+---------+
                                  |
                                  v
                         +------------------+
                         | Mobile           |
                         | Application      |
                         +--------+---------+
                                  |
                                  v
                         +------------------+
                         | AI Service Layer |
                         |      TODO        |
                         +--------+---------+
                                  |
         +------------+-----------+-----------+------------+
         |            |           |           |            |
         v            v           v           v            v
  +------------+ +----------+ +----------+ +----------+ +----------+
  | Reading    | |Vocabulary| |Recommend-| |Assessment| |Analytics |
  | Analysis   | | Engine   | |ation     | | Engine   | | Engine   |
  | Engine     | |          | |Engine    | |          | |          |
  +------------+ +----------+ +----------+ +----------+ +----------+
                                  |
                                  v
                         +------------------+
                         | User Profile     |
                         | Engine           |
                         +------------------+

              Prompt Management supports approved AI interactions.
```

## Prompt Management

Prompt Management defines reusable instructions, approved context, output expectations, and versioning for AI interactions.

It should remain separate from learner-facing screens and must not contain unreviewed sensitive information.

> **TODO:** Define prompt ownership, review, versioning, testing, and change-control procedures.

## AI Service Layer

The AI Service Layer provides a controlled boundary between product workflows and the selected AI capabilities.

Responsibilities include:

- Receive approved requests from application workflows.
- Apply context, validation, and safety controls.
- Route requests to approved AI capabilities.
- Normalize responses for application use.
- Represent failures without exposing provider details or credentials.

> **TODO:** Select the AI provider and define whether this boundary is implemented through backend services or another approved architecture.

## User Profile Engine

The User Profile Engine represents approved learner goals, preferences, progress, and learning history required for personalization.

> **TODO:** Define the profile model, source of truth, consent, update rules, retention, and learner controls.

## Recommendation Engine

The Recommendation Engine selects appropriate reading activities, strategies, vocabulary practice, or next steps from approved options.

> **TODO:** Define recommendation inputs, constraints, ranking behavior, explanations, and evaluation criteria.

## Reading Analysis Engine

The Reading Analysis Engine interprets approved comprehension, fluency, strategy, and activity information to support feedback.

> **TODO:** Define validated reading measures, analysis boundaries, confidence handling, and educational review.

## Vocabulary Engine

The Vocabulary Engine supports contextual explanations, practice selection, review, and vocabulary progress.

> **TODO:** Define vocabulary sources, proficiency rules, content validation, and progress measures.

## Assessment Engine

The Assessment Engine evaluates approved learner responses and reading outcomes against defined educational criteria.

> **TODO:** Define assessment methods, scoring rules, validation evidence, confidence handling, and teacher review requirements.

## Analytics Engine

The Analytics Engine provides approved measures of AI feature use, learning progress, quality, and system performance.

> **TODO:** Define analytics events, access, consent, retention, and separation between product analytics and learning assessment.

---

# AI Data Inputs

AI capabilities may use the minimum approved information required for a learning task, including:

- Current reading content.
- Learner responses.
- Reading performance.
- Vocabulary history.
- Reading speed or fluency measures.
- Comprehension scores.
- Reading strategy usage.
- Activity and progress history.
- Learning goals.
- User preferences.
- Current session context.

Each input requires a defined source, educational purpose, data classification, retention rule, and learner control.

> **TODO:** Approve the AI data inventory and define which inputs may leave the mobile device or be shared with an external service.

---

# AI Outputs

AI capabilities may produce:

- Personalized hints.
- Reading strategy recommendations.
- Vocabulary explanations and practice suggestions.
- Reading feedback.
- Adaptive difficulty recommendations.
- Progress summaries.
- Motivational feedback.
- Suggested learning activities.
- Assessment support.

Outputs should be structured for application validation and should not be presented as verified facts when uncertainty remains.

> **TODO:** Define output contracts, validation rules, confidence behavior, prohibited output, and learner-facing disclosures.

---

# Personalization Strategy

Personalization should adapt the learning experience using approved learner goals, preferences, activity history, performance, and progress.

At a high level, personalization should:

1. Use the current learning activity and available learner context.
2. Identify an approved instructional need.
3. Select suitable feedback, strategy, vocabulary practice, or next activity.
4. Explain the recommendation in learner-appropriate language.
5. Observe subsequent learner performance.
6. Update future recommendations only from validated signals.

Personalization must not depend on a specific algorithm until evaluation criteria and data requirements are approved.

> **TODO:** Define personalization rules, learner controls, cold-start behavior, evaluation measures, and override behavior.

---

# AI Safety

## Privacy

- Collect and share only data required for an approved educational purpose.
- Protect learner information throughout collection, processing, storage, and deletion.
- Do not include credentials or unnecessary personal information in AI requests or logs.

## Transparency

- Identify AI-generated feedback to learners where appropriate.
- Explain recommendations in clear language.
- Communicate uncertainty and service failure without misleading the learner.

## Bias Awareness

- Evaluate feedback and recommendations across representative learner groups and proficiency levels.
- Review systematic differences in quality, difficulty, or encouragement.
- Avoid unsupported conclusions based on learner identity or background.

## Educational Appropriateness

- Align AI behavior with approved reading objectives and proficiency levels.
- Review assessment and feedback criteria with appropriate educational oversight.
- Prevent generated guidance from silently replacing validated learning content.

## Human Control

- Allow learners to reject or move past AI recommendations.
- Preserve teacher or authorized reviewer judgment where educational decisions require it.
- Provide a process for reporting unsuitable or incorrect feedback.
- Keep acceptance of architectural and educational changes under human approval.

> **TODO:** Define the AI risk classification, safety test suite, review ownership, incident process, monitoring thresholds, and release criteria.

---

# Future AI Enhancements

Potential future capabilities include:

- Voice interaction.
- Conversational tutoring.
- Multi-language support.
- Predictive learning analytics.
- Intelligent lesson generation.
- Expanded reading fluency analysis.
- Teacher-facing AI insights.

These capabilities are not implementation commitments. Each must be validated against educational value, data requirements, safety, privacy, cost, and maintainability before adoption.

Material technology or architecture selections must be recorded in `ARCHITECTURE_DECISIONS.md`.

---

# Related Documents

- `Projects/ReadingStrategyCoach/SYSTEM_ARCHITECTURE.md`
- `Projects/ReadingStrategyCoach/MOBILE_ARCHITECTURE.md`
- `Projects/ReadingStrategyCoach/DATA_MODEL.md`
- `Projects/ReadingStrategyCoach/ARCHITECTURE_DECISIONS.md`
