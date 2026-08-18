import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from './badge';

interface BaseCardProps {
  caption?: string;
  description?: string;
  title: string;
}

interface PracticeCardProps extends BaseCardProps {
  ctaLabel?: string;
  enabled?: boolean;
  onPress?: () => void;
  statusLabel?: string;
}

interface StatCardProps {
  label: string;
  value: string;
}

interface ProgressCardProps extends BaseCardProps {
  accentValue?: string;
  accentValueColor?: string;
}

export function PracticeCard({
  caption,
  ctaLabel,
  description,
  enabled = false,
  onPress,
  statusLabel,
  title,
}: PracticeCardProps) {
  const status = statusLabel ?? (enabled ? 'Available' : 'Coming Soon');

  return (
    <Pressable
      disabled={!enabled}
      onPress={onPress}
      style={[styles.card, !enabled && styles.cardMuted, enabled && styles.cardInteractive]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Badge label={status} tone={enabled ? 'success' : 'muted'} />
      </View>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {ctaLabel && enabled ? <Text style={styles.linkText}>{ctaLabel}</Text> : null}
    </Pressable>
  );
}

export function ProgressCard({
  accentValue,
  accentValueColor = '#0F4C5C',
  caption,
  description,
  title,
}: ProgressCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {accentValue ? (
        <Text style={[styles.accentValue, { color: accentValueColor }]}>{accentValue}</Text>
      ) : null}
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <View style={[styles.card, styles.statCard]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  accentValue: {
    color: '#0F4C5C',
    fontSize: 22,
    fontWeight: '800',
  },
  caption: {
    color: '#486581',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  cardInteractive: {
    borderColor: '#A9CBD7',
  },
  cardMuted: {
    backgroundColor: '#F8FBFD',
  },
  cardTitle: {
    color: '#102A43',
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  linkText: {
    color: '#0F4C5C',
    fontSize: 14,
    fontWeight: '700',
  },
  statCard: {
    minHeight: 118,
  },
  statValue: {
    color: '#0F4C5C',
    fontSize: 28,
    fontWeight: '800',
  },
});
