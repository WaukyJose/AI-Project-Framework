import { useEffect, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExaminerAvatar } from './examiner-avatar';
import { languageIdentities } from '../../constants/language-identity';
import {
  buildExaminerScriptSentenceRanges,
  getActiveExaminerSentenceIndex,
} from '../../services/speaking/examiner-script-progress';

type Language = 'en' | 'es';

interface ExaminerTurnBubbleProps {
  examinerText: string;
  examinerAudioUrl: string | null;
  examinerPlaybackProgress?: number;
  isSpeaking?: boolean;
  language?: Language;
  compactScript?: boolean;
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
  examinerPlaybackProgress = 0,
  isSpeaking = false,
  language = 'en',
  compactScript = false,
}: ExaminerTurnBubbleProps) {
  const t = content[language];
  const identity = languageIdentities[language];
  const isSpanish = language === 'es';
  const scriptScrollRef = useRef<ScrollView | null>(null);
  const scriptContentHeightRef = useRef(0);
  const scriptViewportHeightRef = useRef(0);
  const scriptSentenceLayoutsRef = useRef<Record<number, { height: number; y: number }>>({});
  const scriptOffsetRef = useRef(0);
  const scriptPauseUntilRef = useRef(0);
  const scriptRanges = useMemo(
    () => buildExaminerScriptSentenceRanges(examinerText),
    [examinerText],
  );
  const shouldHighlightActiveSentence = isSpeaking || examinerPlaybackProgress >= 1;
  const activeSentenceIndex = useMemo(() => {
    if (!shouldHighlightActiveSentence) {
      return -1;
    }

    return getActiveExaminerSentenceIndex(examinerPlaybackProgress, scriptRanges);
  }, [examinerPlaybackProgress, scriptRanges, shouldHighlightActiveSentence]);

  const pauseAutoScrollForUser = () => {
    scriptPauseUntilRef.current = Date.now() + 1200;
  };

  const scrollActiveSentenceIntoView = (index: number) => {
    if (!compactScript || !isSpeaking || index < 0) {
      return;
    }

    if (Date.now() < scriptPauseUntilRef.current) {
      return;
    }

    const layout = scriptSentenceLayoutsRef.current[index];
    const viewportHeight = scriptViewportHeightRef.current;
    const contentHeight = scriptContentHeightRef.current;

    if (!layout || viewportHeight <= 0 || contentHeight <= 0) {
      return;
    }

    const currentOffset = scriptOffsetRef.current;
    const visibleTop = currentOffset;
    const visibleBottom = currentOffset + viewportHeight;
    const comfortPadding = Math.max(18, Math.round(viewportHeight * 0.12));
    const sentenceTop = layout.y;
    const sentenceBottom = layout.y + layout.height;

    const isComfortablyVisible =
      sentenceTop >= visibleTop + comfortPadding &&
      sentenceBottom <= visibleBottom - comfortPadding;

    if (isComfortablyVisible) {
      return;
    }

    const maxOffset = Math.max(0, contentHeight - viewportHeight);
    const targetOffset = Math.max(0, Math.min(sentenceTop - viewportHeight * 0.28, maxOffset));

    if (Math.abs(targetOffset - currentOffset) < 1) {
      return;
    }

    scriptOffsetRef.current = targetOffset;
    scriptScrollRef.current?.scrollTo({ animated: true, y: targetOffset });
  };

  useEffect(() => {
    if (!compactScript) {
      scriptSentenceLayoutsRef.current = {};
      return;
    }

    scriptScrollRef.current?.scrollTo({ animated: false, y: 0 });
    scriptOffsetRef.current = 0;
    scriptPauseUntilRef.current = 0;
    scriptSentenceLayoutsRef.current = {};
  }, [compactScript, examinerText]);

  useEffect(() => {
    if (!compactScript || !isSpeaking || activeSentenceIndex < 0) {
      return;
    }

    scrollActiveSentenceIntoView(activeSentenceIndex);
  }, [activeSentenceIndex, compactScript, isSpeaking, examinerText]);

  const handleScriptScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scriptOffsetRef.current = event.nativeEvent.contentOffset.y;
  };

  const handleScriptScrollBeginDrag = () => {
    pauseAutoScrollForUser();
  };

  const handleScriptMomentumScrollBegin = () => {
    pauseAutoScrollForUser();
  };

  const renderSentenceSegments = (includeTrailingSpace: boolean) => {
    if (scriptRanges.length === 0) {
      return examinerText;
    }

    return scriptRanges.map((sentence, index) => (
      <Text
        key={`${sentence.index}-${sentence.text}`}
        style={[
          styles.scriptSentence,
          activeSentenceIndex === index && styles.scriptSentenceActive,
        ]}
      >
        {sentence.text}
        {includeTrailingSpace && index < scriptRanges.length - 1 ? ' ' : ''}
      </Text>
    ));
  };

  if (compactScript) {
    return (
      <View style={styles.compactSection}>
        <View style={styles.avatarRow}>
          <ExaminerAvatar
            state={isSpeaking ? 'speaking' : 'idle'}
            size={140}
            isSpeaking={isSpeaking}
          />
        </View>
        <View style={styles.compactBubble}>
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
          <ScrollView
            contentContainerStyle={styles.scriptContent}
            nestedScrollEnabled
            onContentSizeChange={(_, height) => {
              scriptContentHeightRef.current = height;
            }}
            onLayout={(event) => {
              scriptViewportHeightRef.current = event.nativeEvent.layout.height;
            }}
            onMomentumScrollBegin={handleScriptMomentumScrollBegin}
            onScroll={handleScriptScroll}
            onScrollBeginDrag={handleScriptScrollBeginDrag}
            ref={scriptScrollRef}
            scrollEventThrottle={16}
            style={styles.scriptViewport}
          >
            <View>
              {scriptRanges.length > 0
                ? scriptRanges.map((sentence, index) => (
                    <View
                      key={`${sentence.index}-${sentence.text}`}
                      collapsable={false}
                      onLayout={(event) => {
                        const { height, y } = event.nativeEvent.layout;
                        scriptSentenceLayoutsRef.current[index] = { height, y };
                        if (index === activeSentenceIndex) {
                          scrollActiveSentenceIntoView(index);
                        }
                      }}
                      style={styles.scriptSentenceBlock}
                    >
                      <Text
                        style={[
                          styles.examinerText,
                          styles.scriptSentence,
                          activeSentenceIndex === index && styles.scriptSentenceActive,
                        ]}
                      >
                        {sentence.text}
                      </Text>
                    </View>
                  ))
                : <Text style={styles.examinerText}>{examinerText}</Text>}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

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
        <Text style={styles.examinerText}>{renderSentenceSegments(true)}</Text>
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
  compactBubble: {
    backgroundColor: '#F0F9FF',
    borderColor: '#B6E0FF',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    flexShrink: 1,
    gap: 10,
    maxHeight: 220,
    minHeight: 176,
    padding: 16,
  },
  compactSection: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    width: '100%',
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
  scriptSentence: {
    borderRadius: 6,
    color: '#1E293B',
  },
  scriptSentenceActive: {
    backgroundColor: '#DDF4FF',
    color: '#0F172A',
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
  scriptContent: {
    paddingBottom: 28,
    paddingRight: 6,
  },
  scriptSentenceBlock: {
    width: '100%',
  },
  scriptViewport: {
    flexGrow: 0,
    flexShrink: 1,
    height: 132,
  },
});
