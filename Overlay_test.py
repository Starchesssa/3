
import os
import subprocess
from manim import *

# === CONFIGURATION ===
input_video = "group_21.mp4"
output_video = "overlayed_group_21.mp4"
overlay_clip = "manim_overlay.mov"
text_content = "Group 21"
render_dir = "media/videos/manim_overlay/480p15"
font_name = "Proxima Nova Bold"  # Use any system-installed or local font

# === MANIM SCENE CLASS ===
class TextOverlay(Scene):
    def construct(self):
        text = Text(text_content, font=font_name, font_size=72, color=WHITE)
        text.move_to(DOWN * 2)
        self.play(Write(text))  # typewriter-like
        self.wait(2)

# === RENDER MANIM OVERLAY ===
print("[1] Rendering Manim overlay...")
subprocess.run([
    "manim", "-pql", __file__, "TextOverlay",
    "--format=mov", "--transparent"
], check=True)

# === Find the Rendered Manim File ===
try:
    for root, _, files in os.walk(render_dir):
        for f in files:
            if f.endswith(".mov"):
                overlay_path = os.path.join(root, f)
                os.rename(overlay_path, overlay_clip)
                break
except Exception as e:
    print("[X] Error moving overlay clip:", e)
    exit(1)

# === GET VIDEO SIZE ===
print("[2] Probing video...")
try:
    output = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height", "-of", "csv=s=x:p=0", input_video
    ]).decode().strip()
    width, height = map(int, output.split("x"))
    orientation = "vertical" if height > width else "horizontal"
except Exception as e:
    print(f"[X] Could not get video size: {e}")
    exit(1)

# === OVERLAY WITH FFMPEG ===
print(f"[3] Detected {orientation} video. Overlaying Manim animation...")
ffmpeg_cmd = [
    "ffmpeg", "-y",
    "-i", input_video,
    "-i", overlay_clip,
    "-filter_complex", "[0:v][1:v] overlay=0:main_h-overlay_h-50:format=auto",
    "-c:a", "copy",
    output_video
]

try:
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"[✓] Success! Video saved as {output_video}")
except subprocess.CalledProcessError as e:
    print("[X] FFmpeg failed:", e)

# === CLEAN UP ===
if os.path.exists(overlay_clip):
    os.remove(overlay_clip)
