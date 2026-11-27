import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../theme';

const CONFETTI_ITEMS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  angle: (i / 18) * Math.PI * 2,
  distance: 220 + (i % 4) * 90,
  size: 10 + (i % 3) * 5,
  color: i % 3 === 0 ? COLORS.accentPrimary : i % 3 === 1 ? COLORS.accentSecondary : COLORS.textPrimary,
}));

export const Confetti: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 28], [0, 1], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 8, 28], [0, 1, 0], { extrapolateRight: 'clamp' });

  if (frame > 30) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      {CONFETTI_ITEMS.map((item) => {
        const x = Math.cos(item.angle) * item.distance * progress;
        const y = Math.sin(item.angle) * item.distance * progress;
        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              width: item.size,
              height: item.size,
              borderRadius: item.id % 2 === 0 ? '50%' : 3,
              backgroundColor: item.color,
              transform: `translate(${x}px, ${y}px) rotate(${progress * 180}deg)`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};
