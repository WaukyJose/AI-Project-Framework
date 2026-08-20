export const queryKeys = {
  app: ['app'] as const,
  backendDiagnostics: (environment: string) => ['backend-diagnostics', environment] as const,
  dashboard: (language: 'en' | 'es') => ['dashboard', language] as const,
  subscription: ['subscription'] as const,
};
