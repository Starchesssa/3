
import subprocess

# === CONFIGURATION ===
input_video = "group_21.mp4"
output_video = "output.mp4"
text_string = "Smart Pet-feeder"

# === DRAW TEXT FILTER ===
# Fade in (0-2s), fully visible (2-6s), fade out (6-8s)
fade_alpha = (
    "if(lt(t,0),0,"                          # Before 0s invisible
    "if(lt(t,2),(t)/2,"                      # 0-2s fade in from 0 to 1 alpha
    "if(lt(t,6),1,"                          # 2-6s fully visible
    "if(lt(t,8),1-(t-6)/2,0))))"             # 6-8s fade out from 1 to 0 alpha
)

drawtext_filter = (
    "drawtext="
    "font='Ubuntu-Bold':"
    f"text='{text_string}':"
    "fontsize=84:"
    f"fontcolor=cyan@{fade_alpha}:"
    "x=(w-text_w)/2:"  # centered horizontally
    "y=h-80:"          # fixed near bottom
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
