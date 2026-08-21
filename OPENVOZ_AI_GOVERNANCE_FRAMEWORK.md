# OpenVoz AI Governance Framework

Version: 1.0
Scope: Web + Mobile + AI Assessment Platform

## 1. Purpose

## 2. System Scope

OpenVoz consists of:
- Web platform
- Mobile applications
- AI speaking assessment pipeline

## 3. Data Provenance Model

Candidate interaction:

Audio
 ↓
Transcription
 ↓
Conversation state
 ↓
Assessment evidence
 ↓
Criterion evaluation
↓
Feedback

## 4. Data Categories

| Data | Purpose | Retention | Sensitivity |
|---|---|---|---|
| Audio recordings | Speaking practice | TBD | Personal data |
| Transcripts | Assessment | TBD | Personal data |
| Scores | Learning analytics | TBD | Educational record |

## 5. User Consent Management

OpenVoz stores consent state in the backend `UserConsent` model.

Supported consent types:
- `assessment_processing` - required and always enabled for speaking assessments
- `analytics` - optional
- `ai_improvement` - optional

Consent records include a `policy_version` so the app can track which governance policy was in effect when consent was captured or updated.

## 6. AI Assessment Governance

AI does:
- evaluate language evidence
- generate feedback
- assist scoring

AI does not:
- make decisions outside defined criteria
- access unrelated user data

## 7. AI Provenance

OpenVoz stores metadata-only audit events in the backend `AIUsageEvent` model.

Implemented event types:
- `assessment_requested`
- `assessment_completed`

These events record governance metadata such as:
- user
- event type
- purpose
- optional model metadata when available
- consent snapshot
- timestamp

Provenance records do not store learner content.

## 8. Assessment Provenance

Each assessment should identify:

- conversation_id
- criterion evaluated
- model used
- prompt version
- assessment timestamp

## 9. Data Protection Boundaries

Stored:
- governance metadata
- consent state
- audit events

Not stored for provenance or consent records:
- raw audio
- transcripts
- prompts
- private learner content

## 10. Data Retention and Lifecycle

OpenVoz retains data only for the period needed to support the approved product, governance, and legal purposes for which it was collected.

Retention categories:
- audio
- transcripts
- assessment records
- AIUsageEvent audit records

Retention purpose:
- support learner practice and assessment delivery
- preserve assessment and governance auditability
- maintain consent and provenance history where needed

Deletion principles:
- delete or anonymize data when it is no longer needed for its approved purpose
- apply the least-data principle when defining retention workflows
- avoid automatic deletion until a retention period is explicitly defined and approved

Retention periods must be defined before any automated deletion workflow is enabled.

## 11. Governance Monitoring

OpenVoz includes an internal staff governance dashboard for read-only monitoring of:
- total AI activity
- event counts by type and purpose
- consent summary counts
- recent metadata-only AI usage events
- governance health checks

Monitoring is metadata-only and does not expose audio, transcripts, answers, prompts, or feedback content.

## 12. Evidence Reporting

OpenVoz includes a governance report builder that composes:
- AI activity summary
- consent summary
- governance health summary

The staff export endpoint generates a CSV evidence package from this report for internal review. The export is metadata-only and is intended for governance evidence handling, not learner content review.

## 13. Human Oversight

Governance evidence is reviewed by staff through the internal dashboard and CSV export.
The review process is read-only and is limited to governance metadata, consent state, and audit health checks.

## 14. Privacy Principles

- Data minimisation
- Purpose limitation
- Access control
- Retention policy

## 15. Security Controls

Authentication
Authorization
Audit logging
Secrets management

## 16. Future Compliance Mapping

Possible alignment:

- GDPR
- EU AI Act
- ISO/IEC 42001
- NIST AI RMF

## 17. Governance Roadmap
Phase 1...
Phase 2...
