import { HttpClient } from '../api/HttpClient';
import { SubscriptionMapper } from '../mappers/SubscriptionMapper';
import type { SubscriptionDto } from '../../types/dto/SubscriptionDto';
import type { SubscriptionStatus } from '../../types/domain/Subscription';

/**
 * Repository for the authenticated user's subscription status.
 *
 * Orchestrates: GET /api/mobile/subscription/ → SubscriptionDto → SubscriptionStatus
 */
export const SubscriptionRepository = {
  /**
   * Retrieves the current subscription status, plan details, and
   * entitlement source for the authenticated user.
   */
  async getSubscription(): Promise<SubscriptionStatus> {
    const dto = await HttpClient.get<SubscriptionDto>('/api/mobile/subscription/');

    return SubscriptionMapper.fromDto(dto);
  },
};
