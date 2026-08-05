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
  readonly validUntil: string | null;
}
