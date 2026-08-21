import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useState } from 'react';

import { AppHeader } from '../../components/ui/app-header';
import { SecondaryButton } from '../../components/ui/buttons';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { languageIdentities } from '../../constants/language-identity';
import { dataDeletionRequestApi } from '../../services/api';
import { useConsent } from '../../hooks/use-consent';
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
    consentTitle: 'Data sharing preferences',
    consentText:
      'Optional data uses can be controlled here. Assessment processing is required for speaking evaluation.',
    consentLearnMore:
      'Learn more: future AI data-sharing preferences will appear here as optional controls.',
    requiredTitle: 'Required for OpenVoz',
    speakingAssessmentTitle: 'Speaking assessment',
    speakingAssessmentText:
      'Recordings are processed to run speaking sessions. Speech is transcribed and evaluated. Feedback and progress signals are generated.',
    requiredStatus: 'Enabled / Required',
    optionalTitle: 'Optional choices',
    analyticsDescription:
      'Helps improve app performance and understand overall usage.',
    aiImprovementDescription:
      'Controls optional AI improvement and research use.',
    governanceTitle: 'Governance',
    governanceLead: 'OpenVoz follows responsible AI practices.',
    governanceData: 'You can review how your data is used.',
    governanceFuture: 'Future versions will provide data-sharing preferences.',
    transparencyTitle: 'Data transparency',
    audioLabel: 'Audio recordings',
    audioValue: 'Transcription and speaking assessment',
    responsesLabel: 'Responses',
    responsesValue: 'AI feedback generation',
    personalInfoLabel: 'Personal information',
    personalInfoValue: 'Not used for assessment decisions',
    rightsTitle: 'Your data rights',
    rightsReview: 'Review how your data is used.',
    rightsWithdraw: 'Withdraw optional consent.',
    rightsDelete: 'Request deletion of your data.',
    rightsAction: 'Request data deletion',
    rightsConfirmTitle: 'Request data deletion?',
    rightsConfirmText:
      'We will create a deletion request for review. This does not delete your data immediately.',
    rightsSuccess: 'Your deletion request was submitted.',
    rightsError: 'Could not submit your deletion request. Please try again.',
    howAiTitle: 'How AI is used',
    howAiPoint1: 'AI evaluates speaking performance using defined criteria.',
    howAiPoint2: 'AI assists assessment and feedback generation.',
    howAiPoint3: 'AI is not used for unrelated decisions.',
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
    consentTitle: 'Preferencias de compartición de datos',
    consentText:
      'Las opciones de uso opcional de datos se pueden controlar aquí. El procesamiento de la evaluación es necesario para la evaluación oral.',
    consentLearnMore:
      'Más información: aquí aparecerán futuras preferencias opcionales de compartición de datos de IA.',
    requiredTitle: 'Necesario para OpenVoz',
    speakingAssessmentTitle: 'Evaluación oral',
    speakingAssessmentText:
      'Las grabaciones se procesan para ejecutar las sesiones orales. El habla se transcribe y evalúa. Se generan comentarios y señales de progreso.',
    requiredStatus: 'Activado / Necesario',
    optionalTitle: 'Opciones opcionales',
    analyticsDescription:
      'Ayuda a mejorar el rendimiento de la app y entender el uso general.',
    aiImprovementDescription:
      'Controla el uso opcional de mejora e investigación de IA.',
    governanceTitle: 'Gobernanza',
    governanceLead: 'OpenVoz sigue prácticas responsables de IA.',
    governanceData: 'Puedes revisar cómo se usan tus datos.',
    governanceFuture: 'Las versiones futuras incluirán preferencias de compartición de datos.',
    transparencyTitle: 'Transparencia de datos',
    audioLabel: 'Grabaciones de audio',
    audioValue: 'Transcripción y evaluación oral',
    responsesLabel: 'Respuestas',
    responsesValue: 'Generación de comentarios con IA',
    personalInfoLabel: 'Información personal',
    personalInfoValue: 'No se usa para decisiones de evaluación',
    rightsTitle: 'Tus derechos sobre los datos',
    rightsReview: 'Revisa cómo se usan tus datos.',
    rightsWithdraw: 'Retira el consentimiento opcional.',
    rightsDelete: 'Solicita la eliminación de tus datos.',
    rightsAction: 'Solicitar eliminación de datos',
    rightsConfirmTitle: '¿Solicitar eliminación de datos?',
    rightsConfirmText:
      'Crearemos una solicitud para revisión. Esto no elimina tus datos de inmediato.',
    rightsSuccess: 'Tu solicitud de eliminación fue enviada.',
    rightsError: 'No se pudo enviar tu solicitud. Inténtalo de nuevo.',
    howAiTitle: 'Cómo se usa la IA',
    howAiPoint1: 'La IA evalúa el rendimiento oral usando criterios definidos.',
    howAiPoint2: 'La IA ayuda en la evaluación y generación de comentarios.',
    howAiPoint3: 'La IA no se usa para decisiones no relacionadas.',
    session: 'Sesión',
    logOut: 'Cerrar sesión',
  },
} as const;

export function SettingsScreen() {
  const uiLanguage = useUiPreferencesStore((state) => state.uiLanguage);
  const identity = languageIdentities[uiLanguage];
  const t = content[uiLanguage];
  const accentColor = uiLanguage === 'es' ? identity.accent : undefined;
  const consentQuery = useConsent();
  const [dataDeletionState, setDataDeletionState] = useState<{
    error: string | null;
    isSubmitting: boolean;
    success: string | null;
  }>({
    error: null,
    isSubmitting: false,
    success: null,
  });

  const logout = useAuthStore((state) => state.logout);
  const consent = consentQuery.consent;

  async function handleConsentChange(consentType: 'analytics' | 'ai_improvement', value: boolean) {
    try {
      await consentQuery.updateConsent(consentType, value);
    } catch {
      // Leave the current values visible and let the user retry.
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  async function submitDataDeletionRequest() {
    if (dataDeletionState.isSubmitting) {
      return;
    }

    setDataDeletionState({
      error: null,
      isSubmitting: true,
      success: null,
    });

    try {
      const response = await dataDeletionRequestApi.create();
      const payload = (await response.json()) as {
        created: boolean;
        reason: string;
        status: 'requested' | 'processing' | 'completed' | 'rejected';
      };

      setDataDeletionState({
        error: null,
        isSubmitting: false,
        success:
          payload.status === 'requested' || payload.status === 'processing'
            ? t.rightsSuccess
            : t.rightsSuccess,
      });
    } catch {
      setDataDeletionState({
        error: t.rightsError,
        isSubmitting: false,
        success: null,
      });
    }
  }

  function handleRequestDeletion() {
    Alert.alert(t.rightsAction, t.rightsConfirmText, [
      {
        text: uiLanguage === 'es' ? 'Cancelar' : 'Cancel',
        style: 'cancel',
      },
      {
        text: t.rightsAction,
        style: 'destructive',
        onPress: () => void submitDataDeletionRequest(),
      },
    ]);
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

        <SectionHeader description={t.consentLearnMore} title={t.consentTitle} />
        <View style={styles.infoCard}>
          <View style={styles.block}>
            <Text style={styles.sectionEyebrow}>{t.requiredTitle}</Text>
            <Text style={styles.infoTitle}>{t.speakingAssessmentTitle}</Text>
            <Text style={styles.infoText}>{t.speakingAssessmentText}</Text>
            <Text style={styles.requiredStatus}>{t.requiredStatus}</Text>
          </View>
          <View style={styles.blockDivider} />
          <View style={styles.block}>
            <Text style={styles.sectionEyebrow}>{t.optionalTitle}</Text>
            <Text style={styles.infoTitle}>{uiLanguage === 'es' ? 'Analítica' : 'Analytics'}</Text>
            <Text style={styles.infoText}>{t.analyticsDescription}</Text>
          </View>
          <View style={styles.blockDivider} />
          <View style={styles.block}>
            <Text style={styles.infoTitle}>
              {uiLanguage === 'es' ? 'Mejora de IA' : 'AI improvement'}
            </Text>
            <Text style={styles.infoText}>{t.aiImprovementDescription}</Text>
          </View>
        </View>

        <SectionHeader title={t.governanceTitle} />
        <View style={styles.infoCard}>
          <View style={styles.block}>
            <Text style={styles.infoTitle}>{t.governanceLead}</Text>
            <Text style={styles.infoText}>{t.governanceData}</Text>
            <Text style={styles.infoText}>{t.governanceFuture}</Text>
          </View>
        </View>

        <SectionHeader title={t.transparencyTitle} />
        <View style={styles.infoCard}>
          <View style={styles.block}>
            <Text style={styles.infoTitle}>{t.rightsTitle}</Text>
            <Text style={styles.infoText}>{t.rightsReview}</Text>
            <Text style={styles.infoText}>{t.rightsWithdraw}</Text>
            <Text style={styles.infoText}>{t.rightsDelete}</Text>
            <View style={styles.requestActionWrap}>
              <SecondaryButton
                disabled={dataDeletionState.isSubmitting}
                label={dataDeletionState.isSubmitting ? t.rightsAction : t.rightsAction}
                onPress={handleRequestDeletion}
              />
            </View>
            {dataDeletionState.success ? (
              <Text style={styles.successText}>{dataDeletionState.success}</Text>
            ) : null}
            {dataDeletionState.error ? (
              <Text style={styles.errorText}>{dataDeletionState.error}</Text>
            ) : null}
          </View>
          <View style={styles.blockDivider} />
          <View style={styles.block}>
            <Text style={styles.infoTitle}>{t.howAiTitle}</Text>
            <Text style={styles.infoText}>{t.howAiPoint1}</Text>
            <Text style={styles.infoText}>{t.howAiPoint2}</Text>
            <Text style={styles.infoText}>{t.howAiPoint3}</Text>
          </View>
          <View style={styles.blockDivider} />
          <View style={styles.consentRow}>
            <View style={styles.consentCopy}>
              <Text style={styles.infoTitle}>{uiLanguage === 'es' ? 'Analítica' : 'Analytics'}</Text>
              <Text style={styles.infoText}>
                {consentQuery.isLoading
                  ? uiLanguage === 'es'
                    ? 'Cargando estado de consentimiento...'
                    : 'Loading consent status...'
                  : uiLanguage === 'es'
                    ? 'Siempre activo para ejecutar la evaluación de tu práctica oral.'
                    : 'Always on to run your speaking assessment.'}
              </Text>
            </View>
            <Switch accessibilityLabel={t.speakingAssessmentTitle} disabled value={true} />
          </View>
          <View style={styles.blockDivider} />
          <View style={styles.consentRow}>
            <View style={styles.consentCopy}>
              <Text style={styles.infoTitle}>{uiLanguage === 'es' ? 'Analítica' : 'Analytics'}</Text>
              <Text style={styles.infoText}>{t.analyticsDescription}</Text>
              {consentQuery.error ? (
                <Text style={styles.errorText}>
                  {uiLanguage === 'es'
                    ? 'No se pudieron actualizar los ajustes. Inténtalo de nuevo.'
                    : 'Could not update settings. Please try again.'}
                </Text>
              ) : null}
            </View>
            <Switch
              accessibilityLabel={uiLanguage === 'es' ? 'Analítica' : 'Analytics'}
              disabled={consentQuery.isLoading}
              onValueChange={(value) => void handleConsentChange('analytics', value)}
              value={consent?.analytics ?? false}
            />
          </View>
          <View style={styles.blockDivider} />
          <View style={styles.consentRow}>
            <View style={styles.consentCopy}>
              <Text style={styles.infoTitle}>
                {uiLanguage === 'es' ? 'Mejora de IA' : 'AI improvement'}
              </Text>
              <Text style={styles.infoText}>{t.aiImprovementDescription}</Text>
            </View>
            <Switch
              accessibilityLabel={uiLanguage === 'es' ? 'Mejora de IA' : 'AI improvement'}
              disabled={consentQuery.isLoading}
              onValueChange={(value) => void handleConsentChange('ai_improvement', value)}
              value={consent?.aiImprovement ?? false}
            />
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
  errorText: {
    color: '#B21E35',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  successText: {
    color: '#1D7A6B',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  learnMoreText: {
    color: '#1D7A6B',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  infoTitle: {
    color: '#102A43',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  requiredStatus: {
    color: '#1D7A6B',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  sectionEyebrow: {
    color: '#627D98',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  consentCopy: {
    flex: 1,
    gap: 8,
  },
  requestActionWrap: {
    marginTop: 4,
  },
  consentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  transparencyLabel: {
    color: '#102A43',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  transparencyRow: {
    gap: 6,
  },
  transparencyValue: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 20,
  },
});
