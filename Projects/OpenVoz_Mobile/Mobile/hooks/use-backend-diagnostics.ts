import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../services/api';
import { queryKeys } from '../services/query/query-keys';
import { useConnectivityStore } from '../store/connectivity-store';
import { getApiEnvironment } from '../utils/env';

export function useBackendDiagnostics() {
  const selectedEnvironment = useConnectivityStore((state) => state.selectedEnvironment);

  return useQuery({
    queryFn: () => apiClient.getBackendDiagnostics(selectedEnvironment),
    queryKey: queryKeys.backendDiagnostics(getApiEnvironment(selectedEnvironment).name),
    retry: false,
  });
}
