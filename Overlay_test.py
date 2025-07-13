
import subprocess

# === CONFIGURATION ===
input_video = "group_21.mp4"
output_video = "output.mp4"
text_string = "Smart Pet-feeder"

# === DRAW TEXT FILTER ===
# Slide from slightly lower to bottom-left corner (y animates gently)
slide_y = "if(lt(t,1), h+50, if(lt(t,2), h+50-(t-1)*70, h-80))"

drawtext_filter = (
    "drawtext="
    "font='Ubuntu-Bold':"
    f"text='{text_string}':"
    "fontsize=84:"  # Bigger text = thicker
    "fontcolor=cyan:"
    "x=20:"
    f"y='{slide_y}':"
    "shadowcolor=black:shadowx=4:shadowy=4"
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
