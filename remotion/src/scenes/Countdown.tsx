import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Circle } from '@remotion/shapes';
import { COLORS, FONTS, SAFE_ZONE, SPRINGS } from '../theme';

export const CountdownScene: React.FC<{ seconds?: number }> = ({ seconds = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentSec = Math.max(1, seconds - Math.floor(frame / fps));
  const frameInSec = frame % fps;

  const numSpring = spring({
    frame: frameInSec,
    fps,
    config: SPRINGS.pop,
  });

  const ringRadius = interpolate(frameInSec, [0, fps - 1], [140, 220], {
    extrapolateRight: 'clamp',
  });
  const ringOpacity = interpolate(frameInSec, [0, fps - 1], [0.7, 0], {
    extrapolateRight: 'clamp',
  });

  const label = currentSec === 1 ? '1 SECOND LEFT' : `${currentSec} SECONDS LEFT`;

  return (
    <AbsoluteFill>
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
          gap: 40,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 480,
            height: 480,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ position: 'absolute', opacity: ringOpacity }}>
            <Circle
              radius={ringRadius}
              fill="transparent"
              stroke={COLORS.accentPrimary}
              strokeWidth={4}
            />
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 220,
              fontWeight: 800,
              lineHeight: 1,
              color: COLORS.textPrimary,
              transform: `scale(${Math.max(0.7, numSpring)})`,
            }}
          >
            {currentSec}
          </div>
        </div>

        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: COLORS.accentPrimary,
          }}
        >
          {label}
        </div>
      </AbsoluteFill>

      {Array.from({ length: seconds }, (_, i) => (
        <Sequence key={i} from={i * fps} durationInFrames={fps}>
          <Audio src={staticFile('sound_effects/tick_crisp.mp3')} volume={0.85} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
