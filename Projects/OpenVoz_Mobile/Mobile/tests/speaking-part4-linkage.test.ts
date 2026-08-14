// @ts-nocheck -- source-contract tests use Node.js built-ins excluded by tsconfig.

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');
const routeSource = read('app/(app)/practice/[part].tsx');
const screenSource = read('screens/practice/b2-speaking-part-placeholder-screen.tsx');
const storeSource = read('store/speaking-store.ts');

test('completed Part 3 navigation carries its authoritative remote session UUID only', () => {
  assert.match(screenSource, /source_part3_session_id: session\.remoteSessionId/);
  assert.match(screenSource, /label="Continue to Part 4"/);
  assert.doesNotMatch(
    screenSource,
    /params:\s*\{[^}]*(part3_scenario_id|part4_set_id|part4_question_id|part4_question_index)/s,
  );
});

test('Part 4 route reads and normalizes source_part3_session_id', () => {
  assert.match(routeSource, /part, source_part3_session_id/);
  assert.match(routeSource, /Array\.isArray\(source_part3_session_id\)/);
  assert.match(routeSource, /sourcePart3SessionId=\{sourcePart3SessionId\}/);
});

test('Part 4 start passes route linkage through the existing API contract', () => {
  assert.match(screenSource, /startSession\(sourcePart3SessionId\)/);
  assert.match(
    storeSource,
    /partId === 'part-4' \? \{ sourcePart3SessionId \} : undefined/,
  );
  assert.match(storeSource, /speakingApi\.startSession\(/);
});

test('direct Part 4 access without source linkage cannot create or start a session', () => {
  assert.match(storeSource, /partId === 'part-4' && !sourcePart3SessionId/);
  assert.match(storeSource, /Complete Part 3 before starting Part 4/);
  assert.match(screenSource, /Complete Part 3 first/);
});

test('Parts 1-3 retain the shared route and start behavior', () => {
  assert.match(screenSource, /isPart1 \|\| isPart2 \|\| isPart3/);
  assert.match(screenSource, /onPress=\{startSession\}/);
  assert.match(storeSource, /partId === 'part-4' \? \{ sourcePart3SessionId \} : undefined/);
});
