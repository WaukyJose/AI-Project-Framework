import { ScrollView } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { Avatar } from '../../components/ui/avatar';
import { SecondaryButton } from '../../components/ui/buttons';
import { ListItem } from '../../components/ui/listing';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { useAuthStore } from '../../store/auth-store';
import { shellStyles } from '../shared/shell-styles';

export function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          eyebrow="Profile"
          subtitle="Account, subscription, and session actions remain grouped here to match the documented UX architecture."
          title="Profile"
          trailing={<Avatar label={user?.identifier ?? 'OpenVoz Learner'} size={52} />}
        />

        <SectionHeader title="User Information" />
        <ListItem
          caption="Authenticated through the existing OpenVoz backend."
          title={user?.identifier ?? 'Authenticated learner'}
          trailingLabel="Active"
        />

        <SectionHeader title="Account" />
        <ListItem
          caption="Subscription status and usage details will connect to backend services in a later sprint."
          title="Subscription"
          trailingLabel="Placeholder"
        />
        <ListItem
          caption="Profile editing remains out of scope until user APIs are formalized."
          title="Profile Details"
          trailingLabel="Planned"
        />

        <SecondaryButton label="Log Out" onPress={() => void logout()} />
      </ScrollView>
    </ScreenContainer>
  );
}
