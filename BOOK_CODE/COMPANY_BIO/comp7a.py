import librosa
import numpy as np
import matplotlib.pyplot as plt
import os
import subprocess

# --- SETTINGS ---
audio_path = "audio.mp3"
fps = 30
output_dir = "frames"
video_out = "waveform_video.mp4"

# Colors (modern minimal)
bg_color = "#0f0f0f"
wave_color = "#444444"
progress_color = "#6949FF"

# --- LOAD AUDIO ---
y, sr = librosa.load(audio_path, sr=None)
duration = librosa.get_duration(y=y, sr=sr)

# Downsample waveform for performance
samples = 2000
waveform = librosa.util.normalize(y)
waveform = waveform[::len(waveform)//samples]

# --- PREPARE FRAMES FOLDER ---
os.makedirs(output_dir, exist_ok=True)

# --- GENERATE FRAMES ---
total_frames = int(duration * fps)

for frame in range(total_frames):
    progress = frame / total_frames

    plt.figure(figsize=(12, 4))
    plt.style.use("dark_background")
    plt.rcParams["axes.facecolor"] = bg_color

    x = np.linspace(0, 1, len(waveform))

    # Base waveform
    plt.plot(x, waveform, color=wave_color, linewidth=2)

    # Progress overlay
    progress_idx = int(len(x) * progress)
    plt.plot(x[:progress_idx], waveform[:progress_idx],
             color=progress_color, linewidth=2)

    plt.axis("off")

    frame_path = f"{output_dir}/frame_{frame:05d}.png"
    plt.savefig(frame_path, dpi=150, bbox_inches="tight", pad_inches=0)
    plt.close()

print("Frames generated.")

# --- FFmpeg: Frames → Video ---
subprocess.run([
    "ffmpeg",
    "-y",
    "-framerate", str(fps),
    "-i", f"{output_dir}/frame_%05d.png",
    "-i", audio_path,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-shortest",
    video_out
])

print("Video created:", video_out)
