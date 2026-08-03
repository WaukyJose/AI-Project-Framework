import { ScrollView } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { Badge } from '../../components/ui/badge';
import { ProgressCard, StatCard } from '../../components/ui/cards';
import { ResponsiveGrid } from '../../components/ui/grid';
import { ListItem } from '../../components/ui/listing';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { useAuthStore } from '../../store/auth-store';
import { shellStyles } from '../shared/shell-styles';

export function DashboardScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          eyebrow="Dashboard"
          subtitle="The authenticated shell now mirrors the documented OpenVoz structure and prepares the user for future speaking and assessment workflows."
          title="Welcome back"
          trailing={<Badge label={user?.identifier ?? 'OpenVoz'} />}
        />

        <ResponsiveGrid>
          <StatCard label="Daily goal" value="15 min" />
          <StatCard label="Practice sessions" value="01 ready" />
          <StatCard label="Subscription" value="Active" />
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
            accentValue="0 sessions"
            caption="Practice Statistics"
            description="Practice metrics will appear here once speaking and learning activities begin generating backend data."
            title="Practice Statistics"
          />
          <ProgressCard
            accentValue="No activity yet"
            caption="Recent Activity"
            description="Recent attempts, reviews, and completed tasks will surface here later."
            title="Recent Activity"
          />
          <ProgressCard
            accentValue="Active"
            caption="Subscription Status"
            description="Entitlement-aware subscription information will reuse the existing backend subscription system."
            title="Subscription"
          />
        </ResponsiveGrid>

        <SectionHeader title="Daily Goal" />
        <ListItem
          caption="Stay inside one primary workflow at a time and return to the dashboard when you need the next action."
          title="Build a daily practice rhythm"
          trailingLabel="Placeholder"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
