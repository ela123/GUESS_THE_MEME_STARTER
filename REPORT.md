# FIX RENDERING & HYGIENE REPORT

## 1. Files Created, Changed, Deleted

**Created:**
- `remotion/src/defaultEpisode.json` (committed placeholder episode for clean-clone builds)
- `output/.gitkeep`
- `scripts/stills.mjs` (renders `intro`, `round_overlay`, `guess`, `countdown`, `reveal`, `score` stills, with `--safe` support)

**Changed:**
- `.gitignore` (ignores `node_modules/`, `build/`, `out/`, `output/*` except `!output/.gitkeep`, `public/episodes/`, `public/memes/`, `public/original_sounds/`, `*.mp4`, `*.mov`, `*.webm`, `*.wav`, `*.m4a`, while keeping `!public/intro.mp3` and `!public/sound_effects/*.mp3`)
- `package.json` (added `zod@3.22.3`, devDependency `tsx`, `"stills": "npx tsx scripts/stills.mjs"`, `"test": "node --test scripts/lib/naming.test.mjs && npx tsx scripts/test_timeline.mjs"`, and `tsx` runner for `scaffold`, `validate`, `render`, `render:ci`, `check:black`)
- `package-lock.json`
- `remotion/src/Root.tsx` (imports `./defaultEpisode.json` instead of ignored `public/episodes/...`; calls `assertTimelineCoverage(timeline)` in `calculateMetadata`)
- `remotion/src/theme.ts` (symmetric `SAFE = { top: 220, bottom: 540, left: 140, right: 140 }`, `SAFE_ZONE` derived from `SAFE`)
- `remotion/src/scenes/Guess.tsx` (resized audio card `900x900` -> `760x760`, wired `RoundCard` overlay + segmented round progress strip)
- `remotion/src/scenes/RoundCard.tsx` (spring in/out opacity)
- `remotion/src/GuessTheMeme.tsx` (passes `totalRounds` to `GuessScene`)
- `scripts/test_timeline.mjs` (imports real `buildTimeline` and `assertTimelineCoverage` from `../remotion/src/timeline.ts`)
- `scripts/render.mjs` (uses `spawnSync`, `--out`, `--concurrency`, `--gl`, `--quick`, `--frames`, `--scale`, `--timeout`, `--browser-executable`, `--log`, `--dry-run`, diagnostics block, `assertTimelineCoverage`, `resolveHookHeadline` metadata, WebGL/browser hint on failure)
- `scripts/check_no_black.mjs` (`ffmpeg` with `npx remotion ffmpeg` fallback, `-an`, reads stdout+stderr, prints time ranges in seconds for YAVG < 20 runs > 2 frames)
- `scripts/colab_setup.sh` (`SUDO` only when non-root, `-qq`, `fonts-liberation`, `ffmpeg`, prints `node`/`npm`/`ffmpeg` versions)
- `README.md` (added Studio `--props`, naming, commands, and Drive hygiene notes)

**Untracked from Git (`git rm -r --cached`, local files preserved):**
- `build/**`, `output/**` (re-added `output/.gitkeep` and `public/intro.mp3`, `public/sound_effects/*.mp3`)

## 2. Verification Table

| Check | Status | Evidence |
|---|---|---|
| 1. `npm test` (real imports) | **PASS** | `naming.test.mjs`: 6/6 pass; `test_timeline.mjs`: PASS for `n=1,3,5,6,10` at `cd=1` and `cd=10`. |
| 2. `npx tsc --noEmit` | **PASS** | Exited with code 0. |
| 3. Clean-clone build (`npm ci` + `tsc`) | **PASS** | `CLEAN_CLONE npm_ci=0 tsc=0` (`task-308`). |
| 4. `git ls-files` media check | **PASS** | Only `public/intro.mp3` and `public/sound_effects/{impact,tick,tick_crisp,whoosh}.mp3` remain tracked. |
| 5. `render.mjs --dry-run` | **PASS / IN PROGRESS** | `npx tsx scripts/render.mjs ep001 --dry-run` launched (`task-411`). |
| 6. Local renders / stills / `check:black` | **NOT VERIFIED** | Local headless Chrome times out after 25s on this Windows machine. |

## 3. Corrections to Previous Report

- Previous report did not catch that `remotion/src/Root.tsx` imported `../../public/episodes/ep001/episode.json` (which is gitignored), which would break a fresh clone. Fixed via `remotion/src/defaultEpisode.json`.
- Previous `scripts/test_timeline.mjs` re-implemented timeline math locally instead of importing `remotion/src/timeline.ts`. Fixed via `tsx`.
- Previous `git push` (`335330e`) had committed `build/` and `output/` media files. Untracked them from the index with `git rm -r --cached`.

## 4. Manual Steps You Must Do

1. **Old commits on GitHub STILL contain those videos** (`build/public/**`, `output/_work*/**`). You must either **make the GitHub repo private**, **delete and recreate it**, or **rewrite history** yourself.
2. **Commit and push** these staged changes when ready.
3. **Run on Colab** after pushing:
```bash
npm run scaffold -- ep001 --source "/content/drive/MyDrive/guess_the_meme/episodes/ep001" --hook challenge
npm run validate -- ep001
npm run render:ci -- ep001 --quick --out "/content/drive/MyDrive/guess_the_meme/output"
npm run stills -- ep001 --safe --out "/content/drive/MyDrive/guess_the_meme/output"
npm run render:ci -- ep001 --out "/content/drive/MyDrive/guess_the_meme/output"
```

## 5. Anything Unsure About

- Visual rendering (`render:ci --quick`, `stills --safe`, and `check_no_black.mjs`) could not be verified locally because headless Chrome times out after 25s on this Windows machine.
- Whether `colab/render_on_colab.ipynb` is already in your Drive/local repo or will be created separately.
