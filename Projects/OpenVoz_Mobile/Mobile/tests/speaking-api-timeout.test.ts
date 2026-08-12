// @ts-nocheck — uses Node.js built-ins and source inspection against TS files
//
// Run: npx tsx tests/speaking-api-timeout.test.ts

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

test('submitTurn passes timeoutMs = 60000 to apiClient.request', () => {
  const sourcePath = resolve(process.cwd(), 'services/api/speaking-api.ts');
  const source = readFileSync(sourcePath, 'utf8');

  const submitTurnBlock =
    /async submitTurn[\s\S]*?apiClient\.request<SubmitTurnResponse>\(sessionPath\(sessionId, 'turns\/'\), \{([\s\S]*?)\}\);/.exec(
      source,
    );

  assert.ok(submitTurnBlock, 'submitTurn request block should exist');
  assert.match(submitTurnBlock[1], /timeoutMs:\s*60000/, 'submitTurn should override timeout');
});
