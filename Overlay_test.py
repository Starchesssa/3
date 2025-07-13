
import subprocess

# === CONFIGURATION ===
input_video = "group_21.mp4"
output_video = "output.mp4"
text_string = "Smart Pet-feeder"
font_path = "comicsansmsbold.ttf"  # custom font

# === FADE IN / FADE OUT ALPHA EXPRESSION ===
fade_alpha = (
    "if(lt(t,0),0,"
    "if(lt(t,2),t/2,"
    "if(lt(t,6),1,"
    "if(lt(t,8),1-(t-6)/2,0))))"
)

# === DRAW TEXT FILTER ===
drawtext_filter = (
    f"drawtext=fontfile='{font_path}':"
    f"text='{text_string}':"
    "fontsize=84:"
    "fontcolor=cyan:"
    f"alpha='{fade_alpha}':"
    "x=20:"          # bottom-left (left padding)
    "y=h-80:"        # bottom-left (from bottom)
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
