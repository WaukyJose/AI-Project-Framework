import { StyleSheet, Text, View } from 'react-native';

interface SectionHeaderProps {
  description?: string;
  title: string;
}

export function SectionHeader({ description, title }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  description: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  title: {
    color: '#102A43',
    fontSize: 20,
    fontWeight: '800',
  },
});
