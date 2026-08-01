# Cambridge Assessment Engine

## Purpose

The Cambridge Assessment Engine is OpenVoz's authoritative subsystem for
evaluating a candidate's performance after a speaking task has been completed.
It converts evidence from a completed interaction into criterion-level
judgements, an overall band, confidence information, and an instructional
coaching report.

The engine is independent from both the AI Examiner and the AI Gateway. The AI
Examiner conducts the speaking interaction and controls its conversational
behavior. The AI Gateway provides model communication infrastructure. The
Assessment Engine owns assessment policy, evidence requirements, evaluation
criteria, and assessment outputs. It does not conduct the conversation or
control task progression.

The initial scope covers B2 Speaking Parts 1, 2, 3, and 4. The same boundaries
must support B1 Preliminary, A2 Key, IELTS Speaking, and TOEFL Speaking through
exam-specific assessment specifications rather than architectural redesign.

## Design Principles

- **Separation of conversation and assessment.** Conversation is completed
  before assessment begins; assessment cannot alter the recorded interaction.
- **Descriptor-driven evaluation.** Judgements are grounded in the published
  criteria and descriptors applicable to the selected exam and task.
- **Evidence-based scoring.** Every reported judgement is supported by
  observable evidence from approved assessment inputs.
- **Explainable feedback.** Scores are accompanied by concise reasons that a
  candidate or teacher can understand.
- **Extensible architecture.** Exam families, levels, task types, and future
  evidence sources are introduced through explicit specifications and
  contracts.
- **Minimal coupling.** Speaking modules provide standardized assessment inputs
  without containing scoring rules.
- **Consistent evaluation.** Equivalent evidence is treated consistently across
  sessions, while uncertainty is represented explicitly.
- **Instructional value.** Outputs guide improvement and do not merely label
  performance.
- **Privacy and proportionality.** Only evidence required for assessment is
  retained and exposed to downstream consumers.

## High-Level Architecture

```text
Speaking Task
      ↓
Completed Conversation Transcript
      ↓
Assessment Input Contract
      ↓
Cambridge Assessment Engine
      ├── Grammar & Vocabulary
      ├── Discourse Management
      ├── Pronunciation
      └── Interactive Communication
      ↓
Criterion Evidence, Bands, and Confidence
      ↓
Overall Cambridge Band
      ↓
Coaching Report
```

Exam-specific assessment specifications define the relevant criteria and
descriptors. The engine applies those specifications to normalized evidence and
returns a stable assessment report. Speaking modules, model providers, and user
interfaces consume this report without owning its assessment policy.

## Inputs

The Assessment Engine accepts a versioned, validated assessment package. Its
inputs may include:

- the complete examiner and candidate transcript;
- candidate responses with their associated examiner turns;
- task type, exam family, level, and speaking-part identifier;
- conversation metadata required to interpret the interaction;
- clarification requests and other interaction events;
- task completion and progression information;
- response timing and speaking duration, when reliable timing is available;
- audio recordings or derived speech evidence, when audio assessment is
  introduced.

Inputs distinguish recorded observations from derived evidence. Missing or
unreliable evidence must be represented explicitly and must reduce confidence
rather than be inferred or invented.

## Assessment Criteria

The initial B2 assessment profile evaluates four Cambridge speaking dimensions.
Each dimension has its own purpose, admissible evidence, criterion judgement,
and confidence level. This document defines their boundaries but does not define
a scoring algorithm.

## Grammar & Vocabulary

**Purpose.** Evaluate the candidate's control and range of grammatical forms
and their ability to select appropriate vocabulary for familiar B2 topics and
communicative purposes.

**Evidence.** Relevant transcript evidence includes grammatical accuracy,
variety of structures, lexical range, appropriacy, precision, paraphrasing, and
whether errors impede meaning. Evidence should be considered across the
completed task rather than inferred from a single isolated mistake.

**Future enhancements.** Later versions may support error-pattern analysis,
task-normalized comparisons, targeted vocabulary profiles, and longitudinal
tracking of persistent strengths and difficulties.

## Discourse Management

**Purpose.** Evaluate the candidate's ability to produce coherent, relevant,
and appropriately extended spoken contributions.

**Evidence.** Transcript evidence includes response development, organization,
cohesion, relevance, repetition, use of linking language, and the relationship
between ideas. Timing evidence may later help distinguish concise relevance
from insufficient development.

**Future enhancements.** Future assessment may incorporate reliable pause and
fluency measures, task-sensitive expectations for response length, and
longitudinal analysis of discourse development.

## Pronunciation

**Purpose.** Evaluate how effectively pronunciation supports intelligibility,
including control of individual sounds and broader phonological features such
as stress, rhythm, and intonation.

**Evidence.** A transcript alone cannot provide sufficient evidence for a full
pronunciation judgement. Text may reveal recognition failures or clarification
events, but these are indirect indicators and may have causes unrelated to
pronunciation.

**Current limitations.** Until reliable audio analysis is available, the engine
must state that pronunciation evidence is limited, avoid presenting
transcript-only inference as direct observation, and assign an appropriately
lower confidence level.

**Future enhancements.** Audio-based assessment may add intelligibility,
segmental clarity, word and sentence stress, rhythm, intonation, pace, and
pausing evidence. Audio-derived observations must remain explainable and must
be evaluated against the applicable exam descriptors.

## Interactive Communication

**Purpose.** Evaluate the candidate's ability to participate in and develop the
spoken interaction appropriately.

**Evidence.** The engine considers:

- relevance of responses to examiner questions;
- development of the interaction beyond minimal replies;
- handling of follow-up questions;
- clarification requests and the candidate's response to them;
- continuity between turns;
- responsiveness to prompts, partners, and task demands where applicable.

A clarification event is evidence, not an automatic penalty. Its meaning
depends on context, frequency, recovery, and whether the interaction continues
successfully.

**Future enhancements.** Partner-task evidence, turn-taking patterns, repair
strategies, and task-specific interaction measures may be incorporated as
supported exam formats are expanded.

## Evidence Collection

Every criterion judgement must cite observable evidence from the assessment
package. Evidence references should identify the relevant turn or event and
explain how it relates to a descriptor. The engine must distinguish strengths,
limitations, and insufficient evidence.

The engine must never return an unexplained numeric score. It must not invent
candidate behavior, infer unavailable audio properties, or use unrelated
personal information. Conflicting evidence must be represented in the
criterion explanation and reflected in confidence.

Evidence collection and scoring are separate responsibilities. Collection
organizes admissible observations; scoring interprets those observations under
the selected, versioned assessment specification.

## Assessment Output

The intended output is a structured, versioned report containing assessment
identity, task context, criterion results, overall result, coaching feedback,
and confidence information.

Each criterion follows the same conceptual structure:

```text
Criterion
  Band
  Evidence
  Strengths
  Areas for Improvement
  Confidence
```

For B2, this structure is repeated for Grammar & Vocabulary, Discourse
Management, Pronunciation, and Interactive Communication. Outputs must preserve
the distinction between observed evidence and instructional interpretation.

## Overall Band

The overall band will eventually summarize performance across the applicable
criteria according to a versioned Cambridge-aligned assessment policy. It must
be traceable to the criterion judgements, their evidence, and their confidence.

This architecture does not yet define weighting, aggregation, rounding, minimum
evidence thresholds, or treatment of low-confidence criteria. Those decisions
belong to a separately reviewed rubric and scoring specification. The engine
must not calculate an overall band until that policy is defined and validated.

## Coaching Feedback

Coaching feedback translates assessment evidence into practical learning
guidance. It is instructional rather than merely evaluative and includes:

- demonstrated strengths to retain;
- a small number of priority improvements;
- recommended practice aligned with those priorities;
- clear links between each recommendation and observed evidence.

Feedback must remain appropriate to the exam, level, and completed task. It
must not contradict criterion judgements, diagnose causes not supported by the
evidence, or overwhelm the learner with an exhaustive list of errors.

## Confidence Levels

Every criterion and overall judgement carries an evidence-confidence level:

- **High:** sufficient, consistent, directly observable evidence supports the
  judgement.
- **Medium:** useful evidence exists, but its coverage, consistency, or quality
  is limited.
- **Low:** evidence is sparse, indirect, unreliable, or unavailable for an
  important part of the criterion.

Confidence describes the strength of the available evidence, not the
candidate's ability. Pronunciation confidence will normally be lower while the
engine relies on transcripts because stress, intonation, and sound production
cannot be observed directly. Overall reporting must make material confidence
limitations visible.

## Future Architecture

### Audio Pronunciation Analysis

Introduce a governed audio-evidence source for intelligibility and phonological
features while preserving human-readable evidence and explicit confidence.

### CEFR Progression Tracking

Map comparable criterion evidence over time to supported CEFR profiles without
reducing distinct exam constructs to a single universal score.

### Candidate History

Allow authorized assessment consumers to compare completed assessments while
keeping each report reproducible under its original specification version.

### Longitudinal Performance

Identify sustained strengths, recurring difficulties, and meaningful change
across sufficient samples and comparable tasks.

### Institution Analytics

Provide aggregated, privacy-conscious insights for cohorts and programs,
subject to minimum sample sizes and appropriate access controls.

### Teacher Dashboards

Present evidence, confidence, trends, and coaching priorities in a form that
supports teacher judgement rather than replacing it.

## Implementation Roadmap

### Phase 1 — Assessment Architecture

Establish subsystem boundaries, assessment input and output contracts,
specification versioning, evidence provenance, and ownership rules.

### Phase 2 — Cambridge Rubric Integration

Represent the approved B2 criteria and descriptors as governed assessment
specifications, with traceability to their authoritative source and version.

### Phase 3 — Criterion Scoring

Introduce evidence-based criterion judgements with validation, explanations,
confidence levels, and evaluation against representative performance samples.

### Phase 4 — Overall Band Calculation

Define and validate the policy that derives an overall result from criterion
judgements, evidence sufficiency, and confidence.

### Phase 5 — Coaching Feedback

Produce concise strengths, priority improvements, and recommended practice that
remain traceable to assessment evidence.

### Phase 6 — Audio Pronunciation Assessment

Add governed audio evidence and validated pronunciation analysis while
preserving transcript-only operation when audio is unavailable.

### Phase 7 — Learning Analytics

Support candidate progression, longitudinal analysis, teacher views, and
privacy-conscious institution reporting on top of stable assessment records.

