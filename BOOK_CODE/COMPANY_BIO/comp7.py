import os
import re
import numpy as np
import librosa
import matplotlib.pyplot as plt
from moviepy.editor import *

# =====================
# SETTINGS
# =====================
AUDIO_DIR = "BOOKS/Temp/TTS"
OUTPUT_VIDEO = "final_video.mp4"
FPS = 60
BARS = 80

# =====================
# LOAD & SORT AUDIOS
# =====================
def extract_number(filename):
    match = re.match(r"(\d+)", filename)
    return int(match.group(1)) if match else 999

audio_files = [
    f for f in os.listdir(AUDIO_DIR) if f.endswith(".wav")
]

audio_files.sort(key=extract_number)

if not audio_files:
    raise Exception("No WAV files found!")

print("Sorted audio order:")
for f in audio_files:
    print(f)

# =====================
# CONCATENATE AUDIO
# =====================
audio_clips = []
durations = []
names = []

for file in audio_files:
    path = os.path.join(AUDIO_DIR, file)
    clip = AudioFileClip(path)
    audio_clips.append(clip)
    durations.append(clip.duration)

    # Remove number prefix & extension
    name = re.sub(r"^\d+[_\-]*", "", file)
    name = name.replace(".wav", "")
    names.append(name)

final_audio = concatenate_audioclips(audio_clips)

# =====================
# FRAME GENERATOR
# =====================
# Preload audio for analysis
y, sr = librosa.load(os.path.join(AUDIO_DIR, audio_files[0]))
full_audio = []
for file in audio_files:
    y_part, _ = librosa.load(os.path.join(AUDIO_DIR, file), sr=sr)
    full_audio.append(y_part)

y = np.concatenate(full_audio)
total_duration = final_audio.duration

# Track segments
segment_times = np.cumsum([0] + durations)

def get_current_label(t):
    for i in range(len(segment_times) - 1):
        if segment_times[i] <= t < segment_times[i + 1]:
            return names[i]
    return names[-1]

def make_frame(t):
    plt.clf()

    frame_index = int(t * sr)
    window_size = 2048
    slice_ = y[frame_index:frame_index + window_size]

    if len(slice_) == 0:
        slice_ = np.zeros(window_size)

    spectrum = np.abs(np.fft.fft(slice_))[:BARS]
    spectrum = spectrum / (np.max(spectrum) + 1e-6)

    plt.style.use("default")
    plt.bar(range(BARS), spectrum)
    plt.ylim(0, 1)
    plt.axis("off")

    # Label
    label = get_current_label(t)
    plt.text(
        0.5, 0.9,
        label.upper(),
        fontsize=24,
        ha="center",
        transform=plt.gca().transAxes,
        weight="bold"
    )

    fig = plt.gcf()
    fig.canvas.draw()

    img = np.frombuffer(fig.canvas.tostring_rgb(), dtype=np.uint8)
    img = img.reshape(fig.canvas.get_width_height()[::-1] + (3,))

    return img

# =====================
# VIDEO BUILD
# =====================
video_clip = VideoClip(make_frame, duration=total_duration)
video_clip = video_clip.set_audio(final_audio)

video_clip.write_videofile(
    OUTPUT_VIDEO,
    fps=FPS,
    codec="libx264",
    audio_codec="aac"
)
