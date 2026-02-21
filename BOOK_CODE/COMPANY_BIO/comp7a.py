
import os
import numpy as np
from scipy.io import wavfile
from PIL import Image, ImageDraw, ImageFont
import subprocess
import re

AUDIO_DIR = "BOOKS/Temp/TTS"
OUTPUT_DIR = "BOOKS/Temp/output"
FRAME_DIR = os.path.join(OUTPUT_DIR, "frames")
os.makedirs(FRAME_DIR, exist_ok=True)

def numeric_sort_key(filename):
    match = re.match(r"(\d+)", filename)
    return int(match.group(1)) if match else 9999

files = [f for f in os.listdir(AUDIO_DIR) if f.endswith(".wav")]
files.sort(key=numeric_sort_key)

frame_rate = 25  # fps
video_width = 1280
video_height = 720
num_bars = 32

# Font (change path if needed)
try:
    font = ImageFont.truetype("arial.ttf", 48)
except:
    font = ImageFont.load_default()

frame_count_total = 0

for file in files:
    input_audio = os.path.join(AUDIO_DIR, file)
    name = os.path.splitext(file)[0]
    name = re.sub(r"^\d+[_\- ]*", "", name)

    sample_rate, data = wavfile.read(input_audio)
    if len(data.shape) > 1:
        data = data[:,0]  # mono
    chunk_size = int(sample_rate / frame_rate)
    num_frames = len(data) // chunk_size

    print(f"Rendering {name} ({num_frames} frames)")

    for i in range(num_frames):
        chunk = data[i*chunk_size:(i+1)*chunk_size]
        fft_vals = np.abs(np.fft.rfft(chunk))[:num_bars]
        fft_vals = fft_vals / (np.max(fft_vals) + 1e-6)  # normalize

        # Create image
        img = Image.new("RGB", (video_width, video_height), "#f0f0f0")
        draw = ImageDraw.Draw(img)

        # Draw bars
        bar_width = video_width // num_bars - 10
        for j, val in enumerate(fft_vals):
            h = int(val * (video_height * 0.6))
            x0 = j * (bar_width + 10) + 20
            y0 = video_height - h - 50
            x1 = x0 + bar_width
            y1 = video_height - 50

            # Shadow
            draw.rectangle([x0+4, y0+4, x1+4, y1+4], fill="#888888")
            # Main bar
            color = (255-int(val*100), 50, 200)  # pink-purple gradient
            draw.rectangle([x0, y0, x1, y1], fill=color)

        # Draw title
        w, h_text = draw.textsize(name, font=font)
        draw.text(((video_width-w)//2, 20), name, fill="#000000", font=font)

        frame_file = os.path.join(FRAME_DIR, f"frame_{frame_count_total:06d}.png")
        img.save(frame_file)
        frame_count_total += 1

# Combine frames into video with FFmpeg
video_file = os.path.join(OUTPUT_DIR, "final_video.mp4")
first_audio = os.path.join(AUDIO_DIR, files[0])

subprocess.run([
    "ffmpeg", "-y",
    "-r", str(frame_rate),
    "-i", os.path.join(FRAME_DIR, "frame_%06d.png"),
    "-i", first_audio,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-shortest",
    video_file
])

print("Video generated:", video_file)
