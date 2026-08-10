import { StyleSheet, Text, View } from 'react-native';

import { ExaminerAvatar } from './examiner-avatar';

interface ExaminerTurnBubbleProps {
  examinerText: string;
  examinerAudioUrl: string | null;
}

export function ExaminerTurnBubble({ examinerText, examinerAudioUrl }: ExaminerTurnBubbleProps) {
  return (
    <View style={styles.section}>
      <View style={styles.avatarRow}>
        <ExaminerAvatar state="idle" size={140} />
      </View>
      <View style={styles.bubble}>
        <View style={styles.headerRow}>
          <Text style={styles.examinerTitle}>OpenVoz Examiner</Text>
          {examinerAudioUrl ? <Text style={styles.audioBadge}>Audio ready</Text> : null}
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
