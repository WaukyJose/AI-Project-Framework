# OpenVoz Mobile System Architecture

## Purpose

This document defines the architecture of the future OpenVoz mobile application.

Its purpose is to describe how OpenVoz Mobile should be organized as a product-specific client of the existing OpenVoz ecosystem while preserving the boundaries, ownership rules, and reusable platform principles already established elsewhere in the AI Project Framework.

This is an architecture specification. It defines durable system structure, responsibilities, and design principles. It does not define implementation code, project scaffolding, package choices, or framework-specific screen composition.

## Vision

OpenVoz Mobile should extend the OpenVoz learning and speaking-assessment experience onto dedicated mobile devices without creating a separate product backend, a separate assessment engine, or a parallel identity system.

The mobile application should provide a mobile-first learner experience for speaking practice, assessment participation, progress review, and account continuity while remaining a client of the existing OpenVoz backend and assessment services.

The long-term goal is to make mobile delivery a first-class access path to OpenVoz while preserving server-side authority for identity, conversation state, assessment evidence, scoring, and AI-driven evaluation.

## Scope

This architecture covers the future OpenVoz mobile application as a product-specific mobile client.

It includes:

- The architectural role of the mobile client within the OpenVoz ecosystem.
- The major mobile application layers and responsibilities.
- The relationship between the mobile application and shared backend APIs.
- The reuse of the existing OpenVoz authentication and assessment subsystems.
- The architectural treatment of audio capture, offline resilience, synchronization, security, accessibility, performance, testing, and deployment stages.

It does not replace:

- The shared mobile platform architecture defined in `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_PLATFORM_ARCHITECTURE.md`
- The OpenVoz backend architecture defined in `Projects/OpenVoz/SYSTEM_ARCHITECTURE.md`
- The Cambridge Assessment Engine architecture defined in `Projects/OpenVoz/CAMBRIDGE_ASSESSMENT_ENGINE.md`
- The Assessment Engine architectural constraints defined in `Projects/OpenVoz/ASSESSMENT_ENGINE_DECISIONS.md`

## Guiding Principles

- **API-first.** The mobile application should consume stable backend APIs rather than embedding backend business logic on device.
- **Shared backend.** OpenVoz Mobile should reuse the existing Django backend as the authoritative application core.
- **Shared assessment engine.** Assessment logic, evidence interpretation, and scoring remain owned by the server-side assessment platform.
- **Mobile-first UX.** Learner workflows should be designed for handheld and tablet interaction patterns without weakening architectural boundaries.
- **Offline resilience.** Temporary device disconnection should degrade gracefully where the workflow permits it.
- **Accessibility.** Mobile workflows should support equitable access across device capabilities and user needs.
- **Reuse before duplication.** Existing OpenVoz services, data ownership rules, and architectural decisions should be reused unless a new mobile requirement justifies a separate approved design.
- **Server authority.** Identity, conversation lifecycle, transcript authority, and assessment records remain server-controlled.

## Documentation Authority Rule

Each architectural topic has exactly one authoritative document. Other documents must reference that authority rather than duplicate it.

Within the OpenVoz Mobile architecture set:

- conversation API contract authority belongs to `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md`
- Part 1 functional behavior authority belongs to `Projects/OpenVoz_Mobile/Docs/Architecture/PART_1_FUNCTIONAL_SPECIFICATION.md`
- system responsibility and ownership authority belongs to this document
- UX journey and screen authority belongs to `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_UX_MASTER_PLAN.md`
- the general non-speaking mobile API catalogue belongs to `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`

## System Context

OpenVoz Mobile is a client of the existing OpenVoz ecosystem.

Its architectural relationships are:

```text
OpenVoz Mobile Application
            ↓
      REST / JSON APIs
            ↓
   OpenVoz Django Backend
            ↓
OpenVoz Assessment Platform
            ↓
Provider Abstraction Layer
            ↓
   External AI Providers
```

Within this context:

- The mobile application presents learner workflows and captures device-side input.
- REST/JSON APIs provide the contract between the mobile client and the server.
- The Django backend remains the authoritative system for application logic, session continuity, content access, and workflow orchestration.
- The OpenVoz Assessment Platform remains the authoritative subsystem for assessment evaluation and reporting.
- External AI providers remain behind server-controlled abstractions rather than becoming direct mobile dependencies.

This boundary preserves the same trust model already present in the web-based OpenVoz system while extending the access surface to mobile devices.

## Functional Authority

OpenVoz Mobile is the mobile client of the OpenVoz platform.

The existing OpenVoz Django web application is the functional authority for:

- business rules
- speaking workflows
- assessment behavior
- session lifecycle
- API contracts

OpenVoz Mobile should maintain functional parity with the Django application unless a documented mobile-specific constraint or an approved user-experience improvement justifies a deviation.

Within that boundary, OpenVoz Mobile remains responsible for:

- native capabilities
- platform adaptation
- mobile user experience
- offline behavior where applicable
- device integration

This preserves the backend-owned functional model while allowing the mobile client to express that model appropriately on phone and tablet devices.

## High-Level Architecture

OpenVoz Mobile should be organized into five conceptual layers.

## Presentation Layer

The Presentation Layer provides the mobile user experience.

Its responsibilities include:

- Presenting authenticated and unauthenticated user flows.
- Rendering speaking, practice, assessment, review, and account interfaces.
- Capturing user actions and device input.
- Displaying progress, assessment outputs, status messages, and synchronization state.
- Adapting the experience to phone and tablet form factors.

This layer should remain responsible for user interaction, presentation state, and accessibility behavior rather than backend ownership or assessment policy.

## Application Layer

The Application Layer coordinates mobile workflows.

Its responsibilities include:

- Managing application-level state required for session continuity.
- Coordinating navigation and screen-to-screen workflow transitions.
- Applying client-side validation appropriate to the user experience.
- Coordinating offline-aware actions, retry behavior, and synchronization triggers.
- Translating user actions into service requests.

The Application Layer should not duplicate backend business rules that must remain authoritative on the server.

## Service Layer

The Service Layer provides controlled access to server-side capabilities and device-facing abstractions.

Its responsibilities include:

- Communicating with OpenVoz backend APIs.
- Managing authenticated requests and response handling.
- Abstracting audio capture, upload, playback, and future speech-related services.
- Managing synchronization queues and network-recovery behavior.
- Normalizing service errors into application-level states.

This layer should isolate external dependencies and transport concerns from the rest of the mobile application.

## Data Layer

The Data Layer manages local mobile persistence needed for continuity and resilience.

Its responsibilities include:

- Caching non-authoritative data required for responsive mobile workflows.
- Persisting queued actions pending network recovery.
- Storing temporary local artifacts such as audio drafts or session continuity state where permitted.
- Managing local invalidation and refresh behavior.

The Data Layer does not own authoritative learner identity, transcript evidence, or assessment records.

## External Services

The mobile application depends on external capabilities that remain outside the client boundary.

These include:

- The OpenVoz Django backend
- The OpenVoz assessment platform
- Authentication services already used by OpenVoz
- Future speech-recognition or audio-analysis services routed through approved abstractions
- Future AI provider integrations controlled by the backend platform

The mobile application should treat these services as dependencies to be consumed through stable contracts, not as logic to be replicated on device.

## Authentication

OpenVoz Mobile should reuse the existing OpenVoz authentication system.

Authentication architecture should preserve these principles:

- Account identity remains owned by the existing OpenVoz backend.
- Mobile sign-in should use the same underlying account and authorization model used by other OpenVoz clients.
- Authentication state on device should be represented through secure mobile session credentials rather than local identity ownership.
- Authorization decisions remain server-side.
- Session expiration, renewal, sign-out, and account access rules should remain aligned with the backend's existing identity model.

This document does not redesign authentication. It defines only that OpenVoz Mobile is an authenticated client of the established OpenVoz trust boundary.

## Navigation Architecture

OpenVoz Mobile should provide an application navigation model that supports the major learner workflows without coupling navigation structure to implementation-specific screen code.

The expected top-level navigation areas are:

- Splash
- Login
- Dashboard
- Practice
- Speaking
- Assessment
- History
- Settings
- Profile

These areas represent user-facing workflow domains rather than fixed implementation modules.

The navigation architecture should support:

- Clear entry into authenticated and unauthenticated flows.
- Predictable movement between practice, speaking, assessment, and review workflows.
- Recovery after interruption, network loss, or application backgrounding.
- Scalable expansion as future OpenVoz capabilities are added.

## Audio Architecture

Audio is a core capability of OpenVoz Mobile.

The audio architecture should support the complete mobile recording lifecycle while keeping device-specific audio APIs and provider integrations behind abstractions.

### Audio Responsibilities

The mobile client should be able to:

- Request and manage microphone access through platform-appropriate permission flows.
- Start, pause where appropriate, stop, and discard recordings in a controlled lifecycle.
- Preserve recording state across expected interruptions where the workflow allows it.
- Prepare recorded audio for upload or further backend processing.
- Play prompts, playback audio, and future assessment-related spoken outputs.

The initial shared speaking implementation should keep this lifecycle behind a capability-based client abstraction. Where an approved native audio package is not yet present, the application should surface unsupported recording state explicitly rather than inventing hidden platform behavior.

### Recording Lifecycle

The recording lifecycle should preserve a clear sequence:

1. Recording intent is initiated by the learner.
2. Device permission and readiness are validated.
3. Recording begins under client control.
4. Recording state is maintained until completion, cancellation, or interruption.
5. The recorded artifact is finalized for submission, retry, or discard.
6. Submission and server acknowledgment determine whether the recording becomes part of a durable workflow.

The device may temporarily hold audio artifacts, but authoritative assessment evidence remains governed by the backend platform.

### Speech Recognition Abstraction

Speech recognition should be treated as an abstraction, not as a hardwired mobile dependency.

This architecture should allow:

- Future use of native platform speech capabilities where appropriate
- Future use of backend-mediated recognition services
- Future substitution of one recognition strategy for another without redesigning the full application

Recognition output should remain advisory unless the backend explicitly accepts it as part of an approved workflow.

### Future Native APIs and Provider Abstraction

Native audio and speech features may vary by device platform and OS version.

The mobile architecture should therefore separate:

- Mobile audio capture responsibilities
- Optional recognition or preprocessing responsibilities
- Backend-owned transcription, assessment, and AI evaluation responsibilities

Future provider changes should be absorbed behind service abstractions rather than requiring user-interface redesign.

## Assessment Integration

OpenVoz Mobile should consume the existing OpenVoz assessment platform rather than reimplementing assessment logic.

Assessment integration should preserve the architecture already defined in:

- `Projects/OpenVoz/CAMBRIDGE_ASSESSMENT_ENGINE.md`
- `Projects/OpenVoz/ASSESSMENT_ENGINE_DECISIONS.md`

Within this model:

- The mobile client submits assessment-relevant user actions and artifacts through backend-controlled APIs.
- The backend remains responsible for conversation identity, transcript ownership, lifecycle state, and evidence integrity.
- The assessment platform remains responsible for criterion evaluation, confidence handling, and reporting outputs.
- The mobile client displays assessment results and instructional feedback as returned by the backend.

The mobile application is therefore an assessment consumer, not an assessment authority.

## Offline Strategy

OpenVoz Mobile should support controlled offline resilience rather than full offline independence.

The offline strategy should include:

- Local caching of non-authoritative content needed for continuity
- Temporary storage of user workflow state and queued actions
- Explicit handling of which actions may proceed offline and which require network confirmation
- Clear user feedback when a workflow is waiting for synchronization or server validation

Offline operation must not cause the device to become the source of truth for:

- account identity
- transcript authority
- assessment eligibility
- assessment results

Offline support should protect user continuity without weakening backend authority.

## Synchronization

Synchronization should reconcile mobile continuity with server-side authority.

The synchronization model should include:

- Queued requests for actions that could not be completed immediately
- Background synchronization where the operating system and workflow permit it
- Controlled retry after network recovery
- Explicit status tracking for pending, completed, failed, or superseded client actions

Conflict resolution should follow a server-authoritative philosophy:

- The backend remains the final authority for accepted actions and durable state.
- The mobile client may retry or refresh, but it does not resolve conflicts by rewriting server truth locally.
- Duplicate requests should be handled safely through backend-aware request design.
- Interrupted workflows should recover by reloading authoritative server state whenever uncertainty exists.

This model favors correctness and auditability over aggressive client-side merging.

## Security

Security architecture should preserve the OpenVoz trust boundary across mobile delivery.

Key security concerns include:

- reuse of the existing authentication system
- secure handling of mobile session credentials or tokens
- transport security for all client-server communication
- protection of device-stored temporary data
- privacy protection for learner identity, transcripts, recordings, and assessment outputs

The mobile architecture should assume:

- all service communication occurs over secure transport
- sensitive device storage is minimized and limited to what is operationally necessary
- local temporary artifacts are controlled and removable
- authentication state is protected according to mobile platform security expectations
- privacy-sensitive information is exposed on device only as required for the learner workflow

The mobile client must not bypass the backend trust boundary for protected assessment or identity operations.

## Performance

Performance architecture should support a responsive mobile learning experience under realistic network and device conditions.

The architecture should account for:

- startup behavior that reaches a usable state quickly
- lazy loading of non-critical content and workflows
- asset caching appropriate to recurrent mobile usage
- efficient network usage for repeated API interactions
- controlled handling of media upload and download

Performance optimization should not undermine correctness, accessibility, or backend authority.

## Accessibility

Accessibility is a first-class architectural requirement for OpenVoz Mobile.

The application should support:

- screen-reader compatible workflows
- font scaling and dynamic text resilience
- sufficient contrast and non-color-only state communication
- touch targets appropriate for phone and tablet interaction
- voice interaction support where the learning workflow depends on speech

Accessibility should be treated as part of core system behavior, not as a late-stage polish task.

## Testing Strategy

The OpenVoz Mobile architecture should support testing across multiple layers and device contexts.

### Unit Testing

Unit testing should validate isolated application logic, service behavior, data handling, and state transitions that can be verified independently.

### Integration Testing

Integration testing should validate:

- client interaction with backend APIs
- authentication continuity
- audio workflow coordination
- synchronization behavior
- assessment result retrieval and presentation

### Device Testing

Device testing should validate behavior under realistic mobile conditions across:

- Android phones
- iPhone devices
- tablets

Device testing should include differences in network quality, permissions behavior, audio handling, and interruption recovery.

## Deployment Strategy

The deployment strategy for OpenVoz Mobile should progress through controlled stages.

### Development

Early internal development should validate architectural assumptions, API contracts, and mobile workflow behavior.

### Internal Testing

Internal testing should confirm that the application behaves correctly against the shared OpenVoz backend and assessment services before wider distribution.

### Beta

Beta distribution should expose the application to broader controlled testing across representative devices, networks, and user conditions.

### Production

Production release should occur only after the mobile application, backend APIs, assessment workflows, and operational support expectations are sufficiently validated.

Deployment stages define release maturity. They do not change the core architecture.

## Future Expansion

The architecture should support future product growth without requiring a redesign of the mobile trust boundary.

Potential future expansion areas include:

- teacher-facing progress views
- analytics and reporting surfaces
- additional Cambridge levels and related assessment profiles
- controlled offline assessment workflows where evidence integrity can still be preserved
- future AI providers behind backend-controlled abstractions

Future expansion should preserve the boundaries between:

- mobile presentation and workflow orchestration
- backend application authority
- assessment subsystem authority
- provider integration responsibility

## Related Documents

- `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_PLATFORM_ARCHITECTURE.md`
- `Projects/OpenVoz_Mobile/Docs/Decisions/DECISION_LOG.md`
- `Projects/OpenVoz/SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz/CAMBRIDGE_ASSESSMENT_ENGINE.md`
- `Projects/OpenVoz/ASSESSMENT_ENGINE_DECISIONS.md`
