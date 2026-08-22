// @ts-nocheck — uses Node.js built-ins (node:assert, node:test);
// excluded from React Native tsconfig via "exclude": ["tests/**/*"]
//
// Mobile Reliability Layer Phase 1 — pure lifecycle logic tests.
//
// Run:  npx tsx tests/speaking-lifecycle.test.ts

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  hasSpeakingActivity,
  normalizeAppLifecycleState,
  shouldFlagSpeakingInterruption,
} from '../services/speaking/speaking-lifecycle';

test('normalizeAppLifecycleState maps known values and defaults safely', () => {
  assert.strictEqual(normalizeAppLifecycleState('active'), 'active');
  assert.strictEqual(normalizeAppLifecycleState('background'), 'background');
  assert.strictEqual(normalizeAppLifecycleState('inactive'), 'inactive');
  assert.strictEqual(normalizeAppLifecycleState('something-else'), 'inactive');
  assert.strictEqual(normalizeAppLifecycleState(null), 'inactive');
});

test('hasSpeakingActivity detects active speaking work', () => {
  assert.strictEqual(
    hasSpeakingActivity({
      isCreatingSession: false,
      isEvaluating: false,
      isPlaying: false,
      isRecording: false,
      isStartingSession: false,
      isUploading: false,
      remoteSessionId: null,
    }),
    false,
  );

  assert.strictEqual(
    hasSpeakingActivity({
      isCreatingSession: false,
      isEvaluating: false,
      isPlaying: false,
      isRecording: true,
      isStartingSession: false,
      isUploading: false,
      remoteSessionId: null,
    }),
    true,
  );
});

test('shouldFlagSpeakingInterruption only flags leave-active transitions during speaking', () => {
  const activeSnapshot = {
    isCreatingSession: false,
    isEvaluating: false,
    isPlaying: false,
    isRecording: true,
    isStartingSession: false,
    isUploading: false,
    remoteSessionId: 'session-123',
  };

  assert.strictEqual(
    shouldFlagSpeakingInterruption('background', 'active', activeSnapshot),
    true,
  );
  assert.strictEqual(
    shouldFlagSpeakingInterruption('inactive', 'active', activeSnapshot),
    true,
  );
  assert.strictEqual(
    shouldFlagSpeakingInterruption('active', 'background', activeSnapshot),
    false,
  );
  assert.strictEqual(
    shouldFlagSpeakingInterruption('background', 'active', {
      ...activeSnapshot,
      isRecording: false,
      remoteSessionId: null,
    }),
    false,
  );
});
