import React from 'react';
import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { COLORS } from './theme';

export const AudioVisualizer: React.FC<{
  audioSrc: string;
  startSeconds?: number;
  barCount?: number;
  height?: number;
  accentColor?: string;
}> = ({
  audioSrc,
  startSeconds = 0,
  barCount = 32,
  height = 140,
  accentColor = COLORS.accentPrimary,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(staticFile(audioSrc));

  const offsetFrame = frame + Math.round(startSeconds * fps);
  const frequencies = audioData
    ? visualizeAudio({
        fps,
        frame: offsetFrame,
        audioData,
        numberOfSamples: barCount,
      })
    : Array.from({ length: barCount }, () => 0.15);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height,
        width: '100%',
      }}
    >
      {frequencies.map((amp, i) => {
        const clamped = Math.max(0.08, Math.min(1, amp * 2.2));
        const barHeight = Math.round(clamped * height);
        const isPeak = clamped > 0.65;

        return (
          <div
            key={i}
            style={{
              width: 12,
              height: barHeight,
              borderRadius: 999,
              background: isPeak
                ? accentColor
                : `linear-gradient(180deg, ${COLORS.textPrimary} 0%, ${COLORS.accentSecondary} 100%)`,
              opacity: 0.35 + clamped * 0.65,
            }}
          />
        );
      })}
    </div>
  );
};
