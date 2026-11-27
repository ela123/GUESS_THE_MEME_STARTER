import { z } from 'zod';

export const RoundSchema = z.object({
  round: z.number().int().min(1),
  title: z.string(),
  clue_file: z.string(),
  clue_type: z.enum(['video', 'audio']),
  clue_source: z.enum(['original', 'meme_audio']).default('original'),
  clue_start_seconds: z.number().min(0).default(0),
  guess_seconds: z.number().min(2).max(15),
  meme_file: z.string(),
  meme_duration_seconds: z.number().positive(),
  reveal_subtitle: z.string().optional(),
  hide_title: z.boolean().optional(),
});

export const EpisodeSchema = z.object({
  episode_id: z.string(),
  episode_title: z.string(),
  hook: z.string().optional(),
  hook_custom: z.string().optional(),
  intro_audio: z.string().default('intro.mp3'),
  countdown_seconds: z.number().int().min(1).max(10).default(3),
  gap_seconds: z.number().min(0).max(2).default(1.5),
  showSafeZone: z.boolean().default(false).optional(),
  rounds: z.array(RoundSchema).min(1).max(10),
});

export type RoundConfig = z.infer<typeof RoundSchema>;
export type EpisodeConfig = z.infer<typeof EpisodeSchema>;
