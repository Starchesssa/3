
import subprocess

# === CONFIGURATION ===
input_video = "group_21.mp4"
output_video = "output.mp4"
text_string = "Smart Pet-feeder"

# === DRAW TEXT FILTER (UPDATED) ===
drawtext_filter = (
    "drawtext="
    "font='Ubuntu-Bold':"
    f"text='{text_string}':"
    "fontsize=72:"
    "fontcolor=yellow@0.95:"
    "borderw=6:bordercolor=black:"
    "x=20:"
    "y=h-80+20*sin(2*PI*t):"
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
