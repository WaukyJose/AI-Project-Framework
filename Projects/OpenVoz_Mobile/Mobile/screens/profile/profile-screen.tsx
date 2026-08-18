import { router } from 'expo-router';
import { ScrollView } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { Avatar } from '../../components/ui/avatar';
import { SecondaryButton } from '../../components/ui/buttons';
import { ListItem } from '../../components/ui/listing';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { languageIdentities } from '../../constants/language-identity';
import { useSubscriptionStatus } from '../../hooks/use-subscription-status';
import { useAuthStore } from '../../store/auth-store';
import { useUiPreferencesStore } from '../../store/ui-preferences-store';
import { shellStyles } from '../shared/shell-styles';

const content = {
  en: {
    eyebrow: 'Profile',
    subtitle: 'View your account details, subscription status, and session access in one place.',
    title: 'Profile',
    userInformation: 'User Information',
    account: 'Account',
    activeUser: 'Active',
    logOut: 'Log Out',
    learnerFallback: 'OpenVoz Learner',
    emailFallback: 'Authenticated through the existing OpenVoz backend.',
    activeSubscription: 'Active subscription',
    activeUntilPrefix: 'Active until',
    noActiveSubscription: 'No active subscription was found for this account.',
    noSubscription: 'No subscription',
    subscriptionActive: 'Active',
    subscriptionInactive: 'Inactive',
  },
  es: {
    eyebrow: 'Perfil',
    subtitle:
      'Consulta los datos de tu cuenta, el estado de tu suscripción y el acceso a la sesión en un solo lugar.',
    title: 'Perfil',
    userInformation: 'Información del usuario',
    account: 'Cuenta',
    activeUser: 'Activo',
    logOut: 'Cerrar sesión',
    learnerFallback: 'Estudiante de OpenVoz',
    emailFallback: 'Autenticado mediante el backend existente de OpenVoz.',
    activeSubscription: 'Suscripción activa',
    activeUntilPrefix: 'Activa hasta',
    noActiveSubscription: 'No se encontró ninguna suscripción activa para esta cuenta.',
    noSubscription: 'Sin suscripción',
    subscriptionActive: 'Activa',
    subscriptionInactive: 'Inactiva',
  },
} as const;

export function ProfileScreen() {
  const uiLanguage = useUiPreferencesStore((state) => state.uiLanguage);
  const identity = languageIdentities[uiLanguage];
  const t = content[uiLanguage];
  const accentColor = uiLanguage === 'es' ? identity.accent : undefined;

  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { data: subscription } = useSubscriptionStatus();
  const profileLabel = user?.fullName ?? user?.username ?? t.learnerFallback;
  const emailCaption = user?.email ?? t.emailFallback;
  const subscriptionCaption = subscription?.hasSubscription
    ? subscription.validUntil
      ? `${t.activeUntilPrefix} ${new Date(subscription.validUntil).toLocaleDateString()}`
      : t.activeSubscription
    : t.noActiveSubscription;
  const subscriptionLabel = subscription?.plan.name ?? t.noSubscription;
  const subscriptionStatus =
    subscription?.status === 'active' ? t.subscriptionActive : t.subscriptionInactive;

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          accent={accentColor}
          eyebrow={t.eyebrow}
          subtitle={t.subtitle}
          title={t.title}
          trailing={<Avatar label={profileLabel} size={52} />}
        />

        <SectionHeader title={t.userInformation} />
        <ListItem caption={emailCaption} title={profileLabel} trailingLabel={t.activeUser} />

        <SectionHeader title={t.account} />
        <ListItem
          caption={subscriptionCaption}
          title={subscriptionLabel}
          trailingLabel={subscriptionStatus}
        />

        <SecondaryButton label={t.logOut} onPress={() => void handleLogout()} />
      </ScrollView>
    </ScreenContainer>
  );
}
