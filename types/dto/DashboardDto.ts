import { ProfileDto } from './ProfileDto';
import { SubscriptionDto } from './SubscriptionDto';

/**
 * Transport DTO for dashboard learning statistics.
 */
export interface DashboardStatsDto {
  questions_answered: number;
  correct_answers: number;
  accuracy: number;
  study_minutes: number;
  streak: number;
  assessments_completed: number;
}

/**
 * Transport DTO for the dashboard payload (stats + activity).
 */
export interface DashboardPayloadDto {
  stats: DashboardStatsDto;
  recent_activity: unknown[];
}

/**
 * Transport DTO for GET /api/mobile/dashboard/
 *
 * Mirrors: PART1_TRANSPORT_AUTHORITY.md § Response Contracts #6
 */
export interface DashboardDto {
  user: ProfileDto;
  subscription: SubscriptionDto;
  dashboard: DashboardPayloadDto;
}
