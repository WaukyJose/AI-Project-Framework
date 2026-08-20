import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';

import { AppProviders } from '../components/providers/app-providers';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Lora-Bold': require('../assets/fonts/Lora-Bold.ttf'),
    'Lora-Italic': require('../assets/fonts/Lora-Italic.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </AppProviders>
  );
}
