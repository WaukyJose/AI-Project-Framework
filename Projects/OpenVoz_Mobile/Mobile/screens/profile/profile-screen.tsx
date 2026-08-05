import { router } from 'expo-router';
import { ScrollView } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { Avatar } from '../../components/ui/avatar';
import { SecondaryButton } from '../../components/ui/buttons';
import { ListItem } from '../../components/ui/listing';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { useSubscriptionStatus } from '../../hooks/use-subscription-status';
import { useAuthStore } from '../../store/auth-store';
import { shellStyles } from '../shared/shell-styles';

export function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { data: subscription } = useSubscriptionStatus();
  const profileLabel = user?.fullName ?? user?.username ?? 'OpenVoz Learner';
  const emailCaption = user?.email ?? 'Authenticated through the existing OpenVoz backend.';
  const subscriptionCaption = subscription?.hasSubscription
    ? subscription.validUntil
      ? `Active until ${new Date(subscription.validUntil).toLocaleDateString()}`
      : 'Active subscription'
    : 'No active subscription was found for this account.';
  const subscriptionLabel = subscription?.plan.name ?? 'No subscription';
  const subscriptionStatus = subscription?.status === 'active' ? 'Active' : 'Inactive';

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          eyebrow="Profile"
          subtitle="Account, subscription, and session actions remain grouped here to match the documented UX architecture."
          title="Profile"
          trailing={<Avatar label={profileLabel} size={52} />}
        />

        <SectionHeader title="User Information" />
        <ListItem
          caption={emailCaption}
          title={profileLabel}
          trailingLabel="Active"
        />

        <SectionHeader title="Account" />
        <ListItem
          caption={subscriptionCaption}
          title={subscriptionLabel}
          trailingLabel={subscriptionStatus}
        />
        <ListItem
          caption="Profile editing remains out of scope until user APIs are formalized."
          title="Profile Details"
          trailingLabel="Planned"
        />

        <SecondaryButton label="Log Out" onPress={() => void handleLogout()} />
      </ScrollView>
    </ScreenContainer>
  );
}
