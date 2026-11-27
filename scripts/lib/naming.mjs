import fs from 'node:fs';

export const VIDEO_EXTS = new Set(['mp4', 'mov', 'webm', 'mkv', 'm4v']);
export const AUDIO_EXTS = new Set(['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac']);

const FILE_REGEX = /^\s*(\d+)\s*[_\- ]+\s*(.+?)\.([a-z0-9]+)$/i;
const ORIGINAL_REGEX = /^original(?:[_\-\s]+(.*))?$/i;
const MEME_PREFIX_REGEX = /^meme(?:[_\-\s]+(.*))?$/i;

/**
 * Parse an episode asset filename like:
 *   1_original.mp4, 1_original_ocean.mp4, "1_ original.mp3",
 *   "2_Surprised Pikachu.mp4", 1_meme_ocean.mp4, 1_meme.mp4
 */
export function parseEpisodeFilename(filename) {
  const m = filename.match(FILE_REGEX);
  if (!m) return null;

  const round = Number(m[1]);
  const rest = m[2].trim();
  const ext = m[3].toLowerCase();

  const isVideo = VIDEO_EXTS.has(ext);
  const isAudio = AUDIO_EXTS.has(ext);
  if (!isVideo && !isAudio) return null;

  const mediaType = isVideo ? 'video' : 'audio';

  const origMatch = rest.match(ORIGINAL_REGEX);
  if (origMatch) {
    return {
      round,
      kind: 'original',
      slug: (origMatch[1] || '').trim(),
      ext,
      mediaType,
      file: filename,
    };
  }

  const memeMatch = rest.match(MEME_PREFIX_REGEX);
  const slug = memeMatch ? (memeMatch[1] || '').trim() : rest;

  return {
    round,
    kind: 'meme',
    slug,
    ext,
    mediaType,
    file: filename,
  };
}

export function slugToTitle(slug, round) {
  if (!slug) return `Round ${String(round).padStart(2, '0')}`;
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function safeAsciiName(round, kind, slug, ext) {
  const nn = String(round).padStart(2, '0');
  if (kind === 'original') {
    return `${nn}_original.${ext}`;
  }
  const safeSlug = (slug || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return safeSlug ? `${nn}_meme_${safeSlug}.${ext}` : `${nn}_meme.${ext}`;
}

export function copyIfSafe(srcPath, destPath) {
  if (srcPath === destPath) return;
  const srcStat = fs.statSync(srcPath);
  if (fs.existsSync(destPath)) {
    const destStat = fs.statSync(destPath);
    if (srcStat.size === destStat.size && Math.abs(srcStat.mtimeMs - destStat.mtimeMs) < 1000) {
      return;
    }
    throw new Error(`Refusing to overwrite ${destPath} with different content.`);
  }
  fs.copyFileSync(srcPath, destPath);
  fs.utimesSync(destPath, srcStat.atime, srcStat.mtime);
}
