import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { ListItem } from '../../components/ui/listing';
import { SpeakingDevelopmentContinuum } from '../../components/progress/speaking-development-continuum';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { languageIdentities } from '../../constants/language-identity';
import { formatAssessmentStatusLabel } from '../../services/assessment-status-labels';
import { useProgressData } from '../../hooks/use-progress-data';
import type {
  AssessmentSummary,
  Part1HistoryItem,
  SpeakingHistoryItem,
  TaskIdentity,
} from '../../services/progress/progress-service';
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

const speakingHistoryLabels = {
  en: {
    empty: 'No completed speaking attempts yet.',
    replay: 'Replay',
    assessmentAvailable: 'Assessment available',
  },
  es: {
    empty: 'Aún no hay intentos orales completados.',
    replay: 'Repetición',
    assessmentAvailable: 'Evaluación disponible',
  },
} as const;

const part1AttemptLabels = {
  en: {
    normal: 'First practice',
    repeat: 'Repeat practice',
    new: 'New questions',
  },
  es: {
    normal: 'Primera práctica',
    repeat: 'Práctica repetida',
    new: 'Preguntas nuevas',
  },
} as const;

const part1InsightLabels = {
  en: {
    title: 'Your Part 1 Progress',
    attemptsCompleted: 'Attempts completed',
    bestScore: 'Best score',
    progress: 'Progress',
    unavailable: 'Unavailable',
    noData: 'No completed Part 1 attempts yet.',
  },
  es: {
    title: 'Tu progreso de la Parte 1',
    attemptsCompleted: 'Intentos completados',
    bestScore: 'Mejor puntuación',
    progress: 'Progreso',
    unavailable: 'No disponible',
    noData: 'Aún no hay intentos completados de la Parte 1.',
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
    assessmentSectionTitle: 'Assessment feedback',
    criterionSectionTitle: 'Criteria progress',
    criterionSectionDescription: 'Track your Cambridge speaking criteria development.',
    recentSectionTitle: 'Recent activity',
    partHistorySectionTitle: 'Part 1 history',
    partHistorySectionDescription: 'Review your completed Part 1 attempts, scores, and feedback.',
    milestonesSectionTitle: 'Milestones',
    milestonesSectionDescription: 'Keep practising to unlock more speaking milestones.',
    emptyRecentActivity: 'Complete your first speaking session to see your activity here.',
    milestoneAchieved: 'Completed',
    milestoneLocked: 'Keep practising',
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
    assessmentSectionTitle: 'Comentarios de evaluación',
    criterionSectionTitle: 'Progreso por criterios',
    criterionSectionDescription: 'Sigue tu desarrollo en los criterios de expresión oral de Cambridge.',
    recentSectionTitle: 'Actividad reciente',
    partHistorySectionTitle: 'Historial de la Parte 1',
    partHistorySectionDescription:
      'Revisa tus intentos completados de la Parte 1, tus puntuaciones y tu retroalimentación.',
    milestonesSectionTitle: 'Hitos',
    milestonesSectionDescription: 'Sigue practicando para desbloquear más hitos orales.',
    emptyRecentActivity: 'Completa tu primera sesión oral para ver tu actividad aquí.',
    milestoneAchieved: 'Completado',
    milestoneLocked: 'Sigue practicando',
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
  const part1AttemptText = part1AttemptLabels[uiLanguage];
  const part1InsightText = part1InsightLabels[uiLanguage];
  const speakingHistoryText = speakingHistoryLabels[uiLanguage];
  const accentColor = uiLanguage === 'es' ? identity.accent : undefined;
  const { data } = useProgressData(uiLanguage);
  const part1Insights = buildPart1Insights(data?.part1History ?? []);
  const speakingHistory = data?.speakingHistory ?? [];
  const recentSpeakingHistory = speakingHistory.slice(0, 10);
  const recentPart1History = (data?.part1History ?? []).slice(0, 10);
  const isEmpty =
    data !== undefined && data.completedSessions === 0 && data.assessedSessions === 0;
  const hasAssessmentData = Boolean(data?.assessedSessions || data?.recentAssessments.length);
  const hasCriteriaData = Boolean(data?.criterionProgress.length);
  const hasPart1Data = Boolean(data?.part1History.length);
  const hasSpeakingData = Boolean(data?.completedSessions || speakingHistory.length);
  const [isCriterionExpanded, setIsCriterionExpanded] = useState(false);
  const [isRecentExpanded, setIsRecentExpanded] = useState(true);
  const [isAssessmentExpanded, setIsAssessmentExpanded] = useState(false);
  const [isPartHistoryExpanded, setIsPartHistoryExpanded] = useState(false);
  const [isMilestonesExpanded, setIsMilestonesExpanded] = useState(false);

  const formatPart1HistoryCaption = (historyItem: Part1HistoryItem) => {
    const lines = [];
    const score = formatSummaryValue(historyItem.scoreSummary);
    const feedback = formatSummaryValue(historyItem.feedbackSummary);
    const timestamp = historyItem.assessmentTimestamp
      ? new Date(historyItem.assessmentTimestamp).toLocaleString()
      : null;

    if (score) {
      lines.push(score);
    }
    if (feedback) {
      lines.push(feedback);
    }
    if (timestamp) {
      lines.push(timestamp);
    }

    return lines.join('\n');
  };

  const formatSpeakingHistoryCaption = (item: SpeakingHistoryItem) => {
    const label = formatSpeakingTaskLabel(item.taskIdentity, item.speakingPart, uiLanguage);
    const lines = [label];
    const assessment = formatSpeakingAssessmentSummary(item.assessmentSummary, uiLanguage);

    if (item.isReplay) {
      lines.push(speakingHistoryText.replay);
    }
    if (assessment) {
      lines.push(assessment);
    } else if (item.assessmentAvailable) {
      lines.push(speakingHistoryText.assessmentAvailable);
    }
    if (item.completedAt) {
      lines.push(new Date(item.completedAt).toLocaleString());
    }

    return lines.join('\n');
  };

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

        <SpeakingDevelopmentContinuum language={uiLanguage} sessions={recentSpeakingHistory} />

        <ProgressAccordionSection
          description=""
          expanded={isRecentExpanded}
          onToggle={() => setIsRecentExpanded((current) => !current)}
          title={t.recentSectionTitle}
          accessibilityHint={uiLanguage === 'es'
            ? 'Toca para mostrar u ocultar la actividad reciente.'
            : 'Tap to show or hide recent activity.'}
        >
          {isEmpty ? (
            <ListItem title={t.emptyRecentActivity} />
          ) : recentSpeakingHistory.length ? (
            recentSpeakingHistory.map((item) => (
              <ListItem
                key={item.sessionId}
                title={`${uiLanguage === 'es' ? 'Parte' : 'Part'} ${item.speakingPart}`}
                caption={formatSpeakingHistoryCaption(item)}
                trailingLabel={item.isReplay ? speakingHistoryText.replay : undefined}
              />
            ))
          ) : (
            <ListItem title={speakingHistoryText.empty} />
          )}
        </ProgressAccordionSection>

        {!isEmpty && hasAssessmentData ? (
          <ProgressAccordionSection
            description=""
            expanded={isAssessmentExpanded}
            onToggle={() => setIsAssessmentExpanded((current) => !current)}
            title={t.assessmentSectionTitle}
            accessibilityHint={uiLanguage === 'es'
              ? 'Toca para mostrar u ocultar los comentarios de evaluación.'
              : 'Tap to show or hide assessment feedback.'}
          >
            {data?.recentAssessments.map((assessment) => (
              <ListItem
                key={assessment.assessmentId}
                title={
                  assessment.speakingPart
                    ? `${uiLanguage === 'es' ? 'Parte' : 'Part'} ${assessment.speakingPart}`
                    : t.assessmentSectionTitle
                }
                caption={new Date(assessment.assessmentTimestamp).toLocaleDateString()}
                trailingLabel={
                  formatAssessmentStatusLabel(assessment.assessmentStatus, uiLanguage) ?? undefined
                }
              />
            ))}
          </ProgressAccordionSection>
        ) : null}

        {!isEmpty && hasCriteriaData ? (
          <ProgressAccordionSection
            description={t.criterionSectionDescription}
            expanded={isCriterionExpanded}
            onToggle={() => setIsCriterionExpanded((current) => !current)}
            title={t.criterionSectionTitle}
            accessibilityHint={uiLanguage === 'es'
              ? 'Toca para mostrar u ocultar el progreso por criterios.'
              : 'Tap to show or hide criteria progress.'}
          >
            {data?.criterionProgress.map((criterion) => (
              <ListItem
                key={criterion.criterion}
                title={criterion.criterionName}
                caption={`${t.criterionAverageLabel} ${criterion.averageBand} · ${criterion.assessmentsCount} ${t.criterionAssessmentsLabel}`}
                trailingLabel={`${t.criterionBandLabel} ${criterion.latestBand}`}
              />
            ))}
          </ProgressAccordionSection>
        ) : null}

        {!isEmpty && hasPart1Data ? (
          <ProgressAccordionSection
            description={t.partHistorySectionDescription}
            expanded={isPartHistoryExpanded}
            onToggle={() => setIsPartHistoryExpanded((current) => !current)}
            title={t.partHistorySectionTitle}
            accessibilityHint={uiLanguage === 'es'
              ? 'Toca para mostrar u ocultar el historial de la Parte 1.'
              : 'Tap to show or hide Part 1 history.'}
          >
          <SectionHeader title={part1InsightText.title} description="" />
          {part1Insights.hasAttempts ? (
            <View style={styles.insightPanel}>
              <View style={styles.insightRow}>
                <Text style={styles.insightLabel}>{part1InsightText.attemptsCompleted}</Text>
                <Text style={styles.insightValue}>{part1Insights.attemptsCompleted}</Text>
              </View>
              <View style={styles.insightDivider} />
              <View style={styles.insightRow}>
                <Text style={styles.insightLabel}>{part1InsightText.bestScore}</Text>
                <Text style={styles.insightValue}>
                  {part1Insights.bestScore ?? part1InsightText.unavailable}
                </Text>
              </View>
              <View style={styles.insightDivider} />
              <View style={styles.insightRow}>
                <Text style={styles.insightLabel}>{part1InsightText.progress}</Text>
                <Text style={styles.insightValue}>
                  {part1Insights.progressSummary ?? part1InsightText.unavailable}
                </Text>
              </View>
            </View>
          ) : (
            <ListItem title={part1InsightText.noData} />
          )}

          {recentPart1History.map((attempt) => (
            <ListItem
              key={attempt.conversationId}
              title={part1AttemptText[attempt.practiceMode]}
              caption={formatPart1HistoryCaption(attempt)}
              trailingLabel={attempt.replayOfSessionId ? '↩' : undefined}
            />
          ))}
          </ProgressAccordionSection>
        ) : null}

        {!isEmpty && hasSpeakingData && data?.milestones.length ? (
          <ProgressAccordionSection
            description={t.milestonesSectionDescription}
            expanded={isMilestonesExpanded}
            onToggle={() => setIsMilestonesExpanded((current) => !current)}
            title={t.milestonesSectionTitle}
            accessibilityHint={uiLanguage === 'es'
              ? 'Toca para mostrar u ocultar los hitos.'
              : 'Tap to show or hide milestones.'}
          >
            {data.milestones.map((milestone) => (
            <ListItem
              key={milestone.id}
              title={milestoneText[milestone.id as keyof typeof milestoneText] ?? milestone.id}
              caption={milestone.achieved ? t.milestoneAchieved : t.milestoneLocked}
              trailingLabel={milestone.achieved ? '✓' : '🔒'}
            />
            ))}
          </ProgressAccordionSection>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

function ProgressAccordionSection({
  accessibilityHint,
  children,
  description,
  expanded,
  onToggle,
  title,
}: {
  accessibilityHint: string;
  children: ReactNode;
  description: string;
  expanded: boolean;
  onToggle: () => void;
  title: string;
}) {
  return (
    <View style={styles.accordionCard}>
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.accordionHeader, pressed && styles.accordionHeaderPressed]}
      >
        <View style={styles.accordionHeaderText}>
          <Text style={styles.accordionTitle}>{title}</Text>
          <Text style={styles.accordionDescription}>{description}</Text>
        </View>
        <Text style={styles.accordionChevron}>{expanded ? '⌄' : '›'}</Text>
      </Pressable>
      {expanded ? <View style={styles.accordionBody}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  accordionBody: {
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  accordionCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accordionChevron: {
    color: '#486581',
    fontSize: 24,
    fontWeight: '700',
    paddingLeft: 12,
  },
  accordionDescription: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 20,
  },
  accordionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  accordionHeaderPressed: {
    opacity: 0.92,
  },
  accordionHeaderText: {
    flex: 1,
    gap: 4,
  },
  accordionTitle: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
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
  insightDivider: {
    backgroundColor: '#D7E6ED',
    height: 1,
  },
  insightLabel: {
    color: '#486581',
    fontSize: 13,
    fontWeight: '700',
  },
  insightPanel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  insightRow: {
    gap: 6,
  },
  insightValue: {
    color: '#0F4C5C',
    fontSize: 16,
    fontWeight: '800',
  },
});

function formatSummaryValue(summary: Record<string, unknown> | null | undefined) {
  if (!summary || typeof summary !== 'object') {
    return null;
  }

  const display = summary.display;
  if (typeof display === 'string' && display.trim()) {
    return display;
  }

  const score = summary.score;
  const maximum = summary.maximum;
  if (
    (typeof score === 'number' || typeof score === 'string') &&
    (typeof maximum === 'number' || typeof maximum === 'string')
  ) {
    return `${score} / ${maximum}`;
  }

  return null;
}

function formatSpeakingTaskLabel(
  taskIdentity: TaskIdentity | null | undefined,
  speakingPart: number,
  uiLanguage: 'en' | 'es',
) {
  if (!taskIdentity) {
    return uiLanguage === 'es'
      ? `Parte ${speakingPart}`
      : `Part ${speakingPart}`;
  }

  if (speakingPart === 1) {
    if (typeof taskIdentity.questionText === 'string' && taskIdentity.questionText.trim()) {
      return taskIdentity.questionText;
    }
    if (
      typeof taskIdentity.topic === 'string' &&
      taskIdentity.topic.trim() &&
      typeof taskIdentity.questionIndex === 'number'
    ) {
      return `${taskIdentity.topic} · Q${taskIdentity.questionIndex + 1}`;
    }
    if (typeof taskIdentity.topic === 'string' && taskIdentity.topic.trim()) {
      return taskIdentity.topic;
    }
  }

  if (speakingPart === 2) {
    if (typeof taskIdentity.photoId === 'string' && taskIdentity.photoId.trim()) {
      return uiLanguage === 'es'
        ? `Tarea fotográfica ${taskIdentity.photoId}`
        : `Photo task ${taskIdentity.photoId}`;
    }
    return uiLanguage === 'es' ? 'Tarea fotográfica' : 'Photo task';
  }

  if (speakingPart === 3) {
    if (typeof taskIdentity.scenarioId === 'string' && taskIdentity.scenarioId.trim()) {
      return uiLanguage === 'es'
        ? `Escenario ${taskIdentity.scenarioId}`
        : `Scenario ${taskIdentity.scenarioId}`;
    }
    return uiLanguage === 'es' ? 'Escenario' : 'Scenario';
  }

  if (speakingPart === 4) {
    if (typeof taskIdentity.part4SetId === 'string' && taskIdentity.part4SetId.trim()) {
      const match = taskIdentity.part4SetId.match(/(\d+)$/);
      const suffix = match ? match[1] : taskIdentity.part4SetId;
      return uiLanguage === 'es'
        ? `Conjunto de discusión ${suffix}`
        : `Discussion set ${suffix}`;
    }
    return uiLanguage === 'es' ? 'Conjunto de discusión' : 'Discussion set';
  }

  return uiLanguage === 'es' ? `Parte ${speakingPart}` : `Part ${speakingPart}`;
}

function formatSpeakingAssessmentSummary(
  summary: AssessmentSummary | null | undefined,
  language: 'en' | 'es',
) {
  if (!summary) {
    return null;
  }

  const score = formatSummaryValue(summary.scoreSummary);
  if (score) {
    return score;
  }

  if (summary.assessmentStatus) {
    return formatAssessmentStatusLabel(summary.assessmentStatus, language);
  }

  return null;
}

function buildPart1Insights(part1History: Part1HistoryItem[]) {
  const attemptsCompleted = part1History.length;

  if (!attemptsCompleted) {
    return {
      hasAttempts: false,
      attemptsCompleted: 0,
      bestScore: null as string | null,
      progressSummary: null as string | null,
    };
  }

  const scores = part1History
    .map((item) => extractScoreBand(item.scoreSummary))
    .filter((score): score is number => score !== null);

  const bestScore = scores.length ? Math.max(...scores) : null;
  const firstScore = scores.length ? scores[scores.length - 1] : null;
  const latestScore = scores.length ? scores[0] : null;

  return {
    hasAttempts: true,
    attemptsCompleted,
    bestScore: bestScore !== null ? `Band ${bestScore}` : null,
    progressSummary:
      firstScore !== null && latestScore !== null
        ? `Band ${firstScore} → Band ${latestScore}`
        : null,
  };
}

function extractScoreBand(summary: Record<string, unknown> | null | undefined) {
  if (!summary || typeof summary !== 'object') {
    return null;
  }

  const display = summary.display;
  if (typeof display === 'string') {
    const match = display.match(/Band\s+(\d+(?:\.\d+)?)/i);
    if (match) {
      return Number(match[1]);
    }
  }

  const score = summary.score;
  if (typeof score === 'number') {
    return score;
  }

  return null;
}
