import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function LoadingView({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color="#0F4C5C" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

export function ErrorView({ message }: { message: string }) {
  return (
    <View style={[styles.container, styles.error]}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    justifyContent: 'center',
    minHeight: 120,
    padding: 20,
  },
  error: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  text: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
