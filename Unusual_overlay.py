
import os
import re
import subprocess

FONT_PATH = "/storage/emulated/0/Download/FontsFree-Net-Proxima-Nova-Bold-It.otf.ttf"
INPUT_DIR = "Final_Videos"
OUTPUT_DIR = "Overlayed_Videos"
GENERIC_TXT = "Unuusual_memory/GROUP_GDG/group_gdg.txt"
DURATION = 7  # seconds to show the overlay

os.makedirs(OUTPUT_DIR, exist_ok=True)

def parse_generic_names(txt_path):
    mapping = {}
    with open(txt_path, "r", encoding="utf-8") as f:
        content = f.read()

    groups = re.findall(r"group_(\d+)\.txt\s*---\s*Original Product Name: .*?\nGeneric Name:\s*(.+)", content)
    for group_num, generic_name in groups:
        mapping[f"group_{group_num}.mp4"] = generic_name.strip(" *")
    return mapping

def sanitize_filename(name):
    return name.strip().replace(" ", "").replace("__", "_")

def add_slide_text_overlay(input_file, output_file, text, font_path):
    probe_cmd = [
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "csv=s=x:p=0", input_file
    ]
    result = subprocess.run(probe_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        width, height = map(int, result.stdout.strip().split("x"))
    except Exception:
        print(f"⚠️ Could not detect resolution for {input_file}")
        return

    is_vertical = height > width

    slide_filter = (
        f"drawtext=fontfile='{font_path}':"
        f"text='{text}':"
        f"fontsize=90:fontcolor=#C0C0C0:box=1:boxcolor=black@0.8:boxborderw=5:"
        f"x=(w-text_w)/2:"
        f"y='if(lt(t,1), h+text_h, if(lt(t,2), h - (t-1)*(h-text_h-100), if(lt(t,{DURATION}), h-text_h-100, NAN)) )':"
        f"enable='lt(t,{DURATION})':"
        f"shadowcolor=black:shadowx=3:shadowy=3"
    )

    if is_vertical:
        print(f"↕ Vertical video detected: {input_file}")
        filter_chain = (
            f"[0:v]scale=1280:720,boxblur=10:1[blurred];"
            f"[0:v]scale=-2:720[main];"
            f"[blurred][main]overlay=(W-w)/2:(H-h)/2,"
            f"{slide_filter}"
        )
    else:
        print(f"↔ Horizontal video detected: {input_file}")
        filter_chain = slide_filter

    cmd = [
        "ffmpeg", "-i", input_file,
        "-vf", filter_chain,
        "-c:v", "libx264", "-crf", "23", "-preset", "fast", "-y",
        output_file
    ]

    try:
        subprocess.run(cmd, check=True)
        print(f"[✔] Overlayed: {output_file}")
    except subprocess.CalledProcessError as e:
        print(f"❌ FFmpeg failed: {input_file}\n{e}")

def main():
    generic_map = parse_generic_names(GENERIC_TXT)
    video_files = [f for f in os.listdir(INPUT_DIR) if f.endswith(".mp4")]

    if not video_files:
        print("❌ No MP4 videos found in input directory.")
        return

    for video in video_files:
        clean_name = sanitize_filename(video)
        input_path = os.path.join(INPUT_DIR, clean_name)
        output_path = os.path.join(OUTPUT_DIR, clean_name)

        generic_name = generic_map.get(clean_name)
        if not generic_name:
            print(f"⚠️ No generic name found for: {clean_name}")
            continue

        print(f"➤ Processing: {clean_name} | Generic: {generic_name}")
        add_slide_text_overlay(input_path, output_path, generic_name, FONT_PATH)

if __name__ == "__main__":
    main()
