import { StyleSheet, Text, View } from 'react-native';

interface BadgeProps {
  label: string;
  tone?: 'default' | 'muted' | 'success';
}

export function Badge({ label, tone = 'default' }: BadgeProps) {
  return (
    <View style={[styles.badge, toneStyles[tone]]}>
      <Text style={[styles.text, textToneStyles[tone]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});

const toneStyles = StyleSheet.create({
  default: {
    backgroundColor: '#D9F0F3',
  },
  muted: {
    backgroundColor: '#E8EEF2',
  },
  success: {
    backgroundColor: '#D9F8E8',
  },
});

const textToneStyles = StyleSheet.create({
  default: {
    color: '#0F4C5C',
  },
  muted: {
    color: '#52606D',
  },
  success: {
    color: '#166534',
  },
});
