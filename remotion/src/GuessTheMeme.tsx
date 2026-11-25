import React from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { CyberBackground } from './CyberBackground';
import { AudioVisualizer } from './AudioVisualizer';

// Configuration interface for modular, multi-round quiz structure
export interface RoundConfig {
  roundNumber?: number;
  originalVideo: string;
  originalAudioStartSeconds?: number;
  guessDurationSeconds?: number;
  memeVideo: string;
  memeTitle?: string;
  countdownSeconds?: number;
}

export interface GuessTheMemeProps {
  episodeTitle?: string;
  round?: number;
  rounds?: RoundConfig[];
  originalVideo?: string;
  originalStart?: number;
  guessDuration?: number;
  memeVideo?: string;
  memeTitle?: string;
  introDuration?: number;
  countdownSeconds?: number;
  showScoreScreen?: boolean;
}

// THEME PALETTE
const THEME = {
  bg: '#070913',
  neonCyan: '#00f2fe',
  neonPink: '#ff007a',
  neonYellow: '#f5d300',
  neonPurple: '#7928ca',
  white: '#ffffff',
  textSecondary: '#94a3b8',
  panelBorder: 'rgba(0, 242, 254, 0.4)',
};

// ==========================================
// SCENE 1: CINEMATIC KINETIC INTRO (45 frames / 1.5s)
// ==========================================
export const IntroScene: React.FC<{ roundNumber?: number }> = ({ roundNumber = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Kinetic typography spring physics
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 120, mass: 0.8 },
  });

  const subSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  const badgeSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  const glowPulse = 0.8 + Math.sin(frame * 0.25) * 0.2;
  const flareScale = interpolate(frame, [0, 20], [0, 1.8], { extrapolateRight: 'clamp' });
  const flareOpacity = interpolate(frame, [0, 10, 35], [0, 0.9, 0], { extrapolateRight: 'clamp' });

  return (
    <CyberBackground primaryColor="#ff007a" secondaryColor="#00f2fe">
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 50px',
        }}
      >
        {/* Kinetic Light Flare on entrance */}
        <div
          style={{
            position: 'absolute',
            width: 800,
            height: 12,
            background: 'linear-gradient(90deg, transparent, #00f2fe, #fff, #ff007a, transparent)',
            transform: `scaleX(${flareScale})`,
            opacity: flareOpacity,
            filter: 'blur(4px)',
          }}
        />

        {/* Round Badge */}
        <div
          style={{
            transform: `scale(${Math.max(0, badgeSpring)}) translateY(${interpolate(badgeSpring, [0, 1], [-40, 0])}px)`,
            opacity: badgeSpring,
            padding: '12px 34px',
            borderRadius: 50,
            background: 'linear-gradient(90deg, rgba(255,0,122,0.3), rgba(121,40,202,0.4))',
            border: '2px solid #ff007a',
            boxShadow: '0 0 25px rgba(255,0,122,0.5)',
            marginBottom: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: '#ff007a',
              boxShadow: '0 0 12px #ff007a',
            }}
          />
          <span
            style={{
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: 6,
              color: THEME.white,
              textTransform: 'uppercase',
            }}
          >
            ROUND {roundNumber.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Main Title with 3D Pop & Neon Glow */}
        <div
          style={{
            transform: `scale(${Math.max(0, titleSpring)})`,
            textAlign: 'center',
            fontSize: 98,
            fontWeight: 950,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: THEME.white,
            textShadow: `0 0 40px rgba(0,242,254,${glowPulse}), 0 0 80px rgba(0,242,254,0.3)`,
            marginBottom: 20,
          }}
        >
          GUESS THE
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #00f2fe 10%, #ff007a 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 25px rgba(255,0,122,0.6))',
            }}
          >
            MEME!
          </span>
        </div>

        {/* Subtitle banner */}
        <div
          style={{
            transform: `scale(${Math.max(0, subSpring)}) translateY(${interpolate(subSpring, [0, 1], [30, 0])}px)`,
            opacity: subSpring,
            padding: '14px 44px',
            borderRadius: 20,
            background: 'rgba(10, 16, 32, 0.75)',
            border: '1px solid rgba(0, 242, 254, 0.5)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
            marginTop: 20,
          }}
        >
          <span
            style={{
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: 4,
              color: THEME.neonYellow,
              textShadow: '0 0 15px rgba(245,211,0,0.5)',
            }}
          >
            BY ITS ORIGINAL SOUND
          </span>
        </div>
      </AbsoluteFill>

      {/* Intro Sting and Whoosh */}
      <Audio src={staticFile('sound_effects/whoosh.mp3')} volume={0.8} />
      <Audio src={staticFile('intro.mp3')} volume={0.85} />
    </CyberBackground>
  );
};

// ==========================================
// SCENE 2: GUESSING STAGE (ORIGINAL VIDEO PROMINENT & AUDIO SYNCED)
// ==========================================
export const GuessingStage: React.FC<{
  videoSrc: string;
  startSeconds?: number;
  durationInFrames: number;
  roundNumber?: number;
}> = ({
  videoSrc,
  startSeconds = 15,
  durationInFrames,
  roundNumber = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for the video frame
  const frameSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const pulse = Math.sin(frame * 0.1) * 0.05 + 1;
  const startFrame = Math.round(startSeconds * fps);

  return (
    <CyberBackground primaryColor="#00f2fe" secondaryColor="#7928ca">
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '120px 40px 100px',
        }}
      >
        {/* Top Header Pill */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            transform: `translateY(${interpolate(frameSpring, [0, 1], [-60, 0])}px)`,
            opacity: frameSpring,
          }}
        >
          <div
            style={{
              padding: '10px 30px',
              borderRadius: 30,
              background: 'linear-gradient(90deg, #ff007a, #7928ca)',
              boxShadow: '0 0 25px rgba(255, 0, 122, 0.4)',
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: 4,
              color: THEME.white,
            }}
          >
            ROUND {roundNumber.toString().padStart(2, '0')}
          </div>
          <div
            style={{
              fontSize: 54,
              fontWeight: 950,
              letterSpacing: 2,
              color: THEME.white,
              textShadow: '0 0 30px rgba(0,242,254,0.5)',
            }}
          >
            LISTEN CAREFULLY!
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: THEME.neonCyan,
              letterSpacing: 3,
            }}
          >
            DO YOU RECOGNIZE THIS SOUND?
          </div>
        </div>

        {/* Center Prominent Video Screen with Cyber Hologram Frame */}
        <div
          style={{
            position: 'relative',
            width: 960,
            height: 600,
            borderRadius: 32,
            overflow: 'hidden',
            transform: `scale(${frameSpring})`,
            boxShadow: `0 20px 80px rgba(0,0,0,0.8), 0 0 50px rgba(0, 242, 254, 0.35)`,
            border: '4px solid rgba(0, 242, 254, 0.65)',
            background: '#000',
          }}
        >
          {/* Synchronized Original Video Playback (Video + Audio) */}
          <OffthreadVideo
            src={staticFile(videoSrc)}
            startFrom={startFrame}
            endAt={startFrame + durationInFrames}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />

          {/* Corner Cyber HUD Accents */}
          <div style={{ position: 'absolute', top: 16, left: 16, width: 28, height: 28, borderTop: '4px solid #ff007a', borderLeft: '4px solid #ff007a' }} />
          <div style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderTop: '4px solid #ff007a', borderRight: '4px solid #ff007a' }} />
          <div style={{ position: 'absolute', bottom: 16, left: 16, width: 28, height: 28, borderBottom: '4px solid #00f2fe', borderLeft: '4px solid #00f2fe' }} />
          <div style={{ position: 'absolute', bottom: 16, right: 16, width: 28, height: 28, borderBottom: '4px solid #00f2fe', borderRight: '4px solid #00f2fe' }} />

          {/* LIVE CLUE watermark banner */}
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: 24,
              padding: '6px 18px',
              borderRadius: 8,
              background: 'rgba(255, 0, 122, 0.85)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', boxShadow: '0 0 8px #fff' }} />
            <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>ORIGINAL SOURCE CLUE</span>
          </div>
        </div>

        {/* Bottom Audio Visualizer & Call to action */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            width: '100%',
          }}
        >
          <AudioVisualizer width={920} height={130} pulseFactor={pulse} />
          
          <div
            style={{
              padding: '16px 36px',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: 28,
              fontWeight: 800,
              color: THEME.textSecondary,
              letterSpacing: 4,
            }}
          >
            WHAT MEME WAS MADE FROM THIS?
          </div>
        </div>
      </AbsoluteFill>
    </CyberBackground>
  );
};

// ==========================================
// SCENE 3: KINETIC 3-SECOND COUNTDOWN
// ==========================================
export const CountdownStage: React.FC<{ seconds?: number }> = ({ seconds = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Current digit (3, 2, 1)
  const currentSecond = Math.max(1, seconds - Math.floor(frame / 30));
  const localFrame = frame % 30;

  // Explosive spring for each tick
  const pop = spring({
    frame: localFrame,
    fps,
    config: { damping: 9, stiffness: 220, mass: 0.7 },
  });

  const shockwaveScale = interpolate(localFrame, [0, 24], [0.8, 2.5], { extrapolateRight: 'clamp' });
  const shockwaveOpacity = interpolate(localFrame, [0, 6, 24], [0, 0.8, 0], { extrapolateRight: 'clamp' });
  const rotation = interpolate(localFrame, [0, 15], [10, 0], { extrapolateRight: 'clamp' });

  return (
    <CyberBackground primaryColor="#f5d300" secondaryColor="#ff007a">
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Header Alert */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 950,
            letterSpacing: 8,
            color: THEME.white,
            textShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
            marginBottom: 40,
          }}
        >
          CAN YOU GUESS IT?
        </div>

        {/* Central Pulse Ring / Shockwave */}
        <div
          style={{
            position: 'absolute',
            width: 440,
            height: 440,
            borderRadius: '50%',
            border: '6px solid #f5d300',
            transform: `scale(${shockwaveScale})`,
            opacity: shockwaveOpacity,
            filter: 'blur(2px)',
          }}
        />

        {/* Kinetic Number Capsule */}
        <div
          style={{
            position: 'relative',
            width: 460,
            height: 460,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(20,25,45,0.95) 0%, rgba(10,12,24,0.98) 100%)',
            border: '6px solid #f5d300',
            boxShadow: '0 0 80px rgba(245, 211, 0, 0.4), inset 0 0 40px rgba(245, 211, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${0.75 + pop * 0.3}) rotate(${rotation}deg)`,
          }}
        >
          <span
            style={{
              fontSize: 320,
              fontWeight: 950,
              lineHeight: 1,
              color: THEME.neonYellow,
              textShadow: '0 0 60px rgba(245, 211, 0, 0.8), 0 10px 30px rgba(0,0,0,0.8)',
            }}
          >
            {currentSecond}
          </span>
        </div>

        {/* Bottom Status text */}
        <div
          style={{
            marginTop: 60,
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: 10,
            color: THEME.neonCyan,
            textShadow: '0 0 20px rgba(0, 242, 254, 0.5)',
          }}
        >
          SECONDS LEFT
        </div>
      </AbsoluteFill>

      {/* Sync sound effects for every tick */}
      {[0, 1, 2].map((n) => (
        <Sequence key={n} from={n * 30} durationInFrames={30}>
          <Audio src={staticFile('sound_effects/tick_crisp.mp3')} volume={0.9} />
        </Sequence>
      ))}
    </CyberBackground>
  );
};

// ==========================================
// SCENE 4: MEME REVEAL (FULL MEME VIDEO & HIGH ENERGY)
// ==========================================
export const RevealStage: React.FC<{
  videoSrc: string;
  memeTitle?: string;
  durationInFrames: number;
}> = ({ videoSrc, memeTitle = 'OCEAN MEME', durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dramatic "THE ANSWER IS..." stinger sequence
  const introBannerFrames = 40;
  const isIntro = frame < introBannerFrames;

  const bannerSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 140 },
  });

  const bannerScale = interpolate(frame, [0, 15, introBannerFrames - 8, introBannerFrames], [0.6, 1.05, 1.0, 0.2], {
    extrapolateRight: 'clamp',
  });
  const bannerOpacity = interpolate(frame, [0, 8, introBannerFrames - 8, introBannerFrames], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  // Video reveals with dynamic zoom & border flash
  const videoEntrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 13, stiffness: 90 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Full Aspect Ratio Preserved Meme Video */}
      <OffthreadVideo
        src={staticFile(videoSrc)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `scale(${Math.min(1.0, 0.92 + videoEntrance * 0.08)})`,
        }}
      />

      {/* Flash impact sound when reveal triggers */}
      <Sequence from={0} durationInFrames={40}>
        <Audio src={staticFile('sound_effects/impact.mp3')} volume={0.8} />
      </Sequence>

      {/* "THE ANSWER IS..." Explosive Stinger Overlay */}
      {isIntro && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `rgba(7, 9, 19, ${interpolate(frame, [0, 10, 30, 40], [0.8, 0.7, 0.7, 0])})`,
            opacity: bannerOpacity,
          }}
        >
          <div
            style={{
              padding: '24px 60px',
              borderRadius: 30,
              background: 'linear-gradient(135deg, rgba(255,0,122,0.95), rgba(121,40,202,0.95))',
              border: '4px solid #fff',
              boxShadow: '0 0 90px rgba(255, 0, 122, 0.8), 0 20px 50px rgba(0,0,0,0.8)',
              transform: `scale(${bannerScale})`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 68,
                fontWeight: 950,
                letterSpacing: 4,
                color: THEME.white,
                textShadow: '0 0 30px rgba(255,255,255,0.8)',
              }}
            >
              THE ANSWER IS...
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Top Banner showing Answer Title */}
      <div
        style={{
          position: 'absolute',
          top: 70,
          left: 50,
          right: 50,
          padding: '16px 36px',
          borderRadius: 24,
          background: 'rgba(7, 9, 19, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(0, 242, 254, 0.5)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#00f2fe', boxShadow: '0 0 14px #00f2fe' }} />
          <span style={{ fontSize: 32, fontWeight: 900, color: THEME.neonCyan, letterSpacing: 3 }}>ANSWER REVEALED</span>
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 900,
            color: THEME.neonYellow,
            letterSpacing: 2,
            textShadow: '0 0 15px rgba(245, 211, 0, 0.5)',
          }}
        >
          {memeTitle.toUpperCase()}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 5: SCORE & ENGAGEMENT SCREEN (90 frames / 3s)
// ==========================================
export const ScoreScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titlePop = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 120 },
  });

  const commentPulse = 1 + Math.sin(frame * 0.2) * 0.05;

  const TIERS = [
    { score: '0/5', label: 'BEGINNER?', color: '#94a3b8' },
    { score: '3/5', label: 'MEME FAN!', color: '#00f2fe' },
    { score: '5/5', label: 'MEME GURU!!', color: '#f5d300' },
  ];

  return (
    <CyberBackground primaryColor="#ff007a" secondaryColor="#00f2fe">
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 60px',
        }}
      >
        {/* Title */}
        <div
          style={{
            transform: `scale(${titlePop})`,
            fontSize: 72,
            fontWeight: 950,
            letterSpacing: -1,
            color: THEME.white,
            textAlign: 'center',
            marginBottom: 60,
            textShadow: '0 0 40px rgba(0, 242, 254, 0.6)',
          }}
        >
          HOW MANY DID
          <br />
          <span style={{ color: THEME.neonCyan }}>YOU GET RIGHT?</span>
        </div>

        {/* Rating Tiers Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', marginBottom: 60 }}>
          {TIERS.map((tier, idx) => {
            const cardSpring = spring({
              frame: frame - 10 - idx * 6,
              fps,
              config: { damping: 12, stiffness: 140 },
            });
            return (
              <div
                key={tier.score}
                style={{
                  transform: `scale(${Math.max(0, cardSpring)}) translateX(${interpolate(cardSpring, [0, 1], [-80, 0])}px)`,
                  opacity: cardSpring,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '24px 44px',
                  borderRadius: 24,
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: `2px solid ${tier.color}`,
                  boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${tier.color}33`,
                }}
              >
                <span style={{ fontSize: 44, fontWeight: 950, color: tier.color, letterSpacing: 2 }}>{tier.score}</span>
                <span style={{ fontSize: 38, fontWeight: 900, color: THEME.white, letterSpacing: 4 }}>{tier.label}</span>
              </div>
            );
          })}
        </div>

        {/* Comment Call-To-Action Button */}
        <div
          style={{
            transform: `scale(${commentPulse})`,
            padding: '24px 56px',
            borderRadius: 50,
            background: 'linear-gradient(90deg, #ff007a, #7928ca)',
            border: '3px solid #fff',
            boxShadow: '0 0 50px rgba(255, 0, 122, 0.6), 0 20px 40px rgba(0,0,0,0.7)',
            fontSize: 42,
            fontWeight: 950,
            letterSpacing: 4,
            color: THEME.white,
            textAlign: 'center',
          }}
        >
          COMMENT YOUR SCORE!
        </div>
      </AbsoluteFill>
      <Audio src={staticFile('sound_effects/whoosh.mp3')} volume={0.6} />
    </CyberBackground>
  );
};

// ==========================================
// MASTER REUSABLE COMPOSITION
// ==========================================
export const GuessTheMeme: React.FC<GuessTheMemeProps> = ({
  round = 1,
  originalVideo = 'original_sounds/ocean_meme_original.mp4',
  originalStart = 15,
  guessDuration = 10,
  memeVideo = 'memes/ocean_meme.mp4',
  memeTitle = 'Ocean Meme',
  introDuration = 1.5,
  countdownSeconds = 3,
  showScoreScreen = true,
}) => {
  const { fps } = useVideoConfig();

  // Durations in Frames
  const introFrames = Math.round(introDuration * fps); // 45 frames (1.5s)
  const guessFrames = Math.round(guessDuration * fps); // 300 frames (10s)
  const countdownFrames = countdownSeconds * fps; // 90 frames (3s)
  const revealFrames = 337; // 11.22s (full meme video clip)
  const scoreFrames = showScoreScreen ? 90 : 0; // 90 frames (3s)

  // Timeline Start Offsets
  const guessStart = introFrames;
  const countStart = guessStart + guessFrames;
  const revealStart = countStart + countdownFrames;
  const scoreStart = revealStart + revealFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      {/* 1. Attention Grabbing Intro */}
      <Sequence from={0} durationInFrames={introFrames}>
        <IntroScene roundNumber={round} />
      </Sequence>

      {/* 2. Guessing Stage with Visible Original Video + Audio */}
      <Sequence from={guessStart} durationInFrames={guessFrames}>
        <GuessingStage
          videoSrc={originalVideo}
          startSeconds={originalStart}
          durationInFrames={guessFrames}
          roundNumber={round}
        />
      </Sequence>

      {/* 3. Kinetic 3-Second Countdown */}
      <Sequence from={countStart} durationInFrames={countdownFrames}>
        <CountdownStage seconds={countdownSeconds} />
      </Sequence>

      {/* 4. Complete Meme Video Reveal */}
      <Sequence from={revealStart} durationInFrames={revealFrames}>
        <RevealStage
          videoSrc={memeVideo}
          memeTitle={memeTitle}
          durationInFrames={revealFrames}
        />
      </Sequence>

      {/* 5. Score Screen & Final Call To Action */}
      {showScoreScreen && (
        <Sequence from={scoreStart} durationInFrames={scoreFrames}>
          <ScoreScreen />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
