import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../ui/buttons';

interface SpeakingRecordingCardProps {
  capabilityMessage: string;
  clipLabel: string | null;
  isPlaying: boolean;
  isRecording: boolean;
  onDiscard: () => void;
  onStartRecording: () => void;
  onStopPlayback: () => void;
  onStopRecording: () => void;
  onTogglePlayback: () => void;
  playbackSupported: boolean;
  recordingSupported: boolean;
}

export function SpeakingRecordingCard({
  capabilityMessage,
  clipLabel,
  isPlaying,
  isRecording,
  onDiscard,
  onStartRecording,
  onStopPlayback,
  onStopRecording,
  onTogglePlayback,
  playbackSupported,
  recordingSupported,
}: SpeakingRecordingCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Recording Controls</Text>
      <Text style={styles.copy}>{capabilityMessage}</Text>
      {clipLabel ? <Text style={styles.meta}>Current clip: {clipLabel}</Text> : null}

      <View style={styles.actions}>
        {!isRecording ? (
          <PrimaryButton
            disabled={!recordingSupported}
            label="Start recording"
            onPress={onStartRecording}
          />
        ) : (
          <PrimaryButton label="Stop recording" onPress={onStopRecording} />
        )}
        <SecondaryButton disabled={!clipLabel} label="Discard clip" onPress={onDiscard} />
      </View>

      <View style={styles.actions}>
        <SecondaryButton
          disabled={!clipLabel || !playbackSupported || isPlaying}
          label="Play clip"
          onPress={onTogglePlayback}
        />
        <SecondaryButton
          disabled={!clipLabel || !playbackSupported || !isPlaying}
          label="Stop playback"
          onPress={onStopPlayback}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  copy: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  meta: {
    color: '#0F4C5C',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '700',
  },
});
