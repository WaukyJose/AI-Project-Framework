import { StyleSheet, Text, View } from 'react-native';

import type { SpeakingAssessmentSummary } from '../../types/speaking';

// ---------------------------------------------------------------------------
// Presentation-layer view model (defensive; backend contract stays Record<string,unknown>)
// ---------------------------------------------------------------------------

interface PracticeScoreModel {
  display: string;
  stars: string;
  starRating: number | null;
  overallConfidence: string | null;
  assessedCriterionCount: number | null;
}

interface CriterionObservationModel {
  name: string;
  status: 'assessed' | 'unavailable';
  band: number | null;
  confidence: string | null;
  rationale: string | null;
  limitation: string | null;
}

interface AssessmentResultsModel {
  practiceScore: PracticeScoreModel | null;
  criterionObservations: CriterionObservationModel[];
  strengths: string[];
  improvements: string[];
  limitationNotices: string[];
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
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
        name: asString(rec.criterion_name) ?? asString(rec.criterion) ?? 'Criterion',
        status: rec.status === 'assessed' ? ('assessed' as const) : ('unavailable' as const),
        band: asNumber(rec.awarded_band),
        confidence: asString(rec.confidence),
        rationale: asString(rec.rationale),
        limitation: asString(rec.evidence_limitation),
      };
    })
    .filter((c): c is CriterionObservationModel => c !== null);

  const strengths = asArray(feedbackReport?.strengths)
    .map((raw) => asString(asRecord(raw)?.text))
    .filter((t): t is string => t !== null);
  const improvements = asArray(feedbackReport?.improvement_priorities)
    .map((raw) => asString(asRecord(raw)?.text))
    .filter((t): t is string => t !== null);

  return {
    practiceScore: practiceScore
      ? {
          display: asString(practiceScore.display) ?? 'Score unavailable',
          stars: asString(practiceScore.stars) ?? '☆☆☆☆☆',
          starRating: asNumber(practiceScore.star_rating),
          overallConfidence: asString(practiceScore.overall_confidence),
          assessedCriterionCount: asNumber(practiceScore.assessed_criterion_count),
        }
      : null,
    criterionObservations,
    strengths,
    improvements,
    limitationNotices: noticeTexts,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
          <Text style={styles.stars} accessible={false}>
            {score.stars}
          </Text>
          <Text style={styles.scoreMeta}>
            {score.starRating != null ? `${score.starRating} out of 5 stars` : 'No rating'}
            {score.assessedCriterionCount != null
              ? ` · Based on ${score.assessedCriterionCount} assessed criteria`
              : ''}
          </Text>
          {score.overallConfidence ? (
            <Text style={styles.scoreMeta}>
              Overall confidence: {capitalize(score.overallConfidence)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {model.strengths.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Strengths
          </Text>
          {model.strengths.map((text, i) => (
            <Text key={`s-${i}`} style={styles.bullet}>
              • {text}
            </Text>
          ))}
        </View>
      ) : null}

      {model.improvements.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Areas to improve
          </Text>
          {model.improvements.map((text, i) => (
            <Text key={`i-${i}`} style={styles.bullet}>
              • {text}
            </Text>
          ))}
        </View>
      ) : null}

      {model.criterionObservations.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Criterion feedback
          </Text>
          {model.criterionObservations.map((obs, i) => (
            <View key={`c-${i}`} style={styles.criterionRow}>
              <Text style={styles.criterionName}>
                {obs.name}
                {obs.status === 'assessed' && obs.band != null
                  ? ` — Band ${obs.band}`
                  : ' — Not assessed'}
              </Text>
              {obs.status === 'assessed' && obs.confidence ? (
                <Text style={styles.criterionMeta}>Confidence: {capitalize(obs.confidence)}</Text>
              ) : null}
              {obs.status === 'assessed' && obs.rationale ? (
                <Text style={styles.criterionRationale}>{obs.rationale}</Text>
              ) : null}
              {obs.status === 'unavailable' ? (
                <Text style={styles.criterionLimitation}>
                  {obs.limitation ??
                    'This criterion was not assessed for this session; no score or band is inferred.'}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {model.limitationNotices.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Assessment limitation notice
          </Text>
          {model.limitationNotices.map((text, i) => (
            <Text key={`n-${i}`} style={styles.notice}>
              • {text}
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
  criterionLimitation: {
    color: '#9B2226',
    fontSize: 13,
    lineHeight: 20,
  },
  criterionMeta: {
    color: '#486581',
    fontSize: 13,
    fontWeight: '600',
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
  stars: {
    color: '#E6A700',
    fontSize: 22,
    letterSpacing: 2,
  },
  title: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '700',
  },
});
