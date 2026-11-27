import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Confetti } from '../components/Confetti';
import { FitText } from '../components/FitText';
import { Pill } from '../components/Pill';
import { SquareMediaFrame } from '../components/SquareMediaFrame';
import { COLORS, FONTS, SAFE_ZONE, SPRINGS } from '../theme';

export const RevealScene: React.FC<{
  videoSrc: string;
  memeTitle: string;
  revealSubtitle?: string;
  hideTitle?: boolean;
}> = ({ videoSrc, memeTitle, revealSubtitle, hideTitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({ frame, fps, config: SPRINGS.crisp });
  const titleSpring = spring({ frame: frame - 6, fps, config: SPRINGS.crisp });

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
          justifyContent: 'space-between',
        }}
      >
        {!hideTitle && memeTitle ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              opacity: titleSpring,
              transform: `translateY(${interpolate(titleSpring, [0, 1], [-20, 0])}px)`,
            }}
          >
            <Pill accent>THE MEME IS...</Pill>
            <FitText
              text={memeTitle}
              maxFontSize={56}
              minFontSize={28}
              maxLines={3}
              style={{
                fontFamily: FONTS.display,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: COLORS.textPrimary,
                textAlign: 'center',
              }}
            />
            {revealSubtitle ? (
              <div
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: 24,
                  fontWeight: 600,
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                }}
              >
                {revealSubtitle}
              </div>
            ) : null}
          </div>
        ) : (
          <div />
        )}

        <SquareMediaFrame videoSrc={videoSrc} size={760} scale={Math.max(0.92, cardSpring)} />

        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 22,
            color: COLORS.textSecondary,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          FULL REVEAL
        </div>
      </AbsoluteFill>

      <Confetti />
      <Audio src={staticFile('sound_effects/impact.mp3')} volume={0.65} />
    </AbsoluteFill>
  );
};
