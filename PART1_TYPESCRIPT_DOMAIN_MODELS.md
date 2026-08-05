# Part 1 TypeScript Domain Models Specification

## Executive Summary

This document defines the authoritative TypeScript domain model specification for the OpenVoz mobile application. Derived directly from the frozen backend transport contract documented in `PART1_TRANSPORT_AUTHORITY.md`, these models translate raw server responses into strongly typed, predictable domain entities.

This specification serves as the single source of truth for:
- TypeScript interfaces (`types/`)
- API client response wrappers (`services/api/`)
- Repository & persistence layers (`services/`)
- React Query hooks (`hooks/`)
- UI components and screen state (`screens/`, `components/`)

**Status:** ✅ **Frozen & Authoritative**

---

## Domain Model Overview

The mobile domain models are organized into five logical domains:
1. **Authentication & Session** (`User`, `AuthSession`, `Credentials`)
2. **User Profile** (`UserProfile`)
3. **Subscription & Entitlement** (`SubscriptionStatus`, `SubscriptionPlan`)
4. **Dashboard & Analytics** (`DashboardSummary`, `LearningStats`, `ActivityItem`)
5. **Errors & API Envelopes** (`ApiError`, `ApiResponse`)

---

## Entity Relationship Diagram

```text
AuthSession (1) ── contains ──> User (1)
UserProfile (1) ── mirrors ──> User (1)
DashboardSummary (1) ── contains ──> UserProfile (1)
DashboardSummary (1) ── contains ──> SubscriptionStatus (1)
DashboardSummary (1) ── contains ──> LearningStats (1)
DashboardSummary (1) ── contains ──> ActivityItem (0..N)
SubscriptionStatus (1) ── references ──> SubscriptionPlan (1)
```

---

## TypeScript Interface Specifications

### 1. Shared Base Types & Errors

```ts
export type IsoDateTimeString = string;

export interface ApiError {
  readonly code: string;
  readonly message: string;
}

export interface ApiErrorResponse {
  readonly authenticated: false;
  readonly error: ApiError;
}
```

### 2. Authentication Domain

```ts
export interface User {
  readonly id: number;
  readonly identifier: string;
  readonly displayName: string | null;
  readonly email: string | null;
  readonly isStaff: boolean;
}

export interface AuthSession {
  readonly authenticated: true;
  readonly token: string;
  readonly user: User;
}

export type AuthResponse = AuthSession | ApiErrorResponse;
```

### 3. Profile Domain

```ts
export interface UserProfile {
  readonly id: number;
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly email: string;
}
```

### 4. Subscription Domain

```ts
export type SubscriptionStatusType = 'active' | 'inactive';
export type SubscriptionSourceType = 'entitlement' | 'legacy_membership';
export type PaymentProviderType = 'paypal' | 'dlocalgo' | 'stripe' | string;

export interface SubscriptionPlan {
  readonly code: string | null;
  readonly name: string | null;
}

export interface SubscriptionStatus {
  readonly hasSubscription: boolean;
  readonly status: SubscriptionStatusType;
  readonly source: SubscriptionSourceType | null;
  readonly plan: SubscriptionPlan;
  readonly provider: PaymentProviderType | null;
  readonly validUntil: IsoDateTimeString | null;
}
```

### 5. Dashboard Domain

```ts
export interface LearningStats {
  readonly questionsAnswered: number;
  readonly correctAnswers: number;
  readonly accuracy: number;
  readonly studyMinutes: number;
  readonly streak: number;
}

export interface ActivityItem {
  readonly id: string;
  readonly title: string;
  readonly timestamp: IsoDateTimeString;
  readonly score: number | null;
}

export interface DashboardPayload {
  readonly stats: LearningStats;
  readonly recentActivity: readonly ActivityItem[];
}

export interface DashboardSummary {
  readonly user: UserProfile;
  readonly subscription: SubscriptionStatus;
  readonly dashboard: DashboardPayload;
}
```

---

## Enum Definitions & Union Types

```ts
export type AuthErrorCode =
  | 'invalid_json'
  | 'missing_credentials'
  | 'invalid_credentials'
  | 'authentication_required'
  | 'invalid_token'
  | 'inactive_account';

export type PaymentProvider = 'paypal' | 'dlocalgo';
```

---

## Collection Models

Collections are strictly typed as read-only arrays (`readonly T[]`) to reinforce immutability in state stores (Zustand) and UI component props.

```ts
export type ActivityList = readonly ActivityItem[];
```

---

## Nullable and Optional Field Rules

1. **Required vs Optional:** Properties that are guaranteed by the backend transport contract are required (non-optional). Optional fields (`?`) are restricted to client-only runtime states (e.g., loading flags, error banners).
2. **Nullable Fields:** Fields that can be `null` in the transport JSON (such as `display_name`, `email`, `valid_until`) are explicitly typed with union types (e.g., `string | null`). Clients must handle `null` safely.
3. **Strict Null Checks:** TypeScript compiler options (`strictNullChecks: true`) must be enforced across the mobile project.

---

## Mapping Between Transport Contract and Domain Models

To maintain separation between transport serialization (snake_case) and domain logic (camelCase), mappers should be implemented in API services:

| Transport Field (Snake Case) | Domain Property (Camel Case) | Notes |
| --- | --- | --- |
| `display_name` | `displayName` | Mapped in user builder |
| `is_staff` | `isStaff` | Mapped in user builder |
| `has_subscription` | `hasSubscription` | Mapped in subscription builder |
| `valid_until` | `validUntil` | Mapped in subscription builder |
| `questions_answered` | `questionsAnswered` | Mapped in stats builder |
| `recent_activity` | `recentActivity` | Mapped in dashboard builder |

---

## Transport-Only Fields (Do Not Propagate)

- **`authenticated: boolean`** inside successful payload wrappers should be used exclusively by the auth service to branch session validity and should not clutter inner domain entity interfaces.
- **Raw Django session keys or CSRF tokens** are strictly excluded from domain models.

---

## Reuse Strategy & Future Extension

The modular design of these domain models supports future reading modules (e.g., Reading Part 2, C1 Advanced Reading, Vocabulary practice):
- `User`, `UserProfile`, and `SubscriptionStatus` provide core gating for all premium reading features.
- `LearningStats` and `ActivityItem` can be extended with reading-specific metrics (e.g., reading speed, comprehension accuracy) without altering user or auth models.

---

## Final Approval Checklist

- [x] All entities from `PART1_TRANSPORT_AUTHORITY.md` are covered.
- [x] TypeScript types match backend data types exactly.
- [x] Nullable and optional rules are documented.
- [x] Naming conventions (camelCase domain vs snake_case transport) are established.
- [x] Immutable collections (`readonly`) are specified.
