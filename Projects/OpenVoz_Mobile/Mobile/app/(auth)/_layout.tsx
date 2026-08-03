import { Redirect, Stack } from 'expo-router';

import { useAppBootstrap } from '../../hooks/use-app-bootstrap';
import { useAuthStore } from '../../store/auth-store';

export default function AuthLayout() {
  const { isReady } = useAppBootstrap();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isReady) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
