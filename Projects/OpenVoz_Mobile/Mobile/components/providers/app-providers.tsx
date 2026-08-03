import { QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { appQueryClient } from '../../services/query/query-client';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={appQueryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
}
