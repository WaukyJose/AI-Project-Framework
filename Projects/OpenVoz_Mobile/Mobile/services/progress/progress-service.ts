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

interface TaskIdentityResponse {
  topic?: string | null;
  question_index?: number | null;
  question_text?: string | null;
  photo_id?: string | null;
  photo_url?: string | null;
  scenario_id?: string | null;
  source_part3_session_id?: string | null;
  part3_scenario_id?: string | null;
  part4_set_id?: string | null;
  question_ids?: string[] | null;
}

interface AssessmentSummaryResponse {
  assessment_id?: string | null;
  assessment_timestamp?: string | null;
  assessment_status?: string | null;
  score_summary?: Record<string, unknown> | null;
  feedback_summary?: Record<string, unknown> | null;
  criterion_results_count?: number | null;
}

interface SpeakingHistoryResponse {
  session_id: string;
  speaking_part: number;
  completed_at: string | null;
  practice_mode: 'normal' | 'repeat' | 'new';
  is_replay: boolean;
  task_identity: TaskIdentityResponse | null;
  assessment_available: boolean;
  assessment_summary: AssessmentSummaryResponse | null;
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
  speaking_history: SpeakingHistoryResponse[];
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

export interface TaskIdentity {
  topic?: string | null;
  questionIndex?: number | null;
  questionText?: string | null;
  photoId?: string | null;
  photoUrl?: string | null;
  scenarioId?: string | null;
  sourcePart3SessionId?: string | null;
  part3ScenarioId?: string | null;
  part4SetId?: string | null;
  questionIds?: string[] | null;
}

export interface AssessmentSummary {
  assessmentId?: string | null;
  assessmentTimestamp?: string | null;
  assessmentStatus?: string | null;
  scoreSummary?: Record<string, unknown> | null;
  feedbackSummary?: Record<string, unknown> | null;
  criterionResultsCount?: number | null;
}

export interface SpeakingHistoryItem {
  sessionId: string;
  speakingPart: number;
  completedAt: string | null;
  practiceMode: 'normal' | 'repeat' | 'new';
  isReplay: boolean;
  taskIdentity: TaskIdentity | null;
  assessmentAvailable: boolean;
  assessmentSummary: AssessmentSummary | null;
}

export interface ProgressData {
  language: 'en' | 'es';
  completedSessions: number;
  assessedSessions: number;
  speakingHistory: SpeakingHistoryItem[];
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
      speakingHistory: (payload.speaking_history ?? []).map((item) => ({
        sessionId: item.session_id,
        speakingPart: item.speaking_part,
        completedAt: item.completed_at,
        practiceMode: item.practice_mode,
        isReplay: item.is_replay,
        taskIdentity: item.task_identity
          ? {
              topic: item.task_identity.topic ?? null,
              questionIndex: item.task_identity.question_index ?? null,
              questionText: item.task_identity.question_text ?? null,
              photoId: item.task_identity.photo_id ?? null,
              photoUrl: item.task_identity.photo_url ?? null,
              scenarioId: item.task_identity.scenario_id ?? null,
              sourcePart3SessionId: item.task_identity.source_part3_session_id ?? null,
              part3ScenarioId: item.task_identity.part3_scenario_id ?? null,
              part4SetId: item.task_identity.part4_set_id ?? null,
              questionIds: item.task_identity.question_ids ?? null,
            }
          : null,
        assessmentAvailable: item.assessment_available,
        assessmentSummary: item.assessment_summary
          ? {
              assessmentId: item.assessment_summary.assessment_id ?? null,
              assessmentTimestamp: item.assessment_summary.assessment_timestamp ?? null,
              assessmentStatus: item.assessment_summary.assessment_status ?? null,
              scoreSummary: item.assessment_summary.score_summary ?? null,
              feedbackSummary: item.assessment_summary.feedback_summary ?? null,
              criterionResultsCount: item.assessment_summary.criterion_results_count ?? null,
            }
          : null,
      })),

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
