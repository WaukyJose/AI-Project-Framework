import { Redirect, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SpeakingInterruptionBanner } from '../../components/speaking/speaking-interruption-banner';
import { useAppBootstrap } from '../../hooks/use-app-bootstrap';
import { useAppLifecycle } from '../../hooks/use-app-lifecycle';
import { useAuthStore } from '../../store/auth-store';

export default function AppLayout() {
  const { isReady } = useAppBootstrap();
  const lifecycleState = useAppLifecycle();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.container}>
      <SpeakingInterruptionBanner lifecycleState={lifecycleState} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="practice/b2-speaking" />
        <Stack.Screen name="practice/practice-es" />
        <Stack.Screen name="practice/[part]" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
