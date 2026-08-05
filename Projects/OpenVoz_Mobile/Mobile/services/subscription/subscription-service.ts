import { ApiError } from '../api';
import { subscriptionApi } from '../api/subscription-api';
import { SubscriptionStatus } from '../../types/subscription';

interface MobileSubscriptionResponse {
  has_subscription: boolean;
  plan: {
    code: string | null;
    name: string | null;
  };
  provider: string | null;
  source: 'entitlement' | 'legacy_membership' | null;
  status: 'active' | 'inactive';
  valid_until: string | null;
}

function normalizeSubscription(payload: MobileSubscriptionResponse): SubscriptionStatus {
  return {
    hasSubscription: payload.has_subscription,
    plan: {
      code: payload.plan?.code ?? null,
      name: payload.plan?.name ?? null,
    },
    provider: payload.provider ?? null,
    source: payload.source ?? null,
    status: payload.status,
    validUntil: payload.valid_until ?? null,
  };
}

export const subscriptionService = {
  async getAuthenticatedSubscription() {
    const response = await subscriptionApi.getSubscription();
    const payload = (await response.json()) as MobileSubscriptionResponse;

    if (typeof payload.has_subscription !== 'boolean' || !payload.status || !payload.plan) {
      throw new ApiError('Subscription response did not include a valid payload', {
        code: 'invalid_json',
        details: payload,
        status: response.status,
        url: response.url,
      });
    }

    return normalizeSubscription(payload);
  },
};
