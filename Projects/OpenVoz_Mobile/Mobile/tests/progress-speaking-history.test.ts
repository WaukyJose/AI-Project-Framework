// @ts-nocheck -- source-contract tests use Node.js built-ins excluded by tsconfig.

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const progressServiceSource = read('services/progress/progress-service.ts');
const progressScreenSource = read('screens/progress/progress-screen.tsx');
const progressHookSource = read('hooks/use-progress-data.ts');
const dashboardHookSource = read('hooks/use-dashboard-data.ts');
const dashboardScreenSource = read('screens/dashboard/dashboard-screen.tsx');
const continuumSource = read('components/progress/speaking-development-continuum.tsx');

test('Progress refetches its current language query when focus is regained without polling', () => {
  assert.match(progressHookSource, /useIsFocused/);
  assert.match(progressHookSource, /const wasFocused = useRef\(false\)/);
  assert.match(progressHookSource, /if \(wasFocused\.current\) \{\s*void query\.refetch\(\);/);
  assert.match(progressHookSource, /queryKey: queryKeys\.progress\(language\)/);
  assert.doesNotMatch(progressHookSource, /setInterval|refetchInterval/);
});

test('Dashboard uses the same focus refresh pattern without diagnostics', () => {
  assert.match(dashboardHookSource, /useIsFocused/);
  assert.match(dashboardHookSource, /const wasFocused = useRef\(false\)/);
  assert.match(dashboardHookSource, /if \(wasFocused\.current\) \{\s*void query\.refetch\(\);/);
  assert.match(dashboardHookSource, /queryKey: queryKeys\.dashboard\(language\)/);
  assert.doesNotMatch(dashboardHookSource, /dashboard_runtime_diagnostic/);
  assert.doesNotMatch(dashboardScreenSource, /dashboard_runtime_diagnostic/);
});

test('progress service maps speaking_history into normalized mobile history items', () => {
  assert.match(progressServiceSource, /speakingHistory:\s*\(payload\.speaking_history\s*\?\?/);
  assert.match(progressServiceSource, /sessionId:\s*item\.session_id/);
  assert.match(progressServiceSource, /speakingPart:\s*item\.speaking_part/);
  assert.match(progressServiceSource, /taskIdentity:\s*item\.task_identity\s*\?/);
  assert.match(progressServiceSource, /assessmentAvailable:\s*item\.assessment_available/);
  assert.match(progressServiceSource, /assessmentSummary:\s*item\.assessment_summary\s*\?/);
});

test('progress screen renders one recent activity section with the latest ten items', () => {
  assert.match(progressScreenSource, /speakingHistoryLabels/);
  assert.match(progressScreenSource, /ProgressAccordionSection/);
  assert.match(progressScreenSource, /recentSectionTitle: 'Recent activity'/);
  assert.match(progressScreenSource, /recentSectionTitle: 'Actividad reciente'/);
  assert.match(progressScreenSource, /const recentSpeakingHistory = speakingHistory\.slice\(0, 10\)/);
  assert.doesNotMatch(progressScreenSource, /Recent Activity \/ Speaking History/);
  assert.doesNotMatch(progressScreenSource, /title=\{speakingHistoryText\.title\}/);
});

test('progress screen keeps the summary visible and collapses detail sections', () => {
  assert.match(progressScreenSource, /metricsPanel/);
  assert.match(progressScreenSource, /const \[isRecentExpanded, setIsRecentExpanded\] = useState\(true\);/);
  assert.match(progressScreenSource, /const \[isAssessmentExpanded, setIsAssessmentExpanded\] = useState\(false\);/);
  assert.match(progressScreenSource, /const \[isCriterionExpanded, setIsCriterionExpanded\] = useState\(false\);/);
  assert.match(progressScreenSource, /const \[isPartHistoryExpanded, setIsPartHistoryExpanded\] = useState\(false\);/);
  assert.match(progressScreenSource, /const \[isMilestonesExpanded, setIsMilestonesExpanded\] = useState\(false\);/);
  assert.match(progressScreenSource, /accessibilityState=\{\{ expanded \}\}/);
  assert.match(progressScreenSource, /accordionChevron/);
});

test('progress screen removes static duplicate cards and gates empty detail sections', () => {
  assert.doesNotMatch(progressScreenSource, /ProgressCard/);
  assert.doesNotMatch(progressScreenSource, /Speaking Development/);
  assert.doesNotMatch(progressScreenSource, /Assessment Results/);
  assert.match(progressScreenSource, /emptyRecentActivity: 'Complete your first speaking session to see your activity here\.'/);
  assert.match(progressScreenSource, /emptyRecentActivity: 'Completa tu primera sesión oral para ver tu actividad aquí\.'/);
  assert.match(progressScreenSource, /data\.completedSessions === 0 && data\.assessedSessions === 0/);
  assert.match(progressScreenSource, /!isEmpty && hasAssessmentData/);
  assert.match(progressScreenSource, /!isEmpty && hasCriteriaData/);
  assert.match(progressScreenSource, /!isEmpty && hasPart1Data/);
  assert.match(progressScreenSource, /!isEmpty && hasSpeakingData/);
});

test('progress screen uses the simplified section labels', () => {
  assert.match(progressScreenSource, /assessmentSectionTitle: 'Assessment feedback'/);
  assert.match(progressScreenSource, /assessmentSectionTitle: 'Comentarios de evaluación'/);
  assert.match(progressScreenSource, /criterionSectionTitle: 'Criteria progress'/);
  assert.match(progressScreenSource, /criterionSectionTitle: 'Progreso por criterios'/);
  assert.match(progressScreenSource, /partHistorySectionTitle: 'Part 1 history'/);
  assert.match(progressScreenSource, /partHistorySectionTitle: 'Historial de la Parte 1'/);
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

test('recent activity keeps the existing part labels for the visible ten items', () => {
  assert.match(progressScreenSource, /recentSpeakingHistory\.map\(\(item\) =>/);
  assert.match(progressScreenSource, /title=\{`\$\{uiLanguage === 'es' \? 'Parte' : 'Part'\} \$\{item\.speakingPart\}`\}/);
  assert.match(progressScreenSource, /const recentSpeakingHistory = speakingHistory\.slice\(0, 10\)/);
});

test('Part 1 history displays the latest ten attempts without capping progress totals', () => {
  assert.match(progressScreenSource, /const recentPart1History = \(data\?\.part1History \?\? \[\]\)\.slice\(0, 10\)/);
  assert.match(progressScreenSource, /recentPart1History\.map\(\(attempt\) =>/);
  assert.match(progressScreenSource, /\{data\?\.completedSessions \?\? 0\}/);
});

test('existing progress functionality remains wired in', () => {
  assert.match(progressScreenSource, /recentAssessments/);
  assert.match(progressScreenSource, /part1History/);
  assert.match(progressScreenSource, /criterionProgress/);
  assert.match(progressScreenSource, /milestones/);
});

test('speaking development continuum uses recent sessions without changing progress totals', () => {
  assert.match(progressScreenSource, /SpeakingDevelopmentContinuum language=\{uiLanguage\} sessions=\{recentSpeakingHistory\}/);
  assert.match(continuumSource, /if \(!sessions\.length\)/);
  assert.match(continuumSource, /sessions\.slice\(0, 10\)\.reverse\(\)/);
  assert.match(continuumSource, /assessmentSummary\?\.scoreSummary/);
  assert.match(continuumSource, /typeof score !== 'number'/);
  assert.match(continuumSource, /typeof maximum !== 'number'/);
  assert.match(continuumSource, /unassessedMarker/);
  assert.match(continuumSource, /assessedMarker/);
});

test('speaking development continuum preserves low-data and bilingual accessibility copy', () => {
  assert.match(continuumSource, /title: 'Speaking development'/);
  assert.match(continuumSource, /title: 'Desarrollo oral'/);
  assert.match(continuumSource, /Your development will appear as you practise\./);
  assert.match(continuumSource, /Tu desarrollo aparecerá a medida que practiques\./);
  assert.match(continuumSource, /accessibilityLabel=\{accessibilityLabel\}/);
});

test('single-session continuum uses a starting marker and a decorative baseline', () => {
  assert.match(continuumSource, /styles\.singleSessionLine/);
  assert.match(continuumSource, /styles\.singleSessionSlot/);
  assert.match(continuumSource, /visibleSessions\.length === 1\s*\n\s*\? \(TRACK_HEIGHT - MARKER_SIZE\) \/ 2/);
  assert.match(continuumSource, /singleSessionLine: \{/);
  assert.match(continuumSource, /singleSessionSlot: \{/);
  assert.match(continuumSource, /right: '45%'/);
  assert.match(continuumSource, /width: '55%'/);
});

test('continuum hierarchy uses a light track and subtle newest-marker emphasis', () => {
  assert.match(continuumSource, /backgroundColor: '#D9E2EC'/);
  assert.match(continuumSource, /borderColor: '#486581'/);
  assert.match(continuumSource, /backgroundColor: '#0F4C5C'/);
  assert.match(continuumSource, /height: MARKER_SIZE \+ 1\.5/);
  assert.match(continuumSource, /width: MARKER_SIZE \+ 1\.5/);
});
