import { StyleSheet, Text, View } from 'react-native';

import { ProgressCard } from '../ui/cards';

interface SpeakingSessionCardProps {
  remoteSessionId: string | null;
  status: string;
  timeRemainingLabel: string;
  timerStatus: string;
}

export function SpeakingSessionCard({
  remoteSessionId,
  status,
  timeRemainingLabel,
  timerStatus,
}: SpeakingSessionCardProps) {
  return (
    <View style={styles.group}>
      <ProgressCard
        accentValue={timeRemainingLabel}
        caption={`Timer ${timerStatus}`}
        description="The countdown timer is shared infrastructure for future speaking parts and runs independently from backend state."
        title="Speaking Timer"
      />
      <View style={styles.card}>
        <Text style={styles.title}>Session Lifecycle</Text>
        <Text style={styles.copy}>Status: {status}</Text>
        <Text style={styles.copy}>
          Remote session: {remoteSessionId ? remoteSessionId : 'Not connected yet'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  copy: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  group: {
    gap: 14,
  },
  title: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '700',
  },
});
