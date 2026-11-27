import React from 'react';

export interface FitTextProps {
  text: string;
  maxFontSize?: number;
  minFontSize?: number;
  maxLines?: number;
  maxWidth?: number;
  style?: React.CSSProperties;
}

/**
 * Scales font size down for longer strings so text fits within the safe width
 * and clamps to `maxLines` without clipping or horizontal overflow.
 */
export const FitText: React.FC<FitTextProps> = ({
  text,
  maxFontSize = 56,
  minFontSize = 26,
  maxLines = 3,
  maxWidth = 860,
  style,
}) => {
  // Estimate characters per line at maxFontSize (~0.58 * fontSize per char)
  const charsPerLine = Math.max(8, Math.floor(maxWidth / (maxFontSize * 0.58)));
  const targetCapacity = charsPerLine * maxLines;
  const ratio = text.length > targetCapacity ? targetCapacity / text.length : 1;
  const fontSize = Math.max(minFontSize, Math.round(maxFontSize * Math.sqrt(ratio)));

  return (
    <div
      style={{
        maxWidth,
        width: '100%',
        fontSize,
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        overflowWrap: 'break-word',
        ...style,
      }}
    >
      {text}
    </div>
  );
};
