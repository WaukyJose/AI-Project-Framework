import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { SecondaryButton } from '../../components/ui/buttons';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { languageIdentities } from '../../constants/language-identity';
import { useAuthStore } from '../../store/auth-store';
import { useUiPreferencesStore } from '../../store/ui-preferences-store';
import { shellStyles } from '../shared/shell-styles';

const content = {
  en: {
    eyebrow: 'Settings',
    subtitle:
      'Most app behaviour follows your device defaults. Use this screen for session access and future app options.',
    title: 'Settings',
    appAccess: 'App Access',
    appAccessDescription:
      'App-level preferences will appear here when they become useful and configurable inside OpenVoz.',
    noSettingsTitle: 'No additional settings yet',
    noSettingsText:
      'Speaking permissions are requested when needed, and appearance and language continue to use your device settings.',
    privacyAiTitle: 'Privacy & AI',
    recordingsTitle: 'Speaking recordings',
    recordingsText:
      'Your speaking recordings are used to run the session, generate feedback, and keep your practice history available in the app.',
    aiTitle: 'AI assessment',
    aiText:
      'AI assessment reviews your speaking session against the current criteria and returns feedback, bands, and progress signals.',
    consentTitle: 'Future consent controls',
    consentText:
      'Options for AI improvement and research consent will appear later. This page is only a transparency summary for now.',
    session: 'Session',
    logOut: 'Log Out',
  },
  es: {
    eyebrow: 'Configuración',
    subtitle:
      'La mayoría del comportamiento de la aplicación sigue los ajustes predeterminados de tu dispositivo. Usa esta pantalla para el acceso a la sesión y las próximas opciones de la aplicación.',
    title: 'Configuración',
    appAccess: 'Acceso a la aplicación',
    appAccessDescription:
      'Las preferencias de la aplicación aparecerán aquí cuando resulten útiles y configurables dentro de OpenVoz.',
    noSettingsTitle: 'Aún no hay ajustes adicionales',
    noSettingsText:
      'Los permisos de uso del micrófono se solicitan cuando es necesario, y la apariencia y el idioma continúan usando los ajustes de tu dispositivo.',
    privacyAiTitle: 'Privacidad e IA',
    recordingsTitle: 'Grabaciones orales',
    recordingsText:
      'Tus grabaciones orales se usan para ejecutar la sesión, generar comentarios y mantener disponible tu historial de práctica en la aplicación.',
    aiTitle: 'Evaluación con IA',
    aiText:
      'La evaluación con IA revisa tu sesión oral según los criterios actuales y devuelve comentarios, bandas y señales de progreso.',
    consentTitle: 'Controles de consentimiento futuros',
    consentText:
      'Más adelante aparecerán opciones de consentimiento para mejora de IA e investigación. Esta página solo ofrece transparencia por ahora.',
    session: 'Sesión',
    logOut: 'Cerrar sesión',
  },
} as const;

export function SettingsScreen() {
  const uiLanguage = useUiPreferencesStore((state) => state.uiLanguage);
  const identity = languageIdentities[uiLanguage];
  const t = content[uiLanguage];
  const accentColor = uiLanguage === 'es' ? identity.accent : undefined;

  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader accent={accentColor} eyebrow={t.eyebrow} subtitle={t.subtitle} title={t.title} />

        <SectionHeader description={t.appAccessDescription} title={t.appAccess} />
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t.noSettingsTitle}</Text>
          <Text style={styles.infoText}>{t.noSettingsText}</Text>
        </View>

        <SectionHeader title={t.privacyAiTitle} />
        <View style={styles.infoCard}>
          <View style={styles.block}>
            <Text style={styles.infoTitle}>{t.recordingsTitle}</Text>
            <Text style={styles.infoText}>{t.recordingsText}</Text>
          </View>
          <View style={styles.blockDivider} />
          <View style={styles.block}>
            <Text style={styles.infoTitle}>{t.aiTitle}</Text>
            <Text style={styles.infoText}>{t.aiText}</Text>
          </View>
          <View style={styles.blockDivider} />
          <View style={styles.block}>
            <Text style={styles.infoTitle}>{t.consentTitle}</Text>
            <Text style={styles.infoText}>{t.consentText}</Text>
          </View>
        </View>

        <SectionHeader title={t.session} />
        <SecondaryButton label={t.logOut} onPress={() => void handleLogout()} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  block: {
    gap: 8,
  },
  blockDivider: {
    backgroundColor: '#D9E2EC',
    height: 1,
    marginVertical: 14,
  },
  infoText: {
    color: '#52606D',
    fontSize: 15,
    lineHeight: 22,
  },
  infoTitle: {
    color: '#102A43',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
});
