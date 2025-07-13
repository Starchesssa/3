
import subprocess

# === CONFIGURATION ===
input_video = "group_21.mp4"
output_video = "output.mp4"
text_string = "Smart Pet-feeder"

# === DRAW TEXT FILTER ===
# Fade in (0-2s), full visible (2-6s), fade out (6-8s)
fade_alpha = (
    "if(lt(t,0),0,"
    "if(lt(t,2),(t)/2,"
    "if(lt(t,6),1,"
    "if(lt(t,8),1-(t-6)/2,0))))"
)

drawtext_filter = (
    "drawtext="
    "font='Ubuntu-Bold':"
    f"text='{text_string}':"
    "fontsize=84:"
    "fontcolor=cyan:"
    f"alpha='{fade_alpha}':"
    "x=(w-text_w)/2:"  # Centered horizontally
    "y=h-80:"          # Fixed near bottom
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
