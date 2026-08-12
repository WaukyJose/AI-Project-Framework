import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../ui/buttons';

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
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your turn</Text>

      {!hasCompletedPart && timerDisplay && timerStatusLabel ? (
        <View style={styles.timerRow}>
          <Text style={styles.timerValue}>
            {timerDisplay}
            {isRecording ? ' remaining' : ''}
          </Text>
          <Text style={styles.timerStatus}>{timerStatusLabel}</Text>
        </View>
      ) : null}

      {!hasCompletedPart ? (
        <View style={styles.row}>
          {!isRecording ? (
            <PrimaryButton
              disabled={!recordingSupported}
              label="Start recording"
              onPress={onStartRecording}
            />
          ) : (
            <PrimaryButton label="Stop recording" onPress={onStopRecording} />
          )}
        </View>
      ) : null}

      {hasClip ? (
        <>
          <View style={styles.row}>
            {isPlaying ? (
              <SecondaryButton
                disabled={!playbackSupported}
                label="Stop"
                onPress={onStopPlayback}
              />
            ) : (
              <SecondaryButton
                disabled={!playbackSupported || isPlaying}
                label="Listen"
                onPress={onTogglePlayback}
              />
            )}
            <SecondaryButton label="Discard recording" onPress={onDiscard} />
          </View>

          {canUpload ? (
            <View style={styles.row}>
              <PrimaryButton
                disabled={isUploading}
                label={isUploading ? 'Submitting…' : 'Submit answer'}
                onPress={onUpload}
              />
            </View>
          ) : null}

        </>
      ) : null}

      {canRequestEvaluation ? (
        <View style={styles.row}>
          <SecondaryButton
            disabled={isEvaluating}
            label={isEvaluating ? 'Requesting feedback…' : 'Get feedback'}
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
