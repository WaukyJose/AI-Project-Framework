import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useState } from 'react';

import { AppHeader } from '../../components/ui/app-header';
import { SecondaryButton } from '../../components/ui/buttons';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { languageIdentities } from '../../constants/language-identity';
import {
  dataDeletionRequestApi,
  speakingProgressResetApi,
  type DataDeletionRequestResponse,
} from '../../services/api';
import { useConsent } from '../../hooks/use-consent';
import { useAuthStore } from '../../store/auth-store';
import { useUiPreferencesStore } from '../../store/ui-preferences-store';
import { shellStyles } from '../shared/shell-styles';
import { queryKeys } from '../../services/query/query-keys';
import {
  getDeletionRequestConfirmationText,
  getDeletionRequestOutcome,
  type DeletionRequestStatus,
} from './deletion-request-copy';

const PRIVACY_POLICY_URL = 'https://openvoz.com/static/chat/pages/page-privacy.html';
const TERMS_OF_SERVICE_URL = 'https://www.openvoz.com/terms-of-use/';
const PRIVACY_POLICY_VERSION = '1.0';

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
    requiredTitle: 'Required for OpenVoz',
    speakingAssessmentTitle: 'Speaking assessment',
    speakingAssessmentText: 'Required to provide speaking evaluation.',
    requiredStatus: 'Enabled / Required',
    optionalTitle: 'Optional choices',
    analyticsDescription:
      'Helps improve app performance and understand overall usage.',
    aiImprovementDescription:
      'Controls optional AI improvement and research use.',
    rightsTitle: 'Your data rights',
    rightsReview: 'Review how your data is used.',
    rightsWithdraw: 'Withdraw optional consent.',
    rightsDelete: 'Start permanent account deletion.',
    rightsAction: 'Delete account',
    rightsConfirmTitle: 'Delete account?',
    rightsConfirmText: getDeletionRequestConfirmationText('en'),
    rightsError: 'Could not submit your deletion request. Please try again.',
    speakingResetTitle: 'Speaking progress',
    speakingResetText:
      'Remove speaking practice history and assessment data without deleting your account.',
    speakingResetAction: 'Reset speaking progress',
    speakingResetConfirmTitle: 'Reset speaking progress?',
    speakingResetConfirmText:
      'This will permanently remove your speaking practice history, transcripts, assessments, streak, and progress for both English and Spanish. Your account and other learning data will not be affected.',
    speakingResetSuccess: 'Speaking progress reset.',
    speakingResetError: 'Could not reset speaking progress. Please try again.',
    privacyPolicyTitle: 'Privacy Policy',
    privacyPolicyText: 'Review how OpenVoz collects, uses, and protects your data.',
    termsTitle: 'Terms of Service',
    termsText: 'Review OpenVoz usage terms.',
    policyVersionLabel: 'Privacy policy version: 1.0',
    openPolicy: 'Open policy',
    openTerms: 'Open terms',
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
    requiredTitle: 'Necesario para OpenVoz',
    speakingAssessmentTitle: 'Evaluación oral',
    speakingAssessmentText: 'Necesario para proporcionar evaluación oral.',
    requiredStatus: 'Activado / Necesario',
    optionalTitle: 'Opciones opcionales',
    analyticsDescription:
      'Ayuda a mejorar el rendimiento de la app y entender el uso general.',
    aiImprovementDescription:
      'Controla el uso opcional de mejora e investigación de IA.',
    rightsTitle: 'Tus derechos sobre los datos',
    rightsReview: 'Revisa cómo se usan tus datos.',
    rightsWithdraw: 'Retira el consentimiento opcional.',
    rightsDelete: 'Inicia la eliminación permanente de tu cuenta.',
    rightsAction: 'Eliminar cuenta',
    rightsConfirmTitle: '¿Eliminar cuenta?',
    rightsConfirmText: getDeletionRequestConfirmationText('es'),
    rightsError: 'No se pudo enviar tu solicitud. Inténtalo de nuevo.',
    speakingResetTitle: 'Progreso de expresión oral',
    speakingResetText:
      'Elimina el historial de práctica oral y los datos de evaluación sin eliminar tu cuenta.',
    speakingResetAction: 'Restablecer progreso de expresión oral',
    speakingResetConfirmTitle: '¿Restablecer el progreso de expresión oral?',
    speakingResetConfirmText:
      'Esto eliminará permanentemente tu historial de práctica oral, transcripciones, evaluaciones, racha y progreso tanto en inglés como en español. Tu cuenta y otros datos de aprendizaje no se verán afectados.',
    speakingResetSuccess: 'Progreso de expresión oral restablecido.',
    speakingResetError: 'No se pudo restablecer el progreso de expresión oral. Inténtalo de nuevo.',
    privacyPolicyTitle: 'Política de privacidad',
    privacyPolicyText: 'Revisa cómo OpenVoz recopila, usa y protege tus datos.',
    termsTitle: 'Términos de servicio',
    termsText: 'Revisa los términos de uso de OpenVoz.',
    policyVersionLabel: 'Versión de la política de privacidad: 1.0',
    openPolicy: 'Abrir política',
    openTerms: 'Abrir términos',
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
  const queryClient = useQueryClient();
  const [dataDeletionState, setDataDeletionState] = useState<{
    error: string | null;
    isSubmitting: boolean;
    success: string | null;
  }>({
    error: null,
    isSubmitting: false,
    success: null,
  });
  const [isHowAiExpanded, setIsHowAiExpanded] = useState(false);
  const [isRightsExpanded, setIsRightsExpanded] = useState(false);
  const [speakingResetState, setSpeakingResetState] = useState<{
    error: string | null;
    isSubmitting: boolean;
    success: string | null;
  }>({ error: null, isSubmitting: false, success: null });

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

  async function openExternalUrl(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      // Ignore failures; the UI remains usable without opening the link.
    }
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
      const payload = (await response.json()) as DataDeletionRequestResponse;
      const outcome = getDeletionRequestOutcome(uiLanguage, payload.status);

      setDataDeletionState({
        error: outcome.kind === 'error' ? outcome.message : null,
        isSubmitting: false,
        success: outcome.kind === 'success' ? outcome.message : null,
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

  async function resetSpeakingProgress() {
    if (speakingResetState.isSubmitting) {
      return;
    }

    setSpeakingResetState({ error: null, isSubmitting: true, success: null });
    try {
      await speakingProgressResetApi.reset();
      await Promise.all(
        (['en', 'es'] as const).flatMap((language) => [
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(language) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.progress(language) }),
        ])
      );
      setSpeakingResetState({ error: null, isSubmitting: false, success: t.speakingResetSuccess });
    } catch {
      setSpeakingResetState({ error: t.speakingResetError, isSubmitting: false, success: null });
    }
  }

  function handleResetSpeakingProgress() {
    Alert.alert(t.speakingResetConfirmTitle, t.speakingResetConfirmText, [
      { text: uiLanguage === 'es' ? 'Cancelar' : 'Cancel', style: 'cancel' },
      {
        text: t.speakingResetAction,
        style: 'destructive',
        onPress: () => void resetSpeakingProgress(),
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

        <SectionHeader title={t.privacyAiTitle} />
        <View style={styles.infoCard}>
          <View style={styles.settingsSection}>
            <Text style={styles.sectionLabel}>{t.requiredTitle}</Text>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{t.speakingAssessmentTitle}</Text>
                <Text style={styles.rowDescription}>{t.speakingAssessmentText}</Text>
              </View>
              <Text style={styles.rowStatus}>{t.requiredStatus}</Text>
            </View>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.settingsSection}>
            <Text style={styles.sectionLabel}>{t.optionalTitle}</Text>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{uiLanguage === 'es' ? 'Analítica' : 'Analytics'}</Text>
                <Text style={styles.rowDescription}>{t.analyticsDescription}</Text>
              </View>
              <Switch
                accessibilityLabel={uiLanguage === 'es' ? 'Analítica' : 'Analytics'}
                disabled={consentQuery.isLoading}
                onValueChange={(value) => void handleConsentChange('analytics', value)}
                value={consent?.analytics ?? false}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>
                  {uiLanguage === 'es' ? 'Mejora de IA' : 'AI improvement'}
                </Text>
                <Text style={styles.rowDescription}>{t.aiImprovementDescription}</Text>
              </View>
              <Switch
                accessibilityLabel={uiLanguage === 'es' ? 'Mejora de IA' : 'AI improvement'}
                disabled={consentQuery.isLoading}
                onValueChange={(value) => void handleConsentChange('ai_improvement', value)}
                value={consent?.aiImprovement ?? false}
              />
            </View>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.settingsSection}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isHowAiExpanded }}
              onPress={() => setIsHowAiExpanded((current) => !current)}
              style={styles.disclosureRow}
            >
              <Text style={styles.rowTitle}>{t.howAiTitle}</Text>
              <Text style={styles.disclosureChevron}>{isHowAiExpanded ? '⌄' : '›'}</Text>
            </Pressable>
            {isHowAiExpanded ? (
              <View style={styles.expandedCopy}>
                <Text style={styles.infoText}>{t.howAiPoint1}</Text>
                <Text style={styles.infoText}>{t.howAiPoint2}</Text>
                <Text style={styles.infoText}>{t.howAiPoint3}</Text>
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isRightsExpanded }}
              onPress={() => setIsRightsExpanded((current) => !current)}
              style={styles.disclosureRow}
            >
              <Text style={styles.rowTitle}>{t.rightsTitle}</Text>
              <Text style={styles.disclosureChevron}>{isRightsExpanded ? '⌄' : '›'}</Text>
            </Pressable>
            {isRightsExpanded ? (
              <View style={styles.expandedCopy}>
                <Text style={styles.infoText}>{t.rightsReview}</Text>
                <Text style={styles.infoText}>{t.rightsWithdraw}</Text>
                <Text style={styles.infoText}>{t.rightsDelete}</Text>
                <View style={styles.requestActionWrap}>
                  <SecondaryButton
                    disabled={dataDeletionState.isSubmitting}
                    label={t.rightsAction}
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
            ) : null}
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.settingsSection}>
            <Text style={styles.sectionLabel}>{uiLanguage === 'es' ? 'Legal' : 'Legal'}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void openExternalUrl(PRIVACY_POLICY_URL)}
              style={styles.disclosureRow}
            >
              <Text style={styles.rowTitle}>{t.privacyPolicyTitle}</Text>
              <Text style={styles.disclosureChevron}>›</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => void openExternalUrl(TERMS_OF_SERVICE_URL)}
              style={styles.disclosureRow}
            >
              <Text style={styles.rowTitle}>{t.termsTitle}</Text>
              <Text style={styles.disclosureChevron}>›</Text>
            </Pressable>
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{t.policyVersionLabel}</Text>
            </View>
          </View>
        </View>

        <SectionHeader title={t.speakingResetTitle} />
        <View style={styles.infoCard}>
          <View style={styles.settingsSection}>
            <Text style={styles.rowDescription}>{t.speakingResetText}</Text>
            <View style={styles.requestActionWrap}>
              <SecondaryButton
                disabled={speakingResetState.isSubmitting}
                label={t.speakingResetAction}
                onPress={handleResetSpeakingProgress}
              />
            </View>
            {speakingResetState.success ? <Text style={styles.successText}>{speakingResetState.success}</Text> : null}
            {speakingResetState.error ? <Text style={styles.errorText}>{speakingResetState.error}</Text> : null}
          </View>
        </View>

        <SectionHeader
          description={
            uiLanguage === 'es'
              ? 'La eliminación de cuenta inicia una solicitud permanente y no es inmediata.'
              : 'Account deletion starts a permanent request and is not immediate.'
          }
          title={uiLanguage === 'es' ? 'Cuenta' : 'Account'}
        />
        <View style={styles.infoCard}>
          <View style={styles.settingsSection}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{t.rightsAction}</Text>
                <Text style={styles.rowDescription}>{t.rightsDelete}</Text>
              </View>
            </View>
            <View style={styles.requestActionWrap}>
              <SecondaryButton
                accent="#B21E35"
                disabled={dataDeletionState.isSubmitting}
                label={t.rightsAction}
                onPress={handleRequestDeletion}
              />
            </View>
            {dataDeletionState.success ? <Text style={styles.successText}>{dataDeletionState.success}</Text> : null}
            {dataDeletionState.error ? <Text style={styles.errorText}>{dataDeletionState.error}</Text> : null}
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
  sectionDivider: {
    backgroundColor: '#D9E2EC',
    height: 1,
    marginVertical: 12,
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
  sectionLabel: {
    color: '#627D98',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: '#102A43',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  rowDescription: {
    color: '#52606D',
    fontSize: 13,
    lineHeight: 18,
  },
  rowStatus: {
    color: '#1D7A6B',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  disclosureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  disclosureChevron: {
    color: '#627D98',
    fontSize: 22,
    lineHeight: 22,
  },
  expandedCopy: {
    gap: 8,
    paddingBottom: 4,
    paddingLeft: 4,
  },
  requestActionWrap: {
    marginTop: 8,
  },
  settingsSection: {
    gap: 2,
  },
});
