import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEpisodeFilename, safeAsciiName, slugToTitle } from './naming.mjs';

test('parses 1_original.mp4', () => {
  const res = parseEpisodeFilename('1_original.mp4');
  assert.deepEqual(res, {
    round: 1,
    kind: 'original',
    slug: '',
    ext: 'mp4',
    mediaType: 'video',
    file: '1_original.mp4',
  });
  assert.equal(safeAsciiName(res.round, res.kind, res.slug, res.ext), '01_original.mp4');
});

test('parses "1_ original.mp3" with space after underscore', () => {
  const res = parseEpisodeFilename('1_ original.mp3');
  assert.deepEqual(res, {
    round: 1,
    kind: 'original',
    slug: '',
    ext: 'mp3',
    mediaType: 'audio',
    file: '1_ original.mp3',
  });
});

test('parses 1_original_ocean.mp4', () => {
  const res = parseEpisodeFilename('1_original_ocean.mp4');
  assert.deepEqual(res, {
    round: 1,
    kind: 'original',
    slug: 'ocean',
    ext: 'mp4',
    mediaType: 'video',
    file: '1_original_ocean.mp4',
  });
});

test('parses "1_Ocean Meme.mp4" and preserves title', () => {
  const res = parseEpisodeFilename('1_Ocean Meme.mp4');
  assert.deepEqual(res, {
    round: 1,
    kind: 'meme',
    slug: 'Ocean Meme',
    ext: 'mp4',
    mediaType: 'video',
    file: '1_Ocean Meme.mp4',
  });
  assert.equal(slugToTitle(res.slug, res.round), 'Ocean Meme');
  assert.equal(safeAsciiName(res.round, res.kind, res.slug, res.ext), '01_meme_ocean-meme.mp4');
});

test('handles empty or "meme" slug as Round NN', () => {
  const res = parseEpisodeFilename('3_meme.mp4');
  assert.equal(res.kind, 'meme');
  assert.equal(res.slug, '');
  assert.equal(slugToTitle(res.slug, res.round), 'Round 03');
});

test('handles missing original, two originals, three files, and number gaps (1, 2, 4)', () => {
  const files = [
    '1_Ocean Meme.mp4', // missing original
    '2_original.mp3',
    '2_original.mp4', // two originals (video preferred)
    '2_Surprised Pikachu.mp4',
    '4_original.mp4',
    '4_meme_cat.mp4',
    '4_extra_meme.mp4', // three files in group 4
  ];

  const parsed = files.map(parseEpisodeFilename).filter(Boolean);
  const groups = new Map();
  for (const item of parsed) {
    if (!groups.has(item.round)) groups.set(item.round, []);
    groups.get(item.round).push(item);
  }

  assert.deepEqual([...groups.keys()].sort((a, b) => a - b), [1, 2, 4]);
  assert.equal(groups.get(1).some((x) => x.kind === 'original'), false);
  assert.equal(groups.get(2).filter((x) => x.kind === 'original').length, 2);
  assert.equal(groups.get(4).length, 3);
});
