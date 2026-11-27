import assert from 'node:assert/strict';
import { buildTimeline, assertTimelineCoverage } from '../remotion/src/timeline.ts';

const FPS = 30;
const guessOptions = [2, 5, 15];
const memeOptions = [3, 8, 20];

for (const countdownSeconds of [1, 10]) {
  for (const n of [1, 3, 5, 6, 10]) {
    const episode = {
      episode_id: `test_${n}_cd${countdownSeconds}`,
      episode_title: 'Test Episode',
      hook: 'classic',
      intro_audio: 'intro.mp3',
      countdown_seconds: countdownSeconds,
      gap_seconds: 1.5,
      rounds: Array.from({ length: n }, (_, i) => ({
        round: i + 1,
        title: `Round ${i + 1}`,
        clue_file: 'intro.mp3',
        clue_type: 'audio',
        clue_source: 'original',
        clue_start_seconds: 0,
        guess_seconds: guessOptions[i % guessOptions.length],
        meme_file: 'intro.mp3',
        meme_duration_seconds: memeOptions[i % memeOptions.length],
      })),
    };

    const t = buildTimeline(episode, FPS);
    assertTimelineCoverage(t);

    assert.ok(t.transitionFrames <= 60, `transitionFrames > 60 for n=${n}`);
    const sceneDurations = [
      t.introFrames,
      ...t.rounds.flatMap((r) => [r.guessFrames, r.countdownFrames, r.revealFrames]),
      t.scoreFrames,
    ];
    const minScene = Math.min(...sceneDurations);
    assert.ok(
      t.transitionFrames <= minScene,
      `transitionFrames (${t.transitionFrames}) > shortest scene (${minScene}) for n=${n}, cd=${countdownSeconds}`
    );

    const sumScenes = sceneDurations.reduce((a, b) => a + b, 0);
    const overlaps = (n * 3 + 1) * t.transitionFrames;
    assert.equal(t.totalFrames, sumScenes - overlaps, `totalFrames mismatch for n=${n}`);

    console.log(`PASS timeline n=${n} cd=${countdownSeconds}: totalFrames=${t.totalFrames}`);
  }
}
