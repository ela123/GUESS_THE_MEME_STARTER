import React from 'react';
import { COLORS, FONTS, RADII } from '../theme';

export const Pill: React.FC<{
  children: React.ReactNode;
  accent?: boolean;
  style?: React.CSSProperties;
}> = ({ children, accent = false, style }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 24px',
        borderRadius: RADII.pill,
        backgroundColor: accent ? COLORS.accentPrimary : COLORS.surfaceStrong,
        border: accent ? 'none' : `1px solid ${COLORS.hairline}`,
        color: accent ? COLORS.black : COLORS.textPrimary,
        fontFamily: FONTS.mono,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
