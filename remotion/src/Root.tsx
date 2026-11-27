import React from 'react';
import { Composition, staticFile } from 'remotion';
import { getVideoMetadata } from '@remotion/media-utils';
import { GuessTheMeme } from './GuessTheMeme';
import { EpisodeConfig, EpisodeSchema } from './types';
import { buildTimeline } from './timeline';
import defaultEpisode from '../../public/episodes/ep001/episode.json';

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="GuessTheMeme"
      component={GuessTheMeme}
      schema={EpisodeSchema}
      durationInFrames={1000}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={defaultEpisode as EpisodeConfig}
      calculateMetadata={async ({ props }) => {
        const rounds = await Promise.all(
          props.rounds.map(async (r) => {
            if (r.meme_duration_seconds > 0) return r;
            try {
              const meta = await getVideoMetadata(staticFile(r.meme_file));
              return { ...r, meme_duration_seconds: meta.durationInSeconds };
            } catch {
              return { ...r, meme_duration_seconds: 11.22 };
            }
          })
        );

        const updatedProps: EpisodeConfig = {
          ...props,
          rounds: rounds.map((r) => ({
            ...r,
            clue_source: r.clue_source ?? 'original',
            clue_start_seconds: r.clue_start_seconds ?? 0,
          })),
        };
        const timeline = buildTimeline(updatedProps, FPS);

        return {
          durationInFrames: timeline.totalFrames,
          props: updatedProps,
        };
      }}
    />
  );
};
