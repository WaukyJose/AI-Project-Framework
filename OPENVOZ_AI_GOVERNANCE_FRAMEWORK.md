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

## 5. AI Assessment Governance

AI does:
- evaluate language evidence
- generate feedback
- assist scoring

AI does not:
- make decisions outside defined criteria
- access unrelated user data

## 6. Assessment Provenance

Each assessment should identify:

- conversation_id
- candidate evidence
- criterion evaluated
- model used
- prompt version
- assessment timestamp

## 7. Human Oversight

## 8. Privacy Principles

- Data minimisation
- Purpose limitation
- Access control
- Retention policy

## 9. Security Controls

Authentication
Authorization
Audit logging
Secrets management

## 10. Future Compliance Mapping

Possible alignment:

- GDPR
- EU AI Act
- ISO/IEC 42001
- NIST AI RMF

## 11. Governance Roadmap
Phase 1...
Phase 2...
