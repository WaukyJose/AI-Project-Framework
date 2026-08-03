import { StyleSheet, Text, View } from 'react-native';

interface AppHeaderProps {
  eyebrow?: string;
  subtitle?: string;
  title: string;
  trailing?: React.ReactNode;
}

export function AppHeader({ eyebrow, subtitle, title, trailing }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    color: '#0F4C5C',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#52606D',
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    color: '#102A43',
    fontSize: 30,
    fontWeight: '800',
  },
  trailing: {
    alignSelf: 'flex-start',
  },
});
