import { ScrollView } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { ProgressCard, StatCard } from '../../components/ui/cards';
import { ResponsiveGrid } from '../../components/ui/grid';
import { ListItem } from '../../components/ui/listing';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { shellStyles } from '../shared/shell-styles';

export function ProgressScreen() {
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          eyebrow="Progress"
          subtitle="The progress shell prepares learner-facing visibility without connecting to backend data yet."
          title="Progress"
        />

        <ResponsiveGrid>
          <StatCard label="Learning streak" value="04 days" />
          <StatCard label="Speaking sessions" value="00" />
          <StatCard label="Recent assessments" value="00" />
        </ResponsiveGrid>

        <SectionHeader title="Progress Overview" />
        <ResponsiveGrid>
          <ProgressCard
            accentValue="No results yet"
            caption="Recent Assessments"
            description="Assessment summaries will appear here after the shared assessment services are connected."
            title="Assessment Readiness"
          />
          <ProgressCard
            accentValue="Starting point"
            caption="Speaking Progress"
            description="Criterion-level and part-level growth views will reuse the shared assessment platform."
            title="Speaking Development"
          />
        </ResponsiveGrid>

        <SectionHeader title="Learning Momentum" />
        <ListItem
          caption="Badge and milestone tracking will appear here later."
          title="Achievements"
          trailingLabel="Planned"
        />
        <ListItem
          caption="Historical practice and speaking activity summaries will be grouped here."
          title="History"
          trailingLabel="Planned"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
