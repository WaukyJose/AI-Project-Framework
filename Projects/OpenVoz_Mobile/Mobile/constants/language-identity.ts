export type LanguageCode = 'en' | 'es';

export interface LanguageIdentity {
  accent: string;
  code: string;
  label: string;
}

export const languageIdentities: Record<LanguageCode, LanguageIdentity> = {
  en: {
    accent: '#1D7A6B',
    code: 'EN',
    label: 'English',
  },
  es: {
    accent: '#B8762A',
    code: 'ES',
    label: 'Español',
  },
};
