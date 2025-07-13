
import subprocess

# === CONFIGURATION ===
input_video = "group_21.mp4"
output_video = "output.mp4"
text_string = "Smart Pet-feeder"
font_path = "comicsansmsbold.ttf"

# === FADE IN / FADE OUT ALPHA EXPRESSION ===
fade_alpha = (
    "if(lt(t,0),0,"
    "if(lt(t,2),t/2,"
    "if(lt(t,7),1,"
    "if(lt(t,9),1-(t-7)/2,0))))"
)

# === MULTILAYER SHADOW EFFECT ===
# These draw the shadow multiple times around the text with small offsets
shadow_layers = ""
offsets = [(-2, -2), (2, -2), (-2, 2), (2, 2), (0, -3), (-3, 0), (3, 0), (0, 3)]
for i, (dx, dy) in enumerate(offsets):
    shadow_layers += (
        f"drawtext=fontfile='{font_path}':"
        f"text='{text_string}':"
        "fontsize=84:"
        "fontcolor=black:"
        f"alpha='{fade_alpha}':"
        f"x=20+{dx}:"
        f"y=h-80+{dy},"
    )

# === TOP LAYER: THE ACTUAL WHITE TEXT ===
main_text = (
    f"drawtext=fontfile='{font_path}':"
    f"text='{text_string}':"
    "fontsize=84:"
    "fontcolor=white:"
    f"alpha='{fade_alpha}':"
    "x=20:"
    "y=h-80"
)

# === COMPLETE FILTER CHAIN ===
drawtext_filter = shadow_layers + main_text

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
