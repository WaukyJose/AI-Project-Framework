import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ExaminerAvatar } from '../speaking/examiner-avatar';

interface HeroCardProps {
  actionLabel: string;
  onPress: () => void;
  orientation?: string;
  subtitle: string;
  title: string;
}

export function HeroCard({
  actionLabel,
  onPress,
  orientation,
  subtitle,
  title,
}: HeroCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {orientation ? <Text style={styles.orientation}>{orientation}</Text> : null}

      <View style={styles.separator} />

      <View style={styles.action}>
        <Text style={styles.actionLabel}>{actionLabel}</Text>
        <Text style={styles.actionArrow}>→</Text>
        <View style={styles.actionSpacer} />
        <View style={styles.avatarSlot}>
          <ExaminerAvatar size={48} state="idle" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionArrow: {
    color: '#0F4C5C',
    fontSize: 18,
    fontWeight: '600',
  },
  actionLabel: {
    color: '#0F4C5C',
    fontSize: 16,
    fontWeight: '700',
  },
  actionSpacer: {
    flex: 1,
  },
  avatarSlot: {
    flexShrink: 0,
  },
  card: {
    backgroundColor: '#ECF5F8',
    borderColor: '#B6D6E0',
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    padding: 22,
  },
  cardPressed: {
    backgroundColor: '#DEEEF4',
  },
  orientation: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  separator: {
    backgroundColor: '#C4DFE8',
    height: 1,
    marginVertical: 10,
    width: '100%',
  },
  subtitle: {
    color: '#486581',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  title: {
    color: '#102A43',
    fontSize: 22,
    fontWeight: '800',
  },
});
