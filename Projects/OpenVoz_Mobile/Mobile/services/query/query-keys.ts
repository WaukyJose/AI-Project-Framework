export const queryKeys = {
  app: ['app'] as const,
  backendDiagnostics: (environment: string) => ['backend-diagnostics', environment] as const,
};
