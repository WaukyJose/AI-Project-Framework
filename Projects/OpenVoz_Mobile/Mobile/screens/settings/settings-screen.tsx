import { ScrollView } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { SettingsRow } from '../../components/ui/listing';
import { shellStyles } from '../shared/shell-styles';

export function SettingsScreen() {
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          eyebrow="Settings"
          subtitle="Settings placeholders establish the long-term shell without implementing preferences yet."
          title="Settings"
        />

        <SectionHeader title="Application Preferences" />
        <SettingsRow
          description="Theme and visual behavior will remain lightweight and accessible."
          title="Appearance"
        />
        <SettingsRow
          description="Language selection will follow the shared content and account model."
          title="Language"
        />
        <SettingsRow
          description="Notification preferences remain out of scope for this sprint."
          title="Notifications"
        />
        <SettingsRow
          description="Microphone permissions will be surfaced when speaking features begin."
          title="Microphone"
        />
        <SettingsRow
          description="Privacy and data handling references will align with backend-owned account policies."
          title="Privacy"
        />
        <SettingsRow
          description="Application versioning and framework references will appear here."
          title="About"
        />
      </ScrollView>
    </ScreenContainer>
  );
}
