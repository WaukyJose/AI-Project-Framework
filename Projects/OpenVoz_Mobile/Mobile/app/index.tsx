import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../components/ui/screen-container';
import { useAppBootstrap } from '../hooks/use-app-bootstrap';
import { useAuthStore } from '../store/auth-store';

function SplashScreen() {
  return (
    <ScreenContainer centered>
      <View style={styles.splash}>
        <ActivityIndicator color="#0F4C5C" size="large" />
        <Text style={styles.splashTitle}>Restoring session</Text>
        <Text style={styles.splashText}>
          OpenVoz Mobile is validating stored authentication state before routing the user.
        </Text>
      </View>
    </ScreenContainer>
  );
}

export default function IndexRoute() {
  const { isReady } = useAppBootstrap();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isReady) {
    return <SplashScreen />;
  }

  return <Redirect href={isAuthenticated ? '/(app)/(tabs)/dashboard' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  splash: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  splashText: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 280,
    textAlign: 'center',
  },
  splashTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
  },
});
