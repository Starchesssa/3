
import subprocess

# === CONFIGURATION ===
input_video = "group_21.mp4"
output_video = "output.mp4"
text_string = "Group 21"

# === WAVY TEXT FILTER USING FONT NAME ONLY ===
drawtext_filter = (
    "drawtext="
    "font='DejaVu Sans':"
    f"text='{text_string}':"
    "fontcolor=white:fontsize=48:"
    "x=10:"
    "y=h-60+10*sin(2*PI*t):"
    "borderw=2:bordercolor=black"
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
