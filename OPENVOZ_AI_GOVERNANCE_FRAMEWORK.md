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

## 10. Human Oversight

## 11. Privacy Principles

- Data minimisation
- Purpose limitation
- Access control
- Retention policy

## 12. Security Controls

Authentication
Authorization
Audit logging
Secrets management

## 13. Future Compliance Mapping

Possible alignment:

- GDPR
- EU AI Act
- ISO/IEC 42001
- NIST AI RMF

## 14. Governance Roadmap
Phase 1...
Phase 2...
