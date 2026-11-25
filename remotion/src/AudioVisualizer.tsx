import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface AudioVisualizerProps {
  color?: string;
  accentColor?: string;
  barsCount?: number;
  height?: number;
  width?: number;
  pulseFactor?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  color = '#00f2fe',
  accentColor = '#ff007a',
  barsCount = 42,
  height = 160,
  width = 900,
  pulseFactor = 1,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width,
        height,
      }}
    >
      {Array.from({ length: barsCount }, (_, i) => {
        // Multi-frequency wave synthesis for audio-reactive look
        const freq1 = Math.sin(i * 0.42 + frame * 0.22);
        const freq2 = Math.cos(i * 0.28 - frame * 0.16);
        const freq3 = Math.sin((i + frame * 0.5) * 0.15);
        const centerWeight = 1 - Math.abs((i - barsCount / 2) / (barsCount / 2)) * 0.35;
        
        const rawAmp = Math.abs(freq1 * 0.5 + freq2 * 0.3 + freq3 * 0.2);
        const barH = Math.max(12, rawAmp * height * centerWeight * pulseFactor);

        const isPeak = rawAmp > 0.65;

        return (
          <div
            key={i}
            style={{
              width: 10,
              height: barH,
              borderRadius: 6,
              background: isPeak
                ? `linear-gradient(180deg, ${accentColor}, ${color})`
                : `linear-gradient(180deg, ${color}, #4facfe)`,
              boxShadow: isPeak
                ? `0 0 16px ${accentColor}`
                : `0 0 10px rgba(0, 242, 254, 0.45)`,
              transition: 'height 0.05s ease',
            }}
          />
        );
      })}
    </div>
  );
};
