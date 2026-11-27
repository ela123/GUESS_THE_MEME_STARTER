import React from 'react';
import { useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { CyberBackground } from './CyberBackground';
import { COLORS } from './theme';
import { EpisodeConfig } from './types';
import { SAFE } from './theme';
import { buildTimeline } from './timeline';
import { IntroScene } from './scenes/Intro';
import { GuessScene } from './scenes/Guess';
import { CountdownScene } from './scenes/Countdown';
import { RevealScene } from './scenes/Reveal';
import { ScoreScene } from './scenes/Score';

export const GuessTheMeme: React.FC<EpisodeConfig> = (episode) => {
  const { fps } = useVideoConfig();
  const timeline = buildTimeline(episode, fps);
  const totalRounds = episode.rounds.length;

  return (
    <CyberBackground accentColor={COLORS.accentSecondary}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={timeline.introFrames}>
          <IntroScene
            roundNumber={episode.rounds[0]?.round ?? 1}
            introAudio={episode.intro_audio}
            hook={episode.hook}
            hookCustom={episode.hook_custom}
            totalRounds={totalRounds}
            guessSeconds={episode.rounds[0]?.guess_seconds ?? 5}
          />
        </TransitionSeries.Sequence>

        {timeline.rounds.map((item) => {
          const r = item.round;
          const clueDisplay = r.clue_source === 'meme_audio' ? 'audio' : r.clue_type;

          return (
            <React.Fragment key={r.round}>
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: timeline.transitionFrames })}
              />

              <TransitionSeries.Sequence durationInFrames={item.guessFrames}>
                <GuessScene
                  videoSrc={r.clue_file}
                  startSeconds={r.clue_start_seconds}
                  durationInFrames={item.guessFrames}
                  roundNumber={r.round}
                  totalRounds={totalRounds}
                  clueDisplay={clueDisplay}
                />
              </TransitionSeries.Sequence>

              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: timeline.transitionFrames })}
              />

              <TransitionSeries.Sequence durationInFrames={item.countdownFrames}>
                <CountdownScene seconds={episode.countdown_seconds} />
              </TransitionSeries.Sequence>

              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: timeline.transitionFrames })}
              />

              <TransitionSeries.Sequence durationInFrames={item.revealFrames}>
                <RevealScene
                  videoSrc={r.meme_file}
                  memeTitle={r.title}
                  revealSubtitle={r.reveal_subtitle}
                  hideTitle={r.hide_title}
                />
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: timeline.transitionFrames })}
        />

        <TransitionSeries.Sequence durationInFrames={timeline.scoreFrames}>
          <ScoreScene totalRounds={totalRounds} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {episode.showSafeZone && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            borderTop: `${SAFE.top}px solid rgba(255, 0, 80, 0.25)`,
            borderBottom: `${SAFE.bottom}px solid rgba(255, 0, 80, 0.25)`,
            borderLeft: `${SAFE.left}px solid rgba(255, 0, 80, 0.25)`,
            borderRight: `${SAFE.right}px solid rgba(255, 0, 80, 0.25)`,
            boxSizing: 'border-box',
          }}
        />
      )}
    </CyberBackground>
  );
};
