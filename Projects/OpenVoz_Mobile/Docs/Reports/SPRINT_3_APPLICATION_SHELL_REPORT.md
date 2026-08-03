# Sprint 3 Application Shell Report

## Purpose

Sprint 3 establishes the authenticated OpenVoz Mobile application shell.

This sprint focuses on structure, navigation, reusable interface components, and responsive layout behavior. It does not implement speaking, assessment, microphone, audio, or synchronization functionality.

## Implemented Screens

- Login
- Dashboard
- Practice
- B2 Speaking landing
- B2 Speaking part placeholders:
  - Part 1
  - Part 2
  - Follow-up
  - Part 3
  - Part 4
- Progress
- Profile
- Settings

## Navigation

The implemented shell follows the documented mobile UX approach:

- unauthenticated users enter through the login route
- authenticated users enter a persistent tab-based shell
- the tab shell exposes:
  - Dashboard
  - Practice
  - Progress
  - Profile
  - Settings
- B2 Speaking is launched from Practice as a stack-style workflow entry rather than as a permanent top-level tab

This keeps primary navigation stable while preserving room for future speaking and assessment task flows.

## Reusable Components

Sprint 3 introduced shared shell components for consistent UI composition:

- `AppHeader`
- `Avatar`
- `Badge`
- `PrimaryButton`
- `SecondaryButton`
- `PracticeCard`
- `ProgressCard`
- `StatCard`
- `EmptyState`
- `LoadingView`
- `ErrorView`
- `ListItem`
- `SettingsRow`
- `SectionHeader`
- `ResponsiveGrid`
- enhanced `ScreenContainer`

## Responsive Behavior

- `ScreenContainer` constrains content width and centers large-screen layouts.
- `ResponsiveGrid` expands into multiple columns on tablet-width screens.
- The shell avoids phone-only assumptions and keeps all sections readable on phones and tablets.
- Tab navigation remains stable across Android, iPhone, iPad, and Android tablet form factors.

## Known Limitations

- Speaking remains placeholder-only.
- Assessment remains placeholder-only.
- Profile editing, subscriptions, notifications, and settings persistence are not implemented.
- History is currently represented through progress and dashboard placeholders rather than a dedicated navigation destination because this sprint follows the requested top-level section set.
