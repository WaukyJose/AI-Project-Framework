export interface SubscriptionPlan {
  code: string | null;
  name: string | null;
}

export interface SubscriptionStatus {
  hasSubscription: boolean;
  plan: SubscriptionPlan;
  provider: string | null;
  source: 'entitlement' | 'legacy_membership' | null;
  status: 'active' | 'inactive';
  validUntil: string | null;
}
