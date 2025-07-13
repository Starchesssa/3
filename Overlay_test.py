
import subprocess

# === CONFIGURATION ===
input_video = "group_21.mp4"
output_video = "output.mp4"
text_string = "Group 21"

# Use a safe bold font (works in GitHub Actions too)
font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# === WAVY TEXT FILTER ===
# Text will float vertically like waves using a sine function
drawtext_filter = (
    f"drawtext=fontfile='{font_path}':"
    f"text='{text_string}':"
    f"fontcolor=white:fontsize=48:"
    f"x=10:"
    f"y=h-60+10*sin(2*PI*t):"
    f:borderw=2:bordercolor=black"
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
