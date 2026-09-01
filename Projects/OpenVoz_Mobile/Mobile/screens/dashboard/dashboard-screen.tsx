import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Image as SvgImage,
  LinearGradient as SvgLinearGradient,
  Mask,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { ScreenContainer } from '../../components/ui/screen-container';
import { LanguageCode } from '../../constants/language-identity';
import { formatAssessmentStatusLabel } from '../../services/assessment-status-labels';
import { useDashboardData } from '../../hooks/use-dashboard-data';
import { useResponsiveLayout } from '../../hooks/use-responsive-layout';
import { useAuthStore } from '../../store/auth-store';
import { useUiPreferencesStore } from '../../store/ui-preferences-store';
import { DashboardActivityItem } from '../../types/dashboard';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

function extractText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function buildRecentSessionRows(items: DashboardActivityItem[], language: LanguageCode) {
  return items.slice(0, 3).map((item, index) => {
    const title =
      extractText(item.title) ??
      extractText(item.name) ??
      extractText(item.part_title) ??
      extractText(item.label) ??
      `Speaking session ${index + 1}`;
    const meta =
      extractText(item.subtitle) ??
      extractText(item.description) ??
      extractText(item.date) ??
      extractText(item.created_at) ??
      'Recorded session';
    const badge =
      extractText(item.score) ??
      extractText(item.band) ??
      formatAssessmentStatusLabel(extractText(item.result), language) ??
      null;

    return { badge, meta, title };
  });
}

function getInitials(fullName: string | null | undefined, username: string | undefined) {
  const source = fullName?.trim() || username?.trim() || 'Learner';
  return source
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function LogoMark() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Circle cx={8} cy={8} r={6.2} fill="none" stroke="#FFFFFF" strokeWidth={1.4} />
      <Rect x={5} y={6.4} width={1.4} height={3.2} rx={0.7} fill="#FFFFFF" />
      <Rect x={7.3} y={4.8} width={1.4} height={6.4} rx={0.7} fill="#FFFFFF" />
      <Rect x={9.6} y={6} width={1.4} height={4} rx={0.7} fill="#FFFFFF" />
    </Svg>
  );
}

function PlayCircleIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Circle cx={8} cy={8} r={6.6} fill="none" stroke="#FFFFFF" strokeWidth={1.5} />
      <Path d="M6.8 5.4 11 8l-4.2 2.6Z" fill="#FFFFFF" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10">
      <Path d="M3.9 7.1 1.9 5.1l-.8.8 2.8 2.8 5-5-.8-.8Z" fill="#FFFFFF" />
    </Svg>
  );
}

function FeatureIcon({ type }: { type: 'practice' | 'feedback' | 'progress' }) {
  if (type === 'practice') {
    return (
      <Svg width={18} height={18} viewBox="0 0 18 18">
        <Rect x={6} y={2} width={6} height={9} rx={3} fill="none" stroke="#1D7A6B" strokeWidth={1.6} />
        <Path
          d="M3.8 8.5a5.2 5.2 0 0 0 10.4 0M9 13.7V16M6.5 16h5"
          fill="none"
          stroke="#1D7A6B"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (type === 'feedback') {
    return (
      <Svg width={18} height={18} viewBox="0 0 18 18">
        <Path
          d="M9 1.8c.45 3.5 2.7 5.75 6.2 6.2-3.5.45-5.75 2.7-6.2 6.2C8.55 10.7 6.3 8.45 2.8 8 6.3 7.55 8.55 5.3 9 1.8Z"
          fill="#1D7A6B"
        />
      </Svg>
    );
  }

  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path
        d="M2.5 14.5h13M3.5 12l3.1-3.2 2.7 1.8 4.8-5.1M11.8 5.5h2.3v2.3"
        fill="none"
        stroke="#1D7A6B"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DashboardScreen() {
  const navigateToPractice = () => router.push('/(app)/practice');
  const navigateToProgress = () => router.push('/(app)/progress');
  const navigateToProfile = () => router.push('/(app)/profile');
  const logout = useAuthStore((state) => state.logout);
  const uiLanguage = useUiPreferencesStore((state) => state.uiLanguage);
  const setUiLanguage = useUiPreferencesStore((state) => state.setUiLanguage);
  const { width: windowWidth } = useWindowDimensions();
  const [measuredArtworkWidth, setMeasuredArtworkWidth] = useState<number | null>(null);
  const { contentMaxWidth } = useResponsiveLayout();
  const fallbackArtworkWidth = Math.min(windowWidth - 40, contentMaxWidth - 40);
  const heroArtworkWidth =
    measuredArtworkWidth !== null && measuredArtworkWidth > 0
      ? measuredArtworkWidth
      : fallbackArtworkWidth;
  const heroArtworkHeight = heroArtworkWidth * (460 / 630);
  const { data } = useDashboardData(uiLanguage);
  const user = data?.user;
  const stats = data?.dashboard.stats;
  const recentActivity = data?.dashboard.recentActivity ?? [];
  const recentSessions = buildRecentSessionRows(recentActivity, uiLanguage);
  const latestSession = recentSessions[0] ?? null;
  const sessionCount = recentActivity.length;
  const initials = getInitials(user?.fullName, user?.username);
  const [artworkEntrance] = useState(() => new Animated.Value(0));
  const [shimmerPosition] = useState(() => new Animated.Value(-150));
  const [isReducedMotion, setIsReducedMotion] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;
      let reduceMotionEnabled = false;
      let animation: Animated.CompositeAnimation | null = null;
      let shimmerAnimation: Animated.CompositeAnimation | null = null;
      const shimmerStart = -150;
      const shimmerEnd = 630;
      const createShimmerSweep = () => {
        shimmerPosition.setValue(shimmerStart);
        return Animated.timing(shimmerPosition, {
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          toValue: shimmerEnd,
          useNativeDriver: false,
        });
      };

      artworkEntrance.stopAnimation();
      artworkEntrance.setValue(0);
      shimmerPosition.stopAnimation();
      shimmerPosition.setValue(shimmerStart);
      setIsReducedMotion(true);

      const showArtworkImmediately = () => {
        animation?.stop();
        animation = null;
        artworkEntrance.setValue(1);
      };

      const startEntrance = (shouldReduceMotion: boolean) => {
        if (!isFocused) return;
        reduceMotionEnabled = shouldReduceMotion;
        setIsReducedMotion(shouldReduceMotion);

        if (shouldReduceMotion) {
          showArtworkImmediately();
          return;
        }

        animation = Animated.timing(artworkEntrance, {
          duration: 700,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        });
        animation.start(() => {
          animation = null;
        });
      };

      const startShimmer = () => {
        shimmerAnimation = Animated.sequence([
          Animated.delay(1800),
          createShimmerSweep(),
          Animated.loop(
            Animated.sequence([Animated.delay(6800), createShimmerSweep()]),
          ),
        ]);
        shimmerAnimation.start();
      };

      const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
        reduceMotionEnabled = enabled;
        setIsReducedMotion(enabled);
        if (enabled) showArtworkImmediately();
        if (enabled) {
          shimmerAnimation?.stop();
          shimmerAnimation = null;
        }
      });

      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        if (isFocused && !reduceMotionEnabled) {
          startEntrance(enabled);
          if (!enabled) startShimmer();
        }
      });

      return () => {
        isFocused = false;
        animation?.stop();
        shimmerAnimation?.stop();
        subscription.remove();
        setIsReducedMotion(true);
      };
    }, [artworkEntrance, shimmerPosition])
  );

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  function handleLanguagePress(language: LanguageCode) {
    setUiLanguage(language);
    router.push(
      language === 'es' ? '/(app)/practice/b2-speaking?lang=es' : '/(app)/practice/b2-speaking'
    );
  }

  return (
    <ScreenContainer>
      <ScrollView style={styles.dashboardScroll} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroGlow} />

          <View style={styles.heroHeader}>
            <View style={styles.logoRow}>
              <LinearGradient colors={['#1D7A6B', '#2A9B8A']} style={styles.logoMark}>
                <LogoMark />
              </LinearGradient>
              <Text style={styles.wordmark}>OpenVoz</Text>
            </View>
            <Pressable
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={navigateToProfile}
              style={styles.avatarCircle}
            >
              <Text style={styles.avatarInitials}>{initials}</Text>
            </Pressable>
          </View>

          <View
            onLayout={({ nativeEvent }) => {
              const width = nativeEvent.layout.width;
              setMeasuredArtworkWidth((currentWidth) => (currentWidth === width ? currentWidth : width));
            }}
            style={styles.homeHeroArtworkWrap}
          >
            <Animated.View
              style={{
                opacity: artworkEntrance,
                transform: [
                  {
                    translateY: artworkEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [14, 0],
                    }),
                  },
                  {
                    scale: artworkEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.97, 1],
                    }),
                  },
                ],
              }}
            >
              <Image
                accessible={false}
                importantForAccessibility="no"
                resizeMode="contain"
                source={require('../../assets/images/home-hero-middle-clean.png')}
                style={{
                  alignSelf: 'center',
                  height: heroArtworkHeight,
                  width: heroArtworkWidth,
                }}
              />
              {!isReducedMotion ? (
                <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
                  <Svg
                    height={heroArtworkHeight}
                    pointerEvents="none"
                    viewBox="0 0 630 460"
                    width={heroArtworkWidth}
                  >
                    <Defs>
                      <Mask id="homeHeroHeadlineMask" maskUnits="userSpaceOnUse">
                        <SvgImage
                          href={require('../../assets/images/home-hero-middle-headline-mask.png')}
                          height={460}
                          width={630}
                          x={0}
                          y={0}
                        />
                      </Mask>
                      <SvgLinearGradient id="homeHeroSilverRay" x1="0" x2="1" y1="0" y2="0">
                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                        <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.2" />
                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                      </SvgLinearGradient>
                    </Defs>
                    <AnimatedRect
                      fill="url(#homeHeroSilverRay)"
                      height={660}
                      mask="url(#homeHeroHeadlineMask)"
                      transform="rotate(12 315 230)"
                      width={150}
                      x={shimmerPosition}
                      y={-100}
                    />
                  </Svg>
                </Animated.View>
              ) : null}
            </Animated.View>
          </View>

          <Pressable
            onPress={navigateToPractice}
            style={({ pressed }) => [styles.heroCta, pressed && styles.heroCtaPressed]}
          >
            <LinearGradient
              colors={['#1D7A6B', '#2A9B8A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCtaGradient}
            >
              <PlayCircleIcon />
              <Text style={styles.heroCtaText}>Start practising</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Practice language */}
        <View style={styles.languageSection}>
          <Text style={styles.sectionEyebrow}>PRACTICE LANGUAGE</Text>
          <Text style={styles.sectionHeading}>Choose your language</Text>
          <View style={styles.languageGrid}>
            <Pressable
              onPress={() => handleLanguagePress('en')}
              style={({ pressed }) => [
                styles.languageCard,
                styles.languageCardEn,
                uiLanguage === 'en' && styles.languageCardSelectedEn,
                pressed && styles.cardPressed,
              ]}
            >
              {uiLanguage === 'en' ? (
                <View style={styles.selectedCheck}>
                  <CheckIcon />
                </View>
              ) : null}
              <View style={[styles.flagCircle, styles.flagCircleEn]}>
                <Text style={styles.flagGlyph}>🇬🇧</Text>
              </View>
              <Text style={styles.languageName}>English</Text>
              <Text style={styles.languageSubtitle}>B2 First Speaking</Text>
              <View style={[styles.languagePill, styles.languagePillEn]}>
                <Text style={[styles.languagePillText, styles.languagePillTextEn]}>
                  EN · Available
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => handleLanguagePress('es')}
              style={({ pressed }) => [
                styles.languageCard,
                styles.languageCardEs,
                uiLanguage === 'es' && styles.languageCardSelectedEs,
                pressed && styles.cardPressed,
              ]}
            >
              {uiLanguage === 'es' ? (
                <View style={[styles.selectedCheck, styles.selectedCheckEs]}>
                  <CheckIcon />
                </View>
              ) : null}
              <View style={[styles.flagCircle, styles.flagCircleEs]}>
                <Text style={styles.flagGlyph}>🇪🇸</Text>
              </View>
              <Text style={styles.languageName}>Español</Text>
              <Text style={styles.languageSubtitle}>B2 First Speaking</Text>
              <View style={[styles.languagePill, styles.languagePillEs]}>
                <Text style={[styles.languagePillText, styles.languagePillTextEs]}>
                  ES · Available
                </Text>
              </View>
            </Pressable>
          </View>
          <Pressable
            onPress={() => handleLanguagePress(uiLanguage)}
            style={({ pressed }) => [
              styles.secondaryCta,
              uiLanguage === 'es' ? styles.secondaryCtaEs : styles.secondaryCtaEn,
              pressed && styles.cardPressed,
            ]}
          >
            <Text
              style={[
                styles.secondaryCtaText,
                uiLanguage === 'es' ? styles.secondaryCtaTextEs : styles.secondaryCtaTextEn,
              ]}
            >
              {uiLanguage === 'es' ? 'Empezar práctica en Español' : 'Start practising in English'}
            </Text>
          </Pressable>
        </View>

        {/* What you get */}
        <View style={styles.featureSection}>
          <Text style={styles.sectionEyebrow}>WHAT YOU GET</Text>
          <Text style={styles.sectionHeading}>Everything in one place</Text>
          <View style={styles.featureGrid}>
            <View style={[styles.featureCard, styles.featureCardTeal]}>
              <View style={styles.featureIcon}>
                <FeatureIcon type="practice" />
              </View>
              <Text style={styles.featureCardTitle}>Speaking Practice</Text>
              <Text style={styles.featureCardBody}>Parts 1–4 guided practice</Text>
            </View>
            <View style={[styles.featureCard, styles.featureCardNavy]}>
              <View style={styles.featureIcon}>
                <FeatureIcon type="feedback" />
              </View>
              <Text style={styles.featureCardTitle}>AI Feedback</Text>
              <Text style={styles.featureCardBody}>Scored speaking feedback</Text>
            </View>
            <View style={[styles.featureCard, styles.featureCardTeal]}>
              <View style={styles.featureIcon}>
                <FeatureIcon type="progress" />
              </View>
              <Text style={styles.featureCardTitle}>Progress</Text>
              <Text style={styles.featureCardBody}>Track improvement</Text>
            </View>
          </View>
        </View>

        {/* Your activity */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Your activity</Text>
            <Pressable onPress={navigateToProgress}>
              <Text style={styles.activityAction}>View all →</Text>
            </Pressable>
          </View>

          <View style={styles.statGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{sessionCount}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.streak ?? 0}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.assessmentsCompleted ?? 0}</Text>
              <Text style={styles.statLabel}>Assessments</Text>
            </View>
          </View>

          {latestSession ? (
            <View style={styles.sessionCard}>
              <View style={styles.sessionIconWrap}>
                <FeatureIcon type="practice" />
              </View>
              <View style={styles.sessionCopy}>
                <Text style={styles.sessionTitle}>{latestSession.title}</Text>
                <Text style={styles.sessionMeta}>{latestSession.meta}</Text>
              </View>
              <View style={styles.sessionBadge}>
                <Text style={styles.sessionBadgeText}>{latestSession.badge ?? 'B2'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No sessions yet</Text>
              <Text style={styles.emptyText}>
                Your recent speaking sessions will appear here after your first recording.
              </Text>
            </View>
          )}
        </View>

        <Pressable onPress={() => void handleLogout()} style={styles.logoutAction}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dashboardScroll: {
    overflow: 'visible',
  },
  scrollContent: {
    backgroundColor: '#F5F7FA',
    paddingBottom: 18,
  },

  // Hero
  hero: {
    backgroundColor: '#1A2B4A',
    marginHorizontal: -20,
    overflow: 'hidden',
    paddingBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    position: 'relative',
  },
  heroGlow: {
    backgroundColor: 'rgba(42,155,138,0.12)',
    borderRadius: 140,
    bottom: -34,
    height: 170,
    position: 'absolute',
    right: -28,
    width: 170,
  },
  homeHeroArtworkWrap: {
    alignItems: 'center',
    backgroundColor: '#1A2B4A',
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    width: '100%',
  },
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoMark: {
    alignItems: 'center',
    borderRadius: 7,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  wordmark: {
    color: '#FFFFFF',
    fontFamily: 'Lora-Bold',
    fontSize: 15,
    letterSpacing: -0.15,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 15,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  // Primary CTA
  heroCta: {
    borderRadius: 13,
    overflow: 'hidden',
  },
  heroCtaPressed: {
    opacity: 0.92,
  },
  heroCtaGradient: {
    alignItems: 'center',
    borderRadius: 13,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    letterSpacing: 0.1,
  },

  // Section headings
  sectionEyebrow: {
    color: '#64748B',
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  sectionHeading: {
    color: '#1A2B4A',
    fontFamily: 'Lora-Bold',
    fontSize: 18,
    letterSpacing: -0.2,
    marginBottom: 14,
  },

  // What you get
  featureSection: {
    paddingTop: 30,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  featureCard: {
    borderRadius: 14,
    borderWidth: 1,
    flexGrow: 1,
    flexBasis: 0,
    paddingBottom: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  featureCardTeal: {
    backgroundColor: '#EAF4F2',
    borderColor: 'rgba(29,122,107,0.15)',
  },
  featureCardNavy: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E4E9F0',
  },
  featureIcon: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 2,
    height: 32,
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    width: 32,
  },
  featureCardTitle: {
    color: '#1A2B4A',
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    lineHeight: 14.4,
    marginBottom: 4,
  },
  featureCardBody: {
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    lineHeight: 15.95,
  },
  cardPressed: {
    opacity: 0.92,
  },

  // Practice language
  languageSection: {
    paddingTop: 24,
  },
  languageGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  languageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 13,
    position: 'relative',
  },
  languageCardEn: {
    borderColor: 'rgba(29,122,107,0.30)',
  },
  languageCardEs: {
    borderColor: 'rgba(184,118,42,0.30)',
  },
  languageCardSelectedEn: {
    backgroundColor: '#EAF4F2',
    borderColor: 'rgba(29,122,107,0.55)',
  },
  languageCardSelectedEs: {
    backgroundColor: '#FBF3E3',
    borderColor: 'rgba(184,118,42,0.50)',
  },
  selectedCheck: {
    alignItems: 'center',
    backgroundColor: '#1D7A6B',
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 16,
    zIndex: 1,
  },
  selectedCheckEs: {
    backgroundColor: '#B8762A',
  },
  flagCircle: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    marginBottom: 10,
    width: 28,
  },
  flagCircleEn: {
    backgroundColor: '#003399',
  },
  flagCircleEs: {
    backgroundColor: '#C60B1E',
  },
  flagGlyph: {
    fontSize: 14,
  },
  languageName: {
    color: '#1A2B4A',
    fontFamily: 'Inter-Bold',
    fontSize: 13,
  },
  languageSubtitle: {
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    fontSize: 10.5,
    marginTop: 2,
  },
  languagePill: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  languagePillEn: {
    backgroundColor: '#EAF4F2',
    borderColor: 'rgba(29,122,107,0.20)',
  },
  languagePillEs: {
    backgroundColor: '#FBF3E3',
    borderColor: 'rgba(184,118,42,0.20)',
  },
  languagePillText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  languagePillTextEn: {
    color: '#1D7A6B',
  },
  languagePillTextEs: {
    color: '#B8762A',
  },

  secondaryCta: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondaryCtaEn: {
    backgroundColor: '#F7FBFA',
    borderColor: 'rgba(29,122,107,0.18)',
  },
  secondaryCtaEs: {
    backgroundColor: '#FFFBF4',
    borderColor: 'rgba(184,118,42,0.18)',
  },
  secondaryCtaText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  secondaryCtaTextEn: {
    color: '#1D7A6B',
  },
  secondaryCtaTextEs: {
    color: '#B8762A',
  },

  // Your activity
  activitySection: {
    marginTop: 30,
  },
  activityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activityTitle: {
    color: '#1A2B4A',
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  activityAction: {
    color: '#1D7A6B',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9F0',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  statValue: {
    color: '#1A2B4A',
    fontFamily: 'Lora-Bold',
    fontSize: 16,
  },
  statLabel: {
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    marginTop: 2,
  },
  sessionCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9F0',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sessionIconWrap: {
    alignItems: 'center',
    backgroundColor: '#EAF4F2',
    borderRadius: 9,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  sessionCopy: {
    flex: 1,
    gap: 2,
  },
  sessionTitle: {
    color: '#1A2B4A',
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
  sessionMeta: {
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    fontSize: 11,
  },
  sessionBadge: {
    backgroundColor: '#EAF4F2',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  sessionBadgeText: {
    color: '#1D7A6B',
    fontFamily: 'Inter-Bold',
    fontSize: 11,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E9F0',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  emptyTitle: {
    color: '#1A2B4A',
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    marginBottom: 4,
  },
  emptyText: {
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  logoutAction: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoutText: {
    color: '#64748B',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});
