import { execSync } from 'node:child_process';

function runCmd(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

export function getFfprobeCmd() {
  try {
    runCmd('ffprobe -version');
    return 'ffprobe';
  } catch {
    try {
      runCmd('npx remotion ffprobe -version');
      return 'npx remotion ffprobe';
    } catch {
      throw new Error('Neither ffprobe nor `npx remotion ffprobe` is available on PATH.');
    }
  }
}

export function probeMedia(filePath) {
  const ffprobe = getFfprobeCmd();
  const out = runCmd(
    `${ffprobe} -v error -show_entries format=duration -show_entries stream=codec_type,codec_name,width,height -of json "${filePath}"`
  );
  const data = JSON.parse(out);
  const streams = data.streams || [];
  const hasVideo = streams.some((s) => s.codec_type === 'video');
  const hasAudio = streams.some((s) => s.codec_type === 'audio');
  const durationSeconds = parseFloat(data.format?.duration || '0');

  return {
    clueType: hasVideo ? 'video' : 'audio',
    hasVideo,
    hasAudio,
    durationSeconds: Number(durationSeconds.toFixed(3)),
  };
}

export function probeLoudnessLufs(filePath) {
  try {
    const out = execSync(
      `ffmpeg -i "${filePath}" -af ebur128=framelog=quiet -f null - 2>&1`,
      { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }
    );
    const matches = [...out.matchAll(/I:\s*(-?[0-9.]+)\s*LUFS/g)];
    if (matches.length > 0) {
      return parseFloat(matches[matches.length - 1][1]);
    }
  } catch {
    // Fallback if ffmpeg ebur128 is unavailable
  }
  return null;
}
