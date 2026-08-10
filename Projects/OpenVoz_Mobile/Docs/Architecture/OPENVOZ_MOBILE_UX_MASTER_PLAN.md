# OpenVoz Mobile UX Master Plan

## Purpose

This document defines the user experience architecture for the future OpenVoz mobile application.

Its purpose is to establish the complete user journey, navigation philosophy, interaction model, information architecture, and screen relationships required to deliver OpenVoz on mobile devices without requiring major structural redesign during implementation.

This is a UX architecture specification. It defines experience structure and behavioral expectations. It does not define visual styling, interface component implementation, code structure, or framework-specific navigation code.

This document is the authority for UX journeys, navigation, screens, and interaction behavior. It does not define API contracts. API ownership remains with the relevant authoritative architecture documents, especially `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md` for speaking conversation transport and `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md` for the general mobile API catalogue.

## UX Design Principles

- **Simplicity.** Each workflow should present the minimum information and action set needed to move the learner forward.
- **Consistency.** Similar tasks should behave similarly across speaking, assessment, history, and account areas.
- **Accessibility.** Core flows should remain usable across assistive technologies, text scaling, orientation changes, and device classes.
- **Progressive disclosure.** Secondary detail should appear when needed rather than competing with the primary task.
- **Minimal cognitive load.** Users should not have to interpret backend concepts such as transcript authority or asynchronous processing mechanics to complete normal flows.
- **One primary action per screen.** Each screen should make the next intended action obvious.
- **Reuse over duplication.** Shared workflows such as sign-in, progress review, and assessment access should be reused across the application rather than rebuilt in multiple forms.
- **Fast navigation.** Users should be able to move quickly between practice, speaking, assessment history, and account areas.
- **Clear feedback.** The application should always show whether a task is loading, recording, processing, saved, pending synchronization, or failed.
- **Recovery from errors.** Users should be able to understand what failed, what remains safe, and what to do next.
- **Honest empty states.** When no learner data exists yet, show a neutral representation (such as an em dash) rather than a misleading zero-value like "0% accuracy".

## User Personas

## Cambridge B2 Student

This user is actively preparing for Cambridge B2 speaking tasks and wants structured practice, clear assessment feedback, and repeated exposure to Parts 1 through 4.

Primary needs:

- Quick access to the next relevant speaking task
- Reliable speaking and assessment workflows
- Understandable performance feedback
- Reviewable history of prior attempts

## Independent Learner

This user is studying without a teacher and relies on OpenVoz for guidance, repetition, and self-directed improvement.

Primary needs:

- Low-friction entry into practice
- Clear progress and feedback
- Subscription visibility
- Resilient recovery after interruptions

## Returning Subscriber

This user already has an OpenVoz account and expects a fast return path into active learning without repeated setup.

Primary needs:

- Persistent sign-in where permitted
- Immediate visibility of current progress
- Quick access to recent speaking or assessment activity
- Clear subscription and entitlement status

## First-Time Visitor

This user is evaluating OpenVoz for the first time and may not yet understand the full assessment workflow.

Primary needs:

- A clear first-launch path
- Simple account entry
- Understandable explanation of what the application offers
- Guided movement into the first meaningful activity

## Teacher (Future)

This future user reviews learner activity rather than completing the learner workflow directly.

Primary needs:

- Access to learner progress summaries
- Assessment history visibility
- Structured review tools

Teacher workflows are future scope and should not complicate the first learner-centered architecture.

## Primary User Journeys

The application should support a complete flow from first launch through repeated daily use.

### Journey 1 - First Launch

```text
App Launch
    ↓
Splash
    ↓
Welcome / Entry
    ↓
Login or Registration
    ↓
Session Validation
    ↓
Dashboard
```

This journey introduces the product, establishes authentication, validates account state, and lands the user on the dashboard.

Relevant API authority:

- Authentication and account APIs are defined in `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`.

### Journey 2 - Returning Daily Use

```text
App Launch
    ↓
Splash
    ↓
Session Validation
    ↓
Dashboard
    ↓
Resume Practice or Review Progress
```

This journey should minimize friction for returning users and restore the most relevant next action.

#### Dashboard Information Hierarchy

The authenticated Dashboard should answer three learner questions immediately:

1. Where am I?
2. What should I do next?
3. How am I progressing?

The Dashboard should present this information in a clear descending hierarchy:

**Welcome** → **Continue Learning** (dominant primary action) → **Your Progress** (compact metrics) → **Recent Activity** (secondary, when useful) → low-emphasis account actions where temporarily required.

##### Continue Learning

The Dashboard must present one dominant primary action — the Continue Learning card. This card should:

- be the strongest visual element on the screen
- use the OpenVoz brand surface to signal importance
- identify the learner's current program and next activity
- provide one unmistakable call-to-action
- remain architecture-neutral (the card must not permanently define itself as Part 1-specific; it should represent whatever the learner's current or next activity is)

For the present B2 First sprint, "Part 1 · Interview" may be the initial activity.

##### Progress

Progress metrics should use compact horizontal presentation rather than multiple large equal-weight cards. Candidate metrics are drawn from existing dashboard data:

- questionsAnswered
- studyMinutes
- accuracy
- streak
- correctAnswers

Metrics must not be invented. When no questions have been attempted, accuracy must show an empty/unavailable representation such as "—" rather than misleading "0%".

##### Account and Subscription

Subscription and account status must not compete visually with learning progress on the Dashboard. These concerns should be reachable through Profile and Settings rather than occupying Dashboard top-line statistics.

##### Recent Activity

Recent Activity should use a compact, learner-facing empty state when no activity exists. The duplicate "Current Program" / "Next Recommended Action" presentation should be consolidated into the dominant Continue Learning card.

##### Placeholder Features

Placeholder UI such as the Daily Goal section must not appear on the learner Dashboard until backed by real functionality.

Relevant API authority:

- General mobile APIs for authentication, profile, progress, and history are defined in `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`.

### Journey 3 - Start a Speaking Session

```text
Dashboard
    ↓
Select Exam / Task
    ↓
Speaking Introduction
    ↓
Permission Check
    ↓
Speaking Part Flow
    ↓
Session Completion
    ↓
Assessment Loading
```

This journey moves the user from intent into an active speaking session and then into assessment processing.

Relevant API authority:

- speaking conversation transport is defined in `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md`
- supporting content APIs are defined in `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`

### Journey 4 - Review Assessment

```text
Assessment Loading
    ↓
Assessment Summary
    ↓
Criterion Feedback
    ↓
Action Recommendation
    ↓
History or Next Practice
```

This journey presents the result of a completed speaking attempt and guides the learner toward the next action.

Relevant API authority:

- speaking assessment retrieval transport is defined in `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_CONVERSATION_API_SPECIFICATION.md`
- broader assessment APIs are defined in `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`

### Journey 5 - Review History and Progress

```text
Dashboard
    ↓
History
    ↓
Session Detail or Assessment Detail
    ↓
Progress Review
    ↓
Return to Dashboard or Start New Session
```

This journey helps the user inspect prior work and understand continuity over time.

Relevant API authority:

- history, assessment history, and progress APIs are defined in `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`

### Journey 6 - Manage Account and Subscription

```text
Dashboard
    ↓
Profile or Settings
    ↓
Subscription Status / Preferences
    ↓
Save or Return
```

This journey covers account-level maintenance without distracting from learning workflows.

Relevant API authority:

- account, preferences, subscription, and usage APIs are defined in `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`

## Information Architecture

The application should be organized into these functional areas:

- **Authentication** - account entry, account recovery, and session validation
- **Dashboard** - primary overview and launch point for next actions; presents a clear hierarchy of Welcome, Continue Learning (dominant primary action), compact progress metrics, and recent activity
- **Practice** - access to guided or structured learning activities outside the formal speaking flow
- **Speaking** - active speaking session entry and execution
- **Assessment** - assessment loading, summary, feedback, and result review
- **History** - prior speaking attempts and prior assessments
- **Progress** - longitudinal learner-facing progress and performance visibility
- **Subscriptions** - plan status, entitlement visibility, and usage awareness
- **Settings** - user-configurable application preferences
- **Help** - support, permissions guidance, and recovery information
- **Profile** - user identity and editable account profile

These areas should remain distinct enough to support clear user orientation, but integrated enough that the user can move from result review into the next useful learning action without excess navigation.

## Navigation Architecture

The navigation system should balance fast access to major areas with deep workflow focus during active speaking and assessment tasks.

### Navigation Philosophy

- Use persistent primary navigation for the major application areas once the user is authenticated.
- Use stack-style forward progression inside multi-step workflows such as authentication, speaking, and assessment review.
- Use modal interactions only for focused interruptions such as permission prompts, confirmation steps, and critical warnings.
- Preserve predictable back behavior so the user understands whether they are dismissing a detail view, stepping backward in a workflow, or leaving a task.
- Support deep linking into stable destinations such as assessment detail, history detail, or notification-driven entry points when those capabilities are introduced.

### Primary Navigation Model

The authenticated application should use a persistent primary navigation structure with these top-level destinations:

- Dashboard
- Practice
- History
- Profile
- Settings

Speaking and Assessment should be treated as task flows launched from the primary areas rather than as always-visible top-level destinations.

### Navigation Hierarchy

```text
Unauthenticated
  Splash
    └── Welcome / Entry
          ├── Login
          ├── Registration
          └── Password Recovery

Authenticated
  Dashboard
    ├── Practice
    ├── Speaking Introduction
    │     └── Speaking Session Flow
    │            └── Assessment Flow
    ├── History
    ├── Progress
    ├── Subscription
    ├── Help
    ├── Profile
    └── Settings
```

### Back Navigation

- Leaving a detail screen should return the user to the prior context.
- Leaving a speaking session should require explicit confirmation when progress or recording would be affected.
- Assessment summary and feedback screens should return to the source history or dashboard context rather than to an unrelated area.

### Deep Linking

Deep linking should be supported later for:

- assessment availability
- reminder-driven re-entry
- history detail
- subscription status prompts

Deep links should always resolve through session validation before exposing protected content.

## Complete Navigation Map

```text
Splash
  ↓
Welcome / Entry
  ├── Login
  ├── Registration
  └── Password Recovery
         ↓
Authenticated Session
         ↓
Dashboard
  ├── Practice Home
  │     ├── Practice Task Detail
  │     └── Practice Results
  ├── Speaking Introduction
  │     ├── Exam Selection
  │     ├── Task Preparation
  │     ├── Permission Check
  │     ├── Part 1
  │     ├── Part 2
  │     ├── Follow-up
  │     ├── Part 3
  │     ├── Part 4
  │     ├── Session Completion
  │     └── Assessment Loading
  ├── Assessment Summary
  │     ├── Criterion Detail
  │     └── Feedback Detail
  ├── History
  │     ├── Speaking History List
  │     ├── Speaking Session Detail
  │     ├── Assessment History List
  │     └── Assessment Detail
  ├── Progress
  ├── Subscription
  ├── Help
  ├── Profile
  └── Settings
```

## Screen Inventory

Every screen below belongs to at least one documented user journey.

| Screen | Purpose | Primary Actions | Entry Points | Exit Points | Dependencies | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Splash | Initialize application and validate entry conditions | Wait, continue | App launch, deep link | Welcome, Dashboard, Login | Session validation | Existing Backend Supported |
| Welcome / Entry | Explain product entry options | Login, Register, Learn More | Splash | Login, Registration | None | Future |
| Login | Authenticate user | Sign in, password recovery | Welcome, session-expired state | Dashboard, Password Recovery | Authentication APIs | Requires API Extension |
| Registration | Create account when permitted | Register, return to login | Welcome | Dashboard, Login | Authentication APIs | Future |
| Password Recovery | Recover account access | Request reset, return | Login, Welcome | Login | Password reset APIs | Future |
| Dashboard | Present next actions and progress overview with a clear visual hierarchy — welcome, dominant Continue Learning card, compact progress metrics, and recent activity | Continue learning, review progress | Splash, Login, completed tasks | All primary areas | Profile, progress, history summaries | Requires API Extension |
| Practice Home | Show available practice activities | Start practice, open task | Dashboard | Practice Task Detail, Dashboard | Content APIs | Future |
| Practice Task Detail | Explain one practice task | Start, save for later, back | Practice Home | Practice Results, Practice Home | Content APIs | Future |
| Practice Results | Show result of a practice activity | Continue, retry, dashboard | Practice Task Detail | Dashboard, Practice Home | Practice result APIs | Future |
| Exam Selection | Choose exam family, level, or task set | Select exam, continue | Dashboard, Speaking Introduction | Task Preparation, Dashboard | Content APIs | Planned |
| Speaking Introduction | Explain speaking workflow and readiness | Continue, cancel | Dashboard | Exam Selection, Dashboard | Content/task metadata | Planned |
| Task Preparation | Present task instructions and prompts | Start task, back | Exam Selection | Permission Check, Exam Selection | Content/task APIs | Planned |
| Permission Check | Confirm microphone readiness | Grant permission, retry, cancel | Task Preparation | Part 1, Help, Dashboard | Device permission state | Existing Backend Supported |
| Part 1 Speaking | Execute Part 1 interaction | Record, submit, continue | Permission Check | Part 2, exit confirm | Speaking session and turn APIs | Requires API Extension |
| Part 2 Speaking | Execute Part 2 interaction | Record, submit, continue | Part 1 | Follow-up or Part 3 | Speaking session and turn APIs | Requires API Extension |
| Follow-up Speaking | Handle follow-up interaction when used | Record, submit, continue | Part 2 | Part 3 | Follow-up API | Future |
| Part 3 Speaking | Execute Part 3 interaction | Record, submit, continue | Part 2 or Follow-up | Part 4 | Speaking session and turn APIs | Requires API Extension |
| Part 4 Speaking | Execute Part 4 interaction | Record, submit, finish | Part 3 | Session Completion | Speaking session and turn APIs | Requires API Extension |
| Speaking Exit Confirmation | Prevent accidental workflow loss | Stay, exit | Any active speaking part | Prior speaking part, Dashboard | Local session state | Existing Backend Supported |
| Session Completion | Confirm speaking attempt submission | Submit complete session, return | Part 4 | Assessment Loading, Dashboard | Conversation completion transport | Requires API Extension |
| Assessment Loading | Represent assessment processing state | Wait, background, refresh | Session Completion | Assessment Summary, Dashboard | Assessment submission/retrieval APIs | Missing |
| Assessment Summary | Present overall result | Review feedback, view history, continue learning | Assessment Loading, History | Criterion Detail, Feedback Detail, Dashboard | Assessment result API | Missing |
| Criterion Detail | Show criterion-level result detail | Next criterion, back | Assessment Summary | Assessment Summary, Feedback Detail | Assessment score API | Planned |
| Feedback Detail | Show coaching and next-step guidance | Start new practice, view history, back | Assessment Summary | Dashboard, History, Assessment Summary | Assessment feedback API | Planned |
| Speaking History List | List prior speaking attempts | Open session detail, filter, start new | Dashboard, Assessment Summary | Speaking Session Detail, Dashboard | Speaking history APIs | Planned |
| Speaking Session Detail | Show one speaking attempt | View assessment, retry, back | Speaking History List | Assessment Detail, Speaking History List | Speaking history detail API | Planned |
| Assessment History List | List prior assessments | Open assessment detail, filter | Dashboard, History | Assessment Detail, Dashboard | Assessment history APIs | Planned |
| Assessment Detail | Present one prior assessment | Review feedback, back | Assessment History List, Speaking Session Detail | Assessment History List, Speaking Session Detail | Assessment result APIs | Missing |
| Progress | Show learner progress and trends | Review history, continue learning | Dashboard | History, Dashboard | Progress APIs | Planned |
| Subscription | Show plan status and usage | Manage plan, return | Dashboard, gating prompt | Dashboard, external billing flow | Subscription and usage APIs | Requires API Extension |
| Help | Provide support and recovery guidance | View permissions help, retry actions, contact support | Dashboard, error states, permission denial | Prior context, Dashboard | Help content and error context | Future |
| Profile | Show and edit account profile | Edit profile, return | Dashboard | Dashboard | Profile APIs | Requires API Extension |
| Settings | Adjust app preferences | Save preferences, sign out, return | Dashboard | Dashboard, Login | Preferences and logout APIs | Planned |
| Notification Center | Show in-app notifications | Open item, mark read | Deep link, Dashboard | Linked destination, Dashboard | Notification APIs | Future |

### Screen Relationship Diagram

```text
Dashboard
  ├── Practice Home ──> Practice Task Detail ──> Practice Results
  ├── Speaking Introduction ──> Exam Selection ──> Task Preparation
  │        └── Permission Check ──> Part 1 ──> Part 2 ──> Follow-up? ──> Part 3 ──> Part 4
  │                                                     └───────────────────────────────> Session Completion
  │                                                                                           ↓
  │                                                                                   Assessment Loading
  │                                                                                           ↓
  │                                                                                   Assessment Summary
  │                                                                                   ├── Criterion Detail
  │                                                                                   └── Feedback Detail
  ├── Speaking History List ──> Speaking Session Detail ──> Assessment Detail
  ├── Assessment History List ──> Assessment Detail
  ├── Progress
  ├── Subscription
  ├── Profile
  ├── Settings
  └── Help
```

## Speaking Experience

The speaking experience is the core task flow of OpenVoz Mobile and should remain focused, sequential, and interruption-aware.

### Part 1

Part 1 should introduce the active speaking experience with the least friction possible.

The user experience should:

- confirm microphone readiness
- make the prompt and expected response action clear
- present one primary action to begin or submit the response
- provide visible recording state and response progress

### Part 2

Part 2 should preserve continuity from Part 1 while acknowledging that task demands may change.

The user experience should:

- make the task transition explicit
- preserve a focused single-task interface
- show whether preparation time, speaking time, or response completion matters to the workflow

### Follow-up

Follow-up should appear only when the active speaking format requires it.

The user experience should:

- treat follow-up as a continuation of the current flow
- avoid making the user feel that a separate session has begun
- preserve a clear path into the next speaking part

### Part 3

Part 3 should feel like continued progression, not a restart.

The user experience should:

- keep the learner oriented within the larger session
- preserve clear input and submission states
- support quick recovery if connectivity or audio issues occur

### Part 4

Part 4 should provide a clear final-step experience.

The user experience should:

- make it obvious that the user is finishing the speaking workflow
- reduce uncertainty around what happens next
- transition cleanly into submission and assessment processing

### Speaking Flow Requirements

Across all speaking parts, the user experience should:

- show recording state clearly
- show when content is pending upload or server acceptance
- prevent accidental destructive navigation
- recover gracefully after interruption
- avoid exposing backend or assessment internals

## Assessment Experience

The assessment experience should translate server-generated results into a learner-readable flow.

### Assessment Loading

The application should show that:

- the speaking session has ended
- assessment is being prepared or retrieved
- the user may wait, background the app where safe, or return later if the workflow permits

### Assessment Presentation

The assessment summary should provide:

- overall result visibility
- a path into criterion-level detail
- a path into feedback and recommended next actions

### Feedback

Feedback should feel actionable rather than overwhelming.

The feedback experience should:

- emphasize a small number of next steps
- keep the relationship between result and recommendation understandable
- direct the user toward the next useful action

### Progression

From the assessment experience, the user should be able to:

- review history
- continue learning
- start a new practice or speaking activity

### Retry

Retry should be offered only when the relevant backend workflow makes retry meaningful and safe.

The user experience should distinguish:

- retrying a failed retrieval
- starting a new speaking attempt
- revisiting a completed assessment

### History

Completed assessments should remain reachable from both immediate completion flows and later history review.

## Offline Experience

OpenVoz Mobile should support controlled continuity under degraded connectivity.

### No Connectivity

When the application has no connectivity, it should:

- tell the user clearly
- identify which actions are unavailable
- preserve safe local continuity where permitted

### Temporary Offline Storage

The application may temporarily store:

- local navigation and session continuity state
- queued actions that the backend permits to be synchronized later
- temporary audio artifacts pending upload where appropriate

The user experience should not imply that offline local state is already accepted by the backend.

### Synchronization

When connectivity returns, the application should:

- indicate that synchronization is in progress
- expose whether actions are pending, completed, or failed
- refresh authoritative state when uncertainty exists

### Recovery

After interrupted work, the application should restore the user to the safest useful point in the workflow, which may mean returning to a summary or recovery screen rather than dropping the user directly back into an uncertain live task.

## Notifications

Notification support is future scope, but the UX architecture should assume that notifications may later drive re-entry into the application.

Notification types may include:

- practice reminders
- subscription updates
- assessment availability

Notification-driven entry should:

- validate session state first
- route the user into a meaningful destination
- preserve context when the target content is unavailable or outdated

## Error Recovery

The user experience should respond to failure by preserving clarity, minimizing panic, and offering the next safe action.

### Network Failure

The application should:

- indicate that connectivity is unavailable or unstable
- distinguish waiting from failure when possible
- allow retry when appropriate
- protect the user from believing that unsent work is already complete

### Microphone Unavailable

The application should:

- explain that recording cannot proceed
- offer permission guidance or device troubleshooting entry
- prevent entry into a broken speaking state

### Permission Denied

The application should:

- explain what permission is required
- explain why it matters to the current task
- allow the user to retry after updating permission state

### Authentication Expired

The application should:

- explain that secure access has expired
- preserve the user's context where safe
- route the user back through authentication and then return them appropriately

### Subscription Required

The application should:

- explain which capability is gated
- show the current entitlement state
- offer a clear next action without trapping the user in a dead end

### Unexpected Server Errors

The application should:

- acknowledge that the service could not complete the action
- avoid blaming the user
- allow retry or safe return
- avoid presenting incomplete results as final

## Accessibility

Accessibility should be built into the structure of the experience.

The UX architecture should support:

- screen-reader-compatible labeling and task progression
- large text without breaking primary actions
- sufficient non-color state communication
- touch targets large enough for reliable interaction
- landscape resilience where the device and task support it
- tablet optimization without fragmenting the mental model
- voice interaction compatibility where speaking workflows rely on speech

Every critical flow should remain understandable without requiring precise visual interpretation of dense layouts.

## Tablet Experience

Tablet experience should enhance usability through space and context, not through a different product model.

On tablets, the UX may:

- show more supporting context alongside the primary task
- reduce unnecessary step transitions where adjacent context improves understanding
- improve history and progress review through broader layouts
- support better orientation for assessment feedback and comparison views

Tablet improvements should preserve:

- the same navigation hierarchy
- the same task boundaries
- the same language and progression model as phone workflows

## Future Expansion

Future experience areas may include:

- teacher tools
- analytics views
- gamification
- additional Cambridge levels
- AI tutor workflows
- personalized recommendations

These future experiences should extend the existing information architecture rather than forcing a separate parallel application model.

## Related Documents

- `Projects/OpenVoz_Mobile/Docs/Architecture/MOBILE_PLATFORM_ARCHITECTURE.md`
- `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_SYSTEM_ARCHITECTURE.md`
- `Projects/OpenVoz_Mobile/Docs/Architecture/OPENVOZ_MOBILE_API_SPECIFICATION.md`
- `Projects/OpenVoz/CAMBRIDGE_ASSESSMENT_ENGINE.md`
- `Projects/OpenVoz/ASSESSMENT_ENGINE_DECISIONS.md`
