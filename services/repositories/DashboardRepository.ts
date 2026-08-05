import { HttpClient } from '../api/HttpClient';
import { DashboardMapper } from '../mappers/DashboardMapper';
import type { DashboardDto } from '../../types/dto/DashboardDto';
import type { DashboardSummary } from '../../types/domain/Dashboard';

/**
 * Repository for the aggregated mobile dashboard.
 *
 * Orchestrates: GET /api/mobile/dashboard/ → DashboardDto → DashboardSummary
 *
 * The returned DashboardSummary composes UserProfile, SubscriptionStatus,
 * LearningStats, and recent ActivityItems into a single domain entity.
 */
export const DashboardRepository = {
  /**
   * Retrieves the full dashboard payload: user profile, subscription
   * status, learning statistics, and recent activity feed.
   */
  async getDashboard(): Promise<DashboardSummary> {
    const dto = await HttpClient.get<DashboardDto>('/api/mobile/dashboard/');

    return DashboardMapper.fromDto(dto);
  },
};
