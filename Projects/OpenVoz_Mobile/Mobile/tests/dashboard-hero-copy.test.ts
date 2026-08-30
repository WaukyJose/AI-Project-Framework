import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function read(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('dashboard hero copy', () => {
  it('uses static practice-preview copy instead of live-session cues', () => {
    const source = read('screens/dashboard/dashboard-screen.tsx');

    expect(source).toContain("practicePreviewLabel: 'Speaking practice'");
    expect(source).toContain("practicePreviewSupport: 'Practise with an AI examiner'");
    expect(source).toContain("previewBadge: 'Preview'");
    expect(source).toContain("previewTimer: 'Illustrative preview'");
    expect(source).not.toContain('LIVE');
    expect(source).not.toContain('0:24');
  });

  it('keeps Spanish hero copy localized', () => {
    const source = read('screens/dashboard/dashboard-screen.tsx');

    expect(source).toContain("practicePreviewLabel: 'Práctica oral'");
    expect(source).toContain("practicePreviewSupport: 'Practica con un examinador de IA'");
    expect(source).toContain("previewBadge: 'Vista previa'");
    expect(source).toContain("previewTimer: 'Vista previa ilustrativa'");
  });
});
