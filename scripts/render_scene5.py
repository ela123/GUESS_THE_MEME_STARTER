import os, subprocess
from pathlib import Path

ROOT = Path(r"C:\Users\say_my_name\Desktop\GUESS_THE_MEME_STARTER")
WORK = ROOT / "output/_work_artistic"
FONT_RAW = (ROOT / "assets/fonts/DejaVuSans-Bold.ttf").as_posix()
FONT = FONT_RAW.replace(":", r"\:")
W, H, FPS = 1080, 1920, 30

score_out = (WORK / "05_score.mp4").as_posix()
print("Rendering Scene 5...")

# Video filter with clean quotes and motion
vfilter = (
    f"[0:v]drawbox=x=40:y=40:w={W-80}:h={H-80}:color=0x00f2fe@0.3:t=2,"
    f"drawbox=x=340:y=240:w=400:h=60:color=0x00f2fe@0.9:t=fill:enable='gte(t,0.2)',"
    f"drawtext=fontfile='{FONT}':text='FINAL RESULTS':fontcolor=0x070913:fontsize=30:x=(w-text_w)/2:y=255:enable='gte(t,0.2)',"
    f"drawtext=fontfile='{FONT}':text='HOW MANY DID YOU GET RIGHT?':fontcolor=white:fontsize=52:x=(w-text_w)/2:y=340:enable='gte(t,0.3)',"
    f"drawbox=x=120:y=500:w=840:h=120:color=0x13192f@0.92:t=fill:enable='gte(t,0.5)',"
    f"drawbox=x=120:y=500:w=840:h=120:color=0x64748b@0.8:t=3:enable='gte(t,0.5)',"
    f"drawtext=fontfile='{FONT}':text='0 - 1  BEGINNER':fontcolor=0x94a3b8:fontsize=44:x=160:y=538:enable='gte(t,0.5)',"
    f"drawtext=fontfile='{FONT}':text='NEEDS PRACTICE':fontcolor=0x64748b:fontsize=32:x=680:y=544:enable='gte(t,0.5)',"
    f"drawbox=x=120:y=660:w=840:h=120:color=0x13192f@0.92:t=fill:enable='gte(t,0.8)',"
    f"drawbox=x=120:y=660:w=840:h=120:color=0x00f2fe@0.85:t=3:enable='gte(t,0.8)',"
    f"drawtext=fontfile='{FONT}':text='2 - 4  MEME SCHOLAR':fontcolor=0x00f2fe:fontsize=44:x=160:y=698:enable='gte(t,0.8)',"
    f"drawtext=fontfile='{FONT}':text='CERTIFIED FAN':fontcolor=0x38bdf8:fontsize=32:x=700:y=704:enable='gte(t,0.8)',"
    f"drawbox=x=120:y=820:w=840:h=120:color=0x13192f@0.92:t=fill:enable='gte(t,1.1)',"
    f"drawbox=x=120:y=820:w=840:h=120:color=0xf5d300@0.9:t=4:enable='gte(t,1.1)',"
    f"drawtext=fontfile='{FONT}':text='5 / 5  MEME LORD':fontcolor=0xf5d300:fontsize=46:x=160:y=858:enable='gte(t,1.1)',"
    f"drawtext=fontfile='{FONT}':text='PERFECT SCORE':fontcolor=0xfacc15:fontsize=32:x=680:y=864:enable='gte(t,1.1)',"
    f"drawbox=x=100:y=1140:w=880:h=160:color=0xff007a@0.95:t=fill:enable='gte(t,1.4)',"
    f"drawbox=x=90:y=1130:w=900:h=180:color=0xffffff@0.7:t=4:enable='gte(t,1.4)*lt(mod(t*4,2),1)',"
    f"drawtext=fontfile='{FONT}':text='COMMENT YOUR SCORE!':fontcolor=white:fontsize=56:x=(w-text_w)/2:y=1175:enable='gte(t,1.4)',"
    f"drawtext=fontfile='{FONT}':text='SHARE WITH YOUR FRIENDS':fontcolor=0x00f2fe:fontsize=34:x=(w-text_w)/2:y=1380:enable='gte(t,1.7)'[vout]"
)

# Robust audio filter
afilter = (
    "sine=f=523.25:d=0.2[n1];"
    "sine=f=659.25:d=0.2[n2];"
    "sine=f=783.99:d=0.2[n3];"
    "sine=f=1046.50:d=1.0[n4];"
    "[n1][n2][n3][n4]concat=n=4:v=0:a=1,adelay=1200|1200[fanfare];"
    "anoisesrc=d=4.0:c=pink:r=48000,volume=0.15,afade=t=out:st=3.5:d=0.5[noise];"
    "[fanfare][noise]amix=inputs=2:duration=first:dropout_transition=0[aout]"
)

cmd = [
    "ffmpeg", "-y",
    "-f", "lavfi", "-i", f"color=c=0x070913:s={W}x{H}:r={FPS}:d=4.0",
    "-filter_complex", f"{vfilter};{afilter}",
    "-map", "[vout]", "-map", "[aout]",
    "-t", "4.0", "-r", str(FPS),
    "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k",
    score_out
]
print("Running ffmpeg...")
subprocess.run(cmd, check=True)
print("Scene 5 rendered successfully!")
