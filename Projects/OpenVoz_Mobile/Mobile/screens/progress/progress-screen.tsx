import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../components/ui/app-header';
import { ProgressCard } from '../../components/ui/cards';
import { ListItem } from '../../components/ui/listing';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { languageIdentities } from '../../constants/language-identity';
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
    title: 'Speaking History',
    empty: 'No completed speaking attempts yet.',
    replay: 'Replay',
    assessmentAvailable: 'Assessment available',
    partSummary: 'attempts',
  },
  es: {
    title: 'Historial de expresión oral',
    empty: 'Aún no hay intentos orales completados.',
    replay: 'Repetición',
    assessmentAvailable: 'Evaluación disponible',
    partSummary: 'intentos',
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
    part1HistoryTitle: 'Part 1 Progress History',
    part1HistoryDescription: 'Review your completed Part 1 attempts, scores, and feedback.',
    part1HistoryEmpty: 'No completed Part 1 attempts yet.',
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
    part1HistoryTitle: 'Historial de progreso de la Parte 1',
    part1HistoryDescription:
      'Revisa tus intentos completados de la Parte 1, tus puntuaciones y tu retroalimentación.',
    part1HistoryEmpty: 'Aún no hay intentos completados de la Parte 1.',
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
  const part1AttemptText = part1AttemptLabels[uiLanguage];
  const part1InsightText = part1InsightLabels[uiLanguage];
  const speakingHistoryText = speakingHistoryLabels[uiLanguage];
  const accentColor = uiLanguage === 'es' ? identity.accent : undefined;
  const { data } = useProgressData(uiLanguage);
  const part1Insights = buildPart1Insights(data?.part1History ?? []);
  const speakingHistory = data?.speakingHistory ?? [];
  const speakingHistorySummary = buildSpeakingHistorySummary(speakingHistory);

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
    const assessment = formatSpeakingAssessmentSummary(item.assessmentSummary);

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

        <SectionHeader
          title={speakingHistoryText.title}
          description={formatSpeakingHistorySummary(speakingHistorySummary, speakingHistoryText.partSummary)}
        />

        {speakingHistory.length ? (
          speakingHistory.map((item) => (
            <ListItem
              key={item.sessionId}
              title={`Part ${item.speakingPart}`}
              caption={formatSpeakingHistoryCaption(item)}
              trailingLabel={item.isReplay ? speakingHistoryText.replay : undefined}
            />
          ))
        ) : (
          <ListItem title={speakingHistoryText.empty} />
        )}

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

        <SectionHeader
          description={t.part1HistoryDescription}
          title={t.part1HistoryTitle}
        />

        {data?.part1History?.length ? (
          data.part1History.map((attempt) => (
            <ListItem
              key={attempt.conversationId}
              title={part1AttemptText[attempt.practiceMode]}
              caption={formatPart1HistoryCaption(attempt)}
              trailingLabel={attempt.replayOfSessionId ? '↩' : undefined}
            />
          ))
        ) : (
          <ListItem title={t.part1HistoryEmpty} />
        )}

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

function formatSpeakingAssessmentSummary(summary: AssessmentSummary | null | undefined) {
  if (!summary) {
    return null;
  }

  const score = formatSummaryValue(summary.scoreSummary);
  if (score) {
    return score;
  }

  if (summary.assessmentStatus) {
    return summary.assessmentStatus.replaceAll('_', ' ');
  }

  return null;
}

function buildSpeakingHistorySummary(history: SpeakingHistoryItem[]) {
  const counts = new Map<number, number>();
  for (const item of history) {
    counts.set(item.speakingPart, (counts.get(item.speakingPart) ?? 0) + 1);
  }

  return [1, 2, 3, 4].map((part) => ({
    part,
    count: counts.get(part) ?? 0,
  }));
}

function formatSpeakingHistorySummary(
  summary: { part: number; count: number }[],
  partSummaryLabel: string,
) {
  return summary.map((item) => `Part ${item.part} ${item.count} ${partSummaryLabel}`).join(' · ');
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
