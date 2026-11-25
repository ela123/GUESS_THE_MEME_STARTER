#!/usr/bin/env python3
"""High-Energy, Artistic FFmpeg Renderer for 'Guess The Meme By Original Sound'.
Synchronously displays the actual original source video with dynamic cyber HUD,
integrated audio visualizer, explosive kinetic countdown, full meme reveal,
and interactive score outro screen.
"""

import json, os, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CFG_FILE = ROOT / "episode_001.json"
CFG = json.loads(CFG_FILE.read_text(encoding="utf-8")) if CFG_FILE.exists() else {}

OUTDIR = ROOT / "output"
WORK = OUTDIR / "_work_artistic"
WORK.mkdir(parents=True, exist_ok=True)
# Windows path escaping for ffmpeg filter colons
FONT_RAW = (ROOT / "assets/fonts/DejaVuSans-Bold.ttf").as_posix()
FONT = FONT_RAW.replace(":", "\\:")
W, H, FPS = 1080, 1920, 30

def q(p):
    return (ROOT / p).resolve().as_posix()

ORIGINAL = q(CFG.get("original_video", "assets/original_sounds/ocean_meme_original.mp4"))
MEME = q(CFG.get("meme_video", "assets/memes/ocean_meme.mp4"))
INTRO_AUDIO = q(CFG.get("intro_audio", "assets/intro_audio/intro.mp3"))
START_SEC = float(CFG.get("original_audio_start_seconds", 15))
CLUE_DUR = float(CFG.get("guess_audio_duration_seconds", 10))
MEME_TITLE = CFG.get("meme_title", "OCEAN MEME").upper()

def run_cmd(cmd):
    print(" ".join(cmd))
    subprocess.run(cmd, check=True)

print("=== 1. SCENE 1: KINETIC INTRO (1.5s) ===")
intro_out = (WORK / "01_intro.mp4").as_posix()
intro_filter = (
    f"drawbox=x=140:y=540:w=800:h=820:color=0x10162a@0.9:t=fill,"
    f"drawbox=x=140:y=540:w=800:h=820:color=0x00f2fe@0.8:t=4,"
    f"drawbox=x=390:y=620:w=300:h=70:color=0xff007a@0.9:t=fill,"
    f"drawtext=fontfile='{FONT}':text='ROUND 01':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=638,"
    f"drawtext=fontfile='{FONT}':text='GUESS THE MEME!':fontcolor=white:fontsize=84:x=(w-text_w)/2:y=760,"
    f"drawtext=fontfile='{FONT}':text='BY ITS ORIGINAL SOUND':fontcolor=0x00f2fe:fontsize=44:x=(w-text_w)/2:y=890,"
    f"drawbox=x=240:y=990:w=600:h=80:color=0xf5d300@0.2:t=fill,"
    f"drawtext=fontfile='{FONT}':text='HEAR IT • GUESS IT':fontcolor=0xf5d300:fontsize=38:x=(w-text_w)/2:y=1012"
)
run_cmd([
    "ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=0x070913:s={W}x{H}:r={FPS}:d=1.5",
    "-i", INTRO_AUDIO,
    "-vf", intro_filter,
    "-map", "0:v", "-map", "1:a",
    "-t", "1.5", "-r", str(FPS), "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", intro_out
])

print("=== 2. SCENE 2: GUESSING STAGE (10s) WITH VISIBLE ORIGINAL VIDEO & AUDIO ===")
clue_out = (WORK / "02_guess.mp4").as_posix()
guess_filter = (
    f"[0:v]drawbox=x=60:y=500:w=960:h=580:color=0x10162a@0.9:t=fill,"
    f"drawbox=x=60:y=500:w=960:h=580:color=0x00f2fe@0.8:t=4,"
    f"drawbox=x=390:y=120:w=300:h=60:color=0xff007a@0.9:t=fill,"
    f"drawtext=fontfile='{FONT}':text='ROUND 01':fontcolor=white:fontsize=32:x=(w-text_w)/2:y=134,"
    f"drawtext=fontfile='{FONT}':text='LISTEN CAREFULLY!':fontcolor=white:fontsize=64:x=(w-text_w)/2:y=230,"
    f"drawtext=fontfile='{FONT}':text='DO YOU RECOGNIZE THIS SOUND?':fontcolor=0x00f2fe:fontsize=36:x=(w-text_w)/2:y=330,"
    f"drawbox=x=80:y=520:w=320:h=46:color=0xff007a@0.9:t=fill,"
    f"drawtext=fontfile='{FONT}':text='ORIGINAL SOURCE CLUE':fontcolor=white:fontsize=22:x=95:y=534[canvas];"
    f"[1:v]scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:black[vid];"
    f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo,showwaves=s=920x180:mode=cline:rate={FPS}:colors=0x00f2fe|0xff007a[wave];"
    f"[canvas][vid]overlay=60:520[with_vid];"
    f"[with_vid][wave]overlay=(W-w)/2:1180[with_wave];"
    f"[with_wave]drawbox=x=120:y=1430:w=840:h=90:color=0x151c36@0.85:t=fill,"
    f"drawtext=fontfile='{FONT}':text='WHAT MEME WAS MADE FROM THIS?':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=1458[v]"
)
run_cmd([
    "ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=0x070913:s={W}x{H}:r={FPS}:d={CLUE_DUR}",
    "-ss", str(START_SEC), "-t", str(CLUE_DUR), "-i", ORIGINAL,
    "-filter_complex", guess_filter,
    "-map", "[v]", "-map", "1:a",
    "-t", str(CLUE_DUR), "-r", str(FPS), "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", clue_out
])

print("=== 3. SCENE 3: KINETIC 3-SECOND COUNTDOWN ===")
count_files = []
for num in [3, 2, 1]:
    cp = (WORK / f"03_count_{num}.mp4").as_posix()
    count_files.append(cp)
    count_filter = (
        f"drawbox=x=140:y=480:w=800:h=960:color=0x10162a@0.95:t=fill,"
        f"drawbox=x=140:y=480:w=800:h=960:color=0xf5d300@0.8:t=6,"
        f"drawtext=fontfile='{FONT}':text='CAN YOU GUESS IT?':fontcolor=white:fontsize=64:x=(w-text_w)/2:y=620,"
        f"drawtext=fontfile='{FONT}':text='{num}':fontcolor=0xf5d300:fontsize=360:x=(w-text_w)/2:y=760,"
        f"drawtext=fontfile='{FONT}':text='SECONDS LEFT':fontcolor=0x00f2fe:fontsize=44:x=(w-text_w)/2:y=1220"
    )
    run_cmd([
        "ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=0x070913:s={W}x{H}:r={FPS}:d=1",
        "-f", "lavfi", "-i", "sine=frequency=1000:sample_rate=48000:duration=0.15",
        "-vf", count_filter,
        "-map", "0:v", "-map", "1:a",
        "-t", "1", "-r", str(FPS), "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k", cp
    ])

print("=== 4. SCENE 4: MEME REVEAL (FULL MEME VIDEO) ===")
reveal_out = (WORK / "04_reveal.mp4").as_posix()
reveal_filter = (
    f"[0:v]scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:black[base];"
    f"[base]drawbox=x=100:y=800:w=880:h=220:color=0xff007a@0.95:t=fill:enable='lt(t,1.4)',"
    f"drawtext=fontfile='{FONT}':text='THE ANSWER IS...':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=870:enable='lt(t,1.4)',"
    f"drawbox=x=60:y=70:w=960:h=120:color=0x070913@0.88:t=fill:enable='gte(t,1.2)',"
    f"drawbox=x=60:y=70:w=960:h=120:color=0x00f2fe@0.8:t=3:enable='gte(t,1.2)',"
    f"drawtext=fontfile='{FONT}':text='ANSWER REVEALED':fontcolor=0x00f2fe:fontsize=36:x=100:y=112:enable='gte(t,1.2)',"
    f"drawtext=fontfile='{FONT}':text='{MEME_TITLE}':fontcolor=0xf5d300:fontsize=36:x=w-text_w-100:y=112:enable='gte(t,1.2)'[v]"
)
run_cmd([
    "ffmpeg", "-y", "-i", MEME,
    "-filter_complex", reveal_filter,
    "-map", "[v]", "-map", "0:a",
    "-r", str(FPS), "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", reveal_out
])

print("=== 5. SCENE 5: SCORE & CALL TO ACTION (3s) ===")
score_out = (WORK / "05_score.mp4").as_posix()
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

print("=== 6. CONCATENATE ALL SEGMENTS ===")
all_segments = [intro_out, clue_out, *count_files, reveal_out, score_out]
concat_file = WORK / "concat_list.txt"
concat_file.write_text("".join(f"file '{p}'\n" for p in all_segments), encoding="utf-8")

final_output = OUTDIR / "episode_001.mp4"
run_cmd([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_file.as_posix(),
    "-vf", f"fps={FPS},format=yuv420p",
    "-af", "aresample=async=1:first_pts=0",
    "-c:v", "libx264", "-preset", "fast", "-crf", "20",
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
    final_output.as_posix()
])

print(f"\n🎉 MASTER RENDER COMPLETE: {final_output}")
