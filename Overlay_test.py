
import subprocess

# === CONFIGURATION ===
input_video = "group_21.mp4"
output_video = "overlayed_group_21.mp4"
text_string = "Group 21"

# === WAVY + REVEAL ANIMATION + STYLE ===
drawtext_filter = (
    "drawtext="
    "font='DejaVu Sans Bold':"
    f"text='{text_string}':"
    "fontsize=60:"
    "fontcolor=yellow@0.9:"
    "borderw=3:bordercolor=black:"
    "x=20:"
    "y=min(h-50+10*sin(2*PI*t), h-30-(20-t*50)):"
    "enable='between(t,0,10)'"
)

# === FFMPEG COMMAND ===
cmd = [
    "ffmpeg", "-y",
    "-i", input_video,
    "-vf", drawtext_filter,
    "-c:a", "copy",
    output_video
]

# === RUN IT ===
try:
    subprocess.run(cmd, check=True)
    print(f"[✓] Success! Output saved as {output_video}")
except subprocess.CalledProcessError as e:
    print("[X] FFmpeg failed:", e)
