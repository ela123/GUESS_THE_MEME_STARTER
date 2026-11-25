import React from 'react';
import { Composition } from 'remotion';
import { GuessTheMeme } from './GuessTheMeme';

// Total frames:
// Intro: 45 frames (1.5s)
// Guessing Stage: 300 frames (10s)
// Countdown: 90 frames (3s)
// Meme Reveal: 337 frames (11.23s)
// Score Screen: 90 frames (3s)
// Total = 45 + 300 + 90 + 337 + 90 = 862 frames (~28.7s)

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="GuessTheMeme"
      component={GuessTheMeme}
      durationInFrames={862}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        round: 1,
        originalVideo: 'original_sounds/ocean_meme_original.mp4',
        originalStart: 15,
        guessDuration: 10,
        memeVideo: 'memes/ocean_meme.mp4',
        memeTitle: 'Ocean Meme',
        introDuration: 1.5,
        countdownSeconds: 3,
        showScoreScreen: true,
      }}
    />
  );
};
