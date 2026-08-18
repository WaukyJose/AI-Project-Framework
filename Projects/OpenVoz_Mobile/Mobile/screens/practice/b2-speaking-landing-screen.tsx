import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../../components/ui/screen-container';
import { speakingParts } from '../../services/speaking/speaking-parts';
import { languageIdentities } from '../../constants/language-identity';
import { useUiPreferencesStore } from '../../store/ui-preferences-store';

const featuredPartId = 'part-1';

type Language = 'en' | 'es';

interface B2SpeakingLandingScreenProps {
  language?: Language;
}

const content = {
  en: {
    eyebrow: 'Cambridge B2',
    screenTitle: 'B2 First Speaking',
    introText: 'Move through the exam one part at a time with a calmer, guided practice flow.',
    startHere: 'Start here',
    recommendedNextStep: 'Recommended next step',
    allPartsTitle: 'All Parts',
    allPartsDescription:
      'Practise every stage of the speaking exam with the same shared workspace.',
    statusReady: 'Ready',
    openPrefix: 'Open ',
    examFlowLabel: 'Exam flow',
    examFlowText:
      'Part 2 already includes the short follow-up, so you can focus on the real sequence without extra menu choices.',
    parts: {
      'part-1': {
        title: 'Part 1',
        description:
          'Introduce the candidate, conversational warm-up, and guided question exchange.',
      },
      'part-2': {
        title: 'Part 2',
        description: 'Preparation, prompt review, and longer individual response flow.',
      },
      'part-3': {
        title: 'Part 3',
        description: 'Collaborative discussion structure and longer comparative interaction.',
      },
      'part-4': {
        title: 'Part 4',
        description: 'Extended discussion and closing exam dialogue.',
      },
    },
  },
  es: {
    eyebrow: 'Cambridge B2',
    screenTitle: 'B2 Expresión oral',
    introText: 'Avanza por el examen parte por parte con una práctica guiada.',
    startHere: 'Empieza aquí',
    recommendedNextStep: 'Siguiente paso recomendado',
    allPartsTitle: 'Todas las partes',
    allPartsDescription:
      'Practica cada etapa del examen oral en el mismo espacio de trabajo compartido.',
    statusReady: 'Disponible',
    openPrefix: 'Abrir ',
    examFlowLabel: 'Flujo del examen',
    examFlowText:
      'La Parte 2 ya incluye el seguimiento breve, así que puedes enfocarte en la secuencia real sin opciones de menú adicionales.',
    parts: {
      'part-1': {
        title: 'Parte 1',
        description:
          'Presentación del candidato, calentamiento conversacional e intercambio guiado de preguntas.',
      },
      'part-2': {
        title: 'Parte 2',
        description: 'Preparación, revisión del tema y flujo de respuesta individual más largo.',
      },
      'part-3': {
        title: 'Parte 3',
        description: 'Estructura de discusión colaborativa e interacción comparativa extendida.',
      },
      'part-4': {
        title: 'Parte 4',
        description: 'Discusión extendida y diálogo de cierre del examen.',
      },
    },
  },
} as const;

export function B2SpeakingLandingScreen({ language }: B2SpeakingLandingScreenProps) {
  const uiLanguage = useUiPreferencesStore((state) => state.uiLanguage);
  const setUiLanguage = useUiPreferencesStore((state) => state.setUiLanguage);

  // Compatibility bootstrap: a legacy ?lang=es route param seeds the global
  // store once on mount. After that, the store is the primary UI-language
  // source of truth and the prop is never used to override it.
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
  const identity = languageIdentities[uiLanguage];
  const featuredPartOriginal =
    speakingParts.find((part) => part.id === featuredPartId) ?? speakingParts[0];
  const remainingPartsOriginal = speakingParts.filter(
    (part) => part.id !== featuredPartOriginal.id
  );

  const featuredPart = {
    ...featuredPartOriginal,
    title:
      t.parts[featuredPartOriginal.id as keyof typeof t.parts]?.title ?? featuredPartOriginal.title,
    description:
      t.parts[featuredPartOriginal.id as keyof typeof t.parts]?.description ??
      featuredPartOriginal.description,
  };

  const remainingParts = remainingPartsOriginal.map((part) => ({
    ...part,
    title: t.parts[part.id as keyof typeof t.parts]?.title ?? part.title,
    description: t.parts[part.id as keyof typeof t.parts]?.description ?? part.description,
  }));

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{t.eyebrow}</Text>
        <Text style={styles.screenTitle}>{t.screenTitle}</Text>
        <Text style={styles.introText}>{t.introText}</Text>

        <Pressable
          onPress={() =>
            router.push(
              uiLanguage === 'es'
                ? `/(app)/practice/${featuredPart.id}?lang=es`
                : `/(app)/practice/${featuredPart.id}`
            )
          }
          style={({ pressed }) => [styles.featuredCard, pressed && styles.featuredCardPressed]}
        >
          <View style={styles.featuredHeader}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>{t.startHere}</Text>
            </View>
            <View style={styles.featuredChevron}>
              <Text style={styles.featuredChevronText}>›</Text>
            </View>
          </View>

          <Text style={styles.featuredTitle}>{featuredPart.title}</Text>
          <Text style={styles.featuredDescription}>{featuredPart.description}</Text>

          <View style={styles.featuredFooter}>
            <View style={[styles.featuredChip, { backgroundColor: `${identity.accent}72` }]}>
              <Text style={styles.featuredChipText}>{t.recommendedNextStep}</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.allPartsTitle}</Text>
          <Text style={styles.sectionDescription}>{t.allPartsDescription}</Text>
        </View>

        {remainingParts.map((part) => (
          <Pressable
            key={part.id}
            onPress={() =>
              router.push(
                uiLanguage === 'es'
                  ? `/(app)/practice/${part.id}?lang=es`
                  : `/(app)/practice/${part.id}`
              )
            }
            style={({ pressed }) => [styles.partCard, pressed && styles.partCardPressed]}
          >
            <View style={styles.partCardHeader}>
              <Text style={styles.partTitle}>{part.title}</Text>
              <View style={[styles.partStatus, { backgroundColor: `${identity.accent}26` }]}>
                <Text style={[styles.partStatusText, { color: identity.accent }]}>
                  {t.statusReady}
                </Text>
              </View>
            </View>
            <Text style={styles.partDescription}>{part.description}</Text>
            <Text
              style={[styles.partLink, { color: identity.accent }]}
            >{`${t.openPrefix}${part.title}`}</Text>
          </Pressable>
        ))}

        <View
          style={[
            styles.noteCard,
            { borderColor: `${identity.accent}26`, backgroundColor: `${identity.accent}26` },
          ]}
        >
          <Text style={[styles.noteLabel, { color: identity.accent }]}>{t.examFlowLabel}</Text>
          <Text style={styles.noteText}>{t.examFlowText}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  featuredBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  featuredBadgeText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  featuredCard: {
    backgroundColor: '#1A2B4A',
    borderRadius: 20,
    marginTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  featuredCardPressed: {
    opacity: 0.94,
  },
  featuredChevron: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  featuredChevronText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  featuredChip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  featuredChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  featuredDescription: {
    color: 'rgba(255,255,255,0.64)',
    fontSize: 14,
    lineHeight: 21,
  },
  featuredFooter: {
    marginTop: 16,
  },
  featuredHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  introText: {
    color: '#52606D',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 10,
  },
  noteCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  noteText: {
    color: '#374151',
    fontSize: 13,
    lineHeight: 20,
  },
  partCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9F0',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  partCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  partCardPressed: {
    opacity: 0.95,
  },
  partDescription: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
  },
  partLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  partStatus: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  partStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  partTitle: {
    color: '#1A2B4A',
    fontSize: 20,
    fontWeight: '700',
  },
  screenTitle: {
    color: '#1A2B4A',
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  sectionDescription: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
  },
  sectionHeader: {
    gap: 6,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#1A2B4A',
    fontSize: 20,
    fontWeight: '700',
  },
});
