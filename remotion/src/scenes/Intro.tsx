import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { FitText } from '../components/FitText';
import { Pill } from '../components/Pill';
import { resolveHookHeadline } from '../hooks';
import { COLORS, FONTS, SAFE_ZONE, SPRINGS } from '../theme';

export const IntroScene: React.FC<{
  roundNumber?: number;
  introAudio?: string;
  hook?: string;
  hookCustom?: string;
  totalRounds?: number;
  guessSeconds?: number;
}> = ({
  roundNumber = 1,
  introAudio = 'intro.mp3',
  hook = 'classic',
  hookCustom,
  totalRounds = 1,
  guessSeconds = 5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame, fps, config: SPRINGS.pop });
  const titleSpring = spring({ frame: frame - 4, fps, config: SPRINGS.crisp });
  const subSpring = spring({ frame: frame - 10, fps, config: SPRINGS.crisp });
  const discRotation = frame * 1.8;
  const resolved = resolveHookHeadline({ hook, hookCustom, roundCount: totalRounds, guessSeconds });

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
          gap: 36,
        }}
      >
        {/* Spinning Vinyl Motif */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${COLORS.accentPrimary} 0 14%, ${COLORS.bgBase} 15% 24%, ${COLORS.bgElevated} 25% 100%)`,
            border: `1px solid ${COLORS.hairline}`,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            transform: `scale(${Math.max(0, badgeSpring)}) rotate(${discRotation}deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 108,
              height: 108,
              borderRadius: '50%',
              border: `1px solid rgba(255,255,255,0.08)`,
            }}
          />
        </div>

        {/* Round / Preset Sticker */}
        <div
          style={{
            transform: `scale(${Math.max(0, badgeSpring)}) translateY(${interpolate(badgeSpring, [0, 1], [-24, 0])}px)`,
            opacity: badgeSpring,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Pill accent>ROUND {roundNumber.toString().padStart(2, '0')} / SOUND CHECK</Pill>
          {resolved.key !== 'classic' && <Pill>{resolved.label.toUpperCase()}</Pill>}
        </div>

        {/* Main Editorial Headline */}
        <div
          style={{
            transform: `scale(${Math.max(0, titleSpring)}) translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
            opacity: titleSpring,
            textAlign: 'center',
            width: '100%',
          }}
        >
          <FitText
            text={resolved.headline}
            maxFontSize={76}
            minFontSize={36}
            maxLines={3}
            style={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: '-0.03em',
              color: COLORS.textPrimary,
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          />
        </div>

        {/* Subtitle */}
        <div
          style={{
            transform: `translateY(${interpolate(subSpring, [0, 1], [20, 0])}px)`,
            opacity: subSpring,
            fontFamily: FONTS.ui,
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: COLORS.textSecondary,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          BY ITS ORIGINAL SOUND
        </div>
      </AbsoluteFill>

      <Audio src={staticFile('sound_effects/whoosh.mp3')} volume={0.75} />
      <Audio src={staticFile(introAudio)} volume={0.9} />
    </AbsoluteFill>
  );
};
