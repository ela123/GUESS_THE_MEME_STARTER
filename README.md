# Guess the Meme by Its Original Sound

A 1080×1920, 30fps multi-round vertical quiz video template built with Remotion.

## Folder Convention

Place episode media in `public/episodes/<episode_id>/`:
```
public/episodes/ep001/
  01_original.mp4            # clue: video OR audio (.mp4 .mov .webm .mp3 .wav .m4a ...)
  01_meme_ocean-meme.mp4     # full reveal video; slug after _meme_ becomes "Ocean Meme"
```

## 3-Command Workflow

```bash
npm run scaffold -- ep001 --clue-seconds 10 --clue-start 15
npm run validate -- ep001
npm run render -- ep001
```

Preview interactively in Remotion Studio:
```bash
npm run studio
```

## Render on Colab

1. Mount Google Drive and clone the repo.
2. Run `bash scripts/colab_setup.sh` to install Chrome system dependencies, Node 20 (if missing), `npm ci`, and `npx remotion browser ensure`.
3. Scaffold from your Drive episode folder:
   ```bash
   npm run scaffold -- ep001 --source "/content/drive/MyDrive/guess_the_meme/episodes/ep001"
   ```
4. Render directly to Drive:
   ```bash
   npm run render:ci -- ep001 --out "/content/drive/MyDrive/guess_the_meme/output"
   ```
   (Pass `--gl swangle` if WebGL fails on CPU-only machines.)
