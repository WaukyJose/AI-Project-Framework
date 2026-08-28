// @ts-nocheck — uses Node.js built-ins (node:assert, node:test);
// excluded from React Native tsconfig via "exclude": ["tests/**/*"]
//
// Examiner playback progress plumbing tests.
//
// Run:  npx tsx tests/speaking-examiner-progress.test.ts

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

import { normalizeExaminerPlaybackProgress } from '../services/speaking/examiner-playback-progress';

test('normalizes examiner playback progress into the 0..1 range', () => {
  assert.strictEqual(normalizeExaminerPlaybackProgress(0, 0), 0);
  assert.strictEqual(normalizeExaminerPlaybackProgress(0, 15), 0);
  assert.strictEqual(normalizeExaminerPlaybackProgress(7.5, 15), 0.5);
  assert.strictEqual(normalizeExaminerPlaybackProgress(15, 15), 1);
  assert.strictEqual(normalizeExaminerPlaybackProgress(30, 15), 1);
  assert.strictEqual(normalizeExaminerPlaybackProgress(-1, 15), 0);
});

test('speaking-recorder uses playbackStatusUpdate currentTime and duration for examiner progress', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'services/speaking/speaking-recorder.ts'),
    'utf8',
  );

  assert.match(source, /playbackStatusUpdate/);
  assert.match(source, /status\.currentTime/);
  assert.match(source, /status\.duration/);
  assert.match(source, /status\.didJustFinish\s*\?\s*1\s*:/);
  assert.match(source, /normalizeExaminerPlaybackProgress\(status\.currentTime, status\.duration\)/);
  assert.match(source, /subscribeExaminerPlaybackProgress/);
  assert.match(source, /notifyExaminerPlaybackProgress\(0\)/);
  assert.match(source, /if \(status\.didJustFinish \|\| status\.error\)/);
});

test('speaking-store exposes examinerPlaybackProgress and resets it during lifecycle transitions', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'store/speaking-store.ts'),
    'utf8',
  );

  assert.match(source, /examinerPlaybackProgress: number;/);
  assert.match(source, /examinerPlaybackProgress: 0/);
  assert.match(source, /subscribeExaminerPlaybackProgress\(/);
  assert.match(source, /useSpeakingStore\.setState\(\{ examinerPlaybackProgress: progress \}\)/);
  assert.match(source, /examinerPlaybackProgress: 0,[\s\S]*?isStartingSession: false/);
  assert.match(source, /examinerPlaybackProgress: 0,[\s\S]*?isRecording: true/);
  assert.match(source, /examinerPlaybackProgress: 0,[\s\S]*?isPlaying: false/);
});
