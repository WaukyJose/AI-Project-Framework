import { StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
  description: string;
  title: string;
}

export function EmptyState({ description, title }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  description: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  title: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '700',
  },
});
