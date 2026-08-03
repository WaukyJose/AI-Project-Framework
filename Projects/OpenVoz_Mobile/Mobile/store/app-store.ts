import { create } from 'zustand';

interface AppStoreState {
  hasCompletedBootstrap: boolean;
  setHasCompletedBootstrap: (value: boolean) => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  hasCompletedBootstrap: false,
  setHasCompletedBootstrap: (value) => set({ hasCompletedBootstrap: value }),
}));
