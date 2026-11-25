#!/usr/bin/env python3
"""Render one Guess the Meme episode with FFmpeg.

Input convention:
- original_sounds/<name>.(mp4|mov|mkv|webm): source video; audio is extracted
- memes/<name>.(mp4|mov|mkv|webm): full reveal video
- intro_audio/intro.mp3: optional short series sting

Edit episode_001.json to change source paths and timing.
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CFG = json.loads((ROOT / "episode_001.json").read_text(encoding="utf-8"))
OUTDIR = ROOT / "output"
WORK = OUTDIR / "_work"
WORK.mkdir(parents=True, exist_ok=True)
FONT = ROOT / "assets/fonts/DejaVuSans-Bold.ttf"
W, H, FPS = 1080, 1920, 30

def run(args):
    print(" ".join(map(str, args)))
    subprocess.run(list(map(str, args)), check=True)

def q(path):
    return str((ROOT / path).resolve())

original = q(CFG["original_video"])
meme = q(CFG["meme_video"])
intro = q(CFG["intro_audio"])
start = float(CFG.get("original_audio_start_seconds", 15))
clue_dur = float(CFG.get("guess_audio_duration_seconds", 10))
countdown = int(CFG.get("countdown_seconds", 3))
intro_out = WORK / "01_intro.mp4"
clue_out = WORK / "02_listen.mp4"
countdown_files = []
reveal_out = WORK / "04_reveal.mp4"

# 1) Series intro / sting.
intro_dur = 2.325
run([
    "ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=0x080d1b:s={W}x{H}:r={FPS}:d={intro_dur}",
    "-i", intro,
    "-vf", f"drawbox=x=70:y=590:w=940:h=730:color=0x111d35@0.92:t=fill,"
           f"drawbox=x=70:y=590:w=940:h=8:color=0x22d3ee@1:t=fill,"
           f"drawtext=fontfile='{FONT}':text='GUESS THE MEME':fontcolor=white:fontsize=92:x=(w-text_w)/2:y=790,"
           f"drawtext=fontfile='{FONT}':text='BY ITS ORIGINAL SOUND':fontcolor=0x22d3ee:fontsize=48:x=(w-text_w)/2:y=930,"
           f"drawtext=fontfile='{FONT}':text='ROUND 01':fontcolor=0xffd166:fontsize=44:x=(w-text_w)/2:y=1080",
    "-t", str(intro_dur), "-r", str(FPS), "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "160k", "-shortest", str(intro_out)
])

# 2) Hide the meme and play only a 10-second audio clue from source time 00:15.
run([
    "ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=0x080d1b:s={W}x{H}:r={FPS}:d={clue_dur}",
    "-ss", str(start), "-t", str(clue_dur), "-i", original,
    "-filter_complex",
    f"[0:v]drawbox=x=70:y=420:w=940:h=1080:color=0x111d35@0.92:t=fill,"
    f"drawtext=fontfile='{FONT}':text='LISTEN CAREFULLY':fontcolor=white:fontsize=68:x=(w-text_w)/2:y=570,"
    f"drawtext=fontfile='{FONT}':text='WHAT MEME IS THIS?':fontcolor=0x22d3ee:fontsize=48:x=(w-text_w)/2:y=700[base];"
    f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo,showwaves=s=900x260:mode=cline:rate={FPS}:colors=0x22d3ee[wave];"
    f"[base][wave]overlay=(W-w)/2:900[v]",
    "-map", "[v]", "-map", "1:a", "-t", str(clue_dur), "-r", str(FPS),
    "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", str(clue_out)
])

# 3) Countdown, one second per number, with a short electronic tick.
for idx, number in enumerate(range(countdown, 0, -1), start=1):
    p = WORK / f"03_count_{number}.mp4"
    countdown_files.append(p)
    run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=0x080d1b:s={W}x{H}:r={FPS}:d=1",
        "-f", "lavfi", "-i", "sine=frequency=880:sample_rate=48000:duration=0.14",
        "-vf", f"drawbox=x=70:y=500:w=940:h=920:color=0x111d35@0.95:t=fill,"
               f"drawtext=fontfile='{FONT}':text='YOUR GUESS IN':fontcolor=white:fontsize=58:x=(w-text_w)/2:y=650,"
               f"drawtext=fontfile='{FONT}':text='{number}':fontcolor=0xffd166:fontsize=360:x=(w-text_w)/2:y=790,"
               f"drawtext=fontfile='{FONT}':text=' seconds':fontcolor=0x22d3ee:fontsize=52:x=(w-text_w)/2:y=1200",
        "-af", "apad=pad_dur=0.86", "-t", "1", "-r", str(FPS), "-c:v", "libx264", "-preset", "veryfast",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", str(p)
    ])

# 4) Show the complete meme video for the reveal. Keep its original audio.
run([
    "ffmpeg", "-y", "-i", meme,
    "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
           f"drawbox=x=35:y=55:w=1010:h=145:color=0x080d1b@0.75:t=fill:enable='lt(t,1.8)',"
           f"drawtext=fontfile='{FONT}':text='ANSWER REVEALED':fontcolor=0xffd166:fontsize=58:x=(w-text_w)/2:y=95:enable='lt(t,1.8)'",
    "-r", str(FPS), "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "160k", "-shortest", str(reveal_out)
])

# Concat all segments without re-encoding; all segments are 1080x1920, 30fps, H.264/AAC.
segments = [intro_out, clue_out, *countdown_files, reveal_out]
concat_list = WORK / "concat.txt"
concat_list.write_text("".join(f"file '{p.as_posix()}'\n" for p in segments), encoding="utf-8")
output = ROOT / CFG.get("output", "output/episode_001.mp4")
output.parent.mkdir(parents=True, exist_ok=True)
run(["ffmpeg", "-y", "-fflags", "+genpts", "-f", "concat", "-safe", "0", "-i", str(concat_list), "-vf", "fps=30,format=yuv420p", "-af", "aresample=async=1:first_pts=0", "-r", "30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(output)])
print(f"\nDONE: {output}")
