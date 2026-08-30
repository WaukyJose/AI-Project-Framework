import { create } from 'zustand';

import {
  ApiEnvironmentName,
  getCurrentApiEnvironmentName,
  isApiEnvironmentSelectionEnabled,
} from '../utils/env';

interface ConnectivityStoreState {
  selectedEnvironment: ApiEnvironmentName;
  setSelectedEnvironment: (environment: ApiEnvironmentName) => void;
}

export const useConnectivityStore = create<ConnectivityStoreState>((set) => ({
  selectedEnvironment: getCurrentApiEnvironmentName(),
  setSelectedEnvironment: (selectedEnvironment) =>
    set({
      selectedEnvironment: isApiEnvironmentSelectionEnabled()
        ? selectedEnvironment
        : 'production',
    }),
}));
