import { create } from 'zustand';

import { LanguageCode } from '../constants/language-identity';

interface UiPreferencesState {
  uiLanguage: LanguageCode;
  setUiLanguage: (language: LanguageCode) => void;
}

export const useUiPreferencesStore = create<UiPreferencesState>((set) => ({
  uiLanguage: 'en',
  setUiLanguage: (uiLanguage) => set({ uiLanguage }),
}));
