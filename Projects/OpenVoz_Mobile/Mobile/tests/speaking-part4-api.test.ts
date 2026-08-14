// @ts-nocheck -- source-contract tests use Node.js built-ins excluded by tsconfig.

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const apiSource = readFileSync(
  resolve(process.cwd(), 'services/api/speaking-api.ts'),
  'utf8',
);
const typeSource = readFileSync(resolve(process.cwd(), 'types/speaking.ts'), 'utf8');

test('Parts 1-3 retain the existing start payload and Part 4 may add only source linkage', () => {
  assert.match(apiSource, /part === 'part-4' && options\?\.sourcePart3SessionId/);
  assert.match(
    apiSource,
    /\? \{ part, source_part3_session_id: options\.sourcePart3SessionId \}\s*: \{ part \}/,
  );
  assert.doesNotMatch(
    apiSource,
    /body[^;]*(part3_scenario_id|part4_set_id|part4_question_id|part4_question_index|next_question)/,
  );
});

test('Part 4 uses the existing string part representation', () => {
  assert.match(apiSource, /part === 'part-4'/);
  assert.doesNotMatch(apiSource, /part === 4|part:\s*4/);
});

test('shared conversation state exposes the additive Part 4 contract', () => {
  assert.match(
    typeSource,
    /export type Part4Phase = 'not_started' \| 'awaiting_response' \| 'complete';/,
  );
  for (const field of [
    'part4_complete',
    'part4_phase',
    'source_part3_session_id',
    'part4_set_id',
    'part4_question_id',
    'part4_question_index',
    'part4_progression_pending',
  ]) {
    assert.match(typeSource, new RegExp(`${field}\\?`));
  }
});

test('A3 closing transport status and examiner turn remain shared contracts', () => {
  assert.match(typeSource, /turn_status:[^;]*'closing'/);
  assert.match(typeSource, /examiner_turn: ExaminerTurn;/);
});
