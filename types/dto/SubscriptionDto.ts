/**
 * Transport DTO for the subscription plan nested object.
 */
export interface SubscriptionPlanDto {
  code: string | null;
  name: string | null;
}

/**
 * Transport DTO for GET /api/mobile/subscription/
 *
 * Mirrors: PART1_TRANSPORT_AUTHORITY.md § Response Contracts #5
 */
export interface SubscriptionDto {
  has_subscription: boolean;
  status: string;
  source: string | null;
  plan: SubscriptionPlanDto;
  provider: string | null;
  valid_until: string | null;
}
