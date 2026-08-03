import { StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  label: string;
  size?: number;
}

function getInitials(label: string) {
  return label
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ label, size = 48 }: AvatarProps) {
  return (
    <View style={[styles.avatar, { borderRadius: size / 2, height: size, width: size }]}>
      <Text style={[styles.text, { fontSize: size * 0.34 }]}>{getInitials(label)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#0F4C5C',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
