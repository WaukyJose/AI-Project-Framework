// @ts-nocheck -- source-contract tests use Node.js built-ins excluded by tsconfig.

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');
const screenSource = read('screens/practice/b2-speaking-part-placeholder-screen.tsx');
const storeSource = read('store/speaking-store.ts');

const part3CompletionBlock = screenSource.slice(
  screenSource.indexOf('{isPart3Complete ? ('),
  screenSource.indexOf('{isPart4Complete ? ('),
);

test('canonical Part 3 completion exposes feedback and Part 4 as independent actions', () => {
  assert.match(part3CompletionBlock, /View Part 3 feedback/);
  assert.match(part3CompletionBlock, /label="Continue to Part 4"/);
  assert.doesNotMatch(part3CompletionBlock, /assessment[\s\S]*Continue to Part 4/);
});

test('View Part 3 feedback invokes the existing evaluation action and loading state', () => {
  assert.match(part3CompletionBlock, /canRequestEvaluation \? \(/);
  assert.match(part3CompletionBlock, /onPress=\{requestEvaluation\}/);
  assert.match(part3CompletionBlock, /disabled=\{isEvaluating\}/);
  assert.match(part3CompletionBlock, /Requesting feedback…/);
  assert.match(storeSource, /async requestEvaluation\(\)/);
  assert.match(
    storeSource,
    /isPart3[\s\S]*part3Complete === true && part3Phase === 'complete'/,
  );
});

test('existing assessment state and results card remain the rendering path', () => {
  assert.match(screenSource, /const assessment = useSpeakingStore/);
  assert.match(
    screenSource,
    /\{assessment \? <AssessmentResultsCard assessment=\{assessment\} \/> : null\}/,
  );
  assert.doesNotMatch(screenSource, /part3Assessment|Part3AssessmentResults/);
});

test('Part 3 to Part 4 handoff remains independent and UUID-authoritative', () => {
  assert.match(part3CompletionBlock, /session\?\.remoteSessionId/);
  assert.match(part3CompletionBlock, /source_part3_session_id: session\.remoteSessionId/);
  assert.doesNotMatch(
    part3CompletionBlock,
    /params:\s*\{[^}]*(assessment|part3_scenario_id|part4_set_id|part4_question_id)/s,
  );
});

test('Part 4 assessment is available after canonical completion', () => {
  assert.doesNotMatch(screenSource, /Boolean\(session\?\.remoteSessionId\) &&\s*!isPart4/);
  assert.match(screenSource, /View Part 4 feedback/);
  assert.match(storeSource, /const isPart4 = partId === 'part-4'/);
  assert.match(storeSource, /part4Complete === true && part4Phase === 'complete'/);
});
