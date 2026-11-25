# Guess the Meme by Its Original Sound — Starter Project

This is a reusable, semi-manual video project. You provide two source files per round: (1) the original-source video, whose audio is used as the guessing clue, and (2) the meme video, shown in full during the reveal. The project supplies the title treatment, audio visualizer animation, countdown, tick effects, reveal treatment, backgrounds, typography, and 9:16 composition.

## First sample files

- `assets/original_sounds/ocean_meme_original.mp4` — source for the clue audio. The guessing section uses only audio from **00:15 to 00:25**; its video is never displayed during the guessing section.
- `assets/memes/ocean_meme.mp4` — the full **11.216-second** reveal video.
- `assets/intro_audio/intro.mp3` — the short series intro sting.

The sample also contains `output/episode_001.mp4`, a rendered 1080x1920 preview.

## Remotion project (main reusable template)

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run studio
```

Render:

```bash
npm run render
```

The composition is `GuessTheMeme`, 1080x1920, 30 fps. Source assets are in the root `public/` folder because that is Remotion's default public directory.

## Reuse for another round

1. Put the original-source video in `public/original_sounds/`.
2. Put the matching meme reveal video in `public/memes/`.
3. Update the source paths and clue timing in `remotion/src/GuessTheMeme.tsx` (the first sample uses `ocean_meme_original.mp4`, from 15s to 25s, and `ocean_meme.mp4`).
4. Update the composition duration in `remotion/src/Root.tsx` if the intro, clue, countdown, or reveal duration changes.
5. Run `npm run render`.

The source and reveal are separate inputs. The original source contributes audio only during the guessing stage. The meme video is shown in full during the answer reveal.

## Sample timing

- Intro sting: about 2.33 seconds
- Original audio clue: starts at 15.0 seconds and lasts 10 seconds
- Countdown: 3 seconds (3, 2, 1)
- Reveal: full meme video (about 11.22 seconds)
- Total: about 26.54 seconds

## FFmpeg preview renderer

`scripts/render.py` is included as an alternate quick preview renderer. It requires Python 3 and FFmpeg on PATH. Run `python scripts/render.py`.

## Rights note

Only publish audio/video you own or have permission to use. A short excerpt, a meme format, or the presence of a YouTube Content ID claim does not itself grant permission.
