// @ts-nocheck -- source-contract tests use Node.js built-ins excluded by tsconfig.

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');
const storeSource = read('store/speaking-store.ts');
const screenSource = read('screens/practice/b2-speaking-part-placeholder-screen.tsx');

const evaluationBlock = storeSource.slice(
  storeSource.indexOf('async requestEvaluation()'),
  storeSource.indexOf('resetError()'),
);

test('successful Part 4 completion requests assessment through the shared evaluation action', () => {
  assert.match(evaluationBlock, /const isPart4 = partId === 'part-4'/);
  assert.match(evaluationBlock, /part4Complete === true && part4Phase === 'complete'/);
  assert.match(evaluationBlock, /speakingApi\.completeSession/);
  assert.match(evaluationBlock, /speakingApi\.getAssessment/);
  assert.doesNotMatch(evaluationBlock, /Assessment is not available for Part 4 yet/);
});

test('Part 4 completion surfaces a feedback button rendered by the results card', () => {
  const part4Block = screenSource.slice(
    screenSource.indexOf('{isPart4Complete ? ('),
    screenSource.indexOf('{hasStartedTask && !isPart3Complete && !isPart4Complete ? ('),
  );
  assert.match(part4Block, /View Part 4 feedback/);
  assert.match(part4Block, /onPress=\{requestEvaluation\}/);
  assert.match(part4Block, /disabled=\{isEvaluating\}/);
  assert.match(
    screenSource,
    /\{assessment \? <AssessmentResultsCard assessment=\{assessment\} \/> : null\}/,
  );
});

test('Part 4 assessment remains guarded until all three questions complete', () => {
  assert.match(
    evaluationBlock,
    /Complete all three Part 4 questions before requesting evaluation\./,
  );
  assert.doesNotMatch(evaluationBlock, /Assessment is not available for Part 4 yet/);
});

test('Part 3 feedback access remains unchanged', () => {
  const part3Block = screenSource.slice(
    screenSource.indexOf('{isPart3Complete ? ('),
    screenSource.indexOf('{isPart4Complete ? ('),
  );
  assert.match(part3Block, /View Part 3 feedback/);
  assert.match(part3Block, /onPress=\{requestEvaluation\}/);
  assert.doesNotMatch(part3Block, /View Part 4 feedback/);
});
