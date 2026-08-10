import { StyleSheet, View } from 'react-native';

import { ProgressCard } from '../ui/cards';

interface SpeakingSessionCardProps {
  timeRemainingLabel: string;
  timerStatus: string;
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Time complete',
  idle: 'Ready',
  paused: 'Paused',
  running: 'In progress',
};

function learnerTimerLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function SpeakingSessionCard({ timeRemainingLabel, timerStatus }: SpeakingSessionCardProps) {
  return (
    <View style={styles.group}>
      <ProgressCard
        accentValue={timeRemainingLabel}
        caption={learnerTimerLabel(timerStatus)}
        title="Speaking time"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 14,
  },
});
