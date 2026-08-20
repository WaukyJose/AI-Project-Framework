import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { ProgressCard } from '../../components/ui/cards';
import { ListItem } from '../../components/ui/listing';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { languageIdentities } from '../../constants/language-identity';
import { useProgressData } from '../../hooks/use-progress-data';
import { useUiPreferencesStore } from '../../store/ui-preferences-store';
import { shellStyles } from '../shared/shell-styles';

const milestoneLabels = {
  en: {
    first_session: 'First speaking session',
    five_sessions: '5 speaking sessions completed',
    ten_sessions: '10 speaking sessions completed',
    twenty_sessions: '20 speaking sessions completed',
  },
  es: {
    first_session: 'Primera sesión oral',
    five_sessions: '5 sesiones orales completadas',
    ten_sessions: '10 sesiones orales completadas',
    twenty_sessions: '20 sesiones orales completadas',
  },
} as const;

const content = {
  en: {
    eyebrow: 'Progress',
    subtitle: 'Track your speaking practice, assessment results, and next areas to improve.',
    title: 'Progress',
    streakLabel: 'Streak',
    questionsLabel: 'Sessions',
    accuracyLabel: 'Assessments',
    developmentTitle: 'Speaking Development',
    developmentAccentValue: 'Practice activity',
    developmentCaption: 'Speaking Development',
    developmentDescription:
      'Complete speaking sessions and assessments to begin seeing strengths, recent progress, and next improvement areas.',
    assessmentTitle: 'Assessment Results',
    assessmentAccentValue: 'Assessment feedback',
    assessmentCaption: 'Assessment Summary',
    assessmentDescription:
      'Request feedback after a completed speaking session to begin tracking your assessment results.',
    recentActivityTitle: 'Recent Activity',
    recentActivityDescription: 'Review your latest speaking sessions and assessment results.',
    historyTitle: 'History',
    historyCaption:
      'Your recent speaking sessions and assessment history will appear here after your first completed session.',
    milestonesTitle: 'Milestones',
    milestonesCaption: 'Keep practising to unlock more speaking milestones.',
    milestoneAchieved: 'Completed',
    milestoneLocked: 'Keep practising',
    criterionTitle: 'Criterion Progress',
    criterionDescription: 'Track your Cambridge speaking criteria development.',
    criterionBandLabel: 'Band',
    criterionAverageLabel: 'Average band',
    criterionAssessmentsLabel: 'assessments',
  },
  es: {
    eyebrow: 'Progreso',
    subtitle:
      'Haz seguimiento de tu práctica oral, tus resultados de evaluación y las próximas áreas por mejorar.',
    title: 'Progreso',
    streakLabel: 'Racha',
    questionsLabel: 'Sesiones',
    accuracyLabel: 'Evaluaciones',
    developmentTitle: 'Desarrollo de expresión oral',
    developmentAccentValue: 'Actividad de práctica',
    developmentCaption: 'Desarrollo de expresión oral',
    developmentDescription:
      'Completa sesiones de práctica oral y evaluaciones para comenzar a ver tus fortalezas, tu progreso reciente y las próximas áreas de mejora.',
    assessmentTitle: 'Resultados de evaluación',
    assessmentAccentValue: 'Retroalimentación de evaluación',
    assessmentCaption: 'Resumen de evaluación',
    assessmentDescription:
      'Solicita una evaluación después de completar una sesión de práctica oral para comenzar a registrar tus resultados.',
    recentActivityTitle: 'Actividad reciente',
    recentActivityDescription:
      'Revisa tus sesiones orales más recientes y tus resultados de evaluación.',
    historyTitle: 'Historial',
    historyCaption:
      'Tus sesiones recientes de práctica oral y tu historial de evaluaciones aparecerán aquí después de tu primera sesión completada.',
    milestonesTitle: 'Hitos',
    milestonesCaption: 'Sigue practicando para desbloquear más hitos orales.',
    milestoneAchieved: 'Completado',
    milestoneLocked: 'Sigue practicando',
    criterionTitle: 'Progreso por criterio',
    criterionDescription: 'Sigue tu desarrollo en los criterios de expresión oral de Cambridge.',
    criterionBandLabel: 'Banda',
    criterionAverageLabel: 'Banda promedio',
    criterionAssessmentsLabel: 'evaluaciones', 
  },
} as const;

export function ProgressScreen() {
  const uiLanguage = useUiPreferencesStore((state) => state.uiLanguage);
  const identity = languageIdentities[uiLanguage];
  const t = content[uiLanguage];
  const milestoneText = milestoneLabels[uiLanguage];
  const accentColor = uiLanguage === 'es' ? identity.accent : undefined;
  const { data } = useProgressData(uiLanguage);
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader accent={accentColor} eyebrow={t.eyebrow} subtitle={t.subtitle} title={t.title} />

        <View style={styles.metricsPanel}>
          <View style={styles.metric}>
            <Text style={[styles.metricValue, accentColor ? { color: accentColor } : null]}>
              {data?.streak.currentDays ?? 0}
            </Text>
            <Text style={styles.metricLabel}>{t.streakLabel}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={[styles.metricValue, accentColor ? { color: accentColor } : null]}>
              {data?.completedSessions ?? 0}
            </Text>
            <Text style={styles.metricLabel}>{t.questionsLabel}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={[styles.metricValue, accentColor ? { color: accentColor } : null]}>
              {data?.assessedSessions ?? 0}
            </Text>
            <Text style={styles.metricLabel}>{t.accuracyLabel}</Text>
          </View>
        </View>

        <ProgressCard
          accentValue={t.developmentAccentValue}
          accentValueColor={accentColor}
          caption={t.developmentCaption}
          description={t.developmentDescription}
          title={t.developmentTitle}
        />

        <ProgressCard
          accentValue={t.assessmentAccentValue}
          accentValueColor={accentColor}
          caption={t.assessmentCaption}
          description={t.assessmentDescription}
          title={t.assessmentTitle}
        />

        <SectionHeader title={t.criterionTitle} description={t.criterionDescription} />
        {data?.criterionProgress.map((criterion) => (
          <ListItem
            key={criterion.criterion}
            title={criterion.criterionName}
            caption={`${t.criterionAverageLabel} ${criterion.averageBand} · ${criterion.assessmentsCount} ${t.criterionAssessmentsLabel}`}
            trailingLabel={`${t.criterionBandLabel} ${criterion.latestBand}`}
          />
        ))}

        <SectionHeader description={t.recentActivityDescription} title={t.recentActivityTitle} />
        <SectionHeader description={t.historyCaption} title={t.historyTitle} />

        {data?.recentAssessments.map((assessment) => (
          <ListItem
            key={assessment.assessmentId}
            title={
              assessment.speakingPart
                ? `${uiLanguage === 'es' ? 'Parte' : 'Part'} ${assessment.speakingPart}`
                : t.historyTitle
            }
            caption={new Date(assessment.assessmentTimestamp).toLocaleDateString()}
            trailingLabel={assessment.assessmentStatus.replaceAll('_', ' ')}
          />
        ))}
        <SectionHeader description={t.milestonesCaption} title={t.milestonesTitle} />

        {data?.milestones.map((milestone) => (
          <ListItem
            key={milestone.id}
            title={milestoneText[milestone.id as keyof typeof milestoneText] ?? milestone.id}
            caption={milestone.achieved ? t.milestoneAchieved : t.milestoneLocked}
            trailingLabel={milestone.achieved ? '✓' : '🔒'}
          />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  metric: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  metricDivider: {
    backgroundColor: '#D7E6ED',
    height: '100%',
    width: 1,
  },
  metricLabel: {
    color: '#486581',
    fontSize: 13,
    fontWeight: '700',
  },
  metricValue: {
    color: '#0F4C5C',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  metricsPanel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
});
