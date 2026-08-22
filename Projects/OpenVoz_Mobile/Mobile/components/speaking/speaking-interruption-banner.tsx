import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SecondaryButton } from '../ui/buttons';
import type { AppLifecycleState } from '../../services/speaking/speaking-lifecycle';
import { useSpeakingReliabilityStore } from '../../store/speaking-reliability-store';
import { useSpeakingStore } from '../../store/speaking-store';

interface SpeakingInterruptionBannerProps {
  lifecycleState: AppLifecycleState;
}

export function SpeakingInterruptionBanner({ lifecycleState }: SpeakingInterruptionBannerProps) {
  const insets = useSafeAreaInsets();
  const interruptionDetected = useSpeakingReliabilityStore(
    (state) => state.appInterruptionDetected,
  );
  const interruptedAt = useSpeakingReliabilityStore((state) => state.interruptedAt);
  const previousLifecycleState = useSpeakingReliabilityStore(
    (state) => state.previousLifecycleState,
  );
  const clearInterruption = useSpeakingReliabilityStore((state) => state.clearInterruption);

  const hasSpeakingActivity = useSpeakingStore((state) =>
    Boolean(
      state.session?.remoteSessionId ||
        state.isCreatingSession ||
        state.isEvaluating ||
        state.isPlaying ||
        state.isRecording ||
        state.isStartingSession ||
        state.isUploading,
    ),
  );

  if (!interruptionDetected || lifecycleState !== 'active' || !hasSpeakingActivity) {
    return null;
  }

  const interruptedLabel = interruptedAt ? new Date(interruptedAt).toLocaleTimeString() : null;

  return (
    <View pointerEvents="box-none" style={[styles.overlay, { top: insets.top + 12 }]}>
      <View style={styles.banner}>
        <View style={styles.copy}>
          <Text style={styles.title}>Speaking interrupted</Text>
          <Text style={styles.text}>
            The app left the foreground while a speaking session was active.
            {previousLifecycleState ? ` Last state: ${previousLifecycleState}.` : ''}
            {interruptedLabel ? ` Detected at ${interruptedLabel}.` : ''}
          </Text>
        </View>
        <SecondaryButton label="Got it" onPress={clearInterruption} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 14,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  overlay: {
    left: 12,
    position: 'absolute',
    right: 12,
    zIndex: 100,
  },
  text: {
    color: '#9A3412',
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    color: '#9A3412',
    fontSize: 15,
    fontWeight: '800',
  },
});
