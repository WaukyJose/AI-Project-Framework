import { StyleSheet, Text, View } from 'react-native';

import type { SpeakingHistoryItem } from '../../services/progress/progress-service';

const TRACK_HEIGHT = 42;
const MARKER_SIZE = 8;

const labels = {
  en: {
    title: 'Speaking development',
    summary: (total: number, assessed: number) =>
      `Speaking development across ${total} recent sessions. ${assessed} sessions have assessment scores.`,
    oneSession: 'Your development will appear as you practise.',
  },
  es: {
    title: 'Desarrollo oral',
    summary: (total: number, assessed: number) =>
      `Desarrollo oral en ${total} sesiones recientes. ${assessed} sesiones tienen puntuaciones de evaluación.`,
    oneSession: 'Tu desarrollo aparecerá a medida que practiques.',
  },
} as const;

interface SpeakingDevelopmentContinuumProps {
  language: 'en' | 'es';
  sessions: SpeakingHistoryItem[];
}

export function SpeakingDevelopmentContinuum({
  language,
  sessions,
}: SpeakingDevelopmentContinuumProps) {
  if (!sessions.length) {
    return null;
  }

  const visibleSessions = sessions.slice(0, 10).reverse();
  const assessedCount = visibleSessions.filter((session) => getScorePosition(session) !== null).length;
  const copy = labels[language];
  const accessibilityLabel = copy.summary(visibleSessions.length, assessedCount);

  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={styles.container}>
      <Text style={styles.title}>{copy.title}</Text>
      {visibleSessions.length === 1 ? <Text style={styles.note}>{copy.oneSession}</Text> : null}
      <View style={styles.track}>
        {visibleSessions.length > 1 ? (
          <View style={styles.continuumLine} />
        ) : (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={styles.singleSessionLine}
          />
        )}
        {visibleSessions.map((session, index) => {
          const position = getScorePosition(session);
          const top = visibleSessions.length === 1
            ? (TRACK_HEIGHT - MARKER_SIZE) / 2
            : position === null
              ? TRACK_HEIGHT - MARKER_SIZE
              : (1 - position) * (TRACK_HEIGHT - MARKER_SIZE);

          return (
            <View
              key={session.sessionId}
              style={[styles.sessionSlot, visibleSessions.length === 1 ? styles.singleSessionSlot : null]}
            >
              <View
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={[
                  styles.marker,
                  position === null ? styles.unassessedMarker : styles.assessedMarker,
                  index === visibleSessions.length - 1 ? styles.latestMarker : null,
                  { top },
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function getScorePosition(session: SpeakingHistoryItem) {
  const scoreSummary = session.assessmentSummary?.scoreSummary;
  if (!scoreSummary) {
    return null;
  }

  const score = scoreSummary.score;
  const maximum = scoreSummary.maximum;
  if (typeof score !== 'number' || typeof maximum !== 'number' || !Number.isFinite(score) || !Number.isFinite(maximum) || maximum <= 0) {
    return null;
  }

  return Math.min(1, Math.max(0, score / maximum));
}

const styles = StyleSheet.create({
  assessedMarker: {
    backgroundColor: '#0F4C5C',
    borderColor: '#0F4C5C',
  },
  continuumLine: {
    backgroundColor: '#D9E2EC',
    height: 1,
    left: '5%',
    position: 'absolute',
    right: '5%',
    top: TRACK_HEIGHT / 2,
  },
  container: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  latestMarker: {
    borderWidth: 2,
    height: MARKER_SIZE + 1.5,
    width: MARKER_SIZE + 1.5,
  },
  marker: {
    borderRadius: MARKER_SIZE,
    borderWidth: 1.5,
    height: MARKER_SIZE,
    position: 'absolute',
    width: MARKER_SIZE,
  },
  note: {
    color: '#52606D',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  sessionSlot: {
    alignItems: 'center',
    flex: 1,
    height: TRACK_HEIGHT,
    position: 'relative',
  },
  singleSessionLine: {
    backgroundColor: '#D9E2EC',
    height: 1,
    left: 0,
    position: 'absolute',
    right: '45%',
    top: TRACK_HEIGHT / 2,
  },
  singleSessionSlot: {
    alignItems: 'flex-start',
    flex: 0,
    width: '55%',
  },
  title: {
    color: '#102A43',
    fontSize: 16,
    fontWeight: '700',
  },
  track: {
    flexDirection: 'row',
    marginTop: 10,
    minHeight: TRACK_HEIGHT,
    position: 'relative',
  },
  unassessedMarker: {
    backgroundColor: '#FFFFFF',
    borderColor: '#486581',
  },
});
