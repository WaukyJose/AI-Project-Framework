export const queryKeys = {
  app: ['app'] as const,

  backendDiagnostics: (environment: string) =>
    ['backend-diagnostics', environment] as const,

  dashboard: (language: 'en' | 'es') =>
    ['dashboard', language] as const,

  progress: (language: 'en' | 'es') =>
    ['progress', language] as const,

  subscription: ['subscription'] as const,
};