// @ts-nocheck — uses Node.js built-ins (node:assert, node:test);
// excluded from React Native tsconfig via "exclude": ["tests/**/*"]
//
// Examiner script segmentation and progress mapping tests.
//
// Run:  npx tsx tests/speaking-examiner-script-progress.test.ts

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  buildExaminerScriptSentenceRanges,
  getActiveExaminerSentenceIndex,
  segmentExaminerText,
} from '../services/speaking/examiner-script-progress';

test('segmentExaminerText preserves English and Spanish sentence content', () => {
  const text = [
    'First, look at the task. Then discuss the options.',
    '',
    '¡Mira esto! ¿Qué opinas?',
  ].join('\n');

  assert.deepStrictEqual(segmentExaminerText(text), [
    'First, look at the task.',
    'Then discuss the options.',
    '¡Mira esto!',
    '¿Qué opinas?',
  ]);
});

test('buildExaminerScriptSentenceRanges uses word-count weighting', () => {
  const text = 'One two. Three four five six. Seven eight nine ten.';
  const ranges = buildExaminerScriptSentenceRanges(text);

  assert.deepStrictEqual(
    ranges.map(({ index, text: sentence, wordCount, startProgress, endProgress }) => ({
      endProgress,
      index,
      sentence,
      startProgress,
      wordCount,
    })),
    [
      {
        endProgress: 0.2,
        index: 0,
        sentence: 'One two.',
        startProgress: 0,
        wordCount: 2,
      },
      {
        endProgress: 0.6,
        index: 1,
        sentence: 'Three four five six.',
        startProgress: 0.2,
        wordCount: 4,
      },
      {
        endProgress: 1,
        index: 2,
        sentence: 'Seven eight nine ten.',
        startProgress: 0.6,
        wordCount: 4,
      },
    ],
  );
});

test('getActiveExaminerSentenceIndex maps progress boundaries safely', () => {
  const ranges = buildExaminerScriptSentenceRanges('One two. Three four five six. Seven eight nine ten.');

  assert.strictEqual(getActiveExaminerSentenceIndex(-0.25, ranges), 0);
  assert.strictEqual(getActiveExaminerSentenceIndex(0, ranges), 0);
  assert.strictEqual(getActiveExaminerSentenceIndex(0.199999, ranges), 0);
  assert.strictEqual(getActiveExaminerSentenceIndex(0.2, ranges), 1);
  assert.strictEqual(getActiveExaminerSentenceIndex(0.599999, ranges), 1);
  assert.strictEqual(getActiveExaminerSentenceIndex(0.6, ranges), 2);
  assert.strictEqual(getActiveExaminerSentenceIndex(1, ranges), 2);
  assert.strictEqual(getActiveExaminerSentenceIndex(1.5, ranges), 2);
});

test('empty or punctuation-only text is handled safely', () => {
  assert.deepStrictEqual(segmentExaminerText(''), []);
  assert.deepStrictEqual(segmentExaminerText('   \n\t  '), []);
  assert.strictEqual(getActiveExaminerSentenceIndex(0.5, []), -1);

  const ranges = buildExaminerScriptSentenceRanges('...');
  assert.deepStrictEqual(
    ranges.map(({ text, wordCount, startProgress, endProgress }) => ({
      endProgress,
      startProgress,
      text,
      wordCount,
    })),
    [
      {
        endProgress: 1,
        startProgress: 0,
        text: '...',
        wordCount: 0,
      },
    ],
  );
  assert.strictEqual(getActiveExaminerSentenceIndex(0.75, ranges), 0);
});
