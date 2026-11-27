import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildTimeline } from '../remotion/src/timeline.ts';

const args = process.argv.slice(2);
const episodeId = args[0];
if (!episodeId || episodeId.startsWith('--')) {
  console.error('Usage: npm run stills -- <episode_id> [--safe] [--out <dir>]');
  process.exit(1);
}

const isSafe = args.includes('--safe');
const outIdx = args.indexOf('--out');
const outDir = outIdx !== -1 && args[outIdx + 1] ? args[outIdx + 1] : 'output';
const stillsDir = path.join(outDir, 'stills');
fs.mkdirSync(stillsDir, { recursive: true });

const origPropsPath = path.join('public', 'episodes', episodeId, 'episode.json');
const ep = JSON.parse(fs.readFileSync(origPropsPath, 'utf8'));
const FPS = 30;
const t = buildTimeline(ep, FPS);

let propsPath = origPropsPath;
let tempPropsPath = null;
if (isSafe) {
  tempPropsPath = path.join(os.tmpdir(), `props_${episodeId}_safe.json`);
  fs.writeFileSync(tempPropsPath, JSON.stringify({ ...ep, showSafeZone: true }, null, 2));
  propsPath = tempPropsPath;
}

const r0 = t.rounds[0];
const introMid = Math.floor(t.introFrames / 2);
const guessStart = t.introFrames - t.transitionFrames;
const roundOverlayFrame = guessStart + 15;
const guessMid = guessStart + Math.floor(r0.guessFrames / 2);
const countdownStart = guessStart + r0.guessFrames - t.transitionFrames;
const countdownMid = countdownStart + Math.floor(r0.countdownFrames / 2);
const revealStart = countdownStart + r0.countdownFrames - t.transitionFrames;
const revealMid = revealStart + Math.floor(r0.revealFrames / 2);
const scoreStart = t.totalFrames - t.scoreFrames;
const scoreMid = scoreStart + Math.floor(t.scoreFrames / 2);

const prefix = isSafe ? 'safe_' : '';
const targets = [
  [`${prefix}intro.png`, introMid],
  [`${prefix}round_overlay.png`, roundOverlayFrame],
  [`${prefix}guess.png`, guessMid],
  [`${prefix}countdown.png`, countdownMid],
  [`${prefix}reveal.png`, revealMid],
  [`${prefix}score.png`, scoreMid],
];

for (const [name, frame] of targets) {
  const outFile = path.join(stillsDir, name);
  console.log(`Rendering ${outFile} (frame ${frame})...`);
  const res = spawnSync(
    'npx',
    ['remotion', 'still', 'remotion/src/index.ts', 'GuessTheMeme', outFile, `--props=${propsPath}`, `--frame=${frame}`],
    { stdio: 'inherit', shell: process.platform === 'win32' }
  );
  if (res.status !== 0) {
    if (tempPropsPath && fs.existsSync(tempPropsPath)) fs.unlinkSync(tempPropsPath);
    process.exit(res.status ?? 1);
  }
}

if (tempPropsPath && fs.existsSync(tempPropsPath)) {
  fs.unlinkSync(tempPropsPath);
}
console.log(`Stills written to ${stillsDir}`);
