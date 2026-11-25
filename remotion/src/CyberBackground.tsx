import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

const PARTICLES: Particle[] = Array.from({ length: 35 }, (_, i) => ({
  x: (i * 29) % 100,
  y: (i * 47) % 100,
  size: 3 + (i % 5) * 2,
  speed: 0.2 + (i % 4) * 0.15,
  opacity: 0.15 + (i % 6) * 0.08,
  color: i % 3 === 0 ? '#00f2fe' : i % 3 === 1 ? '#ff007a' : '#7928ca',
}));

export const CyberBackground: React.FC<{
  primaryColor?: string;
  secondaryColor?: string;
  intensity?: number;
  children?: React.ReactNode;
}> = ({
  primaryColor = '#ff007a',
  secondaryColor = '#00f2fe',
  intensity = 1,
  children,
}) => {
  const frame = useCurrentFrame();

  // Floating gradient shifts
  const shiftX = Math.sin(frame * 0.03) * 60;
  const shiftY = Math.cos(frame * 0.02) * 50;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#070913',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Dynamic radial gradient light bursts */}
      <div
        style={{
          position: 'absolute',
          top: `calc(15% + ${shiftY}px)`,
          left: `calc(20% + ${shiftX}px)`,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
          opacity: 0.22 * intensity,
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: `calc(15% - ${shiftY}px)`,
          right: `calc(10% - ${shiftX}px)`,
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${secondaryColor} 0%, transparent 70%)`,
          opacity: 0.18 * intensity,
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      {/* Cyber Grid Lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: `0px ${frame * 0.8}px`,
          opacity: 0.45,
          pointerEvents: 'none',
        }}
      />

      {/* Floating dust particles */}
      {PARTICLES.map((p, i) => {
        const currentY = (p.y - frame * p.speed + 100) % 100;
        const currentX = p.x + Math.sin((frame + i * 20) * 0.04) * 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${currentX}%`,
              top: `${currentY}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity: p.opacity * intensity,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 40%, rgba(5,6,12,0.85) 100%)',
          pointerEvents: 'none',
        }}
      />

      {children}
    </div>
  );
};
