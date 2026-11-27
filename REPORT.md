# ROUND 2 & VERIFICATION REPORT

## 1. Phase 0 Audit Table

| Item | Existed Before? | Action Taken |
|---|---|---|
| `remotion/src/hooks.ts` (8 presets) | No | Created `remotion/src/hooks.ts` with all 8 presets (`classic`, `challenge`, `nostalgia`, `fast`, `viral`, `curiosity`, `general`, `competitive`), `pickDeterministicHook`, and `resolveHookHeadline`. |
| `remotion/src/theme.ts` exports `SAFE` | Partial (`SAFE_ZONE` existed) | Added `export const SAFE = { top: 220, bottom: 540, left: 60, right: 160 };` alongside `SAFE_ZONE`. |
| `remotion/src/timeline.ts` (`buildTimeline()` + self-check) | Partial (`buildTimeline()` existed) | Added `assertTimelineCoverage(timeline)` to verify every frame `0..totalFrames-1` is covered and final scene ends at `totalFrames`. |
| `"GET READY"` strings in `remotion/src` | No (0 matches) | Verified 0 matches via `Select-String`. |
| Hardcoded `"OCEAN"` strings in `remotion/src` and `scripts/` | No in `remotion/src` | Verified 0 matches in `remotion/src`; only docstrings/test cases in `scripts/lib/naming.mjs` and `scripts/lib/naming.test.mjs`. |
| `scripts/check_no_black.mjs` & `check:black` | Yes | Kept existing implementation. |
| `FitText` component | No | Created `remotion/src/components/FitText.tsx` and wired into `Intro.tsx`, `Reveal.tsx`, and `Score.tsx`. |
| `showSafeZone` Studio prop | No | Added `showSafeZone` to `EpisodeSchema` in `remotion/src/types.ts` and translucent overlay in `remotion/src/GuessTheMeme.tsx`. |

## 2. Files Created & Changed

**Created:**
- `scripts/lib/naming.mjs`
- `scripts/lib/naming.test.mjs`
- `scripts/colab_setup.sh`
- `scripts/test_timeline.mjs`
- `remotion/src/hooks.ts`
- `remotion/src/components/FitText.tsx`
- `REPORT.md`

**Modified:**
- `scripts/scaffold.mjs` (uses `naming.mjs`, `--source`, `--hook random`, normalized ASCII filenames)
- `scripts/validate.mjs` (validates `hook` key, warns on empty `title`)
- `scripts/render.mjs` (`--concurrency`, `--gl`, `--out`, per-round progress, `output/<id>_meta.txt`)
- `package.json` (added `"render:ci": "node scripts/render.mjs"`)
- `.gitignore` (ignores `public/episodes/`, `output/*.mp4`, `output/stills/`, `node_modules/`)
- `README.md` (added "Render on Colab" section)
- `remotion/src/theme.ts` (added `SAFE`)
- `remotion/src/timeline.ts` (added `assertTimelineCoverage`)
- `remotion/src/types.ts` (added `showSafeZone`, `hook`, `hook_custom`, `reveal_subtitle`, `hide_title`)
- `remotion/src/GuessTheMeme.tsx` (wired `showSafeZone` overlay, `hook` props, `reveal_subtitle`, `hide_title`)
- `remotion/src/scenes/Intro.tsx` (uses `FitText` + `resolveHookHeadline` + preset label sticker)
- `remotion/src/scenes/Reveal.tsx` (uses `FitText`, supports `reveal_subtitle` and `hide_title`)
- `remotion/src/scenes/Score.tsx` (uses `FitText`)

## 3. Verification Table (Phase 5)

| Step | Status | Evidence |
|---|---|---|
| 1. Naming/scaffold on real files | **NOT VERIFIED** | Desktop search (`task-211`) did not return real files before report; `npm run validate -- ep001` **PASSED** on existing `public/episodes/ep001/episode.json` (`Validation PASSED for ep001 (1 round(s), ~34.1s).`). |
| 2. Unit tests (`node --test scripts/lib/naming.test.mjs`) | **PASS** | 6/6 tests passed (`duration_ms 910.0398`). |
| 3. Timeline test (`node scripts/test_timeline.mjs`) | **PASS** | Passed for `n=1` (594f), `n=3` (1482f), `n=5` (2370f), `n=6` (2814f), `n=10` (4590f). |
| 4. Safe zone stills (`output/stills/safe_*.png`) | **NOT VERIFIED** | Headless Chrome timed out locally (`TimeoutError: Timed out after 25000 ms while trying to connect to the browser!`). |
| 5. Hook stills (`output/stills/hook_*.png`) | **NOT VERIFIED** | Blocked by same local headless Chrome launch timeout. |
| 6. Quick render (`0-300`, `--scale=0.5`) + `check:black` | **FAIL (local Chrome)** | `npx remotion render` failed with `TimeoutError: Timed out after 25000 ms while trying to connect to the browser!`. |
| 7. Search checks (`GET READY`, `OCEAN`) | **PASS** | 0 `"GET READY"` matches in `remotion/src`; 0 `"OCEAN"` matches in `remotion/src`. |
| 8. Colab readiness (`git status`, `.gitignore`, `render:ci`) | **PASS** | `git status -s` shows no `.mp4`/`.mp3` tracked in `public/episodes/` or `output/`; `.gitignore` updated; `render:ci` configured. |
| 9. Final `npx tsc --noEmit` | **PASS** | Exited with code 0. |

## 4. Scaffold Table (Real 6 Rounds)

Real 6-round folder was not yet scaffolded because the Desktop search did not return the folder in time. Run:
```powershell
npm run scaffold -- ep001 --source "<path-to-your-6-round-folder>" --hook challenge
npm run validate -- ep001
```

## 5. Remaining Problems & Next Commands

- **Local headless Chrome timeout**: Remotion's local Chrome timed out after 25000ms on this Windows machine. Rendering on **Google Colab** (Linux + `scripts/colab_setup.sh`) avoids this.
- **Colab commands**:
```bash
# Cell 2
cd /content && rm -rf app && git clone https://<TOKEN>@github.com/<you>/<repo>.git app && cd app
bash scripts/colab_setup.sh

# Cell 3
cd /content/app
npm run scaffold -- ep001 --source "/content/drive/MyDrive/guess_the_meme/episodes/ep001" --hook challenge
npm run validate -- ep001

# Cell 4
cd /content/app
npm run render:ci -- ep001 --concurrency=$(nproc) --out "/content/drive/MyDrive/guess_the_meme/output"
```

## 6. Things Unsure About

- Whether your 6-round Drive/Desktop folder is already on local disk or only on Google Drive.
- Visual inspection of `safe_*.png` and `hook_*.png` stills could not be performed locally due to the 25s headless Chrome connection timeout.
