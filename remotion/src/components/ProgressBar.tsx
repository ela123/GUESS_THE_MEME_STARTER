import React from 'react';
import { COLORS, RADII } from '../theme';

export const ProgressBar: React.FC<{
  progress: number; // 0 to 1
  color?: string;
  height?: number;
}> = ({ progress, color = COLORS.accentPrimary, height = 8 }) => {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius: RADII.pill,
        backgroundColor: COLORS.surfaceStrong,
        border: `1px solid ${COLORS.hairline}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: RADII.pill,
          backgroundColor: color,
        }}
      />
    </div>
  );
};
