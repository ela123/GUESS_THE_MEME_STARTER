import { execSync } from 'node:child_process';

const target = process.argv[2] || 'output/episode_001.mp4';
const output = execSync(
  `ffmpeg -i "${target}" -vf signalstats,metadata=print:key=lavfi.signalstats.YAVG -f null - 2>&1`,
  { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
);

const lines = output.split(/\r?\n/);
let consecutiveBlack = 0;
let maxConsecutiveBlack = 0;
let totalFrames = 0;

for (const line of lines) {
  const match = line.match(/lavfi\.signalstats\.YAVG=([0-9.]+)/);
  if (match) {
    totalFrames++;
    const yavg = parseFloat(match[1]);
    if (yavg < 20) {
      consecutiveBlack++;
      if (consecutiveBlack > maxConsecutiveBlack) {
        maxConsecutiveBlack = consecutiveBlack;
      }
    } else {
      consecutiveBlack = 0;
    }
  }
}

console.log(`Checked ${totalFrames} frames. Max consecutive YAVG < 20: ${maxConsecutiveBlack}`);
if (maxConsecutiveBlack > 2) {
  console.error(`FAIL: Found ${maxConsecutiveBlack} consecutive black frames (YAVG < 20).`);
  process.exit(1);
}
console.log('PASS: No black frame sequences detected.');
