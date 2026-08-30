import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function read(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('assessment status label usage', () => {
  it('Home uses the shared assessment status label helper', () => {
    const source = read('screens/dashboard/dashboard-screen.tsx');

    expect(source).toContain('formatAssessmentStatusLabel');
    expect(source).toContain('buildRecentSessionRows(recentActivity, uiLanguage)');
    expect(source).not.toContain("replaceAll('_', ' ')");
  });

  it('Progress uses the shared assessment status label helper', () => {
    const source = read('screens/progress/progress-screen.tsx');

    expect(source).toContain('formatAssessmentStatusLabel');
    expect(source).toContain('formatSpeakingAssessmentSummary(item.assessmentSummary, uiLanguage)');
    expect(source).not.toContain("replaceAll('_', ' ')");
  });
});
