import { ApiError } from '../api';
import { progressApi } from '../api/progress-api';

interface MobileProgressResponse {
  language: 'en' | 'es';
  completed_sessions: number;
  assessed_sessions: number;
  criterion_progress: Record<string, unknown>[];
  recent_assessments: Record<string, unknown>[];
  activity: Record<string, unknown>;
  streak: {
    current_days: number;
    longest_days: number;
  };
  milestones: Record<string, unknown>[];
}

export const progressService = {
  async getProgress(language: 'en' | 'es') {
    const response = await progressApi.getProgress(language);
    const payload = (await response.json()) as MobileProgressResponse;

    if (
      typeof payload.completed_sessions !== 'number' ||
      !Array.isArray(payload.criterion_progress) ||
      !payload.streak
    ) {
      throw new ApiError('Progress response did not include a valid payload', {
        code: 'invalid_json',
        details: payload,
        status: response.status,
        url: response.url,
      });
    }

    return {
      language: payload.language,
      completedSessions: payload.completed_sessions,
      assessedSessions: payload.assessed_sessions,
      criterionProgress: payload.criterion_progress,
      recentAssessments: payload.recent_assessments,
      activity: payload.activity,
      streak: payload.streak,
      milestones: payload.milestones,
    };
  },
};
