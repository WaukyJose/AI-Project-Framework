import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';

import { PrimaryButton, SecondaryButton } from '../ui/buttons';
import { languageIdentities } from '../../constants/language-identity';

type Language = 'en' | 'es';

interface SpeakingAnswerAreaProps {
  canRequestEvaluation: boolean;
  canUpload: boolean;
  hasCompletedPart: boolean;
  hasClip: boolean;
  isTranscribingPreview: boolean;
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
  transcriptionPreview: string | null;
  transcriptionPreviewError: string | null;
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
    yourAnswer: 'Your answer',
    preparingAnswer: 'Preparing your answer…',
    previewError: "We couldn't prepare a transcript. You can still listen or submit your answer.",
    waiting: 'One moment…',
    remaining: ' remaining',
    startRecording: 'Start recording',
    stopRecording: 'Stop recording',
    stop: 'Stop',
    listen: 'Listen',
    discardRecording: 'Discard recording',
    submitting: 'Submitting…',
    submitAnswer: 'Submit answer to continue',
    requestingFeedback: 'Requesting feedback…',
    getFeedback: 'Get feedback',
  },
  es: {
    yourTurn: 'Tu turno',
    yourAnswer: 'Tu respuesta',
    preparingAnswer: 'Preparando tu respuesta…',
    previewError: 'No pudimos preparar una transcripción. Puedes escuchar o enviar tu respuesta.',
    waiting: 'Un momento…',
    remaining: ' restantes',
    startRecording: 'Empezar a grabar',
    stopRecording: 'Detener grabación',
    stop: 'Detener',
    listen: 'Escuchar',
    discardRecording: 'Descartar grabación',
    submitting: 'Enviando…',
    submitAnswer: 'Enviar respuesta para continuar',
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
  isTranscribingPreview,
  isUploading,
  isExaminerSpeaking,
  language = 'en',
  playbackSupported,
  recordingSupported,
  timerDisplay = null,
  timerStatusLabel = null,
  transcriptionPreview,
  transcriptionPreviewError,
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
  const showPreview = hasClip && !isRecording && !isUploading;
  const showUploadControl = hasClip && (canUpload || isUploading);
  const [submitScale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const canAnimate = hasClip && !isRecording && !isUploading;
    let animation: Animated.CompositeAnimation | null = null;
    let mounted = true;

    const stopAnimation = () => {
      animation?.stop();
      animation = null;
      submitScale.setValue(1);
    };

    const startAnimation = () => {
      if (!mounted || !canAnimate) return;
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(submitScale, {
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            toValue: 1.015,
            useNativeDriver: true,
          }),
          Animated.timing(submitScale, {
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
        ]),
      );
      animation.start();
    };

    stopAnimation();
    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (reduceMotionEnabled) => {
        stopAnimation();
        if (!reduceMotionEnabled && canAnimate) {
          startAnimation();
        }
      },
    );

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotionEnabled) => {
      if (mounted && !reduceMotionEnabled && canAnimate) {
        startAnimation();
      }
    });

    return () => {
      mounted = false;
      reduceMotionSubscription.remove();
      stopAnimation();
    };
  }, [hasClip, isRecording, isUploading, submitScale]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t.yourTurn}</Text>

      {showPreview ? (
        <View style={styles.previewBlock}>
          <Text style={styles.previewLabel}>{t.yourAnswer}</Text>
          {isTranscribingPreview ? (
            <View accessibilityLiveRegion="polite" style={styles.previewLoadingRow}>
              <ActivityIndicator color={identity.accent} size="small" />
              <Text style={styles.previewText}>{t.preparingAnswer}</Text>
            </View>
          ) : transcriptionPreview ? (
            <Text style={styles.previewText}>{transcriptionPreview}</Text>
          ) : transcriptionPreviewError ? (
            <Text accessibilityLiveRegion="polite" style={styles.previewError}>
              {t.previewError}
            </Text>
          ) : null}
        </View>
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
              <Animated.View style={{ transform: [{ scale: submitScale }] }}>
                <PrimaryButton
                  accent={isSpanish ? identity.accent : undefined}
                  disabled={isUploading}
                  label={isUploading ? t.waiting : t.submitAnswer}
                  onPress={onUpload}
                />
              </Animated.View>
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
  previewBlock: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    gap: 4,
    padding: 12,
  },
  previewError: {
    color: '#486581',
    fontSize: 14,
    lineHeight: 20,
  },
  previewLabel: {
    color: '#0F766E',
    fontSize: 15,
    fontWeight: '700',
  },
  previewLoadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  previewText: {
    color: '#334E68',
    fontSize: 15,
    lineHeight: 22,
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
