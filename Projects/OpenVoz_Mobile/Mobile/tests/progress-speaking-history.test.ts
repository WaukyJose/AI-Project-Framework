// @ts-nocheck -- source-contract tests use Node.js built-ins excluded by tsconfig.

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const progressServiceSource = read('services/progress/progress-service.ts');
const progressScreenSource = read('screens/progress/progress-screen.tsx');

test('progress service maps speaking_history into normalized mobile history items', () => {
  assert.match(progressServiceSource, /speakingHistory:\s*\(payload\.speaking_history\s*\?\?/);
  assert.match(progressServiceSource, /sessionId:\s*item\.session_id/);
  assert.match(progressServiceSource, /speakingPart:\s*item\.speaking_part/);
  assert.match(progressServiceSource, /taskIdentity:\s*item\.task_identity\s*\?/);
  assert.match(progressServiceSource, /assessmentAvailable:\s*item\.assessment_available/);
  assert.match(progressServiceSource, /assessmentSummary:\s*item\.assessment_summary\s*\?/);
});

test('progress screen renders a consolidated speaking history section', () => {
  assert.match(progressScreenSource, /speakingHistoryLabels/);
  assert.match(progressScreenSource, /ProgressAccordionSection/);
  assert.match(progressScreenSource, /title=\{speakingHistoryText\.title\}/);
  assert.match(progressScreenSource, /buildSpeakingHistorySummary\(speakingHistory\)/);
  assert.match(progressScreenSource, /speakingHistory\.length\s*\?/);
});

test('progress screen keeps the summary visible and collapses detailed sections', () => {
  assert.match(progressScreenSource, /metricsPanel/);
  assert.match(progressScreenSource, /const \[isRecentExpanded, setIsRecentExpanded\] = useState\(true\);/);
  assert.match(progressScreenSource, /const \[isCriterionExpanded, setIsCriterionExpanded\] = useState\(false\);/);
  assert.match(progressScreenSource, /const \[isPartHistoryExpanded, setIsPartHistoryExpanded\] = useState\(false\);/);
  assert.match(progressScreenSource, /const \[isMilestonesExpanded, setIsMilestonesExpanded\] = useState\(false\);/);
  assert.match(progressScreenSource, /accessibilityState=\{\{ expanded \}\}/);
  assert.match(progressScreenSource, /accordionChevron/);
});

test('part 1 speaking labels prefer question text and then topic/question number', () => {
  assert.match(progressScreenSource, /questionText\.trim\(\)/);
  assert.match(progressScreenSource, /`\$\{taskIdentity\.topic\} · Q\$\{taskIdentity\.questionIndex \+ 1\}`/);
  assert.match(progressScreenSource, /taskIdentity\.topic\.trim\(\)/);
});

test('part 2 labels use photo identity and do not surface raw photo urls', () => {
  assert.match(progressScreenSource, /Photo task\s*\$\{taskIdentity\.photoId\}/);
  assert.match(progressScreenSource, /Tarea fotográfica\s*\$\{taskIdentity\.photoId\}/);
  assert.doesNotMatch(progressScreenSource, /photoUrl[^A-Za-z0-9_]/i);
});

test('part 3 and part 4 labels are human readable', () => {
  assert.match(progressScreenSource, /Scenario\s*\$\{taskIdentity\.scenarioId\}/);
  assert.match(progressScreenSource, /Discussion set\s*\$\{suffix\}/);
});

test('replay badge and assessment fallback text are present', () => {
  assert.match(progressScreenSource, /speakingHistoryText\.replay/);
  assert.match(progressScreenSource, /speakingHistoryText\.assessmentAvailable/);
});

test('missing optional speaking metadata is handled defensively', () => {
  assert.match(progressScreenSource, /if \(!taskIdentity\)/);
  assert.match(progressScreenSource, /if \(summary\.assessmentStatus\)/);
  assert.match(progressScreenSource, /if \(item\.isReplay\)/);
});

test('summary counts are derived from speaking history and cover parts 1-4', () => {
  assert.match(progressScreenSource, /for \(const item of history\)/);
  assert.match(progressScreenSource, /\[1, 2, 3, 4\]\.map\(\(part\)/);
  assert.match(progressScreenSource, /Part \$\{item\.part\} \$\{item\.count\} \$\{partSummaryLabel\}/);
});

test('existing progress functionality remains wired in', () => {
  assert.match(progressScreenSource, /recentAssessments/);
  assert.match(progressScreenSource, /part1History/);
  assert.match(progressScreenSource, /criterionProgress/);
  assert.match(progressScreenSource, /milestones/);
});
