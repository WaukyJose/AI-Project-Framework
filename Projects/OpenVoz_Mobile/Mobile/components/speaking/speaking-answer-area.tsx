import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../ui/buttons';
import { languageIdentities } from '../../constants/language-identity';

type Language = 'en' | 'es';

interface SpeakingAnswerAreaProps {
  canRequestEvaluation: boolean;
  canUpload: boolean;
  hasCompletedPart: boolean;
  hasClip: boolean;
  isFollowUpPhase?: boolean;
  isEvaluating: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  isUploading: boolean;
  isExaminerSpeaking: boolean;
  language?: Language;
  playbackSupported: boolean;
  recordingSupported: boolean;
  timerDisplay?: string | null;
  timerStatusLabel?: string | null;
  onDiscard: () => void;
  onRequestEvaluation: () => void;
  onStartRecording: () => void;
  onStopPlayback: () => void;
  onStopRecording: () => void;
  onTogglePlayback: () => void;
  onUpload: () => void;
}

const content = {
  en: {
    yourTurn: 'Your turn',
    answerRecorded: '✓ Answer recorded',
    waiting: 'One moment…',
    remaining: ' remaining',
    startRecording: 'Start recording',
    stopRecording: 'Stop recording',
    stop: 'Stop',
    listen: 'Listen',
    discardRecording: 'Discard recording',
    submitting: 'Submitting…',
    submitAnswer: 'Submit answer',
    requestingFeedback: 'Requesting feedback…',
    getFeedback: 'Get feedback',
  },
  es: {
    yourTurn: 'Tu turno',
    answerRecorded: '✓ Respuesta grabada',
    waiting: 'Un momento…',
    remaining: ' restantes',
    startRecording: 'Empezar a grabar',
    stopRecording: 'Detener grabación',
    stop: 'Detener',
    listen: 'Escuchar',
    discardRecording: 'Descartar grabación',
    submitting: 'Enviando…',
    submitAnswer: 'Enviar respuesta',
    requestingFeedback: 'Solicitando evaluación…',
    getFeedback: 'Ver evaluación',
  },
};

export function SpeakingAnswerArea({
  canRequestEvaluation,
  canUpload,
  hasCompletedPart,
  hasClip,
  isFollowUpPhase = false,
  isEvaluating,
  isPlaying,
  isRecording,
  isUploading,
  isExaminerSpeaking,
  language = 'en',
  playbackSupported,
  recordingSupported,
  timerDisplay = null,
  timerStatusLabel = null,
  onDiscard,
  onRequestEvaluation,
  onStartRecording,
  onStopPlayback,
  onStopRecording,
  onTogglePlayback,
  onUpload,
}: SpeakingAnswerAreaProps) {
  const t = content[language];
  const identity = languageIdentities[language];
  const isSpanish = language === 'es';
  const showRecordedConfirmation = hasClip && !isRecording;
  const showUploadControl = hasClip && (canUpload || isUploading);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t.yourTurn}</Text>

      {showRecordedConfirmation ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.recordedConfirmation, { color: identity.accent }]}
        >
          {t.answerRecorded}
        </Text>
      ) : null}

      {!hasCompletedPart && timerDisplay && timerStatusLabel ? (
        <View style={styles.timerRow}>
          <Text style={[styles.timerValue, isSpanish && { color: identity.accent }]}>
            {timerDisplay}
            {isRecording ? t.remaining : ''}
          </Text>
          <Text style={styles.timerStatus}>{timerStatusLabel}</Text>
        </View>
      ) : null}

      {isUploading ? (
        <View
          accessibilityLiveRegion="polite"
          accessibilityRole="progressbar"
          style={styles.waitingRow}
        >
          <ActivityIndicator color={identity.accent} size="small" />
          <Text style={styles.waitingText}>{t.waiting}</Text>
        </View>
      ) : null}

      {!isUploading && !hasCompletedPart ? (
        <View style={styles.row}>
          {!isRecording ? (
            <PrimaryButton
              accent={isSpanish ? identity.accent : undefined}
              disabled={!recordingSupported || isExaminerSpeaking || isUploading}
              label={t.startRecording}
              onPress={onStartRecording}
            />
          ) : (
            <PrimaryButton
              accent={isSpanish ? identity.accent : undefined}
              label={t.stopRecording}
              onPress={onStopRecording}
            />
          )}
        </View>
      ) : null}

      {!isUploading && hasClip ? (
        <>
          <View style={styles.row}>
            {isPlaying ? (
              <SecondaryButton
                disabled={!playbackSupported || isUploading}
                label={t.stop}
                onPress={onStopPlayback}
              />
            ) : (
              <SecondaryButton
                disabled={!playbackSupported || isPlaying || isUploading}
                label={t.listen}
                onPress={onTogglePlayback}
              />
            )}
            <SecondaryButton
              disabled={isUploading}
              label={t.discardRecording}
              onPress={onDiscard}
            />
          </View>

          {showUploadControl ? (
            <View style={styles.row}>
              <PrimaryButton
                accent={isSpanish ? identity.accent : undefined}
                disabled={isUploading}
                label={isUploading ? t.waiting : t.submitAnswer}
                onPress={onUpload}
              />
            </View>
          ) : null}
        </>
      ) : null}

      {canRequestEvaluation ? (
        <View style={styles.row}>
          <SecondaryButton
            accent={isSpanish ? identity.accent : undefined}
            disabled={isEvaluating}
            label={isEvaluating ? t.requestingFeedback : t.getFeedback}
            onPress={onRequestEvaluation}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  timerRow: {
    gap: 2,
  },
  recordedConfirmation: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  waitingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  waitingText: {
    color: '#486581',
    fontSize: 13,
    fontWeight: '600',
  },
  timerStatus: {
    color: '#486581',
    fontSize: 13,
    fontWeight: '600',
  },
  timerValue: {
    color: '#0F4C5C',
    fontSize: 24,
    fontWeight: '800',
  },
  title: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '700',
  },
});
