import React from 'react';
import { OffthreadVideo, staticFile } from 'remotion';
import { COLORS, RADII } from '../theme';

export const SquareMediaFrame: React.FC<{
  videoSrc: string;
  startFrom?: number;
  endAt?: number;
  scale?: number;
  size?: number;
  children?: React.ReactNode;
}> = ({ videoSrc, startFrom, endAt, scale = 1, size = 900, children }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: RADII.lg,
        overflow: 'hidden',
        transform: `scale(${scale})`,
        border: `1px solid ${COLORS.hairline}`,
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.55)',
        backgroundColor: COLORS.black,
        flexShrink: 0,
      }}
    >
      {/* Blurred Background Fill from the Same Video (No Black Bars) */}
      <OffthreadVideo
        src={staticFile(videoSrc)}
        startFrom={startFrom}
        endAt={endAt}
        muted
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(24px) brightness(0.48)',
          transform: 'scale(1.12)',
        }}
      />

      {/* Proportional Foreground Video (No Stretch, No Crop) */}
      <OffthreadVideo
        src={staticFile(videoSrc)}
        startFrom={startFrom}
        endAt={endAt}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />

      {children}
    </div>
  );
};
