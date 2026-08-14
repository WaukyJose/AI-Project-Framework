// @ts-nocheck -- source-contract tests use Node.js built-ins excluded by tsconfig.

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');
const storeSource = read('store/speaking-store.ts');
const screenSource = read('screens/practice/b2-speaking-part-placeholder-screen.tsx');

const startBlock = storeSource.slice(
  storeSource.indexOf('async startSession('),
  storeSource.indexOf('startTimer()'),
);
const uploadBlock = storeSource.slice(
  storeSource.indexOf('async uploadRecording()'),
  storeSource.indexOf('// Internal helpers'),
);
const uploadCatch = uploadBlock.slice(uploadBlock.lastIndexOf('} catch (error)'));

const part4Fields = [
  'part4Complete',
  'part4Phase',
  'part4ProgressionPending',
  'part4QuestionId',
  'part4QuestionIndex',
  'part4SetId',
  'sourcePart3SessionId',
];

test('Part 4 state is additive and initializePart resets every server-owned field', () => {
  for (const field of part4Fields) {
    assert.match(storeSource, new RegExp(`${field}:`));
  }

  assert.match(storeSource, /part4Complete: false/);
  assert.match(storeSource, /part4Phase: null/);
  assert.match(storeSource, /part4ProgressionPending: false/);
  assert.match(storeSource, /part4QuestionId: null/);
  assert.match(storeSource, /part4QuestionIndex: null/);
  assert.match(storeSource, /part4SetId: null/);
  assert.match(storeSource, /sourcePart3SessionId: null/);
});

test('Part 4 start stores canonical Q1, metadata, and uses existing examiner playback', () => {
  assert.match(startBlock, /examinerText: started\.examiner_turn\.text/);
  assert.match(startBlock, /examinerAudioUrl: started\.examiner_turn\.audio_url/);
  assert.match(startBlock, /part4_question_id \?\? null/);
  assert.match(startBlock, /part4_question_index \?\? null/);
  assert.match(startBlock, /part4_set_id \?\? null/);
  assert.match(startBlock, /source_part3_session_id \?\? null/);
  assert.match(startBlock, /part4_progression_pending \?\? false/);
  assert.match(startBlock, /speakingRecorder\.playExaminerAudio/);
});

test('each successful Part 4 submission stores only the server-returned next examiner turn', () => {
  assert.match(uploadBlock, /examinerText: result\.examiner_turn\.text/);
  assert.match(uploadBlock, /examinerAudioUrl: result\.examiner_turn\.audio_url/);
  assert.match(uploadBlock, /part4QuestionId:[\s\S]*result\.conversation_state\.part4_question_id/);
  assert.match(uploadBlock, /part4QuestionIndex:[\s\S]*result\.conversation_state\.part4_question_index/);
  assert.match(uploadBlock, /part4Phase:[\s\S]*result\.conversation_state\.part4_phase/);
  assert.match(uploadBlock, /speakingRecorder\.playExaminerAudio/);
  assert.doesNotMatch(uploadBlock, /part4QuestionIndex\s*[+][+]|part4QuestionIndex\s*[+]\s*1/);
  assert.doesNotMatch(uploadBlock, /nextPart4Question|selectPart4Question|calculatePart4/);
});

test('A3 closing is retained and completion is accepted only from canonical response state', () => {
  assert.match(uploadBlock, /examinerText: result\.examiner_turn\.text/);
  assert.match(uploadBlock, /part4Complete:[\s\S]*result\.conversation_state\.part4_complete/);
  assert.match(uploadBlock, /part4Phase:[\s\S]*result\.conversation_state\.part4_phase/);
  assert.match(screenSource, /part4Complete && part4Phase === 'complete'/);
  assert.doesNotMatch(storeSource, /current_question[^\n]*throw|!.*current_question/);
});

test('Part 4 completion blocks recording and submission and never invokes completion or assessment', () => {
  const completionGuard = /partId === 'part-4' && part4Complete && part4Phase === 'complete'/g;
  assert.ok((storeSource.match(completionGuard) ?? []).length >= 2);
  assert.match(screenSource, /!isPart4Complete/);
  assert.match(screenSource, /hasCompletedPart=\{isPart2Complete \|\| isPart3Complete \|\| isPart4Complete\}/);
  assert.match(storeSource, /if \(partId === 'part-4'\)[\s\S]*Assessment is not available for Part 4 yet/);
  assert.doesNotMatch(uploadBlock, /completeSession|getAssessment|requestEvaluation/);
});

test('successful submit clears the clip while failed submit preserves clip and Part 4 state', () => {
  assert.match(uploadBlock, /clip: null/);
  assert.doesNotMatch(uploadCatch, /clip:/);
  assert.doesNotMatch(
    uploadCatch,
    /part4Complete:|part4Phase:|part4QuestionId:|part4QuestionIndex:|part4SetId:/,
  );
  assert.doesNotMatch(uploadCatch, /retry|submitTurn\(/);
});

test('Part 4 uses one submit response per answer with no follow-up question request', () => {
  assert.equal((uploadBlock.match(/speakingApi\.submitTurn\(/g) ?? []).length, 1);
  assert.doesNotMatch(uploadBlock, /speakingApi\.(startSession|retrieveSession)\(/);
  assert.doesNotMatch(storeSource, /part4_question_index[^\n]*[+]\s*1/);
});
