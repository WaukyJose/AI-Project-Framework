import { router } from 'expo-router';
import { ScrollView } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { Badge } from '../../components/ui/badge';
import { SecondaryButton } from '../../components/ui/buttons';
import { ProgressCard, StatCard } from '../../components/ui/cards';
import { ResponsiveGrid } from '../../components/ui/grid';
import { ListItem } from '../../components/ui/listing';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { useDashboardData } from '../../hooks/use-dashboard-data';
import { useAuthStore } from '../../store/auth-store';
import { shellStyles } from '../shared/shell-styles';

export function DashboardScreen() {
  const logout = useAuthStore((state) => state.logout);
  const { data } = useDashboardData();
  const user = data?.user;
  const subscription = data?.subscription;
  const stats = data?.dashboard.stats;
  const badgeLabel = user?.username ?? 'OpenVoz';
  const welcomeTitle = user?.fullName ? `Welcome back, ${user.fullName}` : 'Welcome back';
  const subscriptionLabel = subscription?.hasSubscription
    ? subscription.plan.name ?? 'Active'
    : 'Inactive';
  const subscriptionStatusCaption = subscription?.hasSubscription
    ? subscription.validUntil
      ? `Valid until ${new Date(subscription.validUntil).toLocaleDateString()}`
      : 'Active subscription'
    : 'No active subscription';

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          eyebrow="Dashboard"
          subtitle="The authenticated shell now mirrors the documented OpenVoz structure and prepares the user for future speaking and assessment workflows."
          title={welcomeTitle}
          trailing={<Badge label={badgeLabel} />}
        />

        <ResponsiveGrid>
          <StatCard label="Questions answered" value={String(stats?.questionsAnswered ?? 0)} />
          <StatCard label="Accuracy" value={`${stats?.accuracy ?? 0}%`} />
          <StatCard label="Subscription" value={subscriptionLabel} />
        </ResponsiveGrid>

        <SectionHeader title="Continue Learning" />
        <ProgressCard
          accentValue="B2 First"
          caption="Continue Learning"
          description="Return to the B2 speaking pathway and future learning tasks from the authenticated shell."
          title="Next Recommended Action"
        />

        <ResponsiveGrid>
          <ProgressCard
            accentValue="B2 First"
            caption="Exam Focus"
            description="The initial mobile shell is centered on the OpenVoz B2 initiative while remaining reusable for later products."
            title="Current Program"
          />
          <ProgressCard
            accentValue={`${stats?.studyMinutes ?? 0} min`}
            caption="Practice Statistics"
            description={`Correct answers: ${stats?.correctAnswers ?? 0}. Current streak: ${stats?.streak ?? 0}.`}
            title="Practice Statistics"
          />
          <ProgressCard
            accentValue={`${data?.dashboard.recentActivity.length ?? 0} items`}
            caption="Recent Activity"
            description={
              (data?.dashboard.recentActivity.length ?? 0) > 0
                ? 'Recent attempts and completions are available from the aggregated dashboard feed.'
                : 'No recent activity is available yet.'
            }
            title="Recent Activity"
          />
          <ProgressCard
            accentValue={subscription?.status === 'active' ? 'Active' : 'Inactive'}
            caption="Subscription Status"
            description={subscriptionStatusCaption}
            title="Subscription"
          />
        </ResponsiveGrid>

        <SectionHeader title="Daily Goal" />
        <ListItem
          caption="Stay inside one primary workflow at a time and return to the dashboard when you need the next action."
          title="Build a daily practice rhythm"
          trailingLabel="Placeholder"
        />

        <SecondaryButton label="Log Out" onPress={() => void handleLogout()} />
      </ScrollView>
    </ScreenContainer>
  );
}
