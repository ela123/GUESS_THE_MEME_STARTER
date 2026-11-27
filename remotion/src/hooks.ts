export interface HookPreset {
  key: string;
  label: string;
  headline: string;
}

export const HOOK_PRESETS: Record<string, HookPreset> = {
  classic: {
    key: 'classic',
    label: 'Classic',
    headline: 'Guess the Meme by Its Original Sound',
  },
  challenge: {
    key: 'challenge',
    label: 'Challenge',
    headline: "If You're a Meme Guru, Guess All {N}!",
  },
  nostalgia: {
    key: 'nostalgia',
    label: 'Nostalgia',
    headline: 'Only OGs Can Recognize These Meme Sounds',
  },
  fast: {
    key: 'fast',
    label: 'Fast challenge',
    headline: 'Can You Guess the Meme in {SECONDS} Seconds?',
  },
  viral: {
    key: 'viral',
    label: 'Viral',
    headline: 'Guess the Viral Meme from Its Music',
  },
  curiosity: {
    key: 'curiosity',
    label: 'Curiosity',
    headline: '99% Will Fail This Meme Sound Quiz',
  },
  general: {
    key: 'general',
    label: 'General quiz',
    headline: 'How Well Do You Know Internet Memes?',
  },
  competitive: {
    key: 'competitive',
    label: 'Competitive',
    headline: 'Meme Expert or Beginner? Prove It!',
  },
};

export const HOOK_KEYS = Object.keys(HOOK_PRESETS);

export function pickDeterministicHook(episodeId: string): string {
  let hash = 0;
  for (let i = 0; i < episodeId.length; i++) {
    hash = (hash * 31 + episodeId.charCodeAt(i)) >>> 0;
  }
  return HOOK_KEYS[hash % HOOK_KEYS.length];
}

export function resolveHookHeadline(opts: {
  hook?: string;
  hookCustom?: string;
  roundCount: number;
  guessSeconds: number;
}): { key: string; label: string; headline: string } {
  const key = opts.hook && HOOK_PRESETS[opts.hook] ? opts.hook : 'classic';
  const preset = HOOK_PRESETS[key];
  const raw = opts.hookCustom && opts.hookCustom.trim() ? opts.hookCustom.trim() : preset.headline;
  const headline = raw
    .replace(/\{N\}/g, String(opts.roundCount))
    .replace(/\{SECONDS\}/g, String(opts.guessSeconds));

  return {
    key,
    label: preset.label,
    headline,
  };
}
