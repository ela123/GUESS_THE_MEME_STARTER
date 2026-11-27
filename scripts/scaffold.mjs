import fs from 'node:fs';
import path from 'node:path';
import { probeMedia } from './lib/media.mjs';
import { copyIfSafe, parseEpisodeFilename, safeAsciiName, slugToTitle, VIDEO_EXTS } from './lib/naming.mjs';

const args = process.argv.slice(2);
const episodeId = args[0];
if (!episodeId || episodeId.startsWith('--')) {
  console.error('Usage: npm run scaffold -- <episode_id> [--rounds N] [--clue-seconds 5] [--clue-start 0]');
  process.exit(1);
}

function getFlag(name, fallback) {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1] !== undefined) {
    return Number(args[idx + 1]);
  }
  return fallback;
}

function getStringFlag(name, fallback = null) {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1] !== undefined) {
    return args[idx + 1];
  }
  return fallback;
}

const maxRounds = getFlag('--rounds', 10);
const defaultClueSeconds = getFlag('--clue-seconds', 5);
const defaultClueStart = getFlag('--clue-start', 0);
const sourceArg = getStringFlag('--source');
const rawHookArg = getStringFlag('--hook');
const HOOK_KEYS = ['classic', 'challenge', 'nostalgia', 'fast', 'viral', 'curiosity', 'general', 'competitive'];
let hookArg = rawHookArg;
if (rawHookArg === 'random') {
  let hash = 0;
  for (let i = 0; i < episodeId.length; i++) {
    hash = (hash * 31 + episodeId.charCodeAt(i)) >>> 0;
  }
  hookArg = HOOK_KEYS[hash % HOOK_KEYS.length];
}

const epDir = path.resolve('public', 'episodes', episodeId);
const srcDir = sourceArg ? path.resolve(sourceArg) : epDir;

if (!fs.existsSync(srcDir)) {
  console.error(`Source directory not found: ${srcDir}`);
  process.exit(1);
}
fs.mkdirSync(epDir, { recursive: true });

const files = fs.readdirSync(srcDir);

const originals = new Map();
const memes = new Map();

for (const file of files) {
  const parsed = parseEpisodeFilename(file);
  if (!parsed) continue;

  const { round: num, kind, ext, slug } = parsed;
  if (kind === 'original') {
    const prev = originals.get(num);
    if (prev) {
      const prevIsVid = VIDEO_EXTS.has(path.extname(prev).slice(1).toLowerCase());
      const curIsVid = VIDEO_EXTS.has(ext);
      if (curIsVid && !prevIsVid) {
        console.warn(`[WARN] Round ${num}: both audio and video originals found; preferring video (${file}).`);
        originals.set(num, file);
      } else {
        console.warn(`[WARN] Round ${num}: multiple originals found; keeping ${prev}.`);
      }
    } else {
      originals.set(num, file);
    }
    continue;
  }

  if (memes.has(num)) {
    console.warn(`[WARN] Round ${num}: multiple meme files found; keeping ${memes.get(num).file} and ignoring ${file}.`);
  } else {
    memes.set(num, { file, slug });
  }
}

for (const num of originals.keys()) {
  if (!memes.has(num)) {
    console.error(`ERROR [Round ${num}]: Found original (${originals.get(num)}) but no meme file.`);
    process.exit(1);
  }
}

const epJsonPath = path.join(epDir, 'episode.json');
let existing = null;
if (fs.existsSync(epJsonPath)) {
  existing = JSON.parse(fs.readFileSync(epJsonPath, 'utf8'));
}
const existingByRound = new Map((existing?.rounds || []).map((r) => [r.round, r]));

const roundNums = [...memes.keys()].sort((a, b) => a - b).slice(0, maxRounds);
const rounds = [];

console.log('\nRound | Clue File | Type | Clue Dur | Meme File | Title | Meme Dur | Warnings');
console.log('------|-----------|------|----------|-----------|-------|----------|---------');

for (const num of roundNums) {
  const memeInfo = memes.get(num);
  const memeParsed = parseEpisodeFilename(memeInfo.file);
  const safeMemeFile = safeAsciiName(num, 'meme', memeInfo.slug, memeParsed.ext);
  const memeSrcAbs = path.join(srcDir, memeInfo.file);
  const memeAbs = path.join(epDir, safeMemeFile);
  if (memeSrcAbs !== memeAbs) {
    copyIfSafe(memeSrcAbs, memeAbs);
  }
  const memeMeta = probeMedia(memeAbs);

  const origFile = originals.get(num);
  const warnings = [];
  let clueFile;
  let clueType;
  let clueSource;
  let clueDur;

  if (origFile) {
    const origParsed = parseEpisodeFilename(origFile);
    const safeOrigFile = safeAsciiName(num, 'original', origParsed.slug, origParsed.ext);
    const origSrcAbs = path.join(srcDir, origFile);
    const origAbs = path.join(epDir, safeOrigFile);
    if (origSrcAbs !== origAbs) {
      copyIfSafe(origSrcAbs, origAbs);
    }
    clueFile = `episodes/${episodeId}/${safeOrigFile}`;
    const origMeta = probeMedia(origAbs);
    clueType = origMeta.clueType;
    clueSource = 'original';
    clueDur = origMeta.durationSeconds;
  } else {
    clueFile = `episodes/${episodeId}/${safeMemeFile}`;
    clueType = 'audio';
    clueSource = 'meme_audio';
    clueDur = memeMeta.durationSeconds;
    warnings.push('Missing original; using meme_audio');
  }

  const prev = existingByRound.get(num);
  let clueStart = prev?.clue_start_seconds ?? defaultClueStart;
  let guessSec = prev?.guess_seconds ?? defaultClueSeconds;
  const title = prev?.title ?? slugToTitle(memeInfo.slug, num);

  if (guessSec < 2) {
    guessSec = 2;
    warnings.push('Clamped guess_seconds to min 2s');
  } else if (guessSec > 15) {
    guessSec = 15;
    warnings.push('Clamped guess_seconds to max 15s');
  }

  if (clueStart + guessSec > clueDur) {
    clueStart = Math.max(0, Number((clueDur - guessSec).toFixed(2)));
    warnings.push(`Clamped clue_start_seconds to ${clueStart}s`);
  }

  if (memeMeta.durationSeconds > 20) {
    warnings.push(`Meme > 20s (${memeMeta.durationSeconds}s)`);
  }

  rounds.push({
    round: num,
    title,
    clue_file: clueFile,
    clue_type: clueType,
    clue_source: clueSource,
    clue_start_seconds: clueStart,
    guess_seconds: guessSec,
    meme_file: `episodes/${episodeId}/${safeMemeFile}`,
    meme_duration_seconds: memeMeta.durationSeconds,
  });

  console.log(
    `${String(num).padStart(2, '0')} | ${path.basename(clueFile)} | ${clueType} | ${clueDur}s | ${safeMemeFile} | ${title} | ${memeMeta.durationSeconds}s | ${warnings.join('; ') || 'OK'}`
  );
}

const outJson = {
  episode_id: episodeId,
  episode_title: existing?.episode_title ?? 'Guess the Meme by Its Original Sound',
  ...(hookArg || existing?.hook ? { hook: hookArg ?? existing.hook } : {}),
  intro_audio: existing?.intro_audio ?? 'intro.mp3',
  countdown_seconds: existing?.countdown_seconds ?? 3,
  gap_seconds: existing?.gap_seconds ?? 1.5,
  rounds,
};

fs.writeFileSync(epJsonPath, JSON.stringify(outJson, null, 2) + '\n');
console.log(`\nWrote ${epJsonPath} (${rounds.length} round(s)).`);
