import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { FitText } from '../components/FitText';
import { Pill } from '../components/Pill';
import { COLORS, FONTS, RADII, SAFE_ZONE, SPRINGS } from '../theme';

export const ScoreScene: React.FC<{ totalRounds: number }> = ({ totalRounds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: SPRINGS.crisp });
  const tiers = [
    { score: `${totalRounds}/${totalRounds}`, label: 'MEME LEGEND', highlight: true },
    { score: `${Math.max(0, totalRounds - 1)}/${totalRounds}`, label: 'CERTIFIED', highlight: false },
    { score: `0/${totalRounds}`, label: 'NEED MORE SCROLLING', highlight: false },
  ];

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
          gap: 48,
        }}
      >
        <FitText
          text="HOW MANY DID YOU GET?"
          maxFontSize={68}
          minFontSize={34}
          maxLines={3}
          style={{
            opacity: titleSpring,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [-20, 0])}px)`,
            fontFamily: FONTS.display,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            color: COLORS.textPrimary,
          }}
        />

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tiers.map((tier, idx) => {
            const rowSpring = spring({ frame: frame - 8 - idx * 5, fps, config: SPRINGS.crisp });
            return (
              <div
                key={tier.score}
                style={{
                  opacity: rowSpring,
                  transform: `translateY(${interpolate(rowSpring, [0, 1], [20, 0])}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '24px 36px',
                  borderRadius: RADII.md,
                  backgroundColor: tier.highlight ? COLORS.surfaceStrong : COLORS.surface,
                  border: `1px solid ${tier.highlight ? COLORS.accentPrimary : COLORS.hairline}`,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 36,
                    fontWeight: 700,
                    color: tier.highlight ? COLORS.accentPrimary : COLORS.textPrimary,
                  }}
                >
                  {tier.score}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.ui,
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: COLORS.textPrimary,
                  }}
                >
                  {tier.label}
                </span>
              </div>
            );
          })}
        </div>

        <Pill accent style={{ padding: '18px 40px', fontSize: 26 }}>
          DROP YOUR SCORE
        </Pill>
      </AbsoluteFill>

      <Audio src={staticFile('sound_effects/whoosh.mp3')} volume={0.6} />
    </AbsoluteFill>
  );
};
