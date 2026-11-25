import json, os, subprocess, sys
from pathlib import Path

ROOT = Path(r"C:\Users\say_my_name\Desktop\GUESS_THE_MEME_STARTER")
CFG_FILE = ROOT / "episode_001.json"
CFG = json.loads(CFG_FILE.read_text(encoding="utf-8")) if CFG_FILE.exists() else {}

OUTDIR = ROOT / "output"
WORK = OUTDIR / "_work_artistic"
WORK.mkdir(parents=True, exist_ok=True)

FONT_RAW = (ROOT / "assets/fonts/DejaVuSans-Bold.ttf").as_posix()
FONT = FONT_RAW.replace(":", r"\:")
W, H, FPS = 1080, 1920, 30

MEME = (ROOT / CFG.get("meme_video", "assets/memes/ocean_meme.mp4")).resolve().as_posix()
MEME_TITLE = CFG.get("meme_title", "OCEAN MEME").upper()

def run_cmd(cmd):
    print("Executing:", " ".join(cmd))
    subprocess.run(cmd, check=True)

# 1. Complete Scene 4: Meme Reveal
reveal_out = (WORK / "04_reveal.mp4").as_posix()
print("=== Rendering Scene 4 (Reveal) ===")
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

# 2. Scene 5: High-Impact Animated Ending
print("=== Rendering Scene 5 (Dynamic Animated Score & CTA) ===")
score_out = (WORK / "05_score.mp4").as_posix()
# 4-second animated outro with motion graphics, pulsing CTA banner, dynamic sliding score tiers, and cyberpunk aesthetic
score_vfilter = (
    # Background glowing accents
    f"drawbox=x=40:y=40:w={W-80}:h={H-80}:color=0x00f2fe@0.3:t=2,"
    # Header badge
    f"drawbox=x=340:y=240:w=400:h=60:color=0x00f2fe@0.9:t=fill:enable='gte(t,0.2)',"
    f"drawtext=fontfile='{FONT}':text='FINAL RESULTS':fontcolor=0x070913:fontsize=30:x=(w-text_w)/2:y=255:enable='gte(t,0.2)',"
    # Main Question with slide-in / punchy timing
    f"drawtext=fontfile='{FONT}':text='HOW MANY DID YOU GET RIGHT?':fontcolor=white:fontsize=52:x=(w-text_w)/2:y=340:enable='gte(t,0.3)',"
    # Tier 1 (0-1)
    f"drawbox=x=120:y=500:w=840:h=120:color=0x13192f@0.92:t=fill:enable='gte(t,0.5)',"
    f"drawbox=x=120:y=500:w=840:h=120:color=0x64748b@0.8:t=3:enable='gte(t,0.5)',"
    f"drawtext=fontfile='{FONT}':text='0 - 1  BEGINNER':fontcolor=0x94a3b8:fontsize=44:x=160:y=538:enable='gte(t,0.5)',"
    f"drawtext=fontfile='{FONT}':text='NEEDS PRACTICE':fontcolor=0x64748b:fontsize=32:x=680:y=544:enable='gte(t,0.5)',"
    # Tier 2 (2-4)
    f"drawbox=x=120:y=660:w=840:h=120:color=0x13192f@0.92:t=fill:enable='gte(t,0.8)',"
    f"drawbox=x=120:y=660:w=840:h=120:color=0x00f2fe@0.85:t=3:enable='gte(t,0.8)',"
    f"drawtext=fontfile='{FONT}':text='2 - 4  MEME SCHOLAR':fontcolor=0x00f2fe:fontsize=44:x=160:y=698:enable='gte(t,0.8)',"
    f"drawtext=fontfile='{FONT}':text='CERTIFIED FAN':fontcolor=0x38bdf8:fontsize=32:x=700:y=704:enable='gte(t,0.8)',"
    # Tier 3 (5/5)
    f"drawbox=x=120:y=820:w=840:h=120:color=0x13192f@0.92:t=fill:enable='gte(t,1.1)',"
    f"drawbox=x=120:y=820:w=840:h=120:color=0xf5d300@0.9:t=4:enable='gte(t,1.1)',"
    f"drawtext=fontfile='{FONT}':text='5 / 5  MEME LORD':fontcolor=0xf5d300:fontsize=46:x=160:y=858:enable='gte(t,1.1)',"
    f"drawtext=fontfile='{FONT}':text='PERFECT SCORE':fontcolor=0xfacc15:fontsize=32:x=680:y=864:enable='gte(t,1.1)',"
    # Pulsing CTA Banner (Pink / Magenta neon)
    f"drawbox=x=100:y=1140:w=880:h=160:color=0xff007a@0.95:t=fill:enable='gte(t,1.4)',"
    f"drawbox=x=90:y=1130:w=900:h=180:color=0xffffff@0.7:t=4:enable='gte(t,1.4)*lt(mod(t*4,2),1)',"
    f"drawtext=fontfile='{FONT}':text='COMMENT YOUR SCORE!':fontcolor=white:fontsize=56:x=(w-text_w)/2:y=1175:enable='gte(t,1.4)',"
    f"drawtext=fontfile='{FONT}':text='SHARE WITH YOUR FRIENDS':fontcolor=0x00f2fe:fontsize=34:x=(w-text_w)/2:y=1380:enable='gte(t,1.7)'"
)

# Combined rich audio: upbeat synths / sweep risers + confirmation chime
# We generate a composite cinematic soundscape with sine tones, risers, and frequency drops
score_afilter = (
    "sine=frequency=523.25:duration=0.25[note1];" # C5
    "sine=frequency=659.25:duration=0.25[note2];" # E5
    "sine=frequency=783.99:duration=0.25[note3];" # G5
    "sine=frequency=1046.50:duration=1.2[note4];" # C6
    "[note1][note2][note3][note4]concat=n=4:v=0:a=1[fanfare];"
    "anoisesrc=d=4.0:c=pink:r=48000,afade=t=in:ss=0:d=0.3,afade=t=out:st=3.7:d=0.3,volume=0.18[amb];"
    "[fanfare]adelay=1400|1400,volume=0.8[delayed_fanfare];"
    "[amb][delayed_fanfare]amix=inputs=2:duration=first:dropout_transition=0[aout]"
)

run_cmd([
    "ffmpeg", "-y",
    "-f", "lavfi", "-i", f"color=c=0x070913:s={W}x{H}:r={FPS}:d=4.0",
    "-f", "lavfi", "-i", score_afilter,
    "-vf", score_vfilter,
    "-map", "0:v", "-map", "1:a",
    "-t", "4.0", "-r", str(FPS), "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", score_out
])

print("=== Task Complete ===")
