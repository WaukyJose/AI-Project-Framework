import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(__dirname, '..');
const assetsDir = resolve(projectRoot, 'assets/images/part3-spanish');
const mappingFile = resolve(projectRoot, 'constants/part3-spanish-images.ts');

test('bundled Part 3 Spanish assets are present', () => {
  const files = readdirSync(assetsDir)
    .filter((file) => file.endsWith('_es.png'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  expect(files).toEqual([
    'Part3_Ex_1_es.png',
    'Part3_Ex_2_es.png',
    'Part3_Ex_3_es.png',
    'Part3_Ex_4_es.png',
    'Part3_Ex_5_es.png',
    'Part3_Ex_6_es.png',
    'Part3_Ex_7_es.png',
    'Part3_Ex_8_es.png',
    'Part3_Ex_9_es.png',
    'Part3_Ex_10_es.png',
  ]);
});

test('Part 3 Spanish mapping is keyed by canonical IDs 21-30', () => {
  const source = readFileSync(mappingFile, 'utf8');

  for (let id = 21; id <= 30; id += 1) {
    const expectedFile = `Part3_Ex_${id - 20}_es.png`;
    expect(source).toContain(
      `${id}: require('../assets/images/part3-spanish/${expectedFile}')`,
    );
  }
});
