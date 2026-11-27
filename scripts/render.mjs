import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const episodeId = args[0];
if (!episodeId || episodeId.startsWith('--')) {
  console.error('Usage: npm run render -- <episode_id> [--concurrency N] [--gl swangle] [--out <dir>]');
  process.exit(1);
}

function getFlag(name, fallback = null) {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1] !== undefined) {
    return args[idx + 1];
  }
  return fallback;
}

const concurrency = Number(getFlag('--concurrency', os.cpus().length));
const gl = getFlag('--gl', '');
const outDir = getFlag('--out', 'output');

fs.mkdirSync(outDir, { recursive: true });

const propsPath = path.join('public', 'episodes', episodeId, 'episode.json');
const outPath = path.join(outDir, `${episodeId}.mp4`);
const glFlag = gl ? ` --gl=${gl}` : '';

execSync(`node scripts/validate.mjs ${episodeId}`, { stdio: 'inherit' });

const ep = JSON.parse(fs.readFileSync(propsPath, 'utf8'));
console.log(`\nRendering ${episodeId} (${ep.rounds.length} round(s)) -> ${outPath}`);
for (const r of ep.rounds) {
  console.log(`  Round ${String(r.round).padStart(2, '0')}: ${r.title} (${r.guess_seconds}s clue + ${r.meme_duration_seconds}s meme)`);
}

execSync(
  `npx remotion render remotion/src/index.ts GuessTheMeme "${outPath}" --props="${propsPath}" --codec=h264 --crf=18 --concurrency=${concurrency}${glFlag}`,
  { stdio: 'inherit' }
);
execSync(`node scripts/check_no_black.mjs "${outPath}"`, { stdio: 'inherit' });

const metaPath = path.join(outDir, `${episodeId}_meta.txt`);
const metaTitle = ep.episode_title || 'Guess the Meme by Its Original Sound';
const metaContent = [
  `Title: ${metaTitle}`,
  `Description: Can you guess all ${ep.rounds.length} memes from their original sound?`,
  `Hashtags: #guessthememe #memesound #memequiz #shorts #originalsound`,
  '',
].join('\n');
fs.writeFileSync(metaPath, metaContent);
console.log(`Wrote metadata: ${metaPath}`);
