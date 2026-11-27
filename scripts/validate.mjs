import fs from 'node:fs';
import path from 'node:path';
import { probeLoudnessLufs, probeMedia } from './lib/media.mjs';

const episodeId = process.argv[2];
if (!episodeId) {
  console.error('Usage: npm run validate -- <episode_id>');
  process.exit(1);
}

const epJsonPath = path.resolve('public', 'episodes', episodeId, 'episode.json');
if (!fs.existsSync(epJsonPath)) {
  console.error(`ERROR: Missing ${epJsonPath}. Run \`npm run scaffold -- ${episodeId}\` first.`);
  process.exit(1);
}

const ep = JSON.parse(fs.readFileSync(epJsonPath, 'utf8'));
const VALID_HOOKS = new Set(['classic', 'challenge', 'nostalgia', 'fast', 'viral', 'curiosity', 'general', 'competitive']);
let errors = 0;

if (ep.hook && !VALID_HOOKS.has(ep.hook)) {
  console.error(`ERROR: Unknown hook key "${ep.hook}". Valid keys: ${[...VALID_HOOKS].join(', ')}`);
  errors++;
}
let totalSeconds = 2.4 + 3.0; // intro + score
const lufsList = [];

if (!Array.isArray(ep.rounds) || ep.rounds.length === 0) {
  console.error('ERROR: episode.json has no rounds.');
  process.exit(1);
}

for (const r of ep.rounds) {
  const clueAbs = path.resolve('public', r.clue_file);
  const memeAbs = path.resolve('public', r.meme_file);

  if (!fs.existsSync(clueAbs)) {
    console.error(`ERROR [Round ${r.round}]: Missing clue file ${r.clue_file}`);
    errors++;
  }
  if (!fs.existsSync(memeAbs)) {
    console.error(`ERROR [Round ${r.round}]: Missing meme file ${r.meme_file}`);
    errors++;
  } else {
    const meta = probeMedia(memeAbs);
    if (meta.durationSeconds > 20) {
      console.warn(`WARN [Round ${r.round}]: Meme duration is ${meta.durationSeconds}s (> 20s).`);
    }
    const lufs = probeLoudnessLufs(memeAbs);
    if (lufs !== null) lufsList.push({ round: r.round, lufs });
  }

  if (!r.title || !String(r.title).trim()) {
    console.warn(`WARN [Round ${r.round}]: Empty title.`);
  }

  if (r.guess_seconds < 2 || r.guess_seconds > 15) {
    console.error(`ERROR [Round ${r.round}]: guess_seconds (${r.guess_seconds}) must be between 2 and 15.`);
    errors++;
  }

  const roundCard = ep.rounds.length > 1 ? 1.0 : 0;
  totalSeconds += roundCard + r.guess_seconds + (ep.countdown_seconds || 3) + r.meme_duration_seconds + (ep.gap_seconds || 1.5) * 3;
}

if (lufsList.length >= 2) {
  const vals = lufsList.map((x) => x.lufs);
  const diff = Math.max(...vals) - Math.min(...vals);
  if (diff > 6) {
    console.warn(`WARN: Loudness differs by ${diff.toFixed(1)} LUFS across rounds (> 6 LUFS).`);
  }
}

if (totalSeconds > 120) {
  console.warn(`WARN: Estimated total duration is ${totalSeconds.toFixed(1)}s (> 120s).`);
}

if (errors > 0) {
  console.error(`\nValidation FAILED with ${errors} error(s).`);
  process.exit(1);
}

console.log(`Validation PASSED for ${episodeId} (${ep.rounds.length} round(s), ~${totalSeconds.toFixed(1)}s).`);
