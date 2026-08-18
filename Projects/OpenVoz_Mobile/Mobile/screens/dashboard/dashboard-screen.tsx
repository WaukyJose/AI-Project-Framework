import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../components/ui/avatar';
import { ScreenContainer } from '../../components/ui/screen-container';
import { useDashboardData } from '../../hooks/use-dashboard-data';
import { useAuthStore } from '../../store/auth-store';
import { DashboardActivityItem, DashboardStats } from '../../types/dashboard';

function formatAccuracy(stats: DashboardStats | undefined) {
  if (!stats || stats.questionsAnswered === 0) {
    return '—';
  }
  return `${stats.accuracy}%`;
}

function formatFirstName(fullName: string | null | undefined, username: string | undefined) {
  if (fullName?.trim()) {
    return fullName.trim().split(/\s+/)[0] ?? 'Learner';
  }

  if (username?.trim()) {
    return username.trim().split(/[._\s-]+/)[0] ?? 'Learner';
  }

  return 'Learner';
}

function formatQuestionsLabel(count: number) {
  return count === 1 ? 'question' : 'questions';
}

function formatSessionsLabel(count: number) {
  return count === 1 ? 'session' : 'sessions';
}

function extractText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function buildRecentSessionRows(items: DashboardActivityItem[]) {
  return items.slice(0, 3).map((item, index) => {
    const title =
      extractText(item.title) ??
      extractText(item.name) ??
      extractText(item.part_title) ??
      extractText(item.label) ??
      `Speaking session ${index + 1}`;
    const meta =
      extractText(item.subtitle) ??
      extractText(item.description) ??
      extractText(item.date) ??
      extractText(item.created_at) ??
      'Recorded session';
    const badge =
      extractText(item.score) ??
      extractText(item.band) ??
      extractText(item.result) ??
      null;

    return { badge, meta, title };
  });
}

export function DashboardScreen() {
  const logout = useAuthStore((state) => state.logout);
  const { data } = useDashboardData();
  const user = data?.user;
  const stats = data?.dashboard.stats;
  const recentActivity = data?.dashboard.recentActivity ?? [];
  const firstName = formatFirstName(user?.fullName, user?.username);
  const recentSessions = buildRecentSessionRows(recentActivity);
  const sessionCount = recentActivity.length;
  const progressFill = Math.min(1, Math.max(sessionCount, 1) / 4);

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>Good morning</Text>
            <Text style={styles.headerName}>{firstName}</Text>
          </View>
          <Avatar label={user?.fullName ?? user?.username ?? 'Learner'} size={40} />
        </View>

        <View style={styles.examCard}>
          <View>
            <Text style={styles.examEyebrow}>Cambridge B2 First</Text>
            <Text style={styles.examTitle}>Speaking practice ready</Text>
          </View>
          <View style={styles.examStat}>
            <Text style={styles.examStatValue}>4</Text>
            <Text style={styles.examStatLabel}>parts</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/(app)/practice/b2-speaking')}
          style={({ pressed }) => [styles.continueCard, pressed && styles.continueCardPressed]}
        >
          <View style={styles.continueHeader}>
            <View style={styles.continueIcon}>
              <Text style={styles.continueIconGlyph}>▶</Text>
            </View>
            <View style={styles.continueHeaderCopy}>
              <Text style={styles.continueEyebrow}>Continue learning</Text>
              <Text style={styles.continueTitle}>B2 Speaking workspace</Text>
            </View>
            <View style={styles.chevronButton}>
              <Text style={styles.chevronText}>›</Text>
            </View>
          </View>

          <Text style={styles.continueBody}>
            {sessionCount > 0
              ? `You have ${sessionCount} recorded ${sessionCount === 1 ? 'session' : 'sessions'}. Continue practicing or review your latest work.`
              : 'Start your first speaking session and move through Parts 1 to 4 from one guided workspace.'}
          </Text>

          <View style={styles.progressBlock}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Speaking activity</Text>
              <Text style={styles.progressAccent}>
                {sessionCount > 0
                  ? `${sessionCount} ${formatSessionsLabel(sessionCount)} logged`
                  : '4 parts available'}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressFill * 100}%` }]} />
            </View>
          </View>
        </Pressable>

        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Questions</Text>
            <Text style={styles.metricValue}>{stats?.questionsAnswered ?? 0}</Text>
            <Text style={styles.metricSub}>{formatQuestionsLabel(stats?.questionsAnswered ?? 0)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Streak</Text>
            <Text style={[styles.metricValue, styles.metricValueAccent]}>{stats?.streak ?? 0}</Text>
            <Text style={styles.metricSub}>days</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <Pressable onPress={() => router.push('/(app)/progress')}>
            <Text style={styles.sectionAction}>View all →</Text>
          </Pressable>
        </View>

        {recentSessions.length > 0 ? (
          <View style={styles.sessionList}>
            {recentSessions.map((session, index) => (
              <View
                key={`${session.title}-${index}`}
                style={[styles.sessionRow, index === recentSessions.length - 1 && styles.sessionRowLast]}
              >
                <View style={[styles.sessionIconWrap, session.badge && styles.sessionIconWrapActive]}>
                  <Text style={[styles.sessionIcon, session.badge && styles.sessionIconActive]}>◦</Text>
                </View>
                <View style={styles.sessionCopy}>
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  <Text style={styles.sessionMeta}>{session.meta}</Text>
                </View>
                {session.badge ? (
                  <View style={[styles.sessionBadge, styles.sessionBadgeActive]}>
                    <Text style={[styles.sessionBadgeText, styles.sessionBadgeTextActive]}>{session.badge}</Text>
                  </View>
                ) : (
                  <View style={styles.sessionBadge}>
                    <Text style={styles.sessionBadgeText}>B2</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptyText}>Your recent speaking sessions will appear here after your first recording.</Text>
          </View>
        )}

        <View style={styles.secondaryStats}>
          <View style={styles.secondaryCard}>
            <Text style={styles.secondaryTitle}>Accuracy</Text>
            <Text style={styles.secondaryValue}>{formatAccuracy(stats)}</Text>
            <Text style={styles.secondaryText}>Assessment accuracy becomes more useful after a few completed tasks.</Text>
          </View>
          <View style={styles.secondaryCard}>
            <Text style={styles.secondaryTitle}>Practice time</Text>
            <Text style={styles.secondaryValue}>{stats?.studyMinutes ?? 0} min</Text>
            <Text style={styles.secondaryText}>Every recorded minute strengthens speaking routine and review quality.</Text>
          </View>
        </View>

        <Pressable onPress={() => void handleLogout()} style={styles.logoutAction}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingBottom: 12,
    paddingTop: 20,
  },
  continueBody: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
  },
  continueCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9F0',
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    paddingBottom: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  continueCardPressed: {
    opacity: 0.92,
  },
  continueEyebrow: {
    color: '#1D7A6B',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  continueHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  continueHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  continueIcon: {
    alignItems: 'center',
    backgroundColor: '#1D7A6B',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  continueIconGlyph: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  continueTitle: {
    color: '#1A2B4A',
    fontSize: 15,
    fontWeight: '600',
  },
  chevronButton: {
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  chevronText: {
    color: '#1A2B4A',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9F0',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
  },
  emptyTitle: {
    color: '#1A2B4A',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  examCard: {
    alignItems: 'center',
    backgroundColor: '#1A2B4A',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  examEyebrow: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  examStat: {
    alignItems: 'flex-end',
  },
  examStatLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
  },
  examStatValue: {
    color: '#FFFFFF',
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 28,
  },
  examTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  headerCopy: {
    gap: 4,
  },
  headerEyebrow: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headerName: {
    color: '#1A2B4A',
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '600',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logoutAction: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9F0',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 2,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricSub: {
    color: '#64748B',
    fontSize: 11,
  },
  metricValue: {
    color: '#1A2B4A',
    fontFamily: 'Georgia',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 29,
  },
  metricValueAccent: {
    color: '#B8762A',
  },
  progressAccent: {
    color: '#1D7A6B',
    fontSize: 11,
    fontWeight: '600',
  },
  progressBlock: {
    gap: 8,
  },
  progressFill: {
    backgroundColor: '#2A9B8A',
    borderRadius: 10,
    height: 5,
  },
  progressLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTrack: {
    backgroundColor: '#EAF4F2',
    borderRadius: 10,
    height: 5,
    overflow: 'hidden',
  },
  logoutText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9F0',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  secondaryStats: {
    gap: 12,
  },
  secondaryText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
  },
  secondaryTitle: {
    color: '#1A2B4A',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryValue: {
    color: '#1D7A6B',
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionAction: {
    color: '#1D7A6B',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#1A2B4A',
    fontSize: 14,
    fontWeight: '600',
  },
  sessionBadge: {
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  sessionBadgeActive: {
    backgroundColor: '#EAF4F2',
  },
  sessionBadgeText: {
    color: '#1A2B4A',
    fontSize: 11,
    fontWeight: '700',
  },
  sessionBadgeTextActive: {
    color: '#1D7A6B',
  },
  sessionCopy: {
    flex: 1,
    gap: 2,
  },
  sessionIcon: {
    color: '#1A2B4A',
    fontSize: 18,
    lineHeight: 18,
  },
  sessionIconActive: {
    color: '#1D7A6B',
  },
  sessionIconWrap: {
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 9,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  sessionIconWrapActive: {
    backgroundColor: '#EAF4F2',
  },
  sessionList: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9F0',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 18,
  },
  sessionMeta: {
    color: '#64748B',
    fontSize: 11,
  },
  sessionRow: {
    alignItems: 'center',
    borderBottomColor: '#E4E9F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  sessionRowLast: {
    borderBottomWidth: 0,
  },
  sessionTitle: {
    color: '#1A2B4A',
    fontSize: 13,
    fontWeight: '500',
  },
});
