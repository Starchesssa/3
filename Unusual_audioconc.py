
import os
import subprocess
import random

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

# List all valid audio files (.wav)
audio_files = [f for f in os.listdir(audio_folder) if f.endswith(".wav")]

# Helper function to get duration of a media file
def get_duration(file_path):
    result = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file_path
    ], capture_output=True, text=True)
    return float(result.stdout.strip())

# Step 1: Process each group video and merge with its own audio
for audio_file in audio_files:
    group_name = os.path.splitext(audio_file)[0]  # e.g., "group_1"
    video_file = os.path.join(video_folder, f"{group_name}_noface.mp4")
    audio_path = os.path.join(audio_folder, audio_file)

    if not os.path.exists(video_file):
        print(f"Skipping {group_name}, video not found.")
        continue

    # Remove video audio (mute original video)
    muted_video = f"Temp_{group_name}.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-i", video_file, "-an", "-c", "copy", muted_video
    ], check=True)

    audio_duration = get_duration(audio_path)
    video_duration = get_duration(muted_video)

    # Adjust video duration to match audio duration by trimming or looping
    looped_video = f"Looped_{group_name}.mp4"
    if video_duration >= audio_duration:
        # Trim video
        subprocess.run([
            "ffmpeg", "-y", "-ss", "0", "-t", str(audio_duration),
            "-i", muted_video, "-c", "copy", looped_video
        ], check=True)
    else:
        # Loop video to extend duration
        loops = int(audio_duration // video_duration) + 1
        concat_list = f"{group_name}_concat.txt"
        with open(concat_list, "w") as f:
            for _ in range(loops):
                f.write(f"file '{muted_video}'\n")
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_list, "-c", "copy", looped_video
        ], check=True)
        # Trim to exact audio duration
        trimmed_video = f"Trimmed_{group_name}.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-ss", "0", "-t", str(audio_duration),
            "-i", looped_video, "-c", "copy", trimmed_video
        ], check=True)
        os.replace(trimmed_video, looped_video)
        os.remove(concat_list)

    # Merge muted video with corresponding audio
    merged_video = os.path.join(final_folder, f"{group_name}.mp4")
    subprocess.run([
        "ffmpeg", "-y", "-i", looped_video, "-i", audio_path,
        "-c:v", "copy", "-c:a", "aac", "-shortest", merged_video
    ], check=True)

    # Cleanup temp files
    os.remove(muted_video)
    os.remove(looped_video)
    print(f"✅ Created {merged_video}")

# Step 2: Create intro & outro video from middle parts of random group videos
def create_middle_clip(video_path, duration=5):
    total_duration = get_duration(video_path)
    if total_duration <= duration:
        return None  # Skip too-short videos
    start_time = total_duration / 2 - duration / 2
    temp_clip = f"Clip_{os.path.basename(video_path)}"
    subprocess.run([
        "ffmpeg", "-y", "-ss", str(start_time), "-t", str(duration),
        "-i", video_path, "-c", "copy", temp_clip
    ], check=True)
    return temp_clip

# Concatenate clips (try stream copy, fallback to re-encoding)
def concat_clips(clip_list, output_file):
    concat_list = "concat_clips.txt"
    with open(concat_list, "w") as f:
        for clip in clip_list:
            f.write(f"file '{clip}'\n")
    try:
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_list, "-c", "copy", output_file
        ], check=True)
        print(f"✅ Concatenated without re-encoding: {output_file}")
    except subprocess.CalledProcessError:
        print(f"⚠️ Stream copy failed! Re-encoding: {output_file}")
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_list, "-c:v", "libx264", "-preset", "slow", "-crf", "18",
            "-c:a", "aac", "-b:a", "192k", output_file
        ], check=True)
        print(f"✅ Successfully re-encoded: {output_file}")
    os.remove(concat_list)

# Prepare list of all processed final group videos
final_videos = sorted([
    os.path.join(final_folder, f)
    for f in os.listdir(final_folder) if f.endswith(".mp4")
])

# Select random clips for intro and outro (5 clips or fewer if less available)
intro_clips_raw = [create_middle_clip(v) for v in random.sample(final_videos, min(5, len(final_videos)))]
intro_clips = [clip for clip in intro_clips_raw if clip]  # Remove None
remaining_videos = [v for v in final_videos if v not in intro_clips_raw]  # Use originals for filtering
outro_clips_raw = [create_middle_clip(v) for v in random.sample(remaining_videos, min(5, len(remaining_videos)))]
outro_clips = [clip for clip in outro_clips_raw if clip]

intro_video = "Intro_Video.mp4"
outro_video = "Outro_Video.mp4"

# Concatenate visuals for intro and outro
concat_clips(intro_clips, intro_video)
concat_clips(outro_clips, outro_video)

# Step 3: Merge intro/outro visuals with Intro.wav and Outro.wav audio files
intro_final = os.path.join(final_folder, "Intro_Video_Final.mp4")
outro_final = os.path.join(final_folder, "Outro_Video_Final.mp4")

# Merge Intro.wav audio with intro visuals
subprocess.run([
    "ffmpeg", "-y", "-i", intro_video, "-i", intro_audio,
    "-c:v", "copy", "-c:a", "aac", "-shortest", intro_final
], check=True)

# Merge Outro.wav audio with outro visuals
subprocess.run([
    "ffmpeg", "-y", "-i", outro_video, "-i", outro_audio,
    "-c:v", "copy", "-c:a", "aac", "-shortest", outro_final
], check=True)

print(f"✅ Created final intro video with Intro.wav audio: {intro_final}")
print(f"✅ Created final outro video with Outro.wav audio: {outro_final}")

# Cleanup temporary intro/outro clips and intermediate silent videos
for clip in intro_clips + outro_clips:
    if clip and clip.startswith("Clip_") and os.path.exists(clip):
        os.remove(clip)
if os.path.exists(intro_video):
    os.remove(intro_video)
if os.path.exists(outro_video):
    os.remove(outro_video)

print("🎬 Finished Processing All Videos.")
