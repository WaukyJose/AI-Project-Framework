import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from './badge';

interface ListItemProps {
  caption?: string;
  onPress?: () => void;
  title: string;
  trailingLabel?: string;
}

interface SettingsRowProps {
  description?: string;
  title: string;
}

export function ListItem({ caption, onPress, title, trailingLabel }: ListItemProps) {
  const Container = onPress ? Pressable : View;

  return (
    <Container onPress={onPress} style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      {trailingLabel ? <Badge label={trailingLabel} tone="muted" /> : null}
    </Container>
  );
}

export function SettingsRow({ description, title }: SettingsRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.caption}>{description}</Text> : null}
      </View>
      <Text style={styles.trailing}>Placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caption: {
    color: '#52606D',
    fontSize: 13,
    lineHeight: 19,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  row: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: '#102A43',
    fontSize: 16,
    fontWeight: '700',
  },
  trailing: {
    color: '#7B8794',
    fontSize: 13,
    fontWeight: '600',
  },
});
