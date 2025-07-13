
import os
import subprocess

# === Configuration ===
font_file = "FontsFree-Net-Proxima-Nova-Bold-It.otf.ttf"  # Ensure exact filename
input_video = "group_21.mp4"
output_video = "overlayed_group_21.mp4"
text = "Group 21"
ass_file = "temp_group_21.ass"

# === Generate .ass subtitle file ===
def generate_ass_file(text, ass_path, font_name="Proxima Nova Bold", fontsize=60, x=100, y=500):
    text_k = ''.join([f'{{\\k20}}{c}' for c in text])
    ass_content = f"""[Script Info]
Title: Typewriter
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name},{fontsize},&H0000C5FF,&H00000000,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:10.00,Default,,0,0,0,,{{\\pos({x},{y})}}{text_k}
"""
    with open(ass_path, 'w', encoding='utf-8') as f:
        f.write(ass_content)

# === Main process ===
if not os.path.exists(input_video):
    print(f"[X] Input video not found: {input_video}")
    exit()

# Get video resolution to calculate text Y position
try:
    output = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height", "-of", "csv=s=x:p=0", input_video
    ]).decode().strip()
    width, height = map(int, output.split("x"))
    orientation = "vertical" if height > width else "horizontal"
    y_pos = height - 150  # bottom padding
except Exception as e:
    print(f"[!] Could not probe video: {e}")
    y_pos = 300  # fallback

print(f"[>] Detected {orientation} video ({width}x{height}). Overlaying with Typewriter style at bottom...")

# Generate ASS subtitle
generate_ass_file(text, ass_file, x=100, y=y_pos)

# === FFmpeg command with font embedding ===
cmd = [
    "ffmpeg", "-y", "-i", input_video,
    "-vf", f"subtitles={ass_file}:fontsdir=.",  # ← FFmpeg loads font from current dir
    "-c:v", "libx264", "-crf", "23", "-preset", "fast",
    output_video
]

# Run FFmpeg
try:
    subprocess.run(cmd, check=True)
    print(f"[✓] Done! Output saved to: {output_video}")
except subprocess.CalledProcessError as e:
    print("[X] FFmpeg failed:", e)
finally:
    if os.path.exists(ass_file):
        os.remove(ass_file)
