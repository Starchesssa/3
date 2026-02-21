
import os
import subprocess
import re

AUDIO_DIR = "BOOKS/Temp/TTS"
OUTPUT_DIR = "BOOKS/Temp/output"
CONCAT_FILE = os.path.join(OUTPUT_DIR, "concat.txt")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def numeric_sort_key(filename):
    match = re.match(r"(\d+)", filename)
    return int(match.group(1)) if match else 9999

# Collect wav files
files = [f for f in os.listdir(AUDIO_DIR) if f.endswith(".wav")]
files.sort(key=numeric_sort_key)

video_segments = []

for file in files:
    input_audio = os.path.join(AUDIO_DIR, file)

    # Extract display name from filename
    name = os.path.splitext(file)[0]
    name = re.sub(r"^\d+[_\- ]*", "", name)

    segment_video = os.path.join(OUTPUT_DIR, f"{name}.mp4")

    print(f"Creating video for: {name}")

    cmd = [
        "ffmpeg",
        "-y",
        "-i", input_audio,

        # Waveform visualizer
        "-filter_complex",
        f"[0:a]showwaves=s=1280x720:mode=line:rate=25,format=yuv420p[v];"
        f"[v]drawtext=text='{name}':fontcolor=white:fontsize=48:"
        f"x=(w-text_w)/2:y=h-100",

        "-map", "[v]",
        "-map", "0:a",
        "-c:v", "libx264",
        "-c:a", "aac",
        "-shortest",
        segment_video
    ]

    subprocess.run(cmd, check=True)
    video_segments.append(segment_video)

# Create concat list
with open(CONCAT_FILE, "w") as f:
    for segment in video_segments:
        f.write(f"file '{os.path.abspath(segment)}'\n")

final_video = os.path.join(OUTPUT_DIR, "final_video.mp4")

print("Joining videos...")

subprocess.run([
    "ffmpeg",
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", CONCAT_FILE,
    "-c", "copy",
    final_video
], check=True)

print("Done →", final_video)
