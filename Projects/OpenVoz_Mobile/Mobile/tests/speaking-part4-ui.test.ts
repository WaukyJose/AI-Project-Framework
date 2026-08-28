// @ts-nocheck -- source-contract tests use Node.js built-ins excluded by tsconfig.

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');
const screenSource = read('screens/practice/b2-speaking-part-placeholder-screen.tsx');
const storeSource = read('store/speaking-store.ts');

test('linked Part 4 has its own Further discussion introduction and start action', () => {
  assert.match(screenSource, /'part-4': 'Further discussion'/);
  assert.match(
    screenSource,
    /Answer the examiner's questions about the topic from Part 3\. Give reasons and examples to develop your answers\./,
  );
  assert.match(screenSource, /!hasStartedTask && canStartPart4/);
  assert.match(screenSource, /Start Part 4/);
  assert.match(screenSource, /startSession\(sourcePart3SessionId\)/);
});

test('unlinked Part 4 explains the prerequisite and does not expose its start card', () => {
  assert.match(screenSource, /isPart4 && !hasStartedTask && !sourcePart3SessionId/);
  assert.match(screenSource, /Complete Part 3 first/);
  assert.match(screenSource, /Back to B2 Speaking/);
  assert.match(screenSource, /canStartPart4 = isPart4 && Boolean\(sourcePart3SessionId\)/);
});

test('active Part 4 renders the server examiner turn and existing answer area', () => {
  assert.match(screenSource, /hasStartedTask && examinerText/);
  assert.match(
    screenSource,
    /<ExaminerTurnBubble[\s\S]*examinerAudioUrl=\{examinerAudioUrl\}[\s\S]*examinerText=\{examinerText\}/,
  );
  assert.match(
    screenSource,
    /examinerPlaybackProgress=\{examinerPlaybackProgress\}/,
  );
  assert.match(screenSource, /<SpeakingAnswerArea/);
  assert.match(screenSource, /onStartRecording=\{startRecording\}/);
  assert.match(screenSource, /onUpload=\{uploadRecording\}/);
  assert.match(screenSource, /isPart4\s*\?\s*isPart4Complete/);
  assert.match(screenSource, /examinerPlaybackProgress=\{examinerPlaybackProgress\}/);
  assert.match(
    screenSource,
    /compactScript=\{isPart2 \|\| isPart3\}/,
  );
});

test('Part 4 exposes no question count or client progression control', () => {
  assert.doesNotMatch(screenSource, /Question \{?\w+\}? of \{?\w+\}?|Question 1 of 3/);
  assert.doesNotMatch(screenSource, /label="(?:Next|Next question|Continue speaking)"/);
  assert.doesNotMatch(screenSource, /part4QuestionId|part4QuestionIndex|part4SetId/);
});

test('canonical completion preserves closing turn, shows success, and hides answer controls', () => {
  assert.match(screenSource, /part4Complete && part4Phase === 'complete'/);
  assert.match(screenSource, /hasStartedTask && examinerText/);
  assert.match(screenSource, /part4CompletionTitle/);
  assert.match(screenSource, /t\.part4CompleteTitle/);
  assert.match(screenSource, /part4CompletionSubtitle/);
  assert.match(screenSource, /t\.part4CompleteText/);
  assert.match(screenSource, /isPart4Complete \? \(/);
  assert.match(screenSource, /Back to B2 Speaking/);
});

test('Part 4 completion exposes assessment request without manual session completion', () => {
  assert.doesNotMatch(screenSource, /Boolean\(session\?\.remoteSessionId\) &&\s*!isPart4/);
  assert.match(screenSource, /View Part 4 feedback/);
  assert.match(screenSource, /isPart4\s*\?\s*isPart4Complete/);
  assert.match(storeSource, /part4Complete === true && part4Phase === 'complete'/);
  const uploadBlock = storeSource.slice(
    storeSource.indexOf('async uploadRecording()'),
    storeSource.indexOf('// Internal helpers'),
  );
  assert.doesNotMatch(uploadBlock, /completeSession|getAssessment|requestEvaluation/);
});

test('Part 3 completion handoff remains canonical and isolated', () => {
  assert.match(screenSource, /isPart3Complete \? \(/);
  assert.match(screenSource, /label=\{t\.continueToPart4\}/);
  assert.match(screenSource, /source_part3_session_id: session\.remoteSessionId/);
  assert.doesNotMatch(
    screenSource,
    /params:\s*\{[^}]*(part3_scenario_id|part4_set_id|part4_question_id|part4_question_index)/s,
  );
});
