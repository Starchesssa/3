
import subprocess

# === CONFIGURATION ===
input_video = "group_21.mp4"
output_video = "output.mp4"
text_string = "Smart Pet-feeder"
font_path = "comicsansmsbold.ttf"  # custom font

# === FADE IN / FADE OUT ALPHA EXPRESSION ===
fade_alpha = (
    "if(lt(t,0),0,"
    "if(lt(t,2),t/2,"      # fade in: 0s–2s
    "if(lt(t,9),1,"        # stay: 2s–9s
    "if(lt(t,11),1-(t-9)/2,0))))"  # fade out: 9s–11s
)

# === DRAW TEXT FILTER WITH THIN BORDER & SLIGHTLY HIGHER POSITION ===
drawtext_filter = (
    f"drawtext=fontfile='{font_path}':"
    f"text='{text_string}':"
    "fontsize=84:"
    "fontcolor=cyan:"
    f"alpha='{fade_alpha}':"
    "x=20:"
    "y=h-120:"              # Moved text slightly up from bottom
    "borderw=2:"            # Thin black border around text
    "bordercolor=black:"
    "shadowcolor=black:"
    "shadowx=1:"            # Optional subtle shadow
    "shadowy=1"
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
