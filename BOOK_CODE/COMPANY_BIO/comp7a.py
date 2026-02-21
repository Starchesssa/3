
import os
import re
import subprocess
from pathlib import Path

import numpy as np
from pydub import AudioSegment
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib.colors import LinearSegmentedColormap

# --- CONFIG ---
AUDIO_DIR = "BOOKS/Temp/TTS"
OUTPUT_DIR = "BOOKS/Temp/output"
FPS = 30
RESOLUTION = (1280, 720)

os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- LIST FILES NUMERICALLY ---
def numeric_sort_key(filename):
    match = re.match(r"(\d+)", filename)
    return int(match.group(1)) if match else 9999

files = [f for f in os.listdir(AUDIO_DIR) if f.endswith(".wav")]
files.sort(key=numeric_sort_key)

# --- MODERN COLORS / STYLE ---
colors = ["#6949FF", "#FF6B6B", "#FFC75F", "#2ED573", "#1E90FF"]
cmap = LinearSegmentedColormap.from_list("modern", colors)

# --- FUNCTION TO CREATE VIDEO ---
def create_visualizer_video(audio_path, output_path, title):
    from scipy.io import wavfile

    # Load audio
    sr, y = wavfile.read(audio_path)
    y = y / np.max(np.abs(y))  # normalize

    fig, ax = plt.subplots(figsize=(RESOLUTION[0]/100, RESOLUTION[1]/100), dpi=100)
    fig.patch.set_facecolor('#fdfdfd')  # background color
    ax.set_facecolor('#fdfdfd')
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_xlim(0, len(y))
    ax.set_ylim(-1, 1)

    line, = ax.plot([], [], lw=4)

    # Shadow effect
    shadow_line, = ax.plot([], [], lw=6, alpha=0.3, color="black")

    # Title
    ax.text(len(y)//2, 0.9, title, fontsize=28, fontweight="bold",
            ha='center', va='center', color="#000000", alpha=0.8)

    frames = len(y) // (sr // FPS)

    def animate(i):
        idx = i * (sr // FPS)
        window = y[:idx] if idx < len(y) else y
        line.set_data(np.arange(len(window)), window)
        line.set_color(cmap(i / frames))
        shadow_line.set_data(np.arange(len(window)), window)
        return line, shadow_line

    anim = FuncAnimation(fig, animate, frames=frames, interval=1000/FPS, blit=True)

    # Save animation to mp4 via ffmpeg
    anim.save(output_path, fps=FPS, extra_args=['-vcodec', 'libx264', '-pix_fmt', 'yuv420p'])
    plt.close(fig)

# --- PROCESS ALL AUDIO FILES ---
segment_videos = []

for file in files:
    audio_path = os.path.join(AUDIO_DIR, file)
    name = os.path.splitext(file)[0]
    name_title = re.sub(r"^\d+[_\- ]*", "", name)  # remove numbers
    output_video = os.path.join(OUTPUT_DIR, f"{name_title}.mp4")
    print(f"Creating fancy video for: {name_title}")
    create_visualizer_video(audio_path, output_video, title=name_title)
    segment_videos.append(output_video)

# --- CONCAT VIDEOS USING FFmpeg ---
concat_file = os.path.join(OUTPUT_DIR, "concat.txt")
with open(concat_file, "w") as f:
    for seg in segment_videos:
        f.write(f"file '{Path(seg).absolute()}'\n")

final_video = os.path.join(OUTPUT_DIR, "final_video.mp4")
subprocess.run([
    "ffmpeg",
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concat_file,
    "-c", "copy",
    final_video
], check=True)

print("✅ Done →", final_video)
