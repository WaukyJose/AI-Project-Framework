import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../../components/ui/screen-container';
import { languageIdentities } from '../../constants/language-identity';
import { useUiPreferencesStore } from '../../store/ui-preferences-store';

type Language = 'en' | 'es';

interface PracticeScreenProps {
  language?: Language;
}

const content = {
  en: {
    eyebrow: 'OpenVoz',
    screenTitle: 'Speaking Practice',
    examBadgeText: 'Cambridge',
    primaryTitle: 'B2 First Speaking',
    primarySubtitle: 'Four-part oral examination · ~14 minutes · Parts 1-4',
    infoLabel: 'What we test',
    infoBody:
      'Grammar, vocabulary, discourse management, pronunciation, and interactive communication are the five criteria examiners use in real B2 speaking assessments.',
    examParts: [
      { active: true, id: 'part-1', label: 'Part 1' },
      { active: true, id: 'part-2', label: 'Part 2' },
      { active: false, id: 'part-3', label: 'Part 3' },
      { active: false, id: 'part-4', label: 'Part 4' },
    ] as const,
    languageOptions: [
      {
        code: 'EN',
        subtitle: 'Current app language · Ready now',
        title: 'English',
      },
      {
        code: 'ES',
        subtitle: 'Spanish interface · Available now',
        title: 'Spanish',
      },
    ] as const,
  },
  es: {
    eyebrow: 'OpenVoz',
    screenTitle: 'Práctica de expresión oral',
    examBadgeText: 'Cambridge',
    primaryTitle: 'B2 Expresión oral',
    primarySubtitle: 'Examen oral de cuatro partes · ~14 minutos · Partes 1–4',
    infoLabel: 'QUÉ EVALUAMOS',
    infoBody:
      'Gramática, vocabulario, gestión del discurso, pronunciación y comunicación interactiva son los cinco criterios que los examinadores utilizan en las evaluaciones reales de expresión oral de B2.',
    examParts: [
      { active: true, id: 'part-1', label: 'Parte 1' },
      { active: true, id: 'part-2', label: 'Parte 2' },
      { active: false, id: 'part-3', label: 'Parte 3' },
      { active: false, id: 'part-4', label: 'Parte 4' },
    ] as const,
    languageOptions: [
      {
        code: 'EN',
        subtitle: 'Interfaz en inglés',
        title: 'Inglés',
      },
      {
        code: 'ES',
        subtitle: 'Idioma actual de la aplicación · Disponible ahora',
        title: 'Español',
      },
    ] as const,
  },
} as const;

export function PracticeScreen({ language }: PracticeScreenProps) {
  const uiLanguage = useUiPreferencesStore((state) => state.uiLanguage);
  const setUiLanguage = useUiPreferencesStore((state) => state.setUiLanguage);

  // Compatibility bootstrap: an explicitly route-provided language (for
  // example practice-es) seeds the global store once on mount. After that,
  // the global store is the primary source of truth for the UI language.
  const seededFromRoute = useRef(false);
  useEffect(() => {
    if (seededFromRoute.current) {
      return;
    }
    seededFromRoute.current = true;
    if (language) {
      setUiLanguage(language);
    }
  }, [language, setUiLanguage]);

  const t = content[uiLanguage];
  const activeLanguageCode = uiLanguage.toUpperCase();
  const identity = languageIdentities[uiLanguage];

  const handleLanguagePress = (code: string) => {
    setUiLanguage(code === 'ES' ? 'es' : 'en');
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{t.eyebrow}</Text>
        <Text style={styles.screenTitle}>{t.screenTitle}</Text>

        <View style={styles.languagePillContainer}>
          <View style={[styles.languagePill, { backgroundColor: identity.accent }]}>
            <Text style={styles.languagePillText}>{identity.code}</Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              uiLanguage === 'es'
                ? '/(app)/practice/b2-speaking?lang=es'
                : '/(app)/practice/b2-speaking'
            )
          }
          style={({ pressed }) => [
            styles.primaryCard,
            { borderColor: identity.accent, borderWidth: 4 },
            pressed && styles.primaryCardPressed,
          ]}
        >
          <View style={styles.primaryTopRow}>
            <View style={[styles.examBadge, { backgroundColor: `${identity.accent}1A` }]}>
              <Text style={[styles.examBadgeText, { color: identity.accent }]}>
                {t.examBadgeText}
              </Text>
            </View>
            <View style={[styles.chevronButton, { backgroundColor: `${identity.accent}1A` }]}>
              <Text style={styles.chevronText}>›</Text>
            </View>
          </View>

          <Text style={styles.primaryTitle}>{t.primaryTitle}</Text>
          <Text style={styles.primarySubtitle}>{t.primarySubtitle}</Text>

          <View style={styles.partChipsRow}>
            {t.examParts.map((part) => (
              <View
                key={part.id}
                style={[
                  styles.partChip,
                  part.active
                    ? { backgroundColor: `${identity.accent}72` }
                    : styles.partChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.partChipText,
                    part.active ? styles.partChipTextActive : styles.partChipTextInactive,
                  ]}
                >
                  {part.label}
                </Text>
              </View>
            ))}
          </View>
        </Pressable>

        {t.languageOptions.map((exam, index) => (
          <Pressable
            key={exam.code}
            onPress={() => handleLanguagePress(exam.code)}
            style={({ pressed }) => [
              styles.languageRow,
              exam.code === activeLanguageCode ? styles.languageRowActive : styles.languageRowMuted,
              index === t.languageOptions.length - 1 && styles.languageRowLast,
              pressed && styles.languageRowPressed,
            ]}
          >
            <View
              style={[
                styles.languageBadge,
                exam.code === activeLanguageCode && styles.languageBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.languageBadgeText,
                  exam.code === activeLanguageCode && { color: identity.accent },
                ]}
              >
                {exam.code}
              </Text>
            </View>
            <View style={styles.languageCopy}>
              <Text style={styles.languageTitle}>{exam.title}</Text>
              <Text style={styles.languageSubtitle}>{exam.subtitle}</Text>
            </View>
          </Pressable>
        ))}

        <View
          style={[
            styles.infoBlock,
            { borderColor: `${identity.accent}26`, backgroundColor: `${identity.accent}26` },
          ]}
        >
          <Text style={[styles.infoLabel, { color: identity.accent }]}>{t.infoLabel}</Text>
          <Text style={styles.infoBody}>{t.infoBody}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chevronButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  chevronText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  languageBadge: {
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  languageBadgeActive: {
    backgroundColor: '#EAF4F2',
  },
  languageBadgeText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  languageBadgeTextActive: {
    color: '#1D7A6B',
  },
  languageCopy: {
    flex: 1,
    gap: 2,
  },
  languageRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9F0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    opacity: 0.6,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  languageRowActive: {
    opacity: 1,
  },
  languageRowLast: {
    marginBottom: 0,
  },
  languageRowMuted: {
    opacity: 0.6,
  },
  languageRowPressed: {
    opacity: 0.8,
  },
  languageSubtitle: {
    color: '#64748B',
    fontSize: 12,
  },
  languageTitle: {
    color: '#1A2B4A',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 12,
    paddingTop: 20,
  },
  eyebrow: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.6,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  examBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  examBadgeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoBlock: {
    backgroundColor: '#EAF4F2',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoBody: {
    color: '#374151',
    fontSize: 13,
    lineHeight: 20,
  },
  infoLabel: {
    color: '#1D7A6B',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  partChip: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  partChipActive: {
    backgroundColor: 'rgba(29,122,107,0.7)',
  },
  partChipInactive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  partChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  partChipTextActive: {
    color: '#FFFFFF',
  },
  partChipTextInactive: {
    color: 'rgba(255,255,255,0.45)',
  },
  partChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryCard: {
    backgroundColor: '#1A2B4A',
    borderRadius: 18,
    marginTop: 20,
    paddingBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  primaryCardPressed: {
    opacity: 0.94,
  },
  primarySubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  primaryTitle: {
    color: '#FFFFFF',
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  primaryTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  screenTitle: {
    color: '#1A2B4A',
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  languagePillContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  languagePill: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  languagePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
