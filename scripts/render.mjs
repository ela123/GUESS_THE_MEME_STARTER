import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assertTimelineCoverage, buildTimeline } from '../remotion/src/timeline.ts';
import { resolveHookHeadline } from '../remotion/src/hooks.ts';

const args = process.argv.slice(2);
const episodeId = args[0];
if (!episodeId || episodeId.startsWith('--')) {
  console.error(
    'Usage: npm run render -- <episode_id> [--out <dir>] [--concurrency N] [--gl <mode>] [--quick] [--frames a-b] [--scale x] [--timeout ms] [--browser-executable <path>] [--log verbose]'
  );
  process.exit(1);
}

function getFlag(name, fallback = null) {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1] !== undefined) {
    return args[idx + 1];
  }
  const eq = args.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  return fallback;
}

const hasFlag = (name) => args.includes(name);

function runOrExit(cmd, cmdArgs) {
  const res = spawnSync(cmd, cmdArgs, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (res.status !== 0) {
    return res.status ?? 1;
  }
  return 0;
}

const defaultConcurrency = Math.max(1, Math.min(os.cpus().length, 4));
const concurrency = Number(getFlag('--concurrency', defaultConcurrency));
const gl = getFlag('--gl', '');
const outDir = getFlag('--out', 'output');
const isQuick = hasFlag('--quick');
const frames = isQuick ? '0-300' : getFlag('--frames', '');
const scale = isQuick ? '0.5' : getFlag('--scale', '');
const timeout = Number(getFlag('--timeout', 120000));
const browserExec = getFlag('--browser-executable', '');
const logLevel = getFlag('--log', '');
const isDryRun = hasFlag('--dry-run');

fs.mkdirSync(outDir, { recursive: true });

const propsPath = path.join('public', 'episodes', episodeId, 'episode.json');
const outFileName = isQuick ? `${episodeId}_quick.mp4` : `${episodeId}.mp4`;
const outPath = path.join(outDir, outFileName);

const valStatus = runOrExit('npx', ['tsx', 'scripts/validate.mjs', episodeId]);
if (valStatus !== 0) process.exit(valStatus);

const ep = JSON.parse(fs.readFileSync(propsPath, 'utf8'));
const FPS = 30;
const timeline = buildTimeline(ep, FPS);
assertTimelineCoverage(timeline);

const ffmpegCheck = spawnSync('npx', ['remotion', 'ffmpeg', '-version'], {
  stdio: 'ignore',
  shell: process.platform === 'win32',
});
const hasFfmpeg = ffmpegCheck.status === 0;

console.log('\n--- Render Diagnostics ---');
console.log(`Node:        ${process.version}`);
console.log(`CPUs:        ${os.cpus().length} (concurrency=${concurrency})`);
console.log(`Free Memory: ${(os.freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB`);
console.log(`FFmpeg:      ${hasFfmpeg ? 'available' : 'NOT FOUND'}`);
console.log(`Props:       ${propsPath}`);
console.log(`Output:      ${outPath}`);
console.log(`Timeline:    ${timeline.totalFrames} frames (~${(timeline.totalFrames / FPS).toFixed(2)}s @ ${FPS}fps)`);
console.log('\nRound | Title | Clue | Guess | Meme');
console.log('------|-------|------|-------|-----');
for (const r of ep.rounds) {
  console.log(
    `${String(r.round).padStart(2, '0')} | ${r.title} | ${r.clue_type} | ${r.guess_seconds}s | ${r.meme_duration_seconds}s`
  );
}
console.log('--------------------------\n');

const renderArgs = [
  'remotion',
  'render',
  'remotion/src/index.ts',
  'GuessTheMeme',
  outPath,
  `--props=${propsPath}`,
  '--codec=h264',
  '--crf=18',
  `--concurrency=${concurrency}`,
  `--timeout=${timeout}`,
];
if (gl) renderArgs.push(`--gl=${gl}`);
if (frames) renderArgs.push(`--frames=${frames}`);
if (scale) renderArgs.push(`--scale=${scale}`);
if (browserExec) renderArgs.push(`--browser-executable=${browserExec}`);
if (logLevel) renderArgs.push(`--log=${logLevel}`);

if (isDryRun) {
  console.log('DRY RUN planned command:');
  console.log(`  npx ${renderArgs.join(' ')}`);
  process.exit(0);
}

const renderStatus = runOrExit('npx', renderArgs);
if (renderStatus !== 0) {
  console.error('\nRender failed. Try `--gl swangle`, run `npx remotion browser ensure`, or pass `--browser-executable`.');
  process.exit(renderStatus);
}

const blackStatus = runOrExit('npx', ['tsx', 'scripts/check_no_black.mjs', outPath]);
if (blackStatus !== 0) process.exit(blackStatus);

const metaPath = path.join(outDir, `${episodeId}_meta.txt`);
const resolvedHook = resolveHookHeadline({
  hook: ep.hook,
  hookCustom: ep.hook_custom,
  roundCount: ep.rounds.length,
  guessSeconds: ep.rounds[0]?.guess_seconds ?? 5,
});
const metaContent = [
  `Title: ${resolvedHook.headline}`,
  `Description: Can you guess all ${ep.rounds.length} memes from their original sound?`,
  `Hashtags: #guessthememe #memesound #memequiz #shorts #originalsound`,
  '',
].join('\n');
fs.writeFileSync(metaPath, metaContent);
console.log(`Wrote metadata: ${metaPath}`);
