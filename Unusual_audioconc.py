
import os
import subprocess
import random
import shutil

# Folders
video_folder = "No_Face_Videos"
audio_folder = "Unuusual_memory/AUDIO_REAL"
intro_outro_folder = "Unuusual_memory/Intro,ourto_audio"

# Output folder
final_folder = "Final_Videos"
os.makedirs(final_folder, exist_ok=True)

# Intro and Outro audio
intro_audio = os.path.join(intro_outro_folder, "Intro.wav")
outro_audio = os.path.join(intro_outro_folder, "Outro.wav")

# List all valid audio files (only .wav)
audio_files = [f for f in os.listdir(audio_folder) if f.endswith(".wav")]

for audio_file in audio_files:
    group_name = os.path.splitext(audio_file)[0]  # e.g., "group_1"
    video_file = os.path.join(video_folder, f"{group_name}_noface.mp4")
    audio_path = os.path.join(audio_folder, audio_file)

    if not os.path.exists(video_file):
        print(f"Skipping {group_name}, video not found.")
        continue

    # Step 1: Remove video audio
    muted_video = f"Temp_{group_name}.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-i", video_file, "-an", "-c", "copy", muted_video
    ], check=True)

    # Step 2: Get durations
    def get_duration(file_path):
        result = subprocess.run([
            "ffprobe", "-v", "error", "-show_entries",
            "format=duration", "-of",
            "default=noprint_wrappers=1:nokey=1", file_path
        ], capture_output=True, text=True)
        return float(result.stdout.strip())

    audio_duration = get_duration(audio_path)
    video_duration = get_duration(muted_video)

    # Step 3: Adjust video duration to match audio duration
    looped_video = f"Looped_{group_name}.mp4"

    if video_duration >= audio_duration:
        subprocess.run([
            "ffmpeg", "-y", "-ss", "0", "-t", str(audio_duration),
            "-i", muted_video, "-c", "copy", looped_video
        ], check=True)
    else:
        # Calculate how many loops needed
        loops = int(audio_duration // video_duration) + 1
        concat_list = f"{group_name}_concat.txt"
        with open(concat_list, "w") as f:
            for _ in range(loops):
                f.write(f"file '{muted_video}'\n")

        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_list, "-c", "copy", looped_video
        ], check=True)

        # Trim excess
        subprocess.run([
            "ffmpeg", "-y", "-ss", "0", "-t", str(audio_duration),
            "-i", looped_video, "-c", "copy", looped_video
        ], check=True)

        os.remove(concat_list)

    # Step 4: Merge video with audio
    merged_video = os.path.join(final_folder, f"{group_name}.mp4")
    subprocess.run([
        "ffmpeg", "-y", "-i", looped_video, "-i", audio_path,
        "-c:v", "copy", "-c:a", "aac", "-shortest", merged_video
    ], check=True)

    os.remove(muted_video)
    os.remove(looped_video)
    print(f"✅ Created {merged_video}")

# Step 5: Create intro & outro video from middle parts
def create_middle_clip(video_path, duration=5):
    total_duration = get_duration(video_path)
    if total_duration <= duration:
        return video_path  # use full video if too short

    start_time = total_duration / 2 - duration / 2
    temp_clip = f"Clip_{os.path.basename(video_path)}"
    subprocess.run([
        "ffmpeg", "-y", "-ss", str(start_time), "-t", str(duration),
        "-i", video_path, "-c", "copy", temp_clip
    ], check=True)
    return temp_clip

# Select random 5 group videos for intro and next 5 for outro
final_videos = sorted([
    os.path.join(final_folder, f) for f in os.listdir(final_folder)
    if f.endswith(".mp4")
])

intro_clips = [create_middle_clip(v) for v in random.sample(final_videos, min(5, len(final_videos)))]
remaining_videos = [v for v in final_videos if v not in intro_clips]
outro_clips = [create_middle_clip(v) for v in random.sample(remaining_videos, min(5, len(remaining_videos)))]

# Concatenate intro and outro clips
def concat_clips(clip_list, output_file):
    concat_list = "concat_clips.txt"
    with open(concat_list, "w") as f:
        for clip in clip_list:
            f.write(f"file '{clip}'\n")
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_list, "-c", "copy", output_file
    ], check=True)
    os.remove(concat_list)

intro_video = "Intro_Video.mp4"
outro_video = "Outro_Video.mp4"

concat_clips(intro_clips, intro_video)
concat_clips(outro_clips, outro_video)

# Merge intro + audio + outro
full_intro_audio = "Full_Intro_Audio.wav"
full_outro_audio = "Full_Outro_Audio.wav"

# Just merge intro and outro audio with silence gaps (optional, or you can simply concat)
subprocess.run([
    "ffmpeg", "-y", "-i", intro_audio, "-i", outro_audio,
    "-filter_complex", "[0:0][1:0]concat=n=2:v=0:a=1[out]", "-map", "[out]",
    "Combined_Intro_Outro.wav"
], check=True)

# Clean temporary intro/outro clips
for clip in intro_clips + outro_clips:
    if clip not in [intro_video, outro_video]:
        os.remove(clip)

print("🎬 Finished Processing All Videos.")
