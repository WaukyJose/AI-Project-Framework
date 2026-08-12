import { StyleSheet, Text, View } from 'react-native';

import type { SpeakingAssessmentSummary } from '../../types/speaking';

interface PracticeScoreModel {
  assessedCriterionCount: number | null;
  display: string;
}

interface CriterionObservationModel {
  band: number | null;
  name: string;
  rationale: string | null;
  status: 'assessed' | 'unavailable';
}

interface AssessmentResultsModel {
  assessedCriteria: CriterionObservationModel[];
  compactLimitations: string[];
  improvements: string[];
  practiceScore: PracticeScoreModel | null;
  strengths: string[];
  unavailableCriteria: string[];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function buildAssessmentResultsModel(summary: SpeakingAssessmentSummary): AssessmentResultsModel {
  const practiceScore = asRecord(summary.practiceScore);
  const feedbackReport = asRecord(summary.feedbackReport);

  const noticeTexts: string[] = [];
  if (feedbackReport) {
    for (const item of asArray(feedbackReport.educational_messages)) {
      const text = asString(asRecord(item)?.text);
      if (text) noticeTexts.push(text);
    }
    for (const item of asArray(feedbackReport.required_policy_notices)) {
      const text = asString(asRecord(item)?.text);
      if (text) noticeTexts.push(text);
    }
  }

  const criterionObservations = asArray(feedbackReport?.criterion_observations)
    .map((raw) => {
      const rec = asRecord(raw);
      if (!rec) return null;
      return {
        band: asNumber(rec.awarded_band),
        name: asString(rec.criterion_name) ?? asString(rec.criterion) ?? 'Criterion',
        rationale: asString(rec.rationale),
        status: rec.status === 'assessed' ? ('assessed' as const) : ('unavailable' as const),
      };
    })
    .filter((item): item is CriterionObservationModel => item !== null);

  const strengths = asArray(feedbackReport?.strengths)
    .map((raw) => asString(asRecord(raw)?.text))
    .filter((text): text is string => text !== null);

  const improvements = asArray(feedbackReport?.improvement_priorities)
    .map((raw) => asString(asRecord(raw)?.text))
    .filter((text): text is string => text !== null);

  return {
    assessedCriteria: criterionObservations.filter((item) => item.status === 'assessed'),
    compactLimitations: noticeTexts.slice(0, 1),
    improvements,
    practiceScore: practiceScore
      ? {
          assessedCriterionCount: asNumber(practiceScore.assessed_criterion_count),
          display: asString(practiceScore.display) ?? 'Score unavailable',
        }
      : null,
    strengths,
    unavailableCriteria: criterionObservations
      .filter((item) => item.status === 'unavailable')
      .map((item) => item.name),
  };
}

export function AssessmentResultsCard({ assessment }: { assessment: SpeakingAssessmentSummary }) {
  if (assessment.status === 'pending' || assessment.status === 'processing') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Evaluation in progress</Text>
        <Text style={styles.body}>
          The backend has accepted the request, but a final assessment result is not yet confirmed.
        </Text>
      </View>
    );
  }

  if (assessment.status === 'failed') {
    return (
      <View style={[styles.card, styles.errorCard]}>
        <Text style={[styles.title, styles.errorTitle]}>Evaluation unavailable</Text>
        <Text style={styles.body}>
          The assessment could not be completed. Please try requesting evaluation again.
        </Text>
      </View>
    );
  }

  const model = buildAssessmentResultsModel(assessment);
  const score = model.practiceScore;

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        Assessment Results
      </Text>

      {score ? (
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreDisplay}>{score.display}</Text>
          <Text style={styles.scoreMeta}>
            {score.assessedCriterionCount != null
              ? `Based on ${score.assessedCriterionCount} assessed criteria`
              : 'Practice score'}
          </Text>
        </View>
      ) : null}

      {model.strengths.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            What you did well
          </Text>
          {model.strengths.map((text, index) => (
            <Text key={`s-${index}`} style={styles.bullet}>
              • {text}
            </Text>
          ))}
        </View>
      ) : null}

      {model.improvements.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            What to work on next
          </Text>
          {model.improvements.map((text, index) => (
            <Text key={`i-${index}`} style={styles.bullet}>
              • {text}
            </Text>
          ))}
        </View>
      ) : null}

      {model.assessedCriteria.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Detailed feedback
          </Text>
          {model.assessedCriteria.map((obs, index) => (
            <View key={`c-${index}`} style={styles.criterionRow}>
              <Text style={styles.criterionName}>
                {obs.name}
                {obs.band != null ? ` — Band ${obs.band}` : ''}
              </Text>
              {obs.rationale ? (
                <Text style={styles.criterionRationale}>{obs.rationale}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {(model.unavailableCriteria.length > 0 || model.compactLimitations.length > 0) ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            About this feedback
          </Text>
          {model.unavailableCriteria.length > 0 ? (
            <Text style={styles.notice}>
              {model.unavailableCriteria.join(' and ')} were not assessed in this activity.
            </Text>
          ) : null}
          <Text style={styles.notice}>
            This is practice feedback, not an official Cambridge score.
          </Text>
          {model.compactLimitations.map((text, index) => (
            <Text key={`n-${index}`} style={styles.notice}>
              {text}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  bullet: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  criterionName: {
    color: '#102A43',
    fontSize: 15,
    fontWeight: '700',
  },
  criterionRationale: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  criterionRow: {
    gap: 4,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorTitle: {
    color: '#991B1B',
  },
  notice: {
    color: '#486581',
    fontSize: 13,
    lineHeight: 20,
  },
  scoreBlock: {
    gap: 4,
  },
  scoreDisplay: {
    color: '#0F4C5C',
    fontSize: 34,
    fontWeight: '800',
  },
  scoreMeta: {
    color: '#486581',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: '#102A43',
    fontSize: 16,
    fontWeight: '800',
  },
  title: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '700',
  },
});
