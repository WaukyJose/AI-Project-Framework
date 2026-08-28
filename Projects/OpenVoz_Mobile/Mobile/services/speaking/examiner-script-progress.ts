export interface ExaminerScriptSentenceRange {
  endProgress: number;
  index: number;
  startProgress: number;
  text: string;
  wordCount: number;
}

const SENTENCE_BOUNDARY_REGEX = /[.!?。！？…]+(?:["'”’)\]]+)?/g;
const WORD_REGEX = /[A-Za-z0-9À-ÖØ-öø-ÿ]+(?:['’\-][A-Za-z0-9À-ÖØ-öø-ÿ]+)*/g;
type IntlWithSegmenter = typeof Intl & {
  Segmenter?: new (
    locales?: string | string[],
    options?: { granularity: 'sentence' },
  ) => {
    segment: (input: string) => Iterable<{ segment: string }>;
  };
};

function normalizeProgress(value: number): number {
  return Math.min(1, Math.max(0, Number(value.toFixed(12))));
}

function splitParagraphIntoSentences(paragraph: string): string[] {
  const sentences: string[] = [];
  let cursor = 0;

  while (cursor < paragraph.length) {
    SENTENCE_BOUNDARY_REGEX.lastIndex = cursor;
    const match = SENTENCE_BOUNDARY_REGEX.exec(paragraph);

    if (!match) {
      const tail = paragraph.slice(cursor).trim();
      if (tail) {
        sentences.push(tail);
      }
      break;
    }

    let end = SENTENCE_BOUNDARY_REGEX.lastIndex;
    while (end < paragraph.length && /\s/.test(paragraph[end])) {
      end += 1;
    }

    const sentence = paragraph.slice(cursor, end).trim();
    if (sentence) {
      sentences.push(sentence);
    }

    cursor = end;
  }

  return sentences;
}

function countWords(text: string): number {
  const matches = text.match(WORD_REGEX);
  return matches ? matches.length : 0;
}

function splitWithIntlSegmenter(examinerText: string): string[] | null {
  const segmenterConstructor = (Intl as IntlWithSegmenter).Segmenter;

  if (typeof Intl === 'undefined' || typeof segmenterConstructor !== 'function') {
    return null;
  }

  try {
    const segmenter = new segmenterConstructor(undefined, { granularity: 'sentence' });
    const segments = Array.from(
      segmenter.segment(examinerText) as Iterable<{ segment: string }>,
      (part) => part.segment.trim(),
    ).filter(Boolean);
    return segments.length > 0 ? segments : [];
  } catch {
    return null;
  }
}

function splitExaminerTextFallback(examinerText: string): string[] {
  const normalized = examinerText.replace(/\r\n?/g, '\n').trim();

  if (!normalized) {
    return [];
  }

  const segments: string[] = [];
  const paragraphs = normalized.split(/\n\s*\n+/);

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) {
      continue;
    }

    segments.push(...splitParagraphIntoSentences(trimmedParagraph));
  }

  return segments;
}

export function segmentExaminerText(examinerText: string): string[] {
  const normalized = examinerText.replace(/\r\n?/g, '\n').trim();

  if (!normalized) {
    return [];
  }

  const intlSegments = splitWithIntlSegmenter(normalized);
  if (intlSegments) {
    return intlSegments;
  }

  return splitExaminerTextFallback(normalized);
}

export function buildExaminerScriptSentenceRanges(
  examinerText: string,
): ExaminerScriptSentenceRange[] {
  const sentences = segmentExaminerText(examinerText);

  if (sentences.length === 0) {
    return [];
  }

  const wordCounts = sentences.map((sentence) => countWords(sentence));
  const totalWords = wordCounts.reduce((total, count) => total + count, 0);
  const useUniformWeights = totalWords === 0;

  let startProgress = 0;

  return sentences.map((text, index) => {
    const wordCount = wordCounts[index];
    const weight = useUniformWeights ? 1 / sentences.length : wordCount / totalWords;
    const endProgress =
      index === sentences.length - 1 ? 1 : normalizeProgress(startProgress + weight);
    const range: ExaminerScriptSentenceRange = {
      endProgress: index === sentences.length - 1 ? 1 : endProgress,
      index,
      startProgress: normalizeProgress(startProgress),
      text,
      wordCount,
    };
    startProgress = range.endProgress;
    return range;
  });
}

export function getActiveExaminerSentenceIndex(
  examinerPlaybackProgress: number,
  ranges: ExaminerScriptSentenceRange[],
): number {
  if (ranges.length === 0) {
    return -1;
  }

  if (!Number.isFinite(examinerPlaybackProgress) || examinerPlaybackProgress <= 0) {
    return 0;
  }

  if (examinerPlaybackProgress >= 1) {
    return ranges.length - 1;
  }

  for (const range of ranges) {
    if (examinerPlaybackProgress < range.endProgress) {
      return range.index;
    }
  }

  return ranges.length - 1;
}
