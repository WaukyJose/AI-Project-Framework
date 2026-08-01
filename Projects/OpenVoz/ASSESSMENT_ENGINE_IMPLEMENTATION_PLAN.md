# Assessment Engine Implementation Plan

## Purpose

This document is the authoritative implementation roadmap for the OpenVoz
Cambridge Assessment Engine. It translates the responsibilities and boundaries
defined in `CAMBRIDGE_ASSESSMENT_ENGINE.md` into independently deliverable
phases. Each phase establishes a stable baseline for the next and must be
accepted before dependent work begins.

The architecture specification defines what the Assessment Engine is and the
principles it must preserve. This plan defines how OpenVoz will introduce that
architecture without disrupting working speaking experiences.

The Assessment Engine remains distinct from:

- the **AI Gateway**, which supplies model communication infrastructure but
  does not own assessment policy;
- the **speaking modules**, which conduct and record interactions but do not
  score candidate performance;
- **assessment profiles**, which describe the criteria and policies of a
  particular examination while leaving the engine profile-independent.

The first profile will support Cambridge B2 Speaking Parts 1–4. Later profiles,
including Cambridge B1, Cambridge A2, IELTS, and TOEFL, must be introduced
without redesigning the core engine.

## Guiding Principles

- **Incremental implementation.** Introduce one bounded capability at a time
  and accept it before expanding scope.
- **Preserve working code.** Existing speaking flows remain operational while
  assessment responsibilities move behind explicit boundaries.
- **Small independent milestones.** Every phase produces useful, testable
  artifacts and has clear entry and exit conditions.
- **Test-driven changes.** Characterize current behavior first, then verify new
  contracts, evidence handling, and assessment outcomes.
- **Backward compatibility.** Existing public routes, response contracts, and
  stored interactions change only through separately approved migrations.
- **Explainable AI.** Every assessment judgement is linked to observable
  evidence and an applicable descriptor.
- **Cambridge descriptor fidelity.** Assessment profiles preserve the meaning,
  scope, and version of their authoritative descriptors.
- **Explicit uncertainty.** Missing or indirect evidence lowers confidence; it
  is never silently replaced by inference.
- **Stable ownership boundaries.** Conversation, assessment policy, model
  transport, and presentation remain separate responsibilities.
- **Profile independence.** Core orchestration does not contain assumptions
  unique to one examination or level.

# System Overview

```text
Speaking Module
      ↓
Conversation Transcript Builder
      ↓
Assessment Context
      ↓
Assessment Engine
      ↓
Assessment Profile
      ↓
Criterion Evaluation
      ↓
Overall Band
      ↓
Coaching Report
      ↓
User Interface
```

The speaking module completes an interaction and supplies recorded turns and
events. The Transcript Builder converts those records into a consistent,
immutable transcript. The Assessment Context combines the transcript with task
identity and relevant metadata. The Assessment Engine coordinates evaluation
under a selected profile. Criterion results feed a separately governed overall
band policy and coaching report. Presentation layers consume the final report
without recalculating it.

# Core Components

## Transcript Builder

### Purpose

Produce a normalized, ordered account of the completed speaking interaction
that is suitable for assessment and independent of any browser or view format.

### Inputs

- recorded examiner turns;
- recorded candidate turns;
- turn ordering and speaker identity;
- task and conversation events;
- available timestamps and completion status.

### Outputs

A versioned transcript containing ordered turns, stable evidence references,
speaker roles, task boundaries, and explicit indications of missing or invalid
source material.

### Responsibilities

- preserve the meaning and order of the original interaction;
- distinguish examiner, candidate, and system-generated content;
- assign stable references for later evidence citation;
- represent clarification and progression events without interpreting scores;
- validate structural completeness;
- avoid rewriting, summarizing, or correcting candidate language.

### Future Extensions

The builder may later align audio segments, timestamps, partner turns, speech
recognition confidence, and multimodal task events with transcript evidence.
These additions must not invalidate existing transcript versions.

## Assessment Context

The Assessment Context is the complete, validated information package supplied
to an assessment. Every context includes:

- task identifier;
- examination profile and version;
- speaking part;
- candidate transcript;
- examiner transcript;
- conversation metadata;
- clarification attempts;
- response count;
- average response length;
- task completion information;
- future pronunciation metrics, with provenance and confidence;
- future timing metrics, with provenance and confidence.

The context defines what evidence is available, not what that evidence means.
It must separate source observations from derived metrics, identify missing
information, protect learner data, and remain reproducible for a given
assessment version. It must contain only information relevant and authorized
for assessment.

## Assessment Engine

The Assessment Engine coordinates assessment after the speaking interaction is
complete. It validates the context, resolves the approved assessment profile,
requests criterion evaluations, verifies evidence references, applies the
approved overall-band policy, and assembles the final report.

It does not ask examiner questions, progress the conversation, authorize user
access, construct provider-specific requests, or define examination
descriptors. It may use the AI Gateway for approved evaluation capabilities,
but transport and model selection remain Gateway responsibilities.

The engine must produce stable failure states when evidence, profiles, or
criterion results are incomplete. A failed assessment must not modify the
completed transcript or speaking state.

## Assessment Profiles

An Assessment Profile supplies the exam-specific meaning required by the
profile-independent engine. It identifies applicable tasks and criteria,
descriptor versions, evidence expectations, permitted confidence rules,
criterion result requirements, and the approved overall-band policy.

Initial and future profiles may include:

- Cambridge B2 First;
- Cambridge B1 Preliminary;
- Cambridge A2 Key;
- IELTS Speaking;
- TOEFL Speaking.

Profiles must be versioned, reviewable, and traceable to authoritative sources.
They cannot alter engine orchestration or provider infrastructure. Differences
between examination systems are expressed through profile contracts and
policies rather than conditionals embedded throughout speaking modules.

# Implementation Phases

## Phase 1 — Transcript Builder

### Purpose

Establish a reliable assessment record from completed B2 speaking interactions.

### Objectives

- define the normalized transcript contract;
- map existing Part 1–4 interaction records into ordered turns;
- represent speakers, task boundaries, clarification events, and completion;
- provide stable evidence references;
- preserve candidate language without correction or interpretation.

### Deliverables

- approved transcript schema and versioning policy;
- Part 1–4 transcript mapping specifications;
- transcript validation rules;
- characterization and contract test coverage;
- documented handling of incomplete source interactions.

### Dependencies

- current speaking-flow characterization;
- authoritative identification of existing conversation records and state;
- agreed privacy and retention boundaries.

### Acceptance Criteria

- equivalent completed interactions produce equivalent normalized transcripts;
- every candidate and examiner turn has an unambiguous role and stable reference;
- no prompt, view, or speaking behavior changes;
- incomplete records produce explicit validation outcomes;
- Part 1–4 transcript contracts pass representative and boundary tests.

### Testing Strategy

Use captured, anonymized interaction shapes; ordering and role-assignment tests;
missing-turn and malformed-state tests; and compatibility tests against current
Part 1–4 behavior. Tests must verify that learner language is not rewritten.

### Future Considerations

Reserve compatible fields for timestamps, audio alignment, partner turns, and
speech-recognition provenance without requiring those inputs initially.

## Phase 2 — Assessment Context

### Purpose

Create the stable boundary between completed speaking interactions and all
assessment profiles.

### Objectives

- define required and optional context information;
- derive non-evaluative metadata consistently;
- distinguish observed data from derived measures;
- validate task identity, profile selection, and evidence availability;
- establish privacy, versioning, and reproducibility requirements.

### Deliverables

- approved Assessment Context contract;
- context construction rules for B2 Parts 1–4;
- definitions for response count, average response length, and clarification
  events;
- validation and failure classifications;
- context-level contract and privacy tests.

### Dependencies

- accepted Phase 1 transcript contract;
- stable task identifiers for B2 Parts 1–4;
- approved data-minimization requirements.

### Acceptance Criteria

- every supported completed transcript produces a valid context or a classified
  failure;
- derived metadata is deterministic and traceable to source turns;
- unavailable pronunciation and timing evidence is explicit;
- contexts contain no provider-specific configuration;
- assessment can be reproduced from the same versioned inputs.

### Testing Strategy

Test each B2 part, clarification-event counting, response metrics, missing
metadata, unsupported tasks, privacy filtering, and deterministic reconstruction.

### Future Considerations

Allow additional evidence sources and examination metadata through compatible,
versioned extensions rather than widening every speaking-module contract.

## Phase 3 — Cambridge B2 Assessment Profile

### Purpose

Represent the approved Cambridge B2 speaking criteria as a governed profile
that the engine can consume without embedding B2 policy in core orchestration.

### Objectives

- define the profile's supported tasks and four criteria;
- establish descriptor provenance and version control;
- define admissible evidence and evidence sufficiency per criterion;
- specify required criterion output fields and confidence semantics;
- document current pronunciation limitations.

### Deliverables

- reviewed Cambridge B2 profile specification;
- descriptor-to-criterion mapping;
- evidence sufficiency and confidence policy;
- validation rules for profile completeness;
- representative profile conformance tests.

### Dependencies

- accepted Assessment Context;
- approved Cambridge descriptor source and interpretation;
- educational and assessment-owner review.

### Acceptance Criteria

- the profile covers Parts 1–4 without modifying engine responsibilities;
- every descriptor and criterion is traceable and versioned;
- transcript-only pronunciation limitations are explicit;
- profile validation rejects incomplete or inconsistent definitions;
- no scoring algorithm is introduced prematurely.

### Testing Strategy

Use specification validation, descriptor traceability checks, supported-task
matrices, incomplete-profile tests, and review against representative B2 tasks.

### Future Considerations

Keep profile boundaries suitable for Cambridge B1 and A2 and for examination
families whose criteria or scoring structures differ substantially.

## Phase 4 — Criterion Evaluation Services

### Purpose

Produce evidence-supported, confidence-bearing judgements for each Cambridge B2
criterion while keeping the criteria independently testable.

### Objectives

- establish a common criterion-result contract;
- evaluate only evidence permitted by the active profile;
- require evidence references and explanations for every judgement;
- validate result completeness and band bounds;
- isolate criterion failure without fabricating a complete assessment.

### Grammar & Vocabulary

Evaluate range, control, appropriacy, precision, and the effect of errors on
meaning across the task. Avoid treating isolated mistakes as representative of
the complete performance.

### Discourse Management

Evaluate relevance, development, organization, cohesion, and repetition using
the completed response evidence and available task metadata.

### Pronunciation

Report only what supported evidence permits. Transcript-only assessment must
carry limited claims and lower confidence; unavailable phonological evidence
must not be inferred.

### Interactive Communication

Evaluate response relevance, interaction development, follow-up handling,
clarification events, recovery, and conversational continuity in context.

### Deliverables

- shared criterion-result and evidence-reference contracts;
- four independently callable criterion evaluation capabilities;
- output validation and classified failure behavior;
- reviewed representative examples and edge cases;
- consistency and regression test suites.

### Dependencies

- accepted Cambridge B2 profile;
- approved evaluation quality benchmark;
- AI Gateway assessment capability contracts where model assistance is used.

### Acceptance Criteria

- every criterion result includes a band judgement, evidence, explanation,
  strengths, improvements, and confidence;
- all cited evidence resolves to the supplied context;
- unsupported claims and unexplained scores are rejected;
- repeated evaluations meet the approved consistency threshold;
- one criterion cannot silently redefine another criterion's responsibilities.

### Testing Strategy

Combine deterministic contract tests, curated performance samples, expert
review, boundary-band cases, missing-evidence tests, adversarial learner input,
and repeated-run consistency measurement.

### Future Considerations

Permit criterion-specific evidence extensions while preserving the shared
result contract and independent evaluation boundary.

## Phase 5 — Overall Band Calculation

### Purpose

Derive an explainable overall result from accepted criterion judgements under a
separately approved Cambridge B2 policy.

### Objectives

- define aggregation, weighting, rounding, and evidence thresholds;
- specify treatment of unavailable or low-confidence criteria;
- preserve traceability from the overall band to criterion results;
- prevent presentation layers from recalculating scores.

### Deliverables

- reviewed and versioned overall-band policy;
- overall-result contract and rationale requirements;
- handling rules for partial and low-confidence assessments;
- calculation conformance and boundary tests.

### Dependencies

- accepted criterion evaluation services;
- educational approval of the aggregation policy;
- sufficient benchmark examples across relevant band boundaries.

### Acceptance Criteria

- identical accepted criterion inputs produce an identical overall result;
- every result identifies its policy version and contributing criteria;
- incomplete evidence follows an explicit outcome rather than an invented score;
- boundary and rounding behavior is documented and tested;
- results remain explainable to candidates and teachers.

### Testing Strategy

Use calculation tables, band-boundary cases, missing-criterion scenarios,
confidence variations, reproducibility tests, and independent policy review.

### Future Considerations

Different profiles may use different aggregation systems. The engine must
resolve profile policy without assuming that every exam produces a Cambridge
band.

## Phase 6 — Coaching Report Generation

### Purpose

Translate accepted assessment evidence into focused, practical guidance for the
learner.

### Objectives

- summarize demonstrated strengths;
- identify a limited set of priority areas for improvement;
- recommend practice linked to those priorities;
- order learning priorities by likely educational value;
- preserve distinction between assessment evidence and coaching advice.

### Strengths

Highlight repeatable capabilities supported by criterion evidence, not generic
encouragement disconnected from the performance.

### Areas for Improvement

Describe specific, evidence-supported development needs in clear learner-facing
language.

### Recommended Practice

Suggest feasible activities appropriate to the exam level, task, and identified
need without introducing unsupported diagnoses.

### Learning Priorities

Select a manageable sequence of improvements rather than presenting every
observed issue as equally urgent.

### Deliverables

- coaching-report contract;
- evidence-to-feedback traceability rules;
- prioritization and tone standards;
- representative learner-facing report evaluations;
- validation and regression coverage.

### Dependencies

- accepted criterion results and overall-band output;
- approved instructional feedback policy;
- learner-facing language and accessibility review.

### Acceptance Criteria

- every substantive recommendation traces to assessment evidence;
- feedback is concise, actionable, and consistent with criterion results;
- strengths and priorities are balanced and level-appropriate;
- low-confidence observations are not presented as facts;
- reports do not expose internal model or provider details.

### Testing Strategy

Use evidence-link validation, contradiction checks, expert review, readability
assessment, low-confidence cases, sparse-evidence cases, and regression samples.

### Future Considerations

Later personalization may use candidate history, but current-session evidence
and longitudinal evidence must remain distinguishable.

## Phase 7 — User Interface Integration

### Purpose

Present completed assessments clearly without moving assessment logic into the
user interface.

### Objectives

- integrate the versioned assessment report with existing speaking experiences;
- show criterion bands and overall results accessibly;
- make supporting evidence and confidence understandable;
- present strengths, improvements, and practice priorities;
- preserve current speaking flow until an assessment is complete.

### Assessment Presentation

Display task identity, assessment status, criterion summaries, overall result,
confidence, and coaching guidance from the authoritative report.

### Evidence Display

Allow users to understand the observations supporting each judgement while
protecting privacy and avoiding unnecessary exposure of internal records.

### Band Visualization

Represent criterion and overall results without implying precision unsupported
by the assessment policy or confidence level.

### Progress Reporting

Initially present the completed assessment. Later iterations may compare
compatible reports across time using explicitly versioned semantics.

### Future Teacher Dashboard Integration

Keep presentation contracts suitable for authorized teacher review, evidence
inspection, and feedback without coupling the initial learner interface to a
future dashboard.

### Deliverables

- approved presentation requirements and accessibility criteria;
- learner-facing assessment views based solely on report contracts;
- loading, unavailable, partial, and low-confidence states;
- end-to-end compatibility and usability tests.

### Dependencies

- accepted assessment and coaching report contracts;
- product, privacy, accessibility, and educational review;
- authorization requirements for assessment access.

### Acceptance Criteria

- the interface does not calculate or reinterpret assessment results;
- evidence, confidence, and coaching priorities are understandable;
- speaking interactions remain unchanged before completion;
- partial and failed assessments are represented honestly;
- accessibility and supported-device requirements pass.

### Testing Strategy

Use contract integration, accessibility, authorization, responsive presentation,
error-state, and representative end-to-end acceptance tests.

### Future Considerations

Teacher views, export, comparison, and institutional presentation should reuse
the same authoritative report rather than create parallel scoring paths.

## Phase 8 — Future Enhancements

### Purpose

Extend the accepted engine with additional evidence and learning capabilities
without weakening its core contracts.

### Objectives

- add audio pronunciation analysis;
- support candidate history and longitudinal progress;
- enable privacy-conscious institution dashboards and analytics;
- connect evidence-based priorities to adaptive practice;
- support personalized learning plans;
- refine confidence as evidence quality improves;
- introduce additional examination profiles.

### Deliverables

Each enhancement requires its own approved architecture note, bounded
implementation plan, compatibility assessment, acceptance criteria, and quality
benchmark. Phase 8 is not a single release.

### Dependencies

- stable operation of Phases 1–7;
- sufficient quality, privacy, and operational evidence;
- profile-specific educational approval;
- explicit authorization and retention policies for longitudinal data.

### Acceptance Criteria

- enhancements reuse existing engine boundaries and report contracts;
- new evidence records provenance and confidence;
- new profiles do not add exam-specific logic to core orchestration;
- analytics use comparable, versioned assessments;
- adaptive recommendations remain traceable to assessed needs.

### Testing Strategy

Define a dedicated strategy for each enhancement, including quality benchmarks,
bias and privacy review, backward compatibility, longitudinal validity, and
operational monitoring.

### Future Considerations

Potential capabilities include audio pronunciation analysis, candidate history,
longitudinal progress, institution dashboards, cohort analytics, adaptive
practice, personalized learning plans, and refined assessment confidence.

# Risks

| Risk | Architectural response |
|---|---|
| Hallucinations | Require resolvable evidence references, validate claims, and reject unsupported results. |
| Assessment consistency | Use versioned profiles, representative benchmarks, repeated-run evaluation, and explicit acceptance thresholds. |
| Pronunciation limitations | Report transcript-only limitations and low confidence until validated audio evidence exists. |
| Prompt drift | Treat assessment behavior as a versioned capability, compare quality benchmarks, and require review before change. |
| Model upgrades | Separate provider configuration from assessment policy and revalidate quality before adopting a new model. |
| Cambridge descriptor fidelity | Maintain source traceability, educational ownership, profile versioning, and expert review. |
| Explainability | Prohibit unexplained scores and require evidence, rationale, strengths, improvements, and confidence. |
| Evidence quality | Represent missing, indirect, or unreliable evidence explicitly rather than inferring observations. |
| Cross-profile coupling | Keep exam-specific descriptors and score policies inside validated profiles. |
| Privacy | Minimize assessment inputs, control access, and govern retention of transcripts, audio, and history. |

# Success Criteria

The Assessment Engine is successful when:

- supported performances receive descriptor-based assessments that meet the
  approved expert quality benchmark;
- every criterion and overall judgement is explainable through valid evidence;
- equivalent evidence produces criterion results within the approved
  consistency tolerance;
- pronunciation limitations and all material uncertainty are visible;
- completed assessments are reproducible under their recorded profile and
  policy versions;
- speaking modules integrate through a small, stable assessment boundary;
- the AI Gateway remains transport infrastructure rather than an assessment
  authority;
- criterion services, band policy, coaching, and presentation can evolve
  independently within their contracts;
- a new examination profile can be added without redesigning the engine or
  changing existing speaking modules;
- failures remain classified and never produce fabricated scores;
- learner-facing feedback is actionable, evidence-based, and appropriate to
  the selected examination level.

# Future Vision

This roadmap moves OpenVoz from isolated model-assisted scoring toward a
governed language-assessment platform. The completed engine will preserve the
natural conversational role of the AI Examiner while adding a separate,
explainable assessment capability built on stable evidence and examination
profiles.

As audio evidence, candidate history, additional exams, and learning analytics
are introduced, the same architecture can support individual practice,
teacher-guided learning, and institutional insight. OpenVoz can therefore grow
beyond a conversational chatbot into an assessment and coaching platform whose
judgements remain traceable, extensible, and educationally accountable.
