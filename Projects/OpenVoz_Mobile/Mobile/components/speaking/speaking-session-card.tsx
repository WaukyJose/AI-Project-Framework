import { StyleSheet, View } from 'react-native';

import { ProgressCard } from '../ui/cards';

interface SpeakingSessionCardProps {
  description?: string;
  timeRemainingLabel: string;
  timerStatus: string;
  title?: string;
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

export function SpeakingSessionCard({
  description,
  timeRemainingLabel,
  timerStatus,
  title = 'Speaking time',
}: SpeakingSessionCardProps) {
  return (
    <View style={styles.group}>
      <ProgressCard
        accentValue={timeRemainingLabel}
        caption={learnerTimerLabel(timerStatus)}
        description={description}
        title={title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 14,
  },
});
