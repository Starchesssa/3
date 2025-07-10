
import os
import re
import subprocess

audio_dir = "Unuusual_memory/AUDIO"
timeline_dir = "Unuusual_memory/TIMELINE"
output_dir = "Unuusual_memory/AUDIO_REAL"

os.makedirs(output_dir, exist_ok=True)

def extract_audio(source_wav, start_time, end_time, output_wav):
    subprocess.run([
        "ffmpeg", "-y", "-i", source_wav,
        "-ss", start_time, "-to", end_time,
        "-c", "copy", output_wav
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def time_to_seconds(time_str):
    parts = time_str.split(':')
    return int(parts[0]) * 60 + int(parts[1])

# Parse merged wav files and their ranges
wav_files = {}
for filename in os.listdir(audio_dir):
    if filename.endswith(".wav"):
        match = re.search(r"group_(\d+)_to_(\d+)\.wav", filename)
        if match:
            start = int(match.group(1))
            end = int(match.group(2))
            wav_files[(start, end)] = os.path.join(audio_dir, filename)

# Process timeline files
for filename in os.listdir(timeline_dir):
    if filename.endswith(".txt"):
        match = re.search(r"group_(\d+)\.txt", filename)
        if match:
            group_number = int(match.group(1))
            timeline_path = os.path.join(timeline_dir, filename)

            # Find matching wav
            for (start, end), wav_path in wav_files.items():
                if start <= group_number <= end:
                    with open(timeline_path) as f:
                        line = f.readline().strip()
                        if '-' in line:
                            start_time, end_time = line.split('-')
                            output_wav = os.path.join(output_dir, f"group_{group_number}.wav")
                            extract_audio(wav_path, start_time, end_time, output_wav)
                            print(f"Extracted group {group_number} from {wav_path}")
                    break
