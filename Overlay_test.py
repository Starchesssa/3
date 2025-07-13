
import subprocess

# === CONFIGURATION ===
input_video = "group_21.mp4"
output_video = "output.mp4"
text_string = "Smart Pet-feeder"

# === DRAW TEXT FILTER ===
# Slide in from bottom, hold, no bouncing
slide_y = "if(lt(t,1), h, if(lt(t,3), h-(t-1)*100, h-200))"

drawtext_filter = (
    "drawtext="
    "font='Ubuntu-Bold':"
    f"text='{text_string}':"
    "fontsize=78:"
    "fontcolor=cyan:"
    "x=(w-text_w)/2:"
    f"y='{slide_y}':"
    "shadowcolor=black:shadowx=2:shadowy=2"
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
