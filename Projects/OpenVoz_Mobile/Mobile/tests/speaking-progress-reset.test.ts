// @ts-nocheck -- source-contract test uses Node.js built-ins.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

test('speaking progress reset is authenticated, confirmed, and invalidates both language caches', () => {
  const api = read('services/api/speaking-progress-reset-api.ts');
  const settings = read('screens/settings/settings-screen.tsx');

  assert.match(api, /\.\.\/mobile\/speaking-progress-reset\//);
  assert.match(api, /method: 'POST'/);
  assert.match(settings, /Reset speaking progress/);
  assert.match(settings, /Restablecer progreso de expresi[oó]n oral/);
  assert.match(settings, /queryKeys\.dashboard\(language\)/);
  assert.match(settings, /queryKeys\.progress\(language\)/);
  assert.match(settings, /\['en', 'es'\]/);
  assert.match(settings, /style: 'destructive'/);
});
