import { Redirect, Stack } from 'expo-router';

import { useAppBootstrap } from '../../hooks/use-app-bootstrap';
import { useAuthStore } from '../../store/auth-store';

export default function AppLayout() {
  const { isReady } = useAppBootstrap();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="practice/b2-speaking" />
      <Stack.Screen name="practice/b2-speaking/[part]" />
    </Stack>
  );
}
