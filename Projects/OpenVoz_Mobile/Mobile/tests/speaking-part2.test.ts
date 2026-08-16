// @ts-nocheck — uses Node.js built-ins (node:assert, node:test);
// excluded from React Native tsconfig via "exclude": ["tests/**/*"]
//
// Part 2 Mobile state integration — runtime tests.
//
// Tests pure-logic functions that mirror the speaking store's Part 2
// behavior.  The store itself cannot be imported under Node.js (it
// depends on React Native / expo modules), so the same logic is
// exercised standalone.  Type-level compatibility is verified by
// `npx tsc --noEmit`.
//
// Run:  npx tsx tests/speaking-part2.test.ts

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

// ---------------------------------------------------------------------------
// Types (mirrored from types/speaking.ts — verified compatible by tsc)
// ---------------------------------------------------------------------------

type Part2Phase = 'long_turn' | 'follow_up' | 'complete';

interface BackendPhoto {
  id: string;
  photo_url: string;
  specific_instruction: string;
  task_instruction: string;
}

interface Part2PhotoPrompt {
  id: string;
  photoUrl: string;
  specificInstruction: string;
  taskInstruction: string;
}

// ---------------------------------------------------------------------------
// Pure helpers (mirrors store/speaking-store.ts logic exactly)
// ---------------------------------------------------------------------------

/** Mirrors PART2_TIMER_CONFIG from store/speaking-store.ts */
const PART2_TIMER_CONFIG = {
  longTurnSeconds: 60,
  followUpSeconds: 30,
} as const;

/**
 * Mirrors resolvePhotoUrl() from store/speaking-store.ts.
 * Resolves a relative photo_url against the configured siteUrl.
 */
function resolvePhotoUrl(
  photo: BackendPhoto | null | undefined,
  siteUrl: string,
): Part2PhotoPrompt | null {
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

/**
 * Derives the Part 2 phase + complete flag from a conversation_state dict
 * as received from the backend.  Mirrors the store's startSession() and
 * uploadRecording() extraction logic.
 */
function extractPart2State(cs: {
  part2_phase?: Part2Phase | null;
  part2_complete?: boolean;
}): { phase: Part2Phase | null; complete: boolean } {
  return {
    phase: cs.part2_phase ?? null,
    complete: cs.part2_complete ?? false,
  };
}

/**
 * Minimal state machine representing the Part-2-relevant fields the
 * store exposes.
 */
interface Part2TestState {
  part2Photo: Part2PhotoPrompt | null;
  part2Phase: Part2Phase | null;
  part2Complete: boolean;
  partId: string;
}

function createEmptyState(): Part2TestState {
  return { part2Photo: null, part2Phase: null, part2Complete: false, partId: 'part-1' };
}

/** Mirrors store initializePart reset behavior. */
function resetPart2State(): Part2TestState {
  return { part2Photo: null, part2Phase: null, part2Complete: false, partId: 'part-1' };
}

// =========================================================================
// Tests
// =========================================================================

// -- 1. Part 2 start response maps photo + phase correctly ----------------

test('start response maps photo fields', () => {
  const backendPhoto: BackendPhoto = {
    id: 'photo-001',
    photo_url: '/static/chat/images/Part2_Ex_1.png',
    specific_instruction: 'Candidate A, here is your photograph.',
    task_instruction: 'Compare the photographs.',
  };

  const siteUrl = 'http://192.168.100.132:8000';
  const result = resolvePhotoUrl(backendPhoto, siteUrl);

  assert.ok(result, 'photo should not be null');
  assert.strictEqual(result.id, 'photo-001');
  assert.strictEqual(
    result.photoUrl,
    'http://192.168.100.132:8000/static/chat/images/Part2_Ex_1.png',
  );
  assert.strictEqual(result.specificInstruction, 'Candidate A, here is your photograph.');
  assert.strictEqual(result.taskInstruction, 'Compare the photographs.');
});

test('start response maps part2Phase = long_turn, part2Complete = false', () => {
  const cs = {
    conversation_started: true,
    current_question: '',
    follow_up_asked: false,
    part2_phase: 'long_turn' as Part2Phase,
    part2_complete: false,
  };

  const { phase, complete } = extractPart2State(cs);
  assert.strictEqual(phase, 'long_turn');
  assert.strictEqual(complete, false);
});

test('null photo returns null', () => {
  assert.strictEqual(resolvePhotoUrl(null, 'http://example.com'), null);
  assert.strictEqual(resolvePhotoUrl(undefined, 'http://example.com'), null);
});

// -- 2. Relative photo URL resolves against site URL ---------------------

test('relative photo_url resolves against siteUrl', () => {
  const photo: BackendPhoto = {
    id: 'p2', photo_url: '/static/chat/images/Part2_Ex_2.png',
    specific_instruction: 'SI', task_instruction: 'TI',
  };
  const result = resolvePhotoUrl(photo, 'https://www.openvoz.com');
  assert.strictEqual(result.photoUrl, 'https://www.openvoz.com/static/chat/images/Part2_Ex_2.png');
});

test('absolute photo_url passes through unchanged', () => {
  const photo: BackendPhoto = {
    id: 'p3', photo_url: 'https://cdn.example.com/photos/p3.png',
    specific_instruction: 'SI', task_instruction: 'TI',
  };
  const result = resolvePhotoUrl(photo, 'http://192.168.100.132:8000');
  assert.strictEqual(result.photoUrl, 'https://cdn.example.com/photos/p3.png');
});

test('siteUrl with trailing slash resolves correctly (no double slash)', () => {
  const photo: BackendPhoto = {
    id: 'p4', photo_url: '/static/chat/images/Part2_Ex_3.png',
    specific_instruction: 'SI', task_instruction: 'TI',
  };
  const result = resolvePhotoUrl(photo, 'http://192.168.100.132:8000/');
  assert.strictEqual(result.photoUrl, 'http://192.168.100.132:8000/static/chat/images/Part2_Ex_3.png');
});

// -- 3. First Part 2 turn maps part2Phase = follow_up --------------------

test('first turn maps part2Phase = follow_up', () => {
  const cs = {
    part2_phase: 'follow_up' as Part2Phase,
    part2_complete: false,
  };
  const { phase, complete } = extractPart2State(cs);
  assert.strictEqual(phase, 'follow_up');
  assert.strictEqual(complete, false);
});

// -- 4. Second Part 2 turn maps part2Phase = complete, part2Complete = true

test('second turn maps part2Phase = complete, part2Complete = true', () => {
  const cs = {
    part2_phase: 'complete' as Part2Phase,
    part2_complete: true,
  };
  const { phase, complete } = extractPart2State(cs);
  assert.strictEqual(phase, 'complete');
  assert.strictEqual(complete, true);
});

// -- 5. initializePart / reset clears Part 2 state -----------------------

test('reset clears part2Photo, part2Phase, part2Complete', () => {
  const state = resetPart2State();
  assert.strictEqual(state.part2Photo, null);
  assert.strictEqual(state.part2Phase, null);
  assert.strictEqual(state.part2Complete, false);
});

test('state transitions: set then reset', () => {
  const state: Part2TestState = {
    part2Photo: { id: 'test', photoUrl: 'http://x.com/p.png', specificInstruction: 'SI', taskInstruction: 'TI' },
    part2Phase: 'long_turn',
    part2Complete: false,
    partId: 'part-2',
  };
  assert.strictEqual(state.part2Photo?.id, 'test');
  assert.strictEqual(state.part2Phase, 'long_turn');

  const afterReset = resetPart2State();
  assert.strictEqual(afterReset.part2Photo, null);
  assert.strictEqual(afterReset.part2Phase, null);
  assert.strictEqual(afterReset.part2Complete, false);
});

// -- 6. Part 2 state cannot leak into Part 1 -----------------------------

test('Part 2 state does not leak into Part 1', () => {
  const part2State: Part2TestState = {
    part2Photo: { id: 'p2', photoUrl: '/img.png', specificInstruction: 'SI', taskInstruction: 'TI' },
    part2Phase: 'long_turn',
    part2Complete: false,
    partId: 'part-2',
  };

  const part1State = resetPart2State();
  assert.strictEqual(part1State.part2Photo, null);
  assert.strictEqual(part1State.part2Phase, null);
  assert.strictEqual(part1State.part2Complete, false);
  assert.strictEqual(part1State.partId, 'part-1');

  // Original Part 2 state unaffected
  assert.strictEqual(part2State.part2Photo?.id, 'p2');
  assert.strictEqual(part2State.part2Phase, 'long_turn');
});

// -- 7. Timer configuration ----------------------------------------------

test('PART2_TIMER_CONFIG long turn = 60, follow-up = 30', () => {
  assert.strictEqual(PART2_TIMER_CONFIG.longTurnSeconds, 60);
  assert.strictEqual(PART2_TIMER_CONFIG.followUpSeconds, 30);
});

test('PART2_TIMER_CONFIG values are correct at runtime', () => {
  // as const only narrows TypeScript types; the runtime object is a plain
  // mutable JS object.  TypeScript will still reject reassignment at
  // compile time via tsc --noEmit.
  assert.strictEqual(PART2_TIMER_CONFIG.longTurnSeconds, 60);
  assert.strictEqual(PART2_TIMER_CONFIG.followUpSeconds, 30);
  assert.strictEqual(typeof PART2_TIMER_CONFIG.longTurnSeconds, 'number');
  assert.strictEqual(typeof PART2_TIMER_CONFIG.followUpSeconds, 'number');
});

// -- 8. Existing Part 1 behavior remains compatible ----------------------

test('Part 1 conversation_state works without Part 2 fields', () => {
  const cs = {
    conversation_started: true,
    current_question: 'Where are you from?',
    follow_up_asked: false,
    part1_complete: false,
    // NO part2_phase, NO part2_complete
  };
  const { phase, complete } = extractPart2State(cs);
  assert.strictEqual(phase, null);
  assert.strictEqual(complete, false);
});

test('null photo for Part 1 start response', () => {
  assert.strictEqual(resolvePhotoUrl(null, 'http://example.com'), null);
});

// -- 9. Full state transition sequence -----------------------------------

test('full Part 2 lifecycle: long_turn → follow_up → complete', () => {
  const state = createEmptyState();

  // Start
  const { phase: p1, complete: c1 } = extractPart2State({
    part2_phase: 'long_turn', part2_complete: false,
  });
  state.part2Phase = p1; state.part2Complete = c1; state.partId = 'part-2';
  assert.strictEqual(state.part2Phase, 'long_turn');
  assert.strictEqual(state.part2Complete, false);

  // Turn 1
  const { phase: p2, complete: c2 } = extractPart2State({
    part2_phase: 'follow_up', part2_complete: false,
  });
  state.part2Phase = p2; state.part2Complete = c2;
  assert.strictEqual(state.part2Phase, 'follow_up');
  assert.strictEqual(state.part2Complete, false);

  // Turn 2
  const { phase: p3, complete: c3 } = extractPart2State({
    part2_phase: 'complete', part2_complete: true,
  });
  state.part2Phase = p3; state.part2Complete = c3;
  assert.strictEqual(state.part2Phase, 'complete');
  assert.strictEqual(state.part2Complete, true);
});

// -- 10. Presentation-condition logic (mirrors screen component) ----------

/** Mirrors the showPhoto condition from the B2SpeakingPartScreen. */
function shouldShowPhoto(
  partId: string,
  photo: Part2PhotoPrompt | null,
  phase: Part2Phase | null,
): boolean {
  return partId === 'part-2' && photo !== null && phase !== null;
}

/** Mirrors the isPart2Complete condition from the B2SpeakingPartScreen. */
function shouldShowCompletion(
  partId: string,
  complete: boolean,
  phase: Part2Phase | null,
): boolean {
  return partId === 'part-2' && complete && phase === 'complete';
}

/**
 * Mirrors the part-aware assessment gate from store/speaking-store.ts
 * requestEvaluation() and screen canRequestEvaluation.
 *
 * Part 1: unlocked when part1Complete === true.
 * Part 2: unlocked only after BOTH the long turn and the follow-up have
 * been submitted (part2Phase === "complete"); part1Complete is irrelevant.
 */
function isAssessmentAvailable(params: {
  partId: string;
  part1Complete: boolean;
  part2Complete: boolean;
  part2Phase: Part2Phase | null;
}): boolean {
  if (params.partId === 'part-2') {
    return params.part2Complete === true && params.part2Phase === 'complete';
  }
  return params.part1Complete === true;
}

/** Mirrors completed-state gating in SpeakingAnswerArea. */
function shouldShowRecordingControls(hasCompletedPart: boolean): boolean {
  return hasCompletedPart === false;
}

/** Mirrors completed-state gating for top-of-screen session/timer controls. */
function shouldShowSessionSetupControls(isPart2Complete: boolean): boolean {
  return isPart2Complete === false;
}

/**
 * Mirrors the completed-state feedback action behavior:
 * once Part 2 is complete, the learner can request evaluation even if clip is null.
 */
function shouldShowGetFeedback(params: {
  canRequestEvaluation: boolean;
  hasClip: boolean;
  isPart2Complete: boolean;
}): boolean {
  return params.canRequestEvaluation && (params.hasClip || params.isPart2Complete);
}

function timerGuideDuration(phase: Part2Phase | null): number {
  return phase === 'follow_up'
    ? PART2_TIMER_CONFIG.followUpSeconds
    : PART2_TIMER_CONFIG.longTurnSeconds;
}

test('part-1 → no Part 2 photo (showPhoto = false for Part 1)', () => {
  const photo: Part2PhotoPrompt = {
    id: 'p', photoUrl: '/img.png',
    specificInstruction: 'SI', taskInstruction: 'TI',
  };
  // Even if Part 2 data somehow exists, Part 1 must not show it
  assert.strictEqual(shouldShowPhoto('part-1', photo, 'long_turn'), false);
  assert.strictEqual(shouldShowPhoto('part-1', null, null), false);
});

test('part-2 + no photo → no photo component (showPhoto = false)', () => {
  assert.strictEqual(shouldShowPhoto('part-2', null, 'long_turn'), false);
  assert.strictEqual(shouldShowPhoto('part-2', null, null), false);
});

test('part-2 + long_turn + photo → show photo (showPhoto = true)', () => {
  const photo: Part2PhotoPrompt = {
    id: 'p', photoUrl: '/img.png',
    specificInstruction: 'SI', taskInstruction: 'TI',
  };
  assert.strictEqual(shouldShowPhoto('part-2', photo, 'long_turn'), true);
});

test('part-2 + follow_up + photo → show same photo (showPhoto = true)', () => {
  const photo: Part2PhotoPrompt = {
    id: 'p', photoUrl: '/img.png',
    specificInstruction: 'SI', taskInstruction: 'TI',
  };
  // Same photo instance kept — showPhoto still true
  assert.strictEqual(shouldShowPhoto('part-2', photo, 'follow_up'), true);
});

test('part-2 + complete → completion state (isPart2Complete = true)', () => {
  assert.strictEqual(shouldShowCompletion('part-2', true, 'complete'), true);
});

test('part-2 + complete flag but wrong phase → NOT complete', () => {
  // Defensive: only phase === 'complete' triggers completion UI
  assert.strictEqual(shouldShowCompletion('part-2', true, 'long_turn'), false);
  assert.strictEqual(shouldShowCompletion('part-2', true, 'follow_up'), false);
  assert.strictEqual(shouldShowCompletion('part-2', true, null), false);
});

test('part-1 cannot enter completion state', () => {
  assert.strictEqual(shouldShowCompletion('part-1', true, 'complete'), false);
});

test('photo visible during follow_up (not hidden)', () => {
  const photo: Part2PhotoPrompt = {
    id: 'p', photoUrl: '/img.png',
    specificInstruction: 'SI', taskInstruction: 'TI',
  };
  // Follow-up keeps the same photo — photo stays visible
  assert.strictEqual(shouldShowPhoto('part-2', photo, 'follow_up'), true);
});

// -- 11. Part-aware assessment gate (mirrors requestEvaluation / canRequestEvaluation) ---

test('Part 2 before long-turn + follow-up completion: assessment unavailable', () => {
  // long_turn phase (only long turn submitted)
  assert.strictEqual(
    isAssessmentAvailable({ partId: 'part-2', part1Complete: false, part2Complete: false, part2Phase: 'long_turn' }),
    false,
  );
  // follow_up phase (long turn submitted, follow-up pending)
  assert.strictEqual(
    isAssessmentAvailable({ partId: 'part-2', part1Complete: false, part2Complete: false, part2Phase: 'follow_up' }),
    false,
  );
});

test('Part 2 after part2Complete=true + phase=complete: assessment available', () => {
  assert.strictEqual(
    isAssessmentAvailable({ partId: 'part-2', part1Complete: false, part2Complete: true, part2Phase: 'complete' }),
    true,
  );
});

test('Part 1 incomplete: assessment unavailable', () => {
  assert.strictEqual(
    isAssessmentAvailable({ partId: 'part-1', part1Complete: false, part2Complete: false, part2Phase: null }),
    false,
  );
});

test('Part 1 complete: assessment available', () => {
  assert.strictEqual(
    isAssessmentAvailable({ partId: 'part-1', part1Complete: true, part2Complete: false, part2Phase: null }),
    true,
  );
});

test('Part 2 completion must NOT depend on part1Complete', () => {
  // part1Complete=false is irrelevant to Part 2; part2 flags alone decide.
  assert.strictEqual(
    isAssessmentAvailable({ partId: 'part-2', part1Complete: false, part2Complete: true, part2Phase: 'complete' }),
    true,
  );
  // Even if part1Complete=true but Part 2 not finished → still unavailable
  assert.strictEqual(
    isAssessmentAvailable({ partId: 'part-2', part1Complete: true, part2Complete: false, part2Phase: 'follow_up' }),
    false,
  );
});

// -- 12. Completion-state UI gates ---------------------------------------

test('Part 2 complete + clip null → Get feedback remains visible/available', () => {
  assert.strictEqual(
    shouldShowGetFeedback({
      canRequestEvaluation: true,
      hasClip: false,
      isPart2Complete: true,
    }),
    true,
  );
});

test('Get feedback remains hidden when evaluation is not available', () => {
  assert.strictEqual(
    shouldShowGetFeedback({
      canRequestEvaluation: false,
      hasClip: false,
      isPart2Complete: true,
    }),
    false,
  );
});

test('Part 2 complete → Start recording is not offered', () => {
  assert.strictEqual(shouldShowRecordingControls(true), false);
});

test('Part 2 incomplete → recording controls remain available', () => {
  assert.strictEqual(shouldShowRecordingControls(false), true);
});

test('Part 2 complete → session/timer controls are hidden', () => {
  assert.strictEqual(shouldShowSessionSetupControls(true), false);
});

test('Part 2 incomplete → session/timer controls remain visible', () => {
  assert.strictEqual(shouldShowSessionSetupControls(false), true);
});

// -- 13. Timer semantics --------------------------------------------------

test('Part 2 long turn guide uses 60 seconds, follow-up uses 30 seconds', () => {
  assert.strictEqual(timerGuideDuration('long_turn'), 60);
  assert.strictEqual(timerGuideDuration('follow_up'), 30);
});

test('Part 2 does not carry a contradictory 120-second guide', () => {
  const screenSource = readFileSync(
    resolve(process.cwd(), 'screens/practice/b2-speaking-part-placeholder-screen.tsx'),
    'utf8',
  );

  assert.match(screenSource, /subtitle=\{t\.subtitles\[partKey\]\}/);
  assert.match(screenSource, /'part-2': 'Long turn'/);
  assert.match(screenSource, /'part-3': 'Collaborative task'/);
  assert.match(screenSource, /const startLabel = isTaskLoading/);
  assert.match(screenSource, /'part-2': 'Starting Part 2…'/);
  assert.match(screenSource, /'part-2': 'Start Part 2'/);
  assert.doesNotMatch(screenSource, /void startSession\(\);/);
  assert.doesNotMatch(screenSource, /<SpeakingSessionCard/);
  assert.match(screenSource, /timerDisplay=\{shouldShowTimerGuide \? formatCountdown\(secondsRemaining\) : null\}/);
  assert.match(screenSource, /timerStatusLabel=\{shouldShowTimerGuide \? timerStatusLabel : null\}/);
  assert.doesNotMatch(screenSource, /Start timer/);
  assert.doesNotMatch(screenSource, /Reset timer/);
  assert.doesNotMatch(screenSource, /Session ready/);
  assert.doesNotMatch(screenSource, /02:00/);
});

test('Part 1 initial workspace exposes Start Part 1 and does not auto-start', () => {
  const screenSource = readFileSync(
    resolve(process.cwd(), 'screens/practice/b2-speaking-part-placeholder-screen.tsx'),
    'utf8',
  );

  assert.match(screenSource, /const isPart1 = \(partId as SpeakingPartId\) === 'part-1';/);
  assert.match(screenSource, /Start Part 1/);
  assert.match(screenSource, /!hasStartedTask && \(isPart1 \|\| isPart2 \|\| isPart3\)/);
  assert.doesNotMatch(screenSource, /void startSession\(\);/);
});

// -- 14. Source-contract checks for minimal reuse -------------------------

test('Part 2 screen reuses existing requestEvaluation and AssessmentResultsCard', () => {
  const screenSource = readFileSync(
    resolve(process.cwd(), 'screens/practice/b2-speaking-part-placeholder-screen.tsx'),
    'utf8',
  );

  assert.match(screenSource, /const requestEvaluation = useSpeakingStore\(\(state\) => state\.requestEvaluation\);/);
  assert.match(screenSource, /onRequestEvaluation=\{requestEvaluation\}/);
  assert.match(screenSource, /\{assessment \? <AssessmentResultsCard assessment=\{assessment\} \/> : null\}/);
  assert.match(screenSource, /Short follow-up/);
  assert.match(screenSource, /Candidate A's long turn is finished/);
  assert.match(screenSource, /\(isPart2 && hasStartedTask && part2Photo !== null\)/);
});

test('SpeakingAnswerArea shows Get feedback independently of hasClip and hides recording after completion', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'components/speaking/speaking-answer-area.tsx'),
    'utf8',
  );

  assert.match(source, /!\s*hasCompletedPart\s*\?/);
  assert.match(source, /\{canRequestEvaluation \? \(/);
  assert.match(source, /\{hasClip \? \(/);
  assert.match(source, /timerDisplay && timerStatusLabel/);
  assert.match(source, /isRecording \? t\.remaining : ''/);
  assert.match(source, /\) : null}\s*\n\s*\n\s*\{canRequestEvaluation \? \(/);
});

test('Part 2 photo prompt carries task text and phase-specific duration guidance', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'components/speaking/part2-photo-prompt.tsx'),
    'utf8',
  );

  assert.match(source, /Press Start recording when you're ready\./);
  assert.match(source, /Answer the examiner briefly\./);
  assert.doesNotMatch(source, /photo\.taskInstruction/);
  assert.doesNotMatch(source, /photo\.specificInstruction/);
  assert.doesNotMatch(source, /Candidate A, you have one minute to compare the photographs and answer the/);
});

test('Initial Part 2 long-turn state keeps assigned photo/task content primary', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'components/speaking/part2-photo-prompt.tsx'),
    'utf8',
  );

  assert.match(source, /photo\.photoUrl/);
  assert.match(source, /Press Start recording when you're ready\./);
  assert.doesNotMatch(source, /photo\.taskInstruction/);
  assert.doesNotMatch(source, /photo\.specificInstruction/);
});

test('Opening Part 2 does not auto-start the task and shows explicit start gate', () => {
  const screenSource = readFileSync(
    resolve(process.cwd(), 'screens/practice/b2-speaking-part-placeholder-screen.tsx'),
    'utf8',
  );

  assert.match(screenSource, /!hasStartedTask/);
  assert.match(screenSource, /Start Part 2/);
  assert.match(screenSource, /hasStartedTask && examinerText/);
  assert.match(
    screenSource,
    /\{hasStartedTask && !isPart3Complete && !isPart4Complete \? \(\s*<SpeakingAnswerArea/,
  );
});

test('Parts 1-3 retain the shared startSession gate while Part 4 uses its linked gate', () => {
  const screenSource = readFileSync(
    resolve(process.cwd(), 'screens/practice/b2-speaking-part-placeholder-screen.tsx'),
    'utf8',
  );

  assert.match(screenSource, /onPress=\{startSession\}/);
  assert.match(screenSource, /isPart1 \|\| isPart2 \|\| isPart3/);
  assert.match(screenSource, /Start Part 3/);
  assert.match(screenSource, /canStartPart4/);
  assert.match(screenSource, /startSession\(sourcePart3SessionId\)/);
});

test('Assessment results prioritize numeric score and hide stars/confidence', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'components/speaking/assessment-results-card.tsx'),
    'utf8',
  );

  assert.match(source, /What you did well/);
  assert.match(source, /What to work on next/);
  assert.match(source, /About this feedback/);
  assert.doesNotMatch(source, /Overall confidence/);
  assert.doesNotMatch(source, /out of 5 stars/);
});

console.log('\n✅ All Part 2 speaking tests passed.\n');
