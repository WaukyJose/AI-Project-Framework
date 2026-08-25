import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { ScreenContainer } from '../../components/ui/screen-container';
import { LanguageCode } from '../../constants/language-identity';
import { useDashboardData } from '../../hooks/use-dashboard-data';
import { useAuthStore } from '../../store/auth-store';
import { useUiPreferencesStore } from '../../store/ui-preferences-store';
import { DashboardActivityItem } from '../../types/dashboard';

const WAVE_HEIGHTS = [
  8, 14, 20, 12, 28, 16, 32, 18, 24, 14, 20, 10, 18, 12, 22, 14, 10, 16,
];
const PLAYED_COUNT = 11;

function extractText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function buildRecentSessionRows(items: DashboardActivityItem[]) {
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
      extractText(item.score) ?? extractText(item.band) ?? extractText(item.result) ?? null;

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

function ExaminerAvatarIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Circle cx={6} cy={4} r={2.2} fill="#FFFFFF" />
      <Path d="M1.8 10.4c.6-2.2 2.3-3.4 4.2-3.4s3.6 1.2 4.2 3.4" fill="#FFFFFF" />
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
  const { data } = useDashboardData(uiLanguage);
  const user = data?.user;
  const stats = data?.dashboard.stats;
  const recentActivity = data?.dashboard.recentActivity ?? [];
  const recentSessions = buildRecentSessionRows(recentActivity);
  const latestSession = recentSessions[0] ?? null;
  const sessionCount = recentActivity.length;
  const initials = getInitials(user?.fullName, user?.username);

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
            <Pressable onPress={navigateToProfile} style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </Pressable>
          </View>

          <View style={styles.heroPill}>
            <View style={styles.heroPillDot} />
            <Text style={styles.heroPillText}>B2 FIRST SPEAKING</Text>
          </View>

          <Text style={styles.heroHeadline}>
            Practise speaking.{'\n'}Get better.
          </Text>
          <Text style={styles.heroSupportText}>
            All 4 parts of B2 First Speaking with your AI examiner.
          </Text>

          {/* Integrated AI Examiner card */}
          <View style={styles.examinerCard}>
            <View style={styles.examinerHeader}>
              <View style={styles.examinerHeaderLeft}>
                <LinearGradient colors={['#1D7A6B', '#2A9B8A']} style={styles.examinerAvatar}>
                  <ExaminerAvatarIcon />
                </LinearGradient>
                <Text style={styles.examinerLabel}>AI Examiner</Text>
              </View>
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            <Text style={styles.examinerPrompt}>
              “Tell me about something you enjoy learning about.”
            </Text>

            <View style={styles.responseStrip}>
              <View style={styles.responseLeft}>
                <View style={styles.recordingDot} />
                <Text style={styles.timerText}>0:24</Text>
              </View>
              <View style={styles.waveformRow}>
                {WAVE_HEIGHTS.map((height, index) => (
                  <View
                    key={index}
                    style={[
                      styles.waveBar,
                      {
                        height,
                        backgroundColor:
                          index < PLAYED_COUNT
                            ? `rgba(42,155,138,${(0.45 + (height / 32) * 0.55).toFixed(2)})`
                            : 'rgba(255,255,255,0.18)',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
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
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  heroPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(42,155,138,0.15)',
    borderColor: 'rgba(42,155,138,0.35)',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroPillDot: {
    backgroundColor: '#2A9B8A',
    borderRadius: 2.5,
    height: 5,
    width: 5,
  },
  heroPillText: {
    color: '#2A9B8A',
    fontFamily: 'Inter-SemiBold',
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontFamily: 'Lora-Bold',
    fontSize: 28,
    letterSpacing: -0.55,
    lineHeight: 32,
    marginBottom: 8,
  },
  heroSupportText: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 19.5,
    marginBottom: 16,
  },

  // Integrated AI Examiner card
  examinerCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  examinerHeader: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.07)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 13,
    paddingTop: 8,
  },
  examinerHeaderLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  examinerAvatar: {
    alignItems: 'center',
    borderRadius: 10,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  examinerLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  liveRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  liveDot: {
    backgroundColor: '#2A9B8A',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  liveText: {
    color: '#2A9B8A',
    fontFamily: 'Inter-SemiBold',
    fontSize: 9.5,
    letterSpacing: 0.3,
  },
  examinerPrompt: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: 'Lora-Italic',
    fontSize: 12.5,
    lineHeight: 18.8,
    paddingBottom: 8,
    paddingHorizontal: 13,
    paddingTop: 8,
  },
  responseStrip: {
    alignItems: 'center',
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingBottom: 9,
    paddingHorizontal: 13,
    paddingTop: 8,
  },
  responseLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  recordingDot: {
    backgroundColor: '#E05555',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  timerText: {
    color: 'rgba(255,255,255,0.40)',
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  waveformRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 2.5,
  },
  waveBar: {
    borderRadius: 2,
    width: 2.5,
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
    paddingBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
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
    height: 36,
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#1A2B4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    width: 36,
  },
  featureCardTitle: {
    color: '#1A2B4A',
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    lineHeight: 14.4,
    marginBottom: 5,
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
