import type { DashboardDto, DashboardStatsDto } from '../../types/dto/DashboardDto';
import type { DashboardSummary, LearningStats, ActivityItem } from '../../types/domain/Dashboard';
import { ProfileMapper } from './ProfileMapper';
import { SubscriptionMapper } from './SubscriptionMapper';
import { MappingError } from './MappingError';

const DTO_NAME = 'DashboardDto';

/**
 * Pure mapper: converts a DashboardStatsDto into a LearningStats domain model.
 */
function mapStats(dto: DashboardStatsDto): LearningStats {
  if (dto === null || dto === undefined) {
    throw new MappingError('stats', 'DashboardStatsDto is null or undefined', DTO_NAME);
  }

  const numericFields: readonly (keyof DashboardStatsDto)[] = [
    'questions_answered',
    'correct_answers',
    'accuracy',
    'study_minutes',
    'streak',
  ];

  for (const field of numericFields) {
    if (typeof dto[field] !== 'number') {
      throw new MappingError(
        `stats.${field}`,
        `Expected number, got ${typeof dto[field]}`,
        DTO_NAME,
      );
    }
  }

  return {
    questionsAnswered: dto.questions_answered,
    correctAnswers: dto.correct_answers,
    accuracy: dto.accuracy,
    studyMinutes: dto.study_minutes,
    streak: dto.streak,
  };
}

/**
 * Pure mapper: validates and maps a raw activity item from the backend
 * into an ActivityItem domain model.
 *
 * Currently the backend returns an empty array; this validator is
 * forward-compatible with future populated activity data.
 */
function mapActivityItem(raw: unknown, index: number): ActivityItem {
  if (raw === null || raw === undefined || typeof raw !== 'object') {
    throw new MappingError(
      `dashboard.recent_activity[${index}]`,
      `Expected object, got ${typeof raw}`,
      DTO_NAME,
    );
  }

  const item = raw as Record<string, unknown>;

  if (typeof item.id !== 'string') {
    throw new MappingError(
      `dashboard.recent_activity[${index}].id`,
      `Expected string, got ${typeof item.id}`,
      DTO_NAME,
    );
  }

  if (typeof item.title !== 'string') {
    throw new MappingError(
      `dashboard.recent_activity[${index}].title`,
      `Expected string, got ${typeof item.title}`,
      DTO_NAME,
    );
  }

  if (typeof item.timestamp !== 'string') {
    throw new MappingError(
      `dashboard.recent_activity[${index}].timestamp`,
      `Expected string, got ${typeof item.timestamp}`,
      DTO_NAME,
    );
  }

  if (item.score !== null && item.score !== undefined && typeof item.score !== 'number') {
    throw new MappingError(
      `dashboard.recent_activity[${index}].score`,
      `Expected number or null, got ${typeof item.score}`,
      DTO_NAME,
    );
  }

  return {
    id: item.id,
    title: item.title,
    timestamp: item.timestamp,
    score: (item.score as number | null) ?? null,
  };
}

/**
 * Pure mapper: converts a DashboardDto (snake_case transport) into
 * a DashboardSummary domain model (camelCase).
 *
 * Delegates to ProfileMapper and SubscriptionMapper for nested entities.
 * Validates dashboard stats and activity array.
 */
export const DashboardMapper = {
  fromDto(dto: DashboardDto): DashboardSummary {
    if (dto === null || dto === undefined) {
      throw new MappingError('root', 'DashboardDto is null or undefined', DTO_NAME);
    }

    if (dto.user === null || dto.user === undefined) {
      throw new MappingError('user', 'User profile is null or undefined', DTO_NAME);
    }

    if (dto.subscription === null || dto.subscription === undefined) {
      throw new MappingError(
        'subscription',
        'Subscription is null or undefined',
        DTO_NAME,
      );
    }

    if (dto.dashboard === null || dto.dashboard === undefined) {
      throw new MappingError(
        'dashboard',
        'Dashboard payload is null or undefined',
        DTO_NAME,
      );
    }

    const user = ProfileMapper.fromDto(dto.user);
    const subscription = SubscriptionMapper.fromDto(dto.subscription);

    if (!Array.isArray(dto.dashboard.recent_activity)) {
      throw new MappingError(
        'dashboard.recent_activity',
        `Expected array, got ${typeof dto.dashboard.recent_activity}`,
        DTO_NAME,
      );
    }

    const stats = mapStats(dto.dashboard.stats);
    const recentActivity: readonly ActivityItem[] = dto.dashboard.recent_activity.map(
      (raw, index) => mapActivityItem(raw, index),
    );

    return {
      user,
      subscription,
      dashboard: {
        stats,
        recentActivity,
      },
    };
  },
};
