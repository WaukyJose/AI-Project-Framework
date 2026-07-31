# Assessment Engine Architecture Decisions

- **Status:** Accepted
- **Effective date:** 2026-07-31
- **Scope:** OpenVoz Assessment Engine

## Purpose

This Architecture Decision Record defines the mandatory architectural constraints for every implementation of the OpenVoz Assessment Engine. It resolves the ownership, identity, lifecycle, integrity, privacy, failure-handling, and extensibility decisions that must be settled before Phase 1 begins.

This document complements `CAMBRIDGE_ASSESSMENT_ENGINE.md`, which defines the Assessment Engine architecture, and `ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md`, which defines the delivery sequence. Those documents describe the system and its implementation; this record governs the durable decisions that implementations must preserve. If an implementation choice conflicts with this record, this record takes precedence until it is formally superseded by an accepted ADR.

---

# Decision 1 — Conversation Identity

The authoritative conversation identifier is a server-generated, globally unique, opaque, and immutable UUID representing exactly one assessment attempt.

- The server creates the identifier when it accepts a request to start a new conversation, before recording any candidate response or other assessment evidence.
- The server owns the identifier and the association between that identifier, the candidate or authorized session, the assessment profile, and the resulting records.
- The identifier itself does not expire, change, or become available for reuse. Authorization to access or continue the associated conversation may expire according to the conversation lifecycle and access policy.
- An identifier cannot be regenerated for the same attempt. A restart or new attempt receives a new identifier and retains a distinct history.
- The browser may store and return the opaque identifier for workflow continuity, but it is not trusted to create, select, modify, or establish ownership of an identifier. Every use must be resolved and authorized by the server.

**Decision:** One server-issued immutable UUID is the canonical identity of one conversation attempt for its entire lifecycle.

---

# Decision 2 — Transcript Ownership

The authoritative transcript is the ordered server-side record of accepted conversation turns associated with a conversation identifier.

- The server is the system of record for transcript content, ordering, speaker attribution, and acceptance state.
- During an active conversation, the transcript is append-only. Previously accepted turns are not edited or replaced.
- After the conversation reaches a terminal state, the transcript is immutable.
- Client-rendered text, browser memory, local storage, hidden fields, request history, and reconstructed user-interface state are derived workflow data only.
- Browser state must never be treated as assessment evidence or used to repair, override, or supplement the authoritative transcript.

**Decision:** Only the server-authoritative transcript may be submitted to or relied upon by the Assessment Engine.

---

# Decision 3 — Transcript Storage

During Phase 1, transcript data belongs in durable server-side application storage within the OpenVoz trust boundary. It must not exist solely in process memory, browser state, logs, or an external AI service.

- Each accepted turn must cross the persistence boundary into durable storage before the system represents it as recorded assessment evidence.
- Transcript storage begins when the conversation is created and continues through the applicable retention period.
- An interrupted request, process restart, or browser reconnection must not erase previously accepted turns. Recovery uses the server record associated with the existing conversation identifier and lifecycle state.
- An active conversation may be resumed only when the server confirms that it remains active and that the requester is authorized. Terminal conversations cannot be reopened or appended to.
- Phase 1 may use the application's primary durable data store. The transcript must nevertheless remain a distinct domain record with explicit identity, ordering, lifecycle state, and links to assessments.
- Storage design must permit later migration to a more scalable persistence service without changing conversation identity, transcript semantics, evidence integrity, or the Assessment Engine contract.
- Caches, replicas, analytics stores, and rendered transcript views are derived copies and never become authoritative merely because they improve scale or availability.

**Decision:** Use durable server-side application storage as the Phase 1 transcript system of record, with boundaries that preserve future storage portability.

---

# Decision 4 — Conversation Lifecycle

Each conversation is one attempt with a server-controlled lifecycle.

- **Start:** The server creates the conversation identifier, binds the selected assessment profile and version, and records the conversation as active before evidence is accepted.
- **Active:** The server accepts ordered turns while authorization and lifecycle rules remain valid. Activity may extend the operational timeout but cannot change the conversation's identity or profile.
- **Completion:** Completion is a server-recorded terminal transition. No additional turns may be added afterward.
- **Abandonment:** An explicit candidate exit or server determination that the attempt will not continue transitions the conversation to an abandoned terminal state. Its accepted evidence remains distinguishable from a completed attempt.
- **Timeout:** A conversation that exceeds the permitted inactivity or maximum-duration boundary transitions to a timed-out terminal state. A late browser request cannot reactivate it.
- **Restart:** Restarting creates a new conversation and identifier. It never clears, rewrites, or reopens the prior attempt.
- **Multiple attempts:** Multiple attempts are separate records. They may be associated with the same candidate or assessment assignment, but evidence and assessment results must never be merged implicitly.

For Part 1, the authoritative completion event is the successful server-side recording of a `Part 1 completed` lifecycle transition after the server has accepted and durably stored the final required turn. A browser navigation, client-side counter, model response, connection close, or request to complete is not itself evidence of completion.

Assessment eligibility begins only after this completion event. Abandoned, timed-out, interrupted, or otherwise incomplete conversations must not be represented as completed Part 1 attempts.

**Decision:** Conversation lifecycle transitions are explicit, terminal where applicable, and controlled and recorded by the server.

---

# Decision 5 — Assessment Evidence Integrity

Assessment evidence and assessment results are separate records with independent integrity.

- Accepted transcript turns are append-only while the conversation is active.
- A terminal transcript is immutable and is never rewritten, normalized in place, summarized in place, or edited after assessment.
- Assessment reads a stable transcript snapshot identified by conversation, completion state, and assessment profile version.
- Assessment cannot alter transcript content, ordering, attribution, identity, or lifecycle state.
- Assessment outputs are stored separately and linked to the exact evidence and profile version used.
- Reassessment creates a new assessment result; it does not overwrite the transcript or silently replace a prior result.
- Browser state, generated summaries, analytics, logs, cached views, and model-generated reconstructions are not primary evidence.
- Conversation generation and assessment evaluation remain separate responsibilities. Failure or change in one must not corrupt the records of the other.
- Any later audio-derived evidence, including pronunciation evidence, must retain its own provenance and integrity rather than being inferred from or written into the transcript.

**Decision:** The transcript is immutable source evidence after completion, and every assessment is an independently stored, traceable interpretation of that evidence.

---

# Decision 6 — Privacy and Retention

OpenVoz is the technical custodian of transcripts held by the platform; legal control, institutional ownership, candidate rights, and permitted use are determined by the applicable institutional agreement and privacy policy. Technical custody does not grant unrestricted reuse.

- Collect and retain only transcript, identity-linkage, lifecycle, and assessment data required for the stated assessment and operational purposes.
- Apply explicit, configurable retention periods rather than indefinite retention by default.
- Restrict access according to role, purpose, and institutional scope. Cross-institution access or data commingling is prohibited.
- Support deletion or irreversible anonymization when the governing retention period expires or a valid institutional or data-subject request requires it, except where a documented legal or institutional retention obligation applies.
- Deletion must address authoritative records and governed derived copies. Backups may age out under a documented recovery-retention schedule and must not be restored as active records after deletion.
- Preserve the minimum non-content audit evidence needed to demonstrate that a lifecycle or deletion action occurred, where policy permits, without retaining deleted transcript content through the audit trail.
- Keep operational telemetry logically separate from transcript evidence and assessment results. Logs and analytics must not become an unofficial transcript archive.
- Keep assessment results logically separate from transcripts so their access, retention, correction, export, and deletion policies can evolve independently.
- Record provenance and policy context sufficient to support future data access, portability, restriction, correction, and erasure workflows.

**Decision:** Privacy is governed through purpose limitation, institutional isolation, least-privilege access, configurable retention, auditable deletion, and separation of operational data, transcript evidence, and assessment results.

---

# Decision 7 — Failure Handling

The Assessment Engine fails closed with respect to evidence integrity and completion claims. It preserves valid evidence already recorded, exposes an explicit state, and never fabricates continuity or a result.

- **Transcript capture failure:** Do not acknowledge an unpersisted turn as accepted evidence. Keep the conversation active for a safe retry when possible; otherwise mark it incomplete. Never reconstruct the missing turn from browser state or model output.
- **Assessment failure:** Preserve the completed immutable transcript, record the assessment attempt as failed or unavailable, and permit a controlled retry against the same evidence and profile version. Do not alter conversation completion.
- **Unexpected conversation end:** Preserve all accepted turns and transition the attempt to an interrupted, abandoned, or timed-out state according to the recorded facts. Do not mark it complete by inference.
- **Storage unavailable:** Stop accepting evidence and do not record completion or assessment success. The service may reject or defer new work, but it must not continue with browser-only or memory-only authority.
- **Assessment cannot be completed:** Return no score or a clearly unavailable result. Partial diagnostics may be retained for operations but must not be presented as a valid assessment unless the selected profile explicitly defines a valid partial-result state.

Retries must be idempotent at the architectural boundary: they may complete missing work, but they must not duplicate accepted turns, create conflicting completion events, or silently overwrite assessment results. Operational errors must be observable without placing transcript content in logs unnecessarily.

**Decision:** Preserve committed evidence, make failure explicit and recoverable where safe, and withhold completion or assessment claims whenever their prerequisites cannot be verified.

---

# Decision 8 — Future Extensibility

The Assessment Engine is profile-independent. It evaluates authoritative evidence through a versioned assessment profile rather than embedding the rules of one examination directly into the engine.

- Cambridge B2, Cambridge B1, Cambridge A2, IELTS, TOEFL, and future schemes must be introducible as assessment profiles without redesigning conversation identity, transcript storage, lifecycle, evidence integrity, or failure handling.
- A profile defines its own eligibility rules, criteria, scales, required evidence, and result interpretation through an explicit versioned contract.
- The engine supplies common orchestration, validation, provenance, execution, and result-governance responsibilities; it does not impose profile-specific scoring semantics.
- Every assessment result identifies the profile and profile version used so later profile changes do not alter the meaning of historical results.
- Profile addition or revision must not mutate historical transcripts or reinterpret stored results silently.
- Evidence modalities that require distinct analysis, including future pronunciation or audio assessment, remain separate subsystems connected through defined evidence contracts.

**Decision:** Assessment schemes are versioned plug-in profiles over a stable, profile-neutral Assessment Engine contract.

---

# Non-Goals

The Assessment Engine will not:

- Conduct conversations or manage conversational turn generation.
- Generate examiner questions, follow-up questions, or candidate prompts.
- Modify, improve, translate, paraphrase, complete, or correct candidate responses.
- Treat browser state as transcript or assessment evidence.
- Replace, bypass, or absorb the AI Gateway or its provider-integration responsibilities.
- Teach, coach, hint, or provide formative intervention while performing an assessment.
- Decide candidate identity, authentication, enrollment, or institutional authorization policy.
- Merge evidence or scores across attempts unless a future assessment profile explicitly defines an independently approved aggregation process.
- Infer pronunciation or other audio characteristics from text transcripts.
- Serve as the system of record for operational analytics, learning content, or conversation-generation state.

---

# Approved Architectural Decisions

| Area | Decision |
| --- | --- |
| Conversation ID | Server-generated, globally unique, immutable UUID for one attempt |
| Identifier trust | Browser may carry an opaque ID but cannot create, modify, or authorize it |
| Transcript authority | Server-side ordered record is the sole authoritative transcript |
| Active transcript | Append-only |
| Completed transcript | Immutable |
| Phase 1 storage | Durable server-side application storage |
| Browser state | Workflow only; never assessment evidence |
| Part 1 completion | Explicit server-recorded transition after final evidence is durably stored |
| Restart and multiple attempts | New identifier and separate evidence for every attempt |
| Assessment | Independent, traceable result linked to fixed evidence and profile version |
| Failure behavior | Fail closed; preserve committed evidence and never fabricate completion or scores |
| Privacy and retention | Purpose-limited, institutionally isolated, configurable, and deletion-capable |
| Assessment profiles | Versioned plug-in architecture over a profile-independent engine |
| Future pronunciation | Separate evidence and analysis subsystem |
