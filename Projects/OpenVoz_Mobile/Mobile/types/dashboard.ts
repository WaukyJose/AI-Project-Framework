import { AuthUser } from './auth';
import { SubscriptionStatus } from './subscription';

export interface DashboardStats {
  accuracy: number;
  assessmentsCompleted: number;
  correctAnswers: number;
  questionsAnswered: number;
  streak: number;
  studyMinutes: number;
}

export interface DashboardActivityItem {
  [key: string]: unknown;
}

export interface MobileDashboardData {
  dashboard: {
    recentActivity: DashboardActivityItem[];
    stats: DashboardStats;
  };
  subscription: SubscriptionStatus;
  user: AuthUser;
}
