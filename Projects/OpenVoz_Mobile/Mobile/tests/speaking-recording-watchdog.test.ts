// @ts-nocheck — uses Node.js built-ins (node:assert, node:test);
// excluded from React Native tsconfig via "exclude": ["tests/**/*"]
//
// Mobile Reliability Layer Phase 2.1 — pure recording watchdog tests.
//
// Run:  npx tsx tests/speaking-recording-watchdog.test.ts

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  getRecordingWatchdogMessage,
  getRecordingWarningLevel,
} from '../services/speaking/recording-watchdog';

test('recording watchdog stays normal below threshold', () => {
  assert.strictEqual(getRecordingWarningLevel(0), 'normal');
  assert.strictEqual(getRecordingWarningLevel(44), 'normal');
});

test('recording watchdog escalates at long recording threshold', () => {
  assert.strictEqual(getRecordingWarningLevel(45), 'long_recording');
  assert.strictEqual(getRecordingWarningLevel(89), 'long_recording');
});

test('recording watchdog escalates at very long threshold', () => {
  assert.strictEqual(getRecordingWarningLevel(90), 'very_long_recording');
  assert.strictEqual(getRecordingWarningLevel(180), 'very_long_recording');
});

test('watchdog message is only shown when a warning level is active', () => {
  assert.strictEqual(getRecordingWatchdogMessage('normal', 10), null);
  assert.ok(getRecordingWatchdogMessage('long_recording', 45));
  assert.ok(getRecordingWatchdogMessage('very_long_recording', 90));
});
