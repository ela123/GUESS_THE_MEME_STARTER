import { loadFont as loadSyne } from '@remotion/google-fonts/Syne';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';

const syne = loadSyne('normal', { weights: ['700', '800'], subsets: ['latin'] });
const jakarta = loadPlusJakartaSans('normal', { weights: ['500', '600', '700', '800'], subsets: ['latin'] });
const mono = loadJetBrainsMono('normal', { weights: ['600', '700'], subsets: ['latin'] });

export const FONTS = {
  display: syne.fontFamily,
  ui: jakarta.fontFamily,
  mono: mono.fontFamily,
};

export const COLORS = {
  bgBase: '#0B0B10',
  bgElevated: '#14141D',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceStrong: 'rgba(255, 255, 255, 0.08)',
  hairline: 'rgba(255, 255, 255, 0.12)',
  textPrimary: '#F6F5F0',
  textSecondary: '#9A9AA6',
  accentPrimary: '#D4FF33', // Acid Chartreuse
  accentSecondary: '#5E5CE6', // Apple Indigo
  black: '#07070B',
};

export const SAFE = { top: 220, bottom: 540, left: 140, right: 140 };
// frame is 1080x1920: content width 800, centred at x = 540, y = 220..1380

export const SAFE_ZONE = {
  ...SAFE,
  horizontal: SAFE.left,
};

export const RADII = {
  sm: 16,
  md: 24,
  lg: 36,
  pill: 9999,
};

export const SPRINGS = {
  crisp: { damping: 18, stiffness: 140, mass: 0.9 },
  pop: { damping: 12, stiffness: 160, mass: 0.8 },
  gentle: { damping: 20, stiffness: 100, mass: 1 },
};

export interface RoundConfig {
  round: number;
  original_video: string;
  original_audio_start_seconds: number;
  guess_audio_duration_seconds: number;
  meme_video: string;
  meme_title: string;
}

export interface EpisodeConfig {
  episode_title: string;
  clue_display?: 'auto' | 'video' | 'audio';
  intro_audio: string;
  intro_duration_seconds: number;
  countdown_seconds: number;
  gap_seconds: number;
  output: string;
  rounds: RoundConfig[];
}
