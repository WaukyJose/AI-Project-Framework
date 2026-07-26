# ReadWise Coach Architectural Baseline

Scope: read-only assessment of repository structure and overall architecture. No files were modified. AI behavior and data-model quality were not evaluated.

## 1. Executive Summary

ReadWise Coach is a functional, actively developed educational prototype rather than a production-scale application. It has progressed substantially beyond the “one-screen MVP” still described near the beginning of the README: the repository now contains 23 route screens, persistent learner progress, multiple activity modes, shared content modules, reusable components, native assets, and a small supporting server.

Architectural quality is moderate. The repository has a clear top-level organization and several useful separations—routes, components, data, utilities, hooks, assets, documentation, and server code are readily identifiable. Expo Router provides a simple navigation foundation, and persistence logic is kept outside screen components.

The application remains screen-centric, however. Several routes contain presentation, interaction state, navigation decisions, domain calculations, audio behavior, and styling in the same file. This is manageable for a prototype but creates scaling pressure.

Major strengths:

- Immediately understandable top-level structure.
- Clear separation of static content, reusable UI, persistence, and analytics.
- Consistent file-based routing.
- Strict TypeScript configuration and path aliases.
- Platform-specific component and hook variants.
- Purpose-specific AsyncStorage modules.
- A narrowly scoped backend rather than a second application architecture.

Major risks:

- Large, multifunctional screen modules.
- All 23 routes occupy one flat directory.
- No feature-level organization.
- Core task types are inferred from large data arrays rather than defined centrally.
- Navigation parameters and route contracts are distributed across screens.
- Some legacy and Expo-template structures remain alongside the active architecture.
- Requested architecture documentation is absent, preventing a verified implementation-to-design comparison.

Overall maturity: strong prototype / early pre-production architecture.

---

## 2. Repository Structure Assessment

### Current organization

```text
reading-strategy-coach/
├── assets/
│   ├── expo.icon/
│   ├── images/
│   └── sounds/
├── docs/
├── ios/
├── scripts/
├── server/
│   └── main.py
├── src/
│   ├── app/             # Expo Router routes
│   ├── components/      # Shared UI and voice components
│   ├── constants/
│   ├── data/            # Static activity/task banks
│   ├── hooks/
│   └── utils/           # Persistence, analytics, adapters
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
```

### Strengths

- Top-level responsibilities are easy to locate.
- Application code is consistently contained under `src`.
- Assets are separated by purpose: images, sounds, and platform icon material.
- The Python server is isolated from the mobile application.
- Supporting QA, release, audit, and planning material is collected under `docs`.
- Naming is generally predictable:
  - Route files use kebab-case.
  - React components use PascalCase.
  - Hooks and utility modules use camelCase.
  - Data files use domain-oriented names.

- TypeScript strict mode and the `@/*` alias are configured in [tsconfig.json](/Users/joselema/Desktop/mobile-course/reading-strategy-coach/tsconfig.json).
- Content is separated by level in modules such as `readingTasksA2.ts`, `readingTasksB1.ts`, and `readingTasksB2.ts`, then aggregated by [readingTasks.ts](/Users/joselema/Desktop/mobile-course/reading-strategy-coach/src/data/readingTasks.ts:1).

### Weaknesses

- `src/app` is completely flat despite containing 23 user-facing routes.
- The structure is layer-oriented but only partially layered. Screens still own substantial domain and workflow logic.
- There are no dedicated `features`, `navigation`, `models`, or `services` directories.
- Import style is inconsistent: some files use `@/…`, while others use relative `../…` imports.
- `src/utils` combines several kinds of responsibility:
  - Persistence gateways
  - Analytics
  - Content adapters
  - Domain mapping
  - Pure formatting/calculation helpers

- Large data banks dominate the source tree. The three primary task-bank files are each approximately 1,900–2,200 lines.
- Several apparent Expo starter artifacts remain, including `app-tabs`, `external-link`, `hint-row`, `web-badge`, and themed starter components. Some have no verified imports from active routes.
- The README is chronologically extensive but structurally stale in places. It still introduces “Prototype v2.1” as a one-screen MVP while later sections document many subsequent milestones.
- The tracked repository contains no automated test files or visible test-runner configuration. This is a repository-level maturity observation, not an assessment of coding correctness.

### Scalability and maintainability

The top-level structure is suitable for the current prototype size. Scalability is constrained at the screen and feature level: adding more practice modes would increase the flat route collection and likely repeat screen-owned state, styling, and workflow structures.

Maintainability is helped by clear filenames and extracted persistence/content modules, but reduced by large screens and mixed responsibilities.

---

## 3. Mobile Architecture Assessment

### Application shell

The mobile client is React Native 0.85 with Expo 56 and Expo Router, as declared in [package.json](/Users/joselema/Desktop/mobile-course/reading-strategy-coach/package.json:1).

The root layout:

- Installs a stack navigator.
- Wraps the route tree in a VocalBridge provider.
- Configures selected screen titles and header visibility.

Evidence: [\_layout.tsx](/Users/joselema/Desktop/mobile-course/reading-strategy-coach/src/app/_layout.tsx:4).

### Screens

Screens are file-based routes in `src/app`. They fall into several functional groups:

- Entry and dashboard:
  - `index`
  - `home`

- Core learning workflow:
  - `level`
  - `practice`
  - `explanation`
  - `feedback`
  - `cycle-review`

- Practice extensions:
  - `challenge`
  - `explore`
  - `focus-reader`
  - `quick-read`
  - `read-solve`

- Library and progress:
  - `library`
  - `activity-preview`
  - `saved-activities`
  - `progress`
  - `statistics`
  - `achievements`

- User/support:
  - `menu`
  - `profile`
  - `settings`
  - `help`
  - `about`

Screens generally own their local state through `useState`, derived values through `useMemo`, lifecycle behavior through `useEffect`/`useFocusEffect`, route parsing, event handlers, and StyleSheet definitions.

### Components

Verified shared components include:

- `BottomNav`: manual four-destination navigation.
- `ReadingTextRenderer`: renders multiple reading genres.
- `VoiceCoachPanel` and `VoiceCoachCallPanel`: encapsulate voice-coach UI and SDK interaction.
- Themed text/view primitives and platform-specific animation components.

`ReadingTextRenderer` is a meaningful presentation abstraction: it supports article, webpage, email, notice, advertisement, message, sign, and plain-text templates in [ReadingTextRenderer.tsx](/Users/joselema/Desktop/mobile-course/reading-strategy-coach/src/components/ReadingTextRenderer.tsx:184).

The component layer is relatively small compared with the screen layer, confirming that most UI composition remains route-local.

### Navigation

Navigation is handled directly inside screens through Expo Router’s `router`, `useRouter`, and `useLocalSearchParams`. There is no separate navigation configuration or route-contract module.

A custom [BottomNav.tsx](/Users/joselema/Desktop/mobile-course/reading-strategy-coach/src/components/BottomNav.tsx:4) provides Home, Progress, Library, and More destinations. It is UI rendered inside selected screens, not a nested tab navigator.

### Services

There is no formal mobile `services` layer.

External-system boundaries are divided between:

- VocalBridge SDK components in `src/components/voice`.
- A FastAPI token broker in [server/main.py](/Users/joselema/Desktop/mobile-course/reading-strategy-coach/server/main.py:1).
- AsyncStorage access functions under `src/utils`.

The server is narrow in scope: it exposes health and token endpoints and forwards token requests to VocalBridge.

### Hooks

Only lightweight theme/platform hooks are present:

- `use-color-scheme`
- `use-color-scheme.web`
- `use-theme`

No custom domain or workflow hooks were found.

### Context

No application-defined React Context was found. The verified provider usage comes from the external VocalBridge SDK in the root layout and voice panel.

### Models

There is no dedicated model layer. Some secondary activity modules declare explicit local types, such as `ReadSolveActivity`, `QuickReadActivity`, and `FocusReadingText`.

The central reading-task type is inferred from the combined data array in consuming screens, for example:

```ts
type ReadingTask = (typeof readingTasks)[number];
```

Therefore, type information exists, but responsibility for core domain types is not centralized.

### Utilities and persistence

Utilities contain the strongest non-UI separation:

- Progress persistence: [progressStorage.ts](/Users/joselema/Desktop/mobile-course/reading-strategy-coach/src/utils/progressStorage.ts:3)
- Profile persistence: [profileStorage.ts](/Users/joselema/Desktop/mobile-course/reading-strategy-coach/src/utils/profileStorage.ts:5)
- Saved activities: [savedActivities.ts](/Users/joselema/Desktop/mobile-course/reading-strategy-coach/src/utils/savedActivities.ts:21)
- Focus/explore progress
- Progress analytics
- Achievement derivation
- Strategy mapping
- Focus-task adaptation
- Pure reader and puzzle helpers

These modules give screens function-based interfaces instead of direct AsyncStorage access.

### Assets

Assets are sensibly separated into:

- Application and platform icons
- UI/brand imagery
- Responsive image variants
- Feedback and challenge sounds

Asset consumption is direct through static `require` calls in relevant screens.

---

## 4. Navigation Overview

### Navigation hierarchy

```text
Root Stack
│
├── Welcome (/)
│   └── Home
│
├── Home
│   ├── Level Selection
│   │   ├── Strategy Guide / Explanation
│   │   └── Practice
│   │       ├── Explanation
│   │       ├── Cycle Review ──> Practice
│   │       └── Progress
│   │
│   ├── Explore
│   ├── Focus Reader
│   ├── Quick Read
│   ├── Read & Solve
│   ├── Challenge
│   └── Library
│       └── Activity Preview
│           └── Practice
│
├── Bottom navigation destinations
│   ├── Home
│   ├── Progress
│   ├── Library
│   └── More
│
└── More
    ├── Explore
    ├── Focus Reader
    ├── Achievements
    ├── Statistics
    ├── Saved Activities ──> Practice
    ├── Settings
    ├── Help
    └── About
```

Additional route files include `profile` and `feedback`, although neither appears in the current main navigation hub. `feedback` represents an earlier flow that now coexists with inline feedback in `practice`.

### Organization and complexity

Navigation complexity is moderate:

- The application uses one root stack.
- There are no nested route groups.
- Navigation is mostly explicit and easy to trace.
- Core workflow context is transmitted through URL parameters such as `strategy`, `level`, `pathway`, and `taskId`.
- Some return flows use `replace`, while others use `push`.
- Only 11 routes are explicitly named in the root layout; Expo Router still derives the remaining routes from files.
- Two native-tab component variants exist, but no active imports were found. The functional bottom navigation is the manually rendered `BottomNav`.

The hierarchy is comprehensible today but decentralized: route knowledge lives across `home`, `level`, `practice`, `library`, `menu`, `saved-activities`, and other screens.

---

## 5. Architectural Patterns

The following patterns are verified.

### Component-based architecture

React Native screens are composed from both native primitives and shared React components. Examples include `BottomNav`, `ReadingTextRenderer`, and voice-coach components.

### File-based routing

Expo Router maps files under `src/app` to routes. The application is organized around a root stack.

### Layer-oriented repository organization

The repository separates routes, components, data, hooks, constants, utilities, assets, and backend code. It is not a strict layered architecture because screens still contain substantial non-presentation logic.

### Screen-centric architecture

Each route is largely self-contained, commonly including state, event handling, derived calculations, rendering, and styling.

### Local component state

React hooks provide local UI and workflow state. No global application store or application-defined Context is used.

### Function-based persistence gateway

AsyncStorage is accessed through purpose-specific utility modules. This acts as a lightweight storage abstraction.

### Static content repository

Reading tasks and supplementary activity content are stored in imported TypeScript modules. This is a content/data layer, but not a formal Repository Pattern implementation.

### Adapter pattern

`focusTaskAdapter.ts` converts task-bank entries into focus-reading structures and selects balanced content.

### Derived analytics modules

Progress and achievement summaries are produced through pure utility functions rather than calculated exclusively inside presentation code.

### Platform-specific modules

The repository uses `.web.tsx` and `.web.ts` variants for web-specific behavior.

Not found:

- Formal repository classes or interfaces
- Dependency injection
- Application-defined Context API
- Global state management
- A dedicated service layer
- Feature-based module organization

---

## 6. Initial Technical Debt

Only evident structural issues are included.

1. **Oversized screen modules.** `practice.tsx` is approximately 1,445 lines, `focus-reader.tsx` 922, `challenge.tsx` 756, `home.tsx` 655, and `read-solve.tsx` 652. These screens combine multiple architectural responsibilities.

2. **Flat route namespace.** Twenty-three screens share a single `src/app` directory with no route groups or feature folders.

3. **Legacy task duplication.** `home.tsx` contains embedded sample task arrays, while the maintained task bank resides under `src/data`. `practice.tsx` also retains an unused-looking local `tasks` array while actually filtering the imported `readingTasks` collection at [practice.tsx](/Users/joselema/Desktop/mobile-course/reading-strategy-coach/src/app/practice.tsx:225).

4. **Distributed navigation contracts.** Parameter names, defaults, normalization, and destination objects are repeated in multiple route files.

5. **Incomplete separation of workflow logic.** Practice-cycle behavior, audio, persistence coordination, animations, task selection, feedback, and presentation coexist in one screen.

6. **Broad utility category.** `src/utils` acts as persistence layer, analytics layer, adapter layer, and general helper collection.

7. **Core types are not centralized.** The primary task schema is represented structurally by the data arrays rather than a shared model definition.

8. **Mixed navigation mechanisms.** A manual bottom navigator is active while unused native-tab abstractions remain in `components`.

9. **Structural remnants.** Several apparently unused Expo-template components increase ambiguity about the supported component system.

10. **Documentation drift.** The README mixes an outdated early prototype description, long milestone history, duplicated headings, current status, and future plans in one document.

11. **Inconsistent provider ownership.** VocalBridge is configured globally in the root layout and again locally around the practice voice panel.

12. **Configuration embedded in presentation structure.** Local server token URLs are defined directly in UI/provider components rather than represented by a visible configuration boundary.

These are baseline observations, not a refactoring proposal.

---

## 7. Documentation Alignment

The requested files were not found anywhere in the repository:

- `PROJECT_BRIEF.md`
- `SYSTEM_ARCHITECTURE.md`
- `MOBILE_ARCHITECTURE.md`

No case-insensitive filename matches or architecture-document headings were found in other Markdown files.

Consequently, the requested alignment categories cannot be established objectively:

| Document                 | Already aligned | Partially aligned | Not yet implemented |
| ------------------------ | --------------: | ----------------: | ------------------: |
| `PROJECT_BRIEF.md`       |  Not assessable |    Not assessable |      Not assessable |
| `SYSTEM_ARCHITECTURE.md` |  Not assessable |    Not assessable |      Not assessable |
| `MOBILE_ARCHITECTURE.md` |  Not assessable |    Not assessable |      Not assessable |

Absence of documentation is not evidence that documented functionality is unimplemented. Classifying implementation as aligned or unaligned without the source documents would violate the evidence-only scope.

The available [README.md](/Users/joselema/Desktop/mobile-course/reading-strategy-coach/README.md:1) confirms broad implementation themes such as Expo, multiple screens, strategy-based practice, task banks, progress tracking, and manual QA. It is not a substitute for the three requested architecture specifications.

---

## 8. Top 10 Architectural Observations

1. The application is a substantial prototype with 23 file-based screens, not the one-screen MVP described near the beginning of the README.

2. Repository-level separation is good: routes, shared UI, static content, utilities, assets, documentation, and server code are clearly distinguished.

3. The effective architecture is screen-centric rather than feature-centric or strictly layered.

4. Expo Router keeps the navigation foundation simple, but the complete route graph and parameter contracts are distributed among screens.

5. Persistence has a clear function-based boundary around AsyncStorage, which is one of the strongest architectural separations.

6. Static task content is successfully separated from the main practice screen and partitioned by learner level.

7. Large route and data modules are the clearest scalability constraint.

8. Reusable abstractions exist for reading-text rendering, voice interaction, analytics, achievements, storage, and content adaptation, but general screen decomposition remains limited.

9. The codebase contains both active custom architecture and residual starter/legacy structures, making architectural intent less uniform.

10. The absence of the three governing architecture documents is itself a baseline risk because intended boundaries and implementation alignment cannot be verified.

## Overall Architecture Score: 6/10

The repository earns a 6 because it has a coherent and navigable prototype structure, strict TypeScript, sensible top-level separation, file-based navigation, reusable presentation components, extracted data, isolated persistence functions, and a narrowly scoped backend.

It does not score higher because screen responsibilities remain heavily consolidated, route organization is flat, central domain and navigation contracts are absent, legacy structures coexist with active ones, and the specified architecture documentation is unavailable. The current design is maintainable for a prototype, but its structural pressure points would become more significant as screens, workflows, and integrations expand.
