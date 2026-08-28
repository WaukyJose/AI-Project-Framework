// @ts-nocheck -- source-contract tests use Node.js built-ins excluded by tsconfig.

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');
const screenSource = read('screens/practice/b2-speaking-part-placeholder-screen.tsx');
const componentSource = read('components/speaking/examiner-turn-bubble.tsx');

test('Part 1 uses the shared examiner bubble sentence highlighting without changing layout', () => {
  assert.match(screenSource, /Start Part 1/);
  assert.match(screenSource, /hasStartedTask && examinerText/);
  assert.match(
    screenSource,
    /<ExaminerTurnBubble[\s\S]*examinerAudioUrl=\{examinerAudioUrl\}[\s\S]*examinerText=\{examinerText\}/,
  );
  assert.match(
    screenSource,
    /examinerPlaybackProgress=\{examinerPlaybackProgress\}/,
  );
  assert.match(componentSource, /const shouldHighlightActiveSentence = isSpeaking \|\| examinerPlaybackProgress >= 1;/);
  assert.match(componentSource, /renderSentenceSegments\(true\)/);
  assert.match(componentSource, /styles\.scriptSentenceActive/);
  assert.doesNotMatch(componentSource, /requestAnimationFrame/);
});
