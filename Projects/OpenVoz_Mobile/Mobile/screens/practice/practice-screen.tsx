import { router } from 'expo-router';
import { ScrollView } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { PracticeCard } from '../../components/ui/cards';
import { ResponsiveGrid } from '../../components/ui/grid';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { shellStyles } from '../shared/shell-styles';

export function PracticeScreen() {
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          eyebrow="Practice"
          subtitle="Choose a guided learning area. Only the B2 Speaking pathway is active in this sprint."
          title="Practice"
        />

        <ResponsiveGrid>
          <PracticeCard
            caption="Cambridge B2"
            ctaLabel="Open speaking pathway"
            description="Enter the reusable landing flow for Parts 1 through 4 without starting any speaking logic yet."
            enabled
            onPress={() => router.push('/(app)/practice/b2-speaking')}
            title="B2 Speaking"
          />
          <PracticeCard
            caption="Future skill area"
            description="Reading practice content, timing, and activity flows will be introduced in a later sprint."
            title="Reading"
          />
          <PracticeCard
            caption="Future skill area"
            description="Writing journeys will follow the same mobile shell once assessment and task services are ready."
            title="Writing"
          />
          <PracticeCard
            caption="Future skill area"
            description="Listening activities will reuse the shared navigation and content model defined for the platform."
            title="Listening"
          />
        </ResponsiveGrid>

        <SectionHeader
          description="Practice remains distinct from formal speaking assessment flows, but launches from the same authenticated shell."
          title="Practice Structure"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
