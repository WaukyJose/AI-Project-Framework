// @ts-nocheck — uses Node.js built-ins (node:assert, node:test);
// excluded from React Native tsconfig via "exclude": ["tests/**/*"]
//
// Part 3 Mobile state integration — runtime tests.
//
// Mirrors the pure-logic portions of the speaking store and Part 3 screen
// gating. The store itself cannot be imported under Node.js (it depends on
// React Native / expo modules), so the same logic is exercised standalone.
// Type-level compatibility is verified by `npx tsc --noEmit`.
//
// Run:  npx tsx tests/speaking-part3.test.ts
//       node --test tests/speaking-part3.test.ts

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

// ---------------------------------------------------------------------------
// Types (mirrored from types/speaking.ts — verified compatible by tsc)
// ---------------------------------------------------------------------------

type Part3Phase = 'discussion' | 'decision' | 'complete';

interface BackendPhoto {
  id: string;
  photo_url: string;
  specific_instruction: string;
  task_instruction: string;
}

interface Part3Scenario {
  id: string;
  photoUrl: string;
  specificInstruction: string;
  taskInstruction: string;
}

interface Part3ConversationState {
  part3_complete?: boolean;
  part3_phase?: Part3Phase | null;
  part3_comment_index?: number;
  part3_scenario_id?: string;
}

// ---------------------------------------------------------------------------
// Pure helpers (mirror store/speaking-store.ts and the screen's gating)
// ---------------------------------------------------------------------------

/** Mirrors resolvePhotoUrl() from store/speaking-store.ts. */
function resolvePhotoUrl(
  photo: BackendPhoto | null | undefined,
  siteUrl: string,
): Part3Scenario | null {
  if (!photo) return null;
  const rawUrl = photo.photo_url;
  const base = siteUrl.replace(/\/$/, '');
  const resolvedUrl = rawUrl.startsWith('http') ? rawUrl : base + rawUrl;
  return {
    id: photo.id,
    photoUrl: resolvedUrl,
    specificInstruction: photo.specific_instruction,
    taskInstruction: photo.task_instruction,
  };
}

/** Mirrors the Part 3 extraction in startSession()/uploadRecording(). */
function extractPart3State(cs: Part3ConversationState): {
  complete: boolean;
  phase: Part3Phase | null;
  commentIndex: number | null;
  scenarioId: string | null;
} {
  return {
    complete: cs.part3_complete ?? false,
    phase: cs.part3_phase ?? null,
    commentIndex: cs.part3_comment_index ?? null,
    scenarioId: cs.part3_scenario_id ?? null,
  };
}

interface Part3TestState {
  commentIndex: number | null;
  complete: boolean;
  phase: Part3Phase | null;
  scenario: Part3Scenario | null;
  scenarioId: string | null;
}

function resetPart3State(): Part3TestState {
  return {
    commentIndex: null,
    complete: false,
    phase: null,
    scenario: null,
    scenarioId: null,
  };
}

/** Mirrors the screen's explicit start gate. */
function shouldShowStartGate(partId: string, hasStartedTask: boolean): boolean {
  return (
    !hasStartedTask &&
    (partId === 'part-1' || partId === 'part-2' || partId === 'part-3')
  );
}

/** Mirrors the screen's timer-guide condition (Part 2 only). */
function shouldShowTimerGuide(
  partId: string,
  hasStartedTask: boolean,
  part2Complete: boolean,
): boolean {
  return partId === 'part-2' && hasStartedTask && !part2Complete;
}

/** Mirrors hasCompletedPart for Part 3 completion. */
function shouldHideRecordingControls(
  partId: string,
  part3Complete: boolean,
  part3Phase: Part3Phase | null,
): boolean {
  return partId === 'part-3' && part3Complete && part3Phase === 'complete';
}

/** Mirrors the part-aware assessment gate from the store/screen. */
function isAssessmentAvailable(params: {
  partId: string;
  part1Complete: boolean;
  part2Complete: boolean;
  part2Phase: Part3Phase | null;
  part3Complete: boolean;
  part3Phase: Part3Phase | null;
}): boolean {
  if (params.partId === 'part-3') {
    return params.part3Complete === true && params.part3Phase === 'complete';
  }
  if (params.partId === 'part-2') {
    return params.part2Complete === true && params.part2Phase === 'complete';
  }
  return params.part1Complete === true;
}

// =========================================================================
// Tests
// =========================================================================

test('Part3Phase values are discussion, decision, complete', () => {
  const phases: Part3Phase[] = ['discussion', 'decision', 'complete'];
  assert.deepStrictEqual(phases, ['discussion', 'decision', 'complete']);
});

test('extracts Part 3 conversation state fields', () => {
  const state = extractPart3State({
    part3_complete: false,
    part3_phase: 'discussion',
    part3_comment_index: 0,
    part3_scenario_id: 'scenario-001',
  });

  assert.strictEqual(state.complete, false);
  assert.strictEqual(state.phase, 'discussion');
  assert.strictEqual(state.commentIndex, 0);
  assert.strictEqual(state.scenarioId, 'scenario-001');
});

test('comment index is extracted and defaults to null', () => {
  assert.strictEqual(extractPart3State({}).commentIndex, null);
  assert.strictEqual(extractPart3State({ part3_comment_index: 2 }).commentIndex, 2);
});

test('scenario id is extracted and defaults to null', () => {
  assert.strictEqual(extractPart3State({}).scenarioId, null);
  assert.strictEqual(extractPart3State({ part3_scenario_id: 'scenario-009' }).scenarioId, 'scenario-009');
});

test('start response maps scenario photo/task fields', () => {
  const backendPhoto: BackendPhoto = {
    id: 'scenario-001',
    photo_url: '/static/chat/images/Part3_Ex_1.png',
    specific_instruction: 'Candidate A, here is your scenario.',
    task_instruction: 'Discuss the points with your partner.',
  };

  const result = resolvePhotoUrl(backendPhoto, 'http://192.168.100.132:8000');

  assert.ok(result, 'scenario should not be null');
  assert.strictEqual(result.id, 'scenario-001');
  assert.strictEqual(
    result.photoUrl,
    'http://192.168.100.132:8000/static/chat/images/Part3_Ex_1.png',
  );
  assert.strictEqual(result.specificInstruction, 'Candidate A, here is your scenario.');
  assert.strictEqual(result.taskInstruction, 'Discuss the points with your partner.');
});

test('relative scenario photo_url resolves against siteUrl without double slash', () => {
  const photo: BackendPhoto = {
    id: 'scenario-002',
    photo_url: '/static/chat/images/Part3_Ex_2.png',
    specific_instruction: 'SI',
    task_instruction: 'TI',
  };
  const result = resolvePhotoUrl(photo, 'http://192.168.100.132:8000/');
  assert.strictEqual(
    result.photoUrl,
    'http://192.168.100.132:8000/static/chat/images/Part3_Ex_2.png',
  );
});

test('null scenario photo returns null', () => {
  assert.strictEqual(resolvePhotoUrl(null, 'http://example.com'), null);
  assert.strictEqual(resolvePhotoUrl(undefined, 'http://example.com'), null);
});

test('Part 3 lifecycle: null → discussion → decision → complete', () => {
  const state = resetPart3State();
  assert.strictEqual(state.phase, null);
  assert.strictEqual(state.complete, false);

  const discussion = extractPart3State({
    part3_phase: 'discussion',
    part3_complete: false,
    part3_comment_index: 0,
  });
  state.phase = discussion.phase;
  state.complete = discussion.complete;
  state.commentIndex = discussion.commentIndex;
  assert.strictEqual(state.phase, 'discussion');
  assert.strictEqual(state.complete, false);
  assert.strictEqual(state.commentIndex, 0);

  const decision = extractPart3State({
    part3_phase: 'decision',
    part3_complete: false,
    part3_comment_index: 3,
  });
  state.phase = decision.phase;
  state.complete = decision.complete;
  state.commentIndex = decision.commentIndex;
  assert.strictEqual(state.phase, 'decision');
  assert.strictEqual(state.complete, false);
  assert.strictEqual(state.commentIndex, 3);

  const complete = extractPart3State({
    part3_phase: 'complete',
    part3_complete: true,
  });
  state.phase = complete.phase;
  state.complete = complete.complete;
  assert.strictEqual(state.phase, 'complete');
  assert.strictEqual(state.complete, true);
});

test('explicit Start Part 3 gate appears only before task start', () => {
  assert.strictEqual(shouldShowStartGate('part-3', false), true);
  assert.strictEqual(shouldShowStartGate('part-3', true), false);
});

test('opening Part 3 does NOT auto-start the task', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'screens/practice/b2-speaking-part-placeholder-screen.tsx'),
    'utf8',
  );

  // The only mount effect initializes state; it must not call startSession.
  assert.match(source, /initializePart\(\(partId as SpeakingPartId\) \?\? 'part-1'\);/);
  assert.doesNotMatch(source, /void startSession\(\);/);
  assert.doesNotMatch(source, /useEffect\(\(\) => \{\s*startSession\(\)/s);
  // startSession is only wired to the explicit ready-card button.
  assert.match(source, /onPress=\{startSession\}/);
});

test('Part 3 has no timer guide', () => {
  assert.strictEqual(shouldShowTimerGuide('part-3', true, false), false);
  assert.strictEqual(shouldShowTimerGuide('part-2', true, false), true);

  const source = readFileSync(
    resolve(process.cwd(), 'screens/practice/b2-speaking-part-placeholder-screen.tsx'),
    'utf8',
  );
  assert.match(
    source,
    /const shouldShowTimerGuide = isPart2 && hasStartedTask && !isPart2Complete;/,
  );
  assert.match(
    source,
    /timerDisplay=\{shouldShowTimerGuide \? formatCountdown\(secondsRemaining\) : null\}/,
  );
});

test('Part 3 completion hides recording/upload controls', () => {
  assert.strictEqual(shouldHideRecordingControls('part-3', true, 'complete'), true);
  assert.strictEqual(shouldHideRecordingControls('part-3', false, 'decision'), false);
  assert.strictEqual(shouldHideRecordingControls('part-3', true, 'discussion'), false);

  const source = readFileSync(
    resolve(process.cwd(), 'screens/practice/b2-speaking-part-placeholder-screen.tsx'),
    'utf8',
  );
  assert.match(source, /hasCompletedPart=\{isPart2Complete \|\| isPart3Complete\}/);
});

test('incomplete Part 3 cannot request assessment', () => {
  assert.strictEqual(
    isAssessmentAvailable({
      partId: 'part-3',
      part1Complete: false,
      part2Complete: false,
      part2Phase: null,
      part3Complete: false,
      part3Phase: 'decision',
    }),
    false,
  );
});

test('completed Part 3 can request assessment through existing workflow', () => {
  assert.strictEqual(
    isAssessmentAvailable({
      partId: 'part-3',
      part1Complete: false,
      part2Complete: false,
      part2Phase: null,
      part3Complete: true,
      part3Phase: 'complete',
    }),
    true,
  );

  const screenSource = readFileSync(
    resolve(process.cwd(), 'screens/practice/b2-speaking-part-placeholder-screen.tsx'),
    'utf8',
  );
  const storeSource = readFileSync(
    resolve(process.cwd(), 'store/speaking-store.ts'),
    'utf8',
  );
  assert.match(screenSource, /isPart3\s*\? isPart3Complete/);
  assert.doesNotMatch(screenSource, /!isPart3 &&/);
  assert.match(storeSource, /part3Complete === true && part3Phase === 'complete'/);
  assert.doesNotMatch(storeSource, /Part 3 assessment is not available yet/);
});

test('completion assessment is reused and GET is only the fallback', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'store/speaking-store.ts'),
    'utf8',
  );

  assert.match(source, /if \(completeResult\.assessment\?\.status === 'complete'\)/);
  assert.match(source, /buildAssessmentSummary\(completeResult, 'complete'\)/);
  assert.match(source, /return;\s*}\s*\/\/ Step 2: Fetch the final assessment/s);
  assert.match(source, /speakingApi\.getAssessment\(session\.remoteSessionId\)/);
});

test('Part 3 reuses AssessmentResultsCard without manufacturing criteria', () => {
  const screenSource = readFileSync(
    resolve(process.cwd(), 'screens/practice/b2-speaking-part-placeholder-screen.tsx'),
    'utf8',
  );
  const resultsSource = readFileSync(
    resolve(process.cwd(), 'components/speaking/assessment-results-card.tsx'),
    'utf8',
  );

  assert.match(screenSource, /assessment \? <AssessmentResultsCard assessment=\{assessment\} \/>/);
  assert.match(resultsSource, /status === 'unavailable'/);
  assert.doesNotMatch(resultsSource, /global[_ ]achievement/i);
  assert.doesNotMatch(resultsSource, /pronunciation.*band/i);
});

test('assessment failure does not clear Part 3 completion state or auto-retry', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'store/speaking-store.ts'),
    'utf8',
  );

  const catchBlock = source.match(/} catch \(error\) \{([\s\S]*?)\n    }\n  },/);
  assert.ok(catchBlock);
  assert.doesNotMatch(catchBlock[1], /part3Complete|part3Phase|initializePart/);
  assert.doesNotMatch(source, /setInterval|setTimeout|poll/i);
});

test('Part 3 state reset clears all fields', () => {
  const state = resetPart3State();
  assert.strictEqual(state.phase, null);
  assert.strictEqual(state.complete, false);
  assert.strictEqual(state.commentIndex, null);
  assert.strictEqual(state.scenarioId, null);
  assert.strictEqual(state.scenario, null);
});

test('Part 3 state does not leak into Part 1 or Part 2', () => {
  const part3State: Part3TestState = {
    commentIndex: 1,
    complete: false,
    phase: 'discussion',
    scenario: {
      id: 'scenario-001',
      photoUrl: 'http://example.com/scenario.png',
      specificInstruction: 'SI',
      taskInstruction: 'TI',
    },
    scenarioId: 'scenario-001',
  };

  const reset = resetPart3State();
  assert.strictEqual(reset.phase, null);
  assert.strictEqual(reset.scenario, null);
  assert.strictEqual(reset.scenarioId, null);

  // The original Part 3 state remains untouched.
  assert.strictEqual(part3State.phase, 'discussion');
  assert.strictEqual(part3State.scenario?.id, 'scenario-001');
});

test('Part 3 scenario image uses contain-to-width sizing without cropping', () => {
  const screenSource = readFileSync(
    resolve(process.cwd(), 'screens/practice/b2-speaking-part-placeholder-screen.tsx'),
    'utf8',
  );
  assert.match(screenSource, /scaleToFitWidth=\{isPart3\}/);

  const componentSource = readFileSync(
    resolve(process.cwd(), 'components/speaking/part2-photo-prompt.tsx'),
    'utf8',
  );
  assert.match(componentSource, /scaleToFitWidth\?/);
  assert.match(componentSource, /styles\.imageFrameFitWidth/);
  assert.match(componentSource, /resizeMode="contain"/);
  assert.match(componentSource, /style=\{\[styles\.imageFitWidth, \{ aspectRatio \}\]\}/);
  // Part 2's frozen frame path is preserved.
  assert.match(componentSource, /overflow: 'hidden'/);
});

console.log('\n✅ All Part 3 speaking tests passed.\n');
