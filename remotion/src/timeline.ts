import { EpisodeConfig } from './types';

export const TRANSITION_FRAMES = 12;
export const INTRO_FRAMES = 72; // 2.4s at 30fps
export const SCORE_FRAMES = 90; // 3.0s at 30fps

export function buildTimeline(episode: EpisodeConfig, fps: number) {
  const countdownFrames = Math.round((episode.countdown_seconds ?? 3) * fps);

  const rounds = episode.rounds.map((r) => {
    const guessFrames = Math.round(r.guess_seconds * fps);
    const revealFrames = Math.ceil(r.meme_duration_seconds * fps);
    return {
      round: r,
      guessFrames,
      countdownFrames,
      revealFrames,
    };
  });

  const roundsSum = rounds.reduce(
    (acc, r) => acc + r.guessFrames + r.countdownFrames + r.revealFrames,
    0
  );

  // 3 transitions per round (Intro/Prev -> Guess -> Countdown -> Reveal) + 1 before Score
  const transitionCount = episode.rounds.length * 3 + 1;
  const totalFrames = Math.max(
    1,
    INTRO_FRAMES + roundsSum + SCORE_FRAMES - transitionCount * TRANSITION_FRAMES
  );

  return {
    introFrames: INTRO_FRAMES,
    countdownFrames,
    scoreFrames: SCORE_FRAMES,
    transitionFrames: TRANSITION_FRAMES,
    rounds,
    totalFrames,
  };
}

export function assertTimelineCoverage(timeline: ReturnType<typeof buildTimeline>) {
  const { introFrames, scoreFrames, transitionFrames, rounds, totalFrames } = timeline;
  const durations = [
    introFrames,
    ...rounds.flatMap((r) => [r.guessFrames, r.countdownFrames, r.revealFrames]),
    scoreFrames,
  ];

  const intervals: Array<[number, number]> = [];
  let cursor = 0;
  for (let i = 0; i < durations.length; i++) {
    const start = i === 0 ? 0 : cursor - transitionFrames;
    const end = start + durations[i];
    intervals.push([start, end]);
    cursor = end;
  }

  const lastEnd = intervals[intervals.length - 1][1];
  if (lastEnd !== totalFrames) {
    throw new Error(`Timeline end mismatch: final scene ends at ${lastEnd}, expected ${totalFrames}`);
  }

  for (let f = 0; f < totalFrames; f++) {
    const covered = intervals.some(([s, e]) => f >= s && f < e);
    if (!covered) {
      throw new Error(`Timeline gap at frame ${f} (totalFrames=${totalFrames})`);
    }
  }
}
