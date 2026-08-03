import { router } from 'expo-router';
import { ScrollView } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { PracticeCard } from '../../components/ui/cards';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { speakingParts } from '../../services/speaking/speaking-parts';
import { shellStyles } from '../shared/shell-styles';

export function B2SpeakingLandingScreen() {
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          eyebrow="B2 Speaking"
          subtitle="Shared speaking infrastructure is now available for each route. Part-specific task content still remains for later sprint work."
          title="Cambridge B2 Speaking"
        />

        <SectionHeader
          description="Each route opens the same reusable speaking workspace with timer, recording controls, upload, and evaluation integration."
          title="Practice Parts"
        />

        {speakingParts.map((part) => (
          <PracticeCard
            key={part.id}
            ctaLabel="Open workspace"
            description={part.description}
            enabled
            onPress={() => router.push(`/(app)/practice/${part.id}`)}
            statusLabel="Shared Infrastructure"
            title={part.title}
          />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
