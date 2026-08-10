import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { SecondaryButton } from '../../components/ui/buttons';
import { HeroCard } from '../../components/dashboard/hero-card';
import { ScreenContainer } from '../../components/ui/screen-container';
import { useDashboardData } from '../../hooks/use-dashboard-data';
import { useAuthStore } from '../../store/auth-store';
import { DashboardStats } from '../../types/dashboard';
import { shellStyles } from '../shared/shell-styles';

function formatAccuracy(stats: DashboardStats | undefined) {
  if (!stats || stats.questionsAnswered === 0) {
    return '—';
  }
  return `${stats.accuracy}%`;
}

export function DashboardScreen() {
  const logout = useAuthStore((state) => state.logout);
  const { data } = useDashboardData();
  const user = data?.user;
  const stats = data?.dashboard.stats;
  const recentActivity = data?.dashboard.recentActivity ?? [];
  const welcomeTitle = user?.fullName ? `Welcome back, ${user.fullName}` : 'Welcome back';

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          eyebrow="Dashboard"
          title={welcomeTitle}
        />

        <HeroCard
          actionLabel="Continue practice"
          onPress={() => router.push('/(app)/practice/b2-speaking')}
          orientation="Continue where you left off"
          subtitle="Part 1 · Interview"
          title="B2 First Speaking"
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Progress</Text>
          <View style={styles.progressRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{String(stats?.questionsAnswered ?? 0)}</Text>
              <Text style={styles.metricLabel}>Questions</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{stats?.studyMinutes ?? 0} min</Text>
              <Text style={styles.metricLabel}>Practice time</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{formatAccuracy(stats)}</Text>
              <Text style={styles.metricLabel}>Accuracy</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recent Activity</Text>
          {recentActivity.length > 0 ? (
            <Text style={styles.activityText}>
              {recentActivity.length} practice {recentActivity.length === 1 ? 'session' : 'sessions'} recorded.
            </Text>
          ) : (
            <View style={styles.activityEmpty}>
              <Text style={styles.activityText}>No practice sessions yet.</Text>
              <Text style={styles.activityText}>Start practicing to build your history.</Text>
            </View>
          )}
        </View>

        <SecondaryButton label="Log Out" onPress={() => void handleLogout()} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  activityEmpty: {
    gap: 2,
  },
  activityText: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  metricLabel: {
    color: '#486581',
    fontSize: 13,
    fontWeight: '600',
  },
  metricValue: {
    color: '#102A43',
    fontSize: 22,
    fontWeight: '800',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 12,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    color: '#0F4C5C',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
