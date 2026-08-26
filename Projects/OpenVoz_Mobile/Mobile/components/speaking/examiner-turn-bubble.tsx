import { StyleSheet, Text, View } from 'react-native';

import { ExaminerAvatar } from './examiner-avatar';
import { languageIdentities } from '../../constants/language-identity';

type Language = 'en' | 'es';

interface ExaminerTurnBubbleProps {
  examinerText: string;
  examinerAudioUrl: string | null;
  isSpeaking?: boolean;
  language?: Language;
}

const content = {
  en: {
    examinerTitle: 'OpenVoz Examiner',
    audioReady: 'Audio ready',
  },
  es: {
    examinerTitle: 'Examinador OpenVoz',
    audioReady: 'Audio listo',
  },
};

export function ExaminerTurnBubble({
  examinerText,
  examinerAudioUrl,
  isSpeaking = false,
  language = 'en',
}: ExaminerTurnBubbleProps) {
  const t = content[language];
  const identity = languageIdentities[language];
  const isSpanish = language === 'es';

  return (
    <View style={styles.section}>
      <View style={styles.avatarRow}>
        <ExaminerAvatar state={isSpeaking ? 'speaking' : 'idle'} size={140} isSpeaking={isSpeaking} />
      </View>
      <View style={styles.bubble}>
        <View style={styles.headerRow}>
          <Text style={[styles.examinerTitle, isSpanish && { color: identity.accent }]}>
            {t.examinerTitle}
          </Text>
          {examinerAudioUrl ? (
            <Text
              style={[
                styles.audioBadge,
                isSpanish && {
                  backgroundColor: `${identity.accent}26`,
                  color: identity.accent,
                },
              ]}
            >
              {t.audioReady}
            </Text>
          ) : null}
        </View>
        <Text style={styles.examinerText}>{examinerText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  audioBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    color: '#475569',
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  avatarRow: {
    paddingTop: 4,
  },
  bubble: {
    backgroundColor: '#F0F9FF',
    borderColor: '#B6E0FF',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    flexShrink: 1,
    gap: 8,
    padding: 16,
  },
  examinerText: {
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 24,
  },
  examinerTitle: {
    color: '#035388',
    fontSize: 13,
    fontWeight: '700',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  section: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
});
