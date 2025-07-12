import os
import subprocess

font_path = "FontsFree-Net-Proxima-Nova-Bold-It.otf.ttf"
input_folder = "Final_Videos"
output_folder = "Overlayed_Videos"
os.makedirs(output_folder, exist_ok=True)

videos = [f for f in os.listdir(input_folder) if f.endswith(".mp4")]

def generate_ass_file(text, ass_path, font_name="Proxima Nova Bold", fontsize=60, x=100, y=300):
    text_k = ''.join([f'{{\\k20}}{c}' for c in text])
    ass_content = f"""[Script Info]
Title: Typewriter Effect
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name},{fontsize},&H00FFFFFF,&HFF0000FF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:10.00,Default,,0,0,0,,{{\\pos({x},{y})}}{text_k}
"""
    with open(ass_path, 'w', encoding='utf-8') as f:
        f.write(ass_content)

for video in videos:
    input_path = os.path.join(input_folder, video)
    output_path = os.path.join(output_folder, video)

    product_name = video.replace(".mp4", "").replace("_", " ").title()

    # Detect orientation
    cmd_probe = [
        "ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
        "stream=width,height", "-of", "csv=s=x:p=0", input_path
    ]
    try:
        output = subprocess.check_output(cmd_probe).decode().strip()
        width, height = map(int, output.split("x"))
        orientation = "vertical" if height > width else "horizontal"
    except Exception as e:
        print(f"[!] Could not probe video {video}: {e}")
        continue

    print(f"[>] Processing {orientation} video: {video}")

    # Generate .ass file
    ass_path = f"temp_{os.path.splitext(video)[0]}.ass"
    generate_ass_file(product_name, ass_path)

    # Set text position based on orientation
    y_pos = 300 if orientation == "vertical" else 100

    # Adjust position in the .ass file
    generate_ass_file(product_name, ass_path, x=100, y=y_pos)

    # Apply subtitles (typewriter) with FFmpeg
    cmd_overlay = [
        "ffmpeg", "-y", "-i", input_path,
        "-vf", f"subtitles={ass_path}",
        "-c:v", "libx264", "-crf", "23", "-preset", "fast",
        output_path
    ]
    try:
        subprocess.run(cmd_overlay, check=True)
        print(f"[✓] Overlayed with typewriter effect: {output_path}")
    except subprocess.CalledProcessError:
        print(f"[X] FFmpeg failed for {video}")
    finally:
        if os.path.exists(ass_path):
            os.remove(ass_path)
