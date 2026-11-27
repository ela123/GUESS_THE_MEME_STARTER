import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { AudioVisualizer } from '../AudioVisualizer';
import { Pill } from '../components/Pill';
import { ProgressBar } from '../components/ProgressBar';
import { SquareMediaFrame } from '../components/SquareMediaFrame';
import { COLORS, FONTS, RADII, SAFE_ZONE, SPRINGS } from '../theme';

const VIDEO_EXTS = ['.mp4', '.mov', '.webm', '.mkv', '.m4v'];
const AUDIO_EXTS = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'];

export function detectClueType(
  src: string,
  override: 'auto' | 'video' | 'audio' = 'auto'
): 'video' | 'audio' {
  if (override === 'video' || override === 'audio') return override;
  const lower = src.toLowerCase();
  if (VIDEO_EXTS.some((ext) => lower.endsWith(ext))) return 'video';
  if (AUDIO_EXTS.some((ext) => lower.endsWith(ext))) return 'audio';
  return 'audio';
}

export const GuessScene: React.FC<{
  videoSrc: string;
  startSeconds?: number;
  durationInFrames: number;
  roundNumber?: number;
  clueDisplay?: 'auto' | 'video' | 'audio';
}> = ({
  videoSrc,
  startSeconds = 15,
  durationInFrames,
  roundNumber = 1,
  clueDisplay = 'auto',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clueType = detectClueType(videoSrc, clueDisplay);
  const cardSpring = spring({ frame, fps, config: SPRINGS.crisp });
  const startFrame = Math.round(startSeconds * fps);
  const progress = Math.min(1, frame / Math.max(1, durationInFrames));
  const remainingSec = Math.max(0, Math.ceil((durationInFrames - frame) / fps));

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
        {/* Top Header + Progress */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            opacity: cardSpring,
            transform: `translateY(${interpolate(cardSpring, [0, 1], [-24, 0])}px)`,
          }}
        >
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pill>ROUND {roundNumber.toString().padStart(2, '0')}</Pill>
            <Pill accent>{`00:${remainingSec.toString().padStart(2, '0')}`}</Pill>
          </div>
          <ProgressBar progress={progress} color={COLORS.accentPrimary} />
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: COLORS.textPrimary,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            LISTEN CLOSELY
          </div>
        </div>

        {/* Center Stage: Auto-detected Video + Visualizer OR Audio-Only Artwork */}
        {clueType === 'video' ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
              transform: `scale(${Math.max(0.9, cardSpring)})`,
            }}
          >
            <SquareMediaFrame
              videoSrc={videoSrc}
              startFrom={startFrame}
              endAt={startFrame + durationInFrames}
              size={720}
            />
            <div style={{ width: 720 }}>
              <AudioVisualizer audioSrc={videoSrc} startSeconds={startSeconds} barCount={32} height={64} />
            </div>
          </div>
        ) : (
          <div
            style={{
              width: 900,
              height: 900,
              borderRadius: RADII.lg,
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.hairline}`,
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 56,
              gap: 48,
              transform: `scale(${Math.max(0.92, cardSpring)})`,
            }}
          >
            <div
              style={{
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${COLORS.accentPrimary} 0 14%, ${COLORS.bgBase} 15% 26%, ${COLORS.bgElevated} 27% 100%)`,
                border: `1px solid ${COLORS.hairline}`,
                transform: `rotate(${frame * 1.4}deg)`,
              }}
            />
            <AudioVisualizer audioSrc={videoSrc} startSeconds={startSeconds} barCount={32} height={150} />
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 22,
                color: COLORS.textSecondary,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              ORIGINAL AUDIO CLUE
            </div>
          </div>
        )}

        {/* Bottom Prompt */}
        <div
          style={{
            fontFamily: FONTS.ui,
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.textSecondary,
            letterSpacing: '0.02em',
          }}
        >
          Which meme uses this sound?
        </div>
      </AbsoluteFill>

      {clueType === 'audio' && (
        <Audio src={staticFile(videoSrc)} startFrom={startFrame} endAt={startFrame + durationInFrames} />
      )}
    </AbsoluteFill>
  );
};
