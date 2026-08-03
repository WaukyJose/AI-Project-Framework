# Part 1 Functional Specification

## Purpose

This document describes the existing OpenVoz Django web application behavior for Cambridge B2 First Speaking Part 1.

Its role is to serve as the functional implementation contract for Sprint 5 of OpenVoz Mobile.

This document is descriptive, not prescriptive. It records verified current behavior only.

Where behavior could not be verified from the repository, project artifacts, or the publicly accessible OpenVoz web application as inspected on **Monday, August 3, 2026**, the section states:

`Not verified.`

## User Journey

Verified journey:

1. The user can access the public OpenVoz website at `https://www.openvoz.com/`.
2. The user can access a Django login page at `https://www.openvoz.com/usersvoicechat/login/`.
3. The user can access a public page titled `B2 Speaking Part 1` at `https://www.openvoz.com/chat/`.
4. On the Part 1 page, the user sees:
   - the title `B2 Speaking Part 1`;
   - a hero image;
   - the instruction `Press 🎤 & say "Hello" to Start`;
   - the instruction `Remember to press 🎤 to answer...`;
   - a microphone button;
   - a `Continue Your Practice?` section with a `Purchase Access` link.

Not verified:

- The exact entry path users take from the home page into B2 First Speaking Part 1.
- Whether authentication is required before active Part 1 interaction begins.
- Whether access control differs between free and paid users for Part 1.
- Whether the initial utterance `"Hello"` is mandatory or only suggested.
- What happens immediately after the first successful microphone interaction.

## Screen Flow

### Verified Screens

#### 1. Public Home Page

Verified route:

- `GET https://www.openvoz.com/`

Verified visible behavior:

- OpenVoz marketing and exam-selection content is displayed.
- The site presents Cambridge speaking practice as a product area.
- Login is available from the site header/footer area.

#### 2. Login Screen

Verified route:

- `GET https://www.openvoz.com/usersvoicechat/login/`

Verified visible behavior:

- The page title is `Login`.
- The page includes `Username` and `Password` fields.
- The page includes a `Login` button.
- The page includes a `Register here` link.

#### 3. B2 Speaking Part 1 Screen

Verified route:

- `GET https://www.openvoz.com/chat/`

Verified visible behavior:

- Page title: `B2 Speaking Part 1`
- Navigation labels visible on the page:
  - `Main Menu`
  - `Part 2`
  - `Part 3`
  - `Part 4`
- A `Change Background` control is visible.
- A hero image is displayed.
- The page shows:
  - `Press 🎤 & say "Hello" to Start`
  - `Remember to press 🎤 to answer...`
- A microphone button is visible.
- A `Continue Your Practice?` section is visible.
- A `Purchase Access` link is visible in that section.

#### 4. Adjacent Part 2 Screen

Verified route:

- `GET https://www.openvoz.com/b2-speaking-part2/`

Verified visible behavior:

- The page title is `B2 Speaking Part 2`.
- A `Start Instructions` control is visible.
- A microphone button is visible.
- Recording controls are visible:
  - `Recording: 00:00`
  - delete button
  - `Send for Feedback`
- A photo is displayed.
- An `Ask Follow-Up Question` control is visible.

This adjacent page is included only because it proves that Part 1 exists within a multi-part B2 speaking flow.

### Verified Transitions

- The public home page and login page are both reachable.
- The Part 1 page is reachable directly by URL.
- The Part 1 page visibly references `Part 2`, `Part 3`, and `Part 4`.
- The Part 1 page visibly presents a `Purchase Access` path.

### Not Verified Transitions

- Whether the `Main Menu`, `Part 2`, `Part 3`, and `Part 4` labels are server-rendered links, JavaScript buttons, or static labels.
- Whether Part 1 automatically transitions to Part 2 after completion.
- Whether the user remains on the same page during the full Part 1 interaction or moves through multiple internal states/screens.
- Whether login is enforced before recording, submission, or feedback.
- Whether payment state changes the rendered screen flow.

## Voice Interaction

### Instructions

Verified:

- The Part 1 page instructs the user to `Press 🎤 & say "Hello" to Start`.
- The Part 1 page also instructs the user: `Remember to press 🎤 to answer...`

Not verified:

- Whether additional spoken or written instructions are revealed after interaction starts.
- Whether instructions are replayable.
- Whether the page uses text-to-speech, prerecorded audio, or text-only prompts.

### Countdown

Not verified.

No visible countdown timer or documented Part 1 countdown behavior could be verified from the available public Part 1 page or project artifacts.

### Recording

Verified:

- A microphone button is present on the Part 1 page.
- The page copy implies microphone-driven interaction.
- The page copy implies that the user presses the microphone button to start and to answer.

Not verified:

- Whether recording is push-to-talk, press-to-start/press-to-stop, or another interaction model.
- Whether recording auto-stops.
- Whether waveform, elapsed time, or recording status feedback exists during Part 1.
- Whether the browser permission request appears before or after the first press.

### Follow-up Questions

Verified:

- No explicit `Ask Follow-Up Question` control is visible on the public Part 1 page.
- A follow-up control is visible on the public Part 2 page.

Not verified:

- Whether Part 1 contains follow-up questions.
- Whether examiner follow-up inside Part 1 exists as a separate control, hidden state, or backend-driven prompt.

### Number of Questions

Not verified.

### Completion

Verified from OpenVoz project artifacts:

- Part 1 completion is not defined by browser navigation, a client-side counter, a model response, a connection close, or a client request to complete.
- The authoritative completion event is a server-side `Part 1 completed` lifecycle transition recorded only after the server has accepted and durably stored the final required turn.
- Assessment eligibility begins only after that completion event.
- Abandoned, timed-out, interrupted, or otherwise incomplete conversations must not be represented as completed Part 1 attempts.

Not verified:

- What user-visible signal indicates successful Part 1 completion on the existing web app.
- Whether the web app shows a completion message before navigating to the next part.

## Backend Interaction

This section documents verified backend interaction only.

### Verified Endpoints

#### 1. Part 1 Page Delivery

- Request: `GET https://www.openvoz.com/chat/`
- Verified response behavior: server returns an HTML page titled `B2 Speaking Part 1`
- Verified state transition: page becomes available for user interaction

#### 2. Login Page Delivery

- Request: `GET https://www.openvoz.com/usersvoicechat/login/`
- Verified response behavior: server returns an HTML login page with username/password fields
- Verified state transition: unauthenticated user can attempt login

#### 3. Part 2 Page Delivery

- Request: `GET https://www.openvoz.com/b2-speaking-part2/`
- Verified response behavior: server returns an HTML page titled `B2 Speaking Part 2`
- Verified state transition: adjacent later-stage speaking page is reachable

### Not Verified Backend Interactions

Not verified:

- The exact request used to submit a Part 1 user turn.
- The exact request used to upload audio for Part 1.
- The exact request used to fetch examiner prompts or follow-up prompts.
- The exact request used to mark Part 1 complete.
- The exact request used to trigger assessment or feedback generation.
- Any request payload for turn submission, audio upload, or completion.
- Any response payload for turn submission, audio upload, completion, or feedback.
- Whether Part 1 uses AJAX, HTML form submission, WebSocket, fetch/XHR, or another mechanism.

## Session Lifecycle

Verified from OpenVoz project artifacts:

1. A conversation is one attempt with a server-controlled lifecycle.
2. The server creates the conversation identifier before evidence is accepted.
3. While active, the server accepts ordered turns while authorization and lifecycle rules remain valid.
4. Completion is a server-recorded terminal transition.
5. No additional turns may be added after completion.
6. Explicit candidate exit or server abandonment creates an abandoned terminal state.
7. Timeout creates a timed-out terminal state.
8. Restart creates a new conversation and a new identifier.
9. Multiple attempts are separate records and must not be merged implicitly.
10. Part 1 completion is authoritative only after the server has accepted and durably stored the final required turn.

Not verified:

- The user-visible identifier for a Part 1 attempt.
- Whether the browser stores session state locally.
- Whether the web client restores an interrupted in-progress Part 1 attempt.
- The inactivity timeout duration.
- The maximum-duration limit for Part 1.

## Audio Behaviour

### Playback

Not verified.

No public Part 1 evidence was found for prompt playback, answer playback, or replay controls.

### Recording

Verified:

- The Part 1 page exposes a microphone control.
- The page copy instructs the user to press the microphone to start and answer.

Not verified:

- Whether audio is recorded continuously or per turn.
- Whether the user can review a recording before submission.
- Whether Part 1 uses speech-to-text, raw audio upload, or both.

### Timing

Not verified.

### Interruptions

Verified from OpenVoz project artifacts:

- Interrupted conversations must not be represented as completed Part 1 attempts unless the server has durably stored the final required turn and recorded the completion transition.

Not verified:

- The browser behavior on microphone denial.
- The browser behavior on tab close, refresh, or network loss.
- Whether the page warns the user before leaving.

### Retry Behavior

Verified:

- The Part 2 page contains a visible `Try Again!` element.

Not verified:

- Whether Part 1 has an equivalent retry control.
- Whether retry restarts the current Part 1 attempt or creates a new attempt.
- Whether retry preserves prior accepted turns.

## Assessment

Verified from OpenVoz project artifacts:

- Assessment is not eligible until the server has recorded the `Part 1 completed` lifecycle transition after final required evidence is durably stored.
- Incomplete, abandoned, interrupted, or timed-out Part 1 attempts must not be represented as completed attempts for assessment purposes.

Not verified:

- Whether Part 1 is assessed immediately after completion or only after later speaking parts.
- Whether the user receives Part 1-only feedback.
- Whether assessment is synchronous or asynchronous.
- What assessment output is shown to the user.
- Which backend endpoint performs assessment.

## Error Handling

Verified error-related behavior:

- The server lifecycle is fail-closed for completion and assessment integrity according to OpenVoz project decisions:
  - completion must not be fabricated;
  - incomplete attempts must not be represented as completed;
  - preserved committed evidence must not be rewritten as if the attempt completed successfully.

Not verified:

- User-visible microphone permission error messages.
- User-visible upload or submission error messages.
- User-visible timeout messages.
- User-visible network retry flow.
- User-visible payment or entitlement errors on Part 1.

## Edge Cases

Verified edge cases:

- Browser navigation is not itself evidence of Part 1 completion.
- A client-side counter is not itself evidence of Part 1 completion.
- A model response is not itself evidence of Part 1 completion.
- Connection close is not itself evidence of Part 1 completion.
- A request to complete is not itself evidence of Part 1 completion.
- A late browser request cannot reactivate a timed-out conversation.
- Restarting creates a new conversation and must not reopen the prior attempt.
- Multiple attempts remain separate records.

Not verified:

- Empty microphone input behavior.
- Silence handling.
- Double-submit behavior.
- Duplicate audio upload handling.
- Browser refresh behavior during an active Part 1 turn.

## Business Rules

### Verified Rules

- Part 1 is a distinct page at `https://www.openvoz.com/chat/`.
- Part 1 is part of a multi-part B2 speaking flow that includes Part 2, Part 3, and Part 4.
- The page instructs the user to begin by pressing the microphone and saying `Hello`.
- The page instructs the user to press the microphone to answer.
- Part 1 completion is server-authoritative.
- The final required turn must be accepted and durably stored before the server records `Part 1 completed`.
- Completion is terminal.
- Assessment eligibility starts only after server-recorded completion.
- Incomplete attempts must not be treated as completed attempts.
- Restarting creates a new attempt identifier.
- Attempts must remain distinct and must not be merged.

### Not Verified Rules

- Question order
- Number of examiner questions
- Number of candidate turns
- Number of follow-up questions
- Whether the first utterance must literally be `Hello`
- Time limits
- Access gating rules for free versus paid users
- Whether Part 1 can be skipped
- Whether Part 1 must be completed before Part 2 is unlocked

## Acceptance Criteria

A mobile implementation can be considered functionally equivalent to the verified existing Django implementation only when all of the following are true:

1. The mobile flow provides a distinct B2 Speaking Part 1 entry corresponding to the existing web Part 1 page.
2. The mobile Part 1 experience presents the verified startup instruction to begin with microphone interaction and the verified instruction that the learner presses the microphone to answer.
3. The mobile flow preserves the fact that Part 1 belongs to a larger B2 speaking sequence that includes Parts 2, 3, and 4.
4. The mobile implementation does not treat client-side navigation, client-side counters, connection close, or a local completion request as authoritative completion.
5. The mobile implementation treats Part 1 completion as server-authoritative only after the final required turn has been accepted and durably stored by the backend.
6. The mobile implementation does not represent abandoned, interrupted, timed-out, or otherwise incomplete Part 1 attempts as completed attempts.
7. Restarting Part 1 creates a new attempt record rather than reopening or overwriting a prior attempt.
8. Multiple Part 1 attempts remain separate records and are not merged implicitly.
9. Any assessment flow in mobile begins only after the backend records the authoritative Part 1 completion event.
10. Where the existing web implementation is not verified, the mobile implementation must not invent incompatible behavior without separate approval and documentation.
