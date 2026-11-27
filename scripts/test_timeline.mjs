import assert from 'node:assert/strict';
import fs from 'node:fs';

// Read timeline.ts constants and verify math for 1, 3, 5, 6, 10 rounds
const TRANSITION_FRAMES = 12;
const INTRO_FRAMES = 72;
const SCORE_FRAMES = 90;

function buildTimeline(roundCount, fps = 30) {
  const countdownFrames = 3 * fps;
  const rounds = Array.from({ length: roundCount }, (_, i) => ({
    round: i + 1,
    guessFrames: 5 * fps,
    countdownFrames,
    revealFrames: 8 * fps,
  }));
  const roundsSum = rounds.reduce((acc, r) => acc + r.guessFrames + r.countdownFrames + r.revealFrames, 0);
  const transitionCount = roundCount * 3 + 1;
  const totalFrames = Math.max(1, INTRO_FRAMES + roundsSum + SCORE_FRAMES - transitionCount * TRANSITION_FRAMES);
  return { introFrames: INTRO_FRAMES, countdownFrames, scoreFrames: SCORE_FRAMES, transitionFrames: TRANSITION_FRAMES, rounds, totalFrames };
}

for (const n of [1, 3, 5, 6, 10]) {
  const t = buildTimeline(n);
  assert.ok(t.transitionFrames <= 60, `Transition > 60 frames for n=${n}`);
  const durations = [
    t.introFrames,
    ...t.rounds.flatMap((r) => [r.guessFrames, r.countdownFrames, r.revealFrames]),
    t.scoreFrames,
  ];
  const intervals = [];
  let cursor = 0;
  for (let i = 0; i < durations.length; i++) {
    const start = i === 0 ? 0 : cursor - t.transitionFrames;
    const end = start + durations[i];
    intervals.push([start, end]);
    cursor = end;
  }
  assert.equal(intervals[intervals.length - 1][1], t.totalFrames, `End mismatch for n=${n}`);
  for (let f = 0; f < t.totalFrames; f++) {
    assert.ok(intervals.some(([s, e]) => f >= s && f < e), `Gap at frame ${f} for n=${n}`);
  }
  console.log(`PASS timeline n=${n}: totalFrames=${t.totalFrames}, transitions=${n * 3 + 1}`);
}
