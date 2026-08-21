import { ApiError } from '../api';
import { progressApi } from '../api/progress-api';

interface CriterionProgressResponse {
  criterion: string;
  criterion_name: string;
  latest_band: number;
  average_band: number;
  assessments_count: number;
}

interface MilestoneResponse {
  id: string;
  achieved: boolean;
  achieved_at: string | null;
  current: number;
  target: number;
}

interface RecentAssessmentResponse {
  assessment_id: string;
  conversation_id: string;
  speaking_part: number | null;
  assessment_status: string;
  assessment_timestamp: string;
  criterion_results: Record<string, unknown>[];
}

interface Part1HistoryResponse {
  conversation_id: string;
  practice_mode: 'normal' | 'repeat' | 'new';
  replay_of_session_id: string | null;
  score_summary: Record<string, unknown> | null;
  feedback_summary: Record<string, unknown> | null;
  assessment_timestamp: string | null;
}

interface MobileProgressResponse {
  language: 'en' | 'es';
  completed_sessions: number;
  assessed_sessions: number;
  criterion_progress: CriterionProgressResponse[];
  recent_assessments: RecentAssessmentResponse[];
  part1_history: Part1HistoryResponse[];
  activity: Record<string, unknown>;
  streak: {
    current_days: number;
    longest_days: number;
  };
  milestones: MilestoneResponse[];
}

export interface Part1HistoryItem {
  conversationId: string;
  practiceMode: 'normal' | 'repeat' | 'new';
  replayOfSessionId: string | null;
  scoreSummary: Record<string, unknown> | null;
  feedbackSummary: Record<string, unknown> | null;
  assessmentTimestamp: string | null;
}

export interface ProgressData {
  language: 'en' | 'es';
  completedSessions: number;
  assessedSessions: number;
  criterionProgress: {
    criterion: string;
    criterionName: string;
    latestBand: number;
    averageBand: number;
    assessmentsCount: number;
  }[];
  recentAssessments: {
    assessmentId: string;
    conversationId: string;
    speakingPart: number | null;
    assessmentStatus: string;
    assessmentTimestamp: string;
    criterionResults: Record<string, unknown>[];
  }[];
  part1History: Part1HistoryItem[];
  activity: Record<string, unknown>;
  streak: {
    currentDays: number;
    longestDays: number;
  };
  milestones: {
    id: string;
    achieved: boolean;
    achievedAt: string | null;
    current: number;
    target: number;
  }[];
}

export const progressService = {
  async getProgress(language: 'en' | 'es'): Promise<ProgressData> {
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

      criterionProgress: payload.criterion_progress.map((criterion) => ({
        criterion: criterion.criterion,
        criterionName: criterion.criterion_name,
        latestBand: criterion.latest_band,
        averageBand: criterion.average_band,
        assessmentsCount: criterion.assessments_count,
      })),

      recentAssessments: payload.recent_assessments.map((assessment) => ({
        assessmentId: assessment.assessment_id,
        conversationId: assessment.conversation_id,
        speakingPart: assessment.speaking_part,
        assessmentStatus: assessment.assessment_status,
        assessmentTimestamp: assessment.assessment_timestamp,
        criterionResults: assessment.criterion_results,
      })),
      part1History: payload.part1_history.map((attempt) => ({
        conversationId: attempt.conversation_id,
        practiceMode: attempt.practice_mode,
        replayOfSessionId: attempt.replay_of_session_id,
        scoreSummary: attempt.score_summary,
        feedbackSummary: attempt.feedback_summary,
        assessmentTimestamp: attempt.assessment_timestamp,
      })),
      activity: payload.activity,

      streak: {
        currentDays: payload.streak.current_days,
        longestDays: payload.streak.longest_days,
      },

      milestones: payload.milestones.map((milestone) => ({
        id: milestone.id,
        achieved: milestone.achieved,
        achievedAt: milestone.achieved_at,
        current: milestone.current,
        target: milestone.target,
      })),
    };
  },
};
