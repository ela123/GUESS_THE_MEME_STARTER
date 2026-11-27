import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Pill } from '../components/Pill';
import { COLORS, FONTS, SAFE_ZONE, SPRINGS } from '../theme';

export const RoundCard: React.FC<{
  roundNumber: number;
  totalRounds: number;
}> = ({ roundNumber, totalRounds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: SPRINGS.pop });

  return (
    <AbsoluteFill
      style={{
        paddingTop: SAFE_ZONE.top,
        paddingBottom: SAFE_ZONE.bottom,
        paddingLeft: SAFE_ZONE.left,
        paddingRight: SAFE_ZONE.right,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
      }}
    >
      <div style={{ transform: `scale(${Math.max(0.8, pop)})`, opacity: pop }}>
        <Pill accent>NEXT ROUND</Pill>
      </div>
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: 120,
          fontWeight: 800,
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          color: COLORS.textPrimary,
          textAlign: 'center',
          transform: `translateY(${interpolate(pop, [0, 1], [24, 0])}px)`,
          opacity: pop,
        }}
      >
        ROUND {roundNumber}
        <br />
        <span style={{ fontSize: 56, color: COLORS.textSecondary }}>OF {totalRounds}</span>
      </div>
      <Audio src={staticFile('sound_effects/whoosh.mp3')} volume={0.65} />
    </AbsoluteFill>
  );
};
