#!/usr/bin/env python3
"""Resume renderer from Scene 5 (Score outro) and final concatenation.
Does NOT re-render Scenes 1-4.
"""
import json, os, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CFG_FILE = ROOT / "episode_001.json"
CFG = json.loads(CFG_FILE.read_text(encoding="utf-8")) if CFG_FILE.exists() else {}

OUTDIR = ROOT / "output"
WORK = OUTDIR / "_work_artistic"
WORK.mkdir(parents=True, exist_ok=True)

FONT_RAW = (ROOT / "assets/fonts/DejaVuSans-Bold.ttf").as_posix()
FONT = FONT_RAW.replace(":", "\\:")
W, H, FPS = 1080, 1920, 30

intro_out = (WORK / "01_intro.mp4").as_posix()
clue_out = (WORK / "02_guess.mp4").as_posix()
count_files = [(WORK / f"03_count_{num}.mp4").as_posix() for num in [3, 2, 1]]
reveal_out = (WORK / "04_reveal.mp4").as_posix()
score_out = (WORK / "05_score.mp4").as_posix()

def run_cmd(cmd):
    print(" ".join(cmd))
    subprocess.run(cmd, check=True)

print("=== VERIFYING PREVIOUS SEGMENTS ===")
required_segments = [intro_out, clue_out, *count_files, reveal_out]
for s in required_segments:
    if not os.path.exists(s) or os.path.getsize(s) == 0:
        raise FileNotFoundError(f"Missing required prior segment: {s}")
    print(f"  [EXISTS] {s} ({os.path.getsize(s)} bytes)")

print("\n=== RESUMING AT SCENE 5: SCORE & CALL TO ACTION (3s) ===")
score_filter = (
    f"drawtext=fontfile='{FONT}':text='HOW MANY DID YOU GET RIGHT?':fontcolor=white:fontsize=56:x=(w-text_w)/2:y=420,"
    f"drawbox=x=120:y=560:w=840:h=110:color=0x151c36@0.9:t=fill,"
    f"drawbox=x=120:y=560:w=840:h=110:color=0x94a3b8@0.8:t=3,"
    f"drawtext=fontfile='{FONT}':text='0/5  BEGINNER?':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=595,"
    f"drawbox=x=120:y=720:w=840:h=110:color=0x151c36@0.9:t=fill,"
    f"drawbox=x=120:y=720:w=840:h=110:color=0x00f2fe@0.8:t=3,"
    f"drawtext=fontfile='{FONT}':text='3/5  MEME FAN!':fontcolor=0x00f2fe:fontsize=42:x=(w-text_w)/2:y=755,"
    f"drawbox=x=120:y=880:w=840:h=110:color=0x151c36@0.9:t=fill,"
    f"drawbox=x=120:y=880:w=840:h=110:color=0xf5d300@0.8:t=3,"
    f"drawtext=fontfile='{FONT}':text='5/5  MEME GURU!!':fontcolor=0xf5d300:fontsize=42:x=(w-text_w)/2:y=915,"
    f"drawbox=x=140:y=1120:w=800:h=120:color=0xff007a@0.95:t=fill,"
    f"drawtext=fontfile='{FONT}':text='COMMENT YOUR SCORE!':fontcolor=white:fontsize=50:x=(w-text_w)/2:y=1155"
)
run_cmd([
    "ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=0x070913:s={W}x{H}:r={FPS}:d=3.0",
    "-f", "lavfi", "-i", "anoisesrc=d=3.0:c=pink:r=48000,afade=t=in:ss=0:d=0.2,volume=0.3",
    "-vf", score_filter,
    "-map", "0:v", "-map", "1:a",
    "-t", "3", "-r", str(FPS), "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k", score_out
])

print("\n=== SCENE 6: CONCATENATING ALL SEGMENTS ===")
all_segments = [intro_out, clue_out, *count_files, reveal_out, score_out]
concat_file = WORK / "concat_list.txt"
concat_file.write_text("".join(f"file '{p}'\n" for p in all_segments), encoding="utf-8")

final_output = OUTDIR / "episode_001_artistic.mp4"
run_cmd([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_file.as_posix(),
    "-vf", f"fps={FPS},format=yuv420p",
    "-af", "aresample=async=1:first_pts=0",
    "-c:v", "libx264", "-preset", "fast", "-crf", "20",
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
    final_output.as_posix()
])

print(f"\n🎉 MASTER RENDER COMPLETE: {final_output}")
