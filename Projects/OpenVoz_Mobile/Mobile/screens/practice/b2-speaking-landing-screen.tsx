import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScreenContainer } from '../../components/ui/screen-container';
import { speakingParts } from '../../services/speaking/speaking-parts';
import { languageIdentities } from '../../constants/language-identity';
import { useUiPreferencesStore } from '../../store/ui-preferences-store';
import Svg, { Path } from 'react-native-svg';

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
    featuredExamName: 'B2 FIRST',
    featuredDiscipline: 'Speaking Practice',
    featuredMeta: 'Four-part oral examination · ~14 min',
    startSpeakingPractice: 'Enter B2 Speaking',
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
    featuredExamName: 'B2 FIRST',
    featuredDiscipline: 'Práctica oral',
    featuredMeta: 'Examen oral de cuatro partes · ~14 min',
    startSpeakingPractice: 'Entrar en práctica oral',
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
  const [arrowAnimation] = useState(() => new Animated.Value(0));

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

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;
      let reduceMotionEnabled = false;
      let animation: Animated.CompositeAnimation | null = null;

      arrowAnimation.stopAnimation();
      arrowAnimation.setValue(0);

      const stopAndResetArrow = () => {
        animation?.stop();
        animation = null;
        arrowAnimation.stopAnimation();
        arrowAnimation.setValue(0);
      };

      const startArrowAnimation = (shouldReduceMotion: boolean) => {
        if (!isFocused || shouldReduceMotion) return;
        reduceMotionEnabled = false;
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(arrowAnimation, {
              duration: 500,
              easing: Easing.inOut(Easing.cubic),
              toValue: 1,
              useNativeDriver: true,
            }),
            Animated.timing(arrowAnimation, {
              duration: 500,
              easing: Easing.inOut(Easing.cubic),
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.delay(1800),
          ])
        );
        animation.start();
      };

      const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
        reduceMotionEnabled = enabled;
        if (enabled) stopAndResetArrow();
      });

      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        if (!isFocused || reduceMotionEnabled) return;
        startArrowAnimation(enabled);
      });

      return () => {
        isFocused = false;
        stopAndResetArrow();
        subscription.remove();
      };
    }, [arrowAnimation])
  );

  const t = content[uiLanguage];
  const identity = languageIdentities[uiLanguage];
  const animatedArrowStyle = {
    opacity: arrowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.72],
    }),
    transform: [
      {
        translateX: arrowAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 6],
        }),
      },
    ],
  };
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
          <View style={styles.featuredIdentity}>
            <Text style={styles.featuredExamName}>{t.featuredExamName}</Text>
            <Text style={styles.featuredTitle}>{t.featuredDiscipline}</Text>
          </View>

          <Text style={styles.featuredMeta}>{t.featuredMeta}</Text>

          <View style={styles.featuredFooter}>
            <View style={styles.featuredDivider} />
            <View style={styles.featuredAction}>
              <Text style={styles.featuredActionText}>{t.startSpeakingPractice}</Text>
              <Animated.View style={[styles.featuredActionArrow, animatedArrowStyle]}>
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Path
                    d="M5 12h13M13 6l6 6-6 6"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Animated.View>
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
  featuredCard: {
    backgroundColor: '#1A2B4A',
    borderRadius: 12,
    marginTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  featuredCardPressed: {
    opacity: 0.94,
  },
  featuredAction: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
  },
  featuredActionArrow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  featuredActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  featuredDivider: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    height: 1,
    width: '100%',
  },
  featuredExamName: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  featuredIdentity: {
    gap: 5,
  },
  featuredMeta: {
    color: 'rgba(255,255,255,0.64)',
    fontSize: 14,
    lineHeight: 20,
  },
  featuredFooter: {
    marginTop: 28,
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
