import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: npx tsx scripts/check_no_black.mjs <video_path>');
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error(`File not found: ${file}`);
  process.exit(1);
}

const ffArgs = ['-i', file, '-an', '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG', '-f', 'null', '-'];
let res = spawnSync('ffmpeg', ffArgs, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
if (res.error) {
  res = spawnSync('npx', ['remotion', 'ffmpeg', ...ffArgs], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
    shell: process.platform === 'win32',
  });
}

const output = `${res.stdout || ''}\n${res.stderr || ''}`;
const lines = output.split(/\r?\n/);

const FPS = 30;
let frameIdx = 0;
let runStart = null;
const badRuns = [];

for (const line of lines) {
  const m = line.match(/lavfi\.signalstats\.YAVG=([0-9.]+)/);
  if (!m) continue;
  const yavg = Number(m[1]);
  if (yavg < 20) {
    if (runStart === null) runStart = frameIdx;
  } else {
    if (runStart !== null && frameIdx - runStart > 2) {
      badRuns.push([runStart, frameIdx - 1]);
    }
    runStart = null;
  }
  frameIdx++;
}
if (runStart !== null && frameIdx - runStart > 2) {
  badRuns.push([runStart, frameIdx - 1]);
}

if (badRuns.length > 0) {
  console.error(`Black-frame check FAILED for ${file}:`);
  for (const [s, e] of badRuns) {
    console.error(`  frames ${s}-${e} (${(s / FPS).toFixed(2)}s - ${(e / FPS).toFixed(2)}s)`);
  }
  process.exit(1);
}

console.log(`Black-frame check PASSED for ${file} (${frameIdx} frames checked).`);
