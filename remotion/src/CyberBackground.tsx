import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from './theme';

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 47 + 13) % 100,
  y: (i * 73 + 29) % 100,
  size: 2 + (i % 4),
  speed: 0.08 + (i % 5) * 0.03,
  opacity: 0.12 + (i % 4) * 0.06,
}));

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`;

export const CyberBackground: React.FC<{
  children: React.ReactNode;
  accentColor?: string;
}> = ({ children, accentColor = COLORS.accentSecondary }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 20%, ${accentColor}22 0%, ${COLORS.bgElevated} 45%, ${COLORS.bgBase} 100%)`,
        fontFamily: FONTS.ui,
        color: COLORS.textPrimary,
        overflow: 'hidden',
      }}
    >
      {/* Subtle Ambient Field (zero blur cost) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 80% 78%, ${COLORS.accentPrimary}12 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Safe-modulo floating particles */}
      {PARTICLES.map((p) => {
        const rawY = p.y - frame * p.speed;
        const yPos = ((rawY % 100) + 100) % 100;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${yPos}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.id % 3 === 0 ? COLORS.accentPrimary : COLORS.textPrimary,
              opacity: p.opacity,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* Subtle Film Grain */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: GRAIN_SVG,
          pointerEvents: 'none',
        }}
      />

      {children}
    </AbsoluteFill>
  );
};
