import { ApiError } from '../api';
import { dashboardApi } from '../api/dashboard-api';
import { AuthUser } from '../../types/auth';
import { MobileDashboardData } from '../../types/dashboard';
import { SubscriptionStatus } from '../../types/subscription';

interface MobileDashboardResponse {
  dashboard: {
    recent_activity: Record<string, unknown>[];
    stats: {
      accuracy: number;
      correct_answers: number;
      questions_answered: number;
      streak: number;
      study_minutes: number;
    };
  };
  subscription: {
    has_subscription: boolean;
    plan: {
      code: string | null;
      name: string | null;
    };
    provider: string | null;
    source: 'entitlement' | 'legacy_membership' | null;
    status: 'active' | 'inactive';
    valid_until: string | null;
  };
  user: {
    email: string;
    first_name: string;
    full_name: string;
    id: number;
    last_name: string;
    username: string;
  };
}

function normalizeUser(user: MobileDashboardResponse['user']): AuthUser {
  return {
    displayName: user.full_name || user.username,
    email: user.email || null,
    firstName: user.first_name,
    fullName: user.full_name || null,
    id: user.id,
    identifier: user.username,
    lastName: user.last_name,
    username: user.username,
  };
}

function normalizeSubscription(
  subscription: MobileDashboardResponse['subscription']
): SubscriptionStatus {
  return {
    hasSubscription: subscription.has_subscription,
    plan: {
      code: subscription.plan?.code ?? null,
      name: subscription.plan?.name ?? null,
    },
    provider: subscription.provider ?? null,
    source: subscription.source ?? null,
    status: subscription.status,
    validUntil: subscription.valid_until ?? null,
  };
}

export const dashboardService = {
  async getDashboard(language: 'en' | 'es') {
    const response = await dashboardApi.getDashboard(language);
    const payload = (await response.json()) as MobileDashboardResponse;

    if (
      typeof payload.user?.id !== 'number' ||
      !payload.user?.username ||
      !payload.subscription ||
      !payload.dashboard?.stats ||
      !Array.isArray(payload.dashboard?.recent_activity)
    ) {
      throw new ApiError('Dashboard response did not include a valid payload', {
        code: 'invalid_json',
        details: payload,
        status: response.status,
        url: response.url,
      });
    }

    return {
      dashboard: {
        recentActivity: payload.dashboard.recent_activity,
        stats: {
          accuracy: payload.dashboard.stats.accuracy,
          correctAnswers: payload.dashboard.stats.correct_answers,
          questionsAnswered: payload.dashboard.stats.questions_answered,
          streak: payload.dashboard.stats.streak,
          studyMinutes: payload.dashboard.stats.study_minutes,
        },
      },
      subscription: normalizeSubscription(payload.subscription),
      user: normalizeUser(payload.user),
    } satisfies MobileDashboardData;
  },
};
