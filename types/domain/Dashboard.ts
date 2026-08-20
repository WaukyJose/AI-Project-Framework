import { UserProfile } from './UserProfile';
import { SubscriptionStatus } from './Subscription';

export interface LearningStats {
  readonly questionsAnswered: number;
  readonly correctAnswers: number;
  readonly accuracy: number;
  readonly studyMinutes: number;
  readonly streak: number;
  readonly assessmentsCompleted: number;
}

export interface ActivityItem {
  readonly id: string;
  readonly title: string;
  readonly timestamp: string;
  readonly score: number | null;
}

export interface DashboardPayload {
  readonly stats: LearningStats;
  readonly recentActivity: readonly ActivityItem[];
}

export interface DashboardSummary {
  readonly user: UserProfile;
  readonly subscription: SubscriptionStatus;
  readonly dashboard: DashboardPayload;
}
