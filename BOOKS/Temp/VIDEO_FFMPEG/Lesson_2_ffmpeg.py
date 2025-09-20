#!/usr/bin/env python3
import shutil, subprocess, sys, os

```python
#!/usr/bin/env python3

import subprocess
import os
import shutil
import sys

# --- Configuration ---
WIDTH = 3840
HEIGHT = 2160
FPS = 30
AUDIO_PATH = 'BOOKS/Temp/TTS/Lesson_2.wav'
OUTPUT_PATH = 'BOOKS/Temp/VIDEO_FFMPEG/Lesson_2_ffmpeg_output.mp4'
IMAGE_DIR = 'assets/images'

# --- Timeline & Scene Definitions ---
# The script will calculate durations based on these start/end points.
# A final end time of -1 will be replaced by the total audio duration.
TIMELINE = [
    {"scene": 1, "start": 0.0, "end": 5.82, "name": "Market Mood Swing"},
    {"scene": 2, "start": 5.82, "end": 16.92, "name": "Bubble Burst"},
    {"scene": 3, "start": 16.92, "end": 31.80, "name": "Amazon Crash"},
    {"scene": 4, "start": 31.80, "end": 48.54, "name": "Panic vs Strategy"},
    {"scene": 5, "start": 48.54, "end": -1, "name": "Building Through Storm"}
]

IMAGE_ASSETS = {
    # Scene 1
    's1_bg': 'abstract_gears_background.jpg',
    's1_mg1': 'stock-chart-midground.png',
    's1_mg2': 'gears-midground.png',
    # Scene 2
    's2_bg': 'rainy-city.jpg',
    's2_mg1': 'falling-chart.png',
    's2_mg2': 'broken_gears.png',
    's2_fg': 'rain_overlay.png',
    # Scene 3
    's3_bg': 'city_background.jpg',
    's3_mg1': 'falling-chart.png',
    's3_mg2': 'sad-people.png',
    's3_fg': 'data_stream_foreground.png',
    # Scene 4a (Panic)
    's4a_bg': 'dark_clouds.jpg',
    's4a_mg': 'sad-people.png',
    's4a_fg': 'glowing_particles.png',
    # Scene 4b (Strategy)
    's4b_bg': 'blueprint_bg.jpg',
    's4b_mg': 'fortress.png',
    's4b_fg': 'gears-foreground.png',
    # Scene 5
    's5_bg': 'sunrise-field.jpg',
    's5_mg1': 'amazon_warehouse_midground.png',
    's5_mg2': 'phoenix_from_ashes.png',
    's5_fg': 'delivery_drone_foreground.png',
}

def check_dependencies():
    """Checks for ffmpeg, ffprobe, and all required media files."""
    if not shutil.which("ffmpeg"):
        sys.exit("Error: ffmpeg not found. Please install it and ensure it's in your PATH.")
    if not shutil.which("ffprobe"):
        sys.exit("Error: ffprobe not found. Please install it and ensure it's in your PATH.")

    if not os.path.isfile(AUDIO_PATH):
        sys.exit(f"Error: Audio file not found at {AUDIO_PATH}")

    for asset in set(IMAGE_ASSETS.values()):
        path = os.path.join(IMAGE_DIR, asset)
        if not os.path.isfile(path):
            sys.exit(f"Error: Image asset not found at {path}")
    print("All dependencies and assets found.")

def get_audio_duration(file_path):
    """Gets the duration of an audio file using ffprobe."""
    command = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", file_path,
    ]
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return float(result.stdout)
    except (subprocess.CalledProcessError, FileNotFoundError, ValueError) as e:
        sys.exit(f"Error getting audio duration: {e}")

def construct_ffmpeg_command(total_duration):
    """Constructs the full ffmpeg command as a list of arguments."""
    unique_images = sorted(list(set(IMAGE_ASSETS.values())))
    image_indices = {name: unique_images.index(path) for name, path in IMAGE_ASSETS.items()}

    inputs = []
    for image_file in unique_images:
        # Use stream_loop for video-like overlays, loop for static images
        if 'rain_overlay.png' in image_file:
            inputs.extend(['-stream_loop', '-1'])
        else:
            inputs.extend(['-loop', '1'])
        inputs.extend(['-i', os.path.join(IMAGE_DIR, image_file)])
    
    audio_input_index = len(unique_images)
    inputs.extend(['-i', AUDIO_PATH])

    scene_durations = [scene["end"] - scene["start"] for scene in TIMELINE]
    d1, d2, d3, d4_total, d5 = scene_durations
    
    # Specific timing for scene 4's internal crossfade
    d4a_end_point = 40.02
    d4a = d4a_end_point - TIMELINE[3]["start"]
    fade_duration = 1.0
    d4_fade_offset = d4a - fade_duration

    filters = []

    # Scene 1: Horizontal Parallax + Zoom
    s1_bg, s1_mg1, s1_mg2 = image_indices['s1_bg'], image_indices['s1_mg1'], image_indices['s1_mg2']
    filters.append(
        f"[{s1_bg}:v]scale={WIDTH*1.2:.0f}x-1,crop={WIDTH}:{HEIGHT},format=yuva420p[s1_bg_scaled];"
        f"[{s1_mg1}:v]scale={WIDTH*1.3:.0f}x-1,format=yuva420p[s1_mg1_scaled];"
        f"[{s1_mg2}:v]scale={WIDTH*1.1:.0f}x-1,format=yuva420p[s1_mg2_scaled];"
        f"[s1_bg_scaled]zoompan=z='1+0.05*t/{d1}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d={d1*FPS:.0f}:s={WIDTH}x{HEIGHT}[s1_base];"
        f"[s1_base][s1_mg1_scaled]overlay=x='-t/{d1}*({WIDTH*1.3-WIDTH})':y=H-h[s1_over1];"
        f"[s1_over1][s1_mg2_scaled]overlay=x='W-w+t/{d1}*({WIDTH*1.1-WIDTH})':y=H/2-h/2,trim=duration={d1},setpts=PTS-STARTPTS[v_scene1]"
    )

    # Scene 2: Vertical Float
    s2_bg, s2_mg1, s2_mg2, s2_fg = image_indices['s2_bg'], image_indices['s2_mg1'], image_indices['s2_mg2'], image_indices['s2_fg']
    filters.append(
        f"[{s2_bg}:v]scale={WIDTH*1.1:.0f}x-1,crop={WIDTH}:{HEIGHT},format=yuva420p[s2_bg_scaled];"
        f"[{s2_mg1}:v]scale={WIDTH*0.6:.0f}:-1,format=yuva420p[s2_mg1_scaled];"
        f"[{s2_mg2}:v]scale={WIDTH*0.8:.0f}:-1,format=yuva420p[s2_mg2_scaled];"
        f"[{s2_fg}:v]scale={WIDTH}:{HEIGHT},format=yuva420p[s2_fg_scaled];"
        f"[s2_bg_scaled]overlay=x=0:y='-t/{d2}*({HEIGHT*1.1-HEIGHT})'[s2_base];"
        f"[s2_base][s2_mg1_scaled]overlay=x=W/2-w/2:y='-h+(t/{d2})*(H+h)*1.2'[s2_over1];"
        f"[s2_over1][s2_mg2_scaled]overlay=x=W/3-w/2:y='-h+(t/{d2})*(H+h)*0.8'[s2_over2];"
        f"[s2_over2][s2_fg_scaled]overlay=x=0:y=0:shortest=1,trim=duration={d2},setpts=PTS-STARTPTS[v_scene2]"
    )

    # Scene 3: Zoom out + Pan
    s3_bg, s3_mg1, s3_mg2, s3_fg = image_indices['s3_bg'], image_indices['s3_mg1'], image_indices['s3_mg2'], image_indices['s3_fg']
    filters.append(
        f"[{s3_bg}:v]scale={WIDTH}x{HEIGHT},format=yuva420p[s3_bg_base];"
        f"[{s3_mg1}:v]scale={WIDTH*0.5:.0f}:-1,format=yuva420p[s3_mg1_scaled];"
        f"[{s3_mg2}:v]scale={WIDTH*0.9:.0f}:-1,format=yuva420p[s3_mg2_scaled];"
        f"[{s3_fg}:v]scale={WIDTH}:{HEIGHT},format=yuva420p,colorchannelmixer=rr=1.2:rb=0:rg=0:aa=0.7[s3_fg_scaled];"
        f"[s3_bg_base]zoompan=z='1+0.15*t/{d3}':d={d3*FPS:.0f}:s={WIDTH}x{HEIGHT}[s3_base];"
        f"[s3_base][s3_mg1_scaled]overlay=x=W/4-w/2:y='-h+(t/{d3})*(H+h)*1.5'[s3_over1];"
        f"[s3_over1][s3_mg2_scaled]overlay=x='-w+(t/{d3})*(W+w)':y=H-h,fade=in:st=0:d=1:alpha=1,fade=out:st={d3-1:.2f}:d=1:alpha=1[s3_over2];"
        f"[s3_over2][s3_fg_scaled]overlay=x=0:y=0,trim=duration={d3},setpts=PTS-STARTPTS[v_scene3]"
    )

    # Scene 4: XFade between two sub-scenes
    s4a_bg, s4a_mg, s4a_fg = image_indices['s4a_bg'], image_indices['s4a_mg'], image_indices['s4a_fg']
    filters.append(
        f"[{s4a_bg}:v]scale={WIDTH*1.2:.0f}x-1,crop={WIDTH}:{HEIGHT},format=yuva420p[s4a_bg_scaled];"
        f"[{s4a_mg}:v]scale={WIDTH*0.7:.0f}:-1,format=yuva420p[s4a_mg_scaled];"
        f"[{s4a_fg}:v]scale={WIDTH}:{HEIGHT},format=yuva420p[s4a_fg_scaled];"
        f"[s4a_bg_scaled]overlay=x='-t/{d4_total}*{WIDTH*0.2}':y=0[s4a_base];"
        f"[s4a_base][s4a_mg_scaled]overlay=x=W/2-w/2:y='-t/{d4_total}*{HEIGHT*0.3}'[s4a_over1];"
        f"[s4a_over1][s4a_fg_scaled]overlay=x=0:y=0,trim=duration={d4_total},setpts=PTS-STARTPTS[v_scene4a]"
    )
    s4b_bg, s4b_mg, s4b_fg = image_indices['s4b_bg'], image_indices['s4b_mg'], image_indices['s4b_fg']
    filters.append(
        f"[{s4b_bg}:v]scale={WIDTH*1.1:.0f}x-1,crop={WIDTH}:{HEIGHT},format=yuva420p[s4b_bg_scaled];"
        f"[{s4b_mg}:v]scale={WIDTH*0.6:.0f}:-1,format=yuva420p[s4b_mg_scaled];"
        f"[{s4b_fg}:v]scale={WIDTH*0.4:.0f}:-1,format=yuva420p[s4b_fg_scaled];"
        f"[s4b_bg_scaled]zoompan=z='1.1-0.05*t/{d4_total}':d={d4_total*FPS:.0f}:s={WIDTH}x{HEIGHT}[s4b_base];"
        f"[s4b_base][s4b_mg_scaled]overlay=x=W/2-w/2:y=H-h*1.1[s4b_over1];"
        f"[s4b_over1][s4b_fg_scaled]overlay=x=W-w*1.1:y=H-h*1.1,trim=duration={d4_total},setpts=PTS-STARTPTS[v_scene4b]"
    )
    filters.append(f"[v_scene4a][v_scene4b]xfade=transition=fade:duration={fade_duration}:offset={d4_fade_offset:.2f}[v_scene4]")

    # Scene 5: Pseudo-3D Perspective
    s5_bg, s5_mg1, s5_mg2, s5_fg = image_indices['s5_bg'], image_indices['s5_mg1'], image_indices['s5_mg2'], image_indices['s5_fg']
    filters.append(
        f"[{s5_bg}:v]scale={WIDTH*1.4:.0f}x-1,format=yuva420p[s5_bg_scaled];"
        f"[{s5_mg1}:v]scale={WIDTH*1.2:.0f}x-1,format=yuva420p[s5_mg1_scaled];"
        f"[{s5_mg2}:v]scale={WIDTH*0.5:.0f}:-1,format=yuva420p,fade=in:st=1:d=2:alpha=1[s5_mg2_scaled];"
        f"[{s5_fg}:v]scale={WIDTH*0.3:.0f}:-1,format=yuva420p[s5_fg_scaled];"
        f"[s5_bg_scaled]crop={WIDTH}:{HEIGHT}:x='(iw-ow)/2+t/{d5}*{WIDTH*0.1}':y='(ih-oh)/2-t/{d5}*{HEIGHT*0.1}'[s5_base];"
        f"[s5_base][s5_mg1_scaled]overlay=x='(W-w)/2-t/{d5}*{WIDTH*0.2}':y=H-h[s5_over1];"
        f"[s5_over1][s5_mg2_scaled]overlay=x=W/2-w/2:y='H-h-(t/{d5})*H*0.4'[s5_over2];"
        f"[s5_over2][s5_fg_scaled]overlay=x='-w+(t/{d5})*(W+w)':y=H*0.2,trim=duration={d5},setpts=PTS-STARTPTS[v_scene5]"
    )
    
    filters.append("[v_scene1][v_scene2][v_scene3][v_scene4][v_scene5]concat=n=5:v=1:a=0[v]")
    filter_complex = "".join(filters)

    command = ["ffmpeg", "-y"]
    command.extend(inputs)
    command.extend([
        "-filter_complex", filter_complex,
        "-map", "[v]", "-map", f"{audio_input_index}:a",
        "-c:v", "libx264", "-preset", "slow", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p", "-r", str(FPS), "-t", str(total_duration),
        OUTPUT_PATH,
    ])

    return command

def main():
    """Main function to generate the video."""
    check_dependencies()
    
    total_duration = get_audio_duration(AUDIO_PATH)
    if TIMELINE[-1]["end"] == -1:
        TIMELINE[-1]["end"] = total_duration

    output_dir = os.path.dirname(OUTPUT_PATH)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    ffmpeg_command = construct_ffmpeg_command(total_duration)

    print("Executing ffmpeg command... This may take a while.")
    # For debugging a complex command, uncomment the next line:
    # print(" ".join(f'"{arg}"' if " " in arg else arg for arg in ffmpeg_command))
    
    try:
        subprocess.run(ffmpeg_command, check=True, capture_output=True)
        print(f"\nSuccessfully created video: {OUTPUT_PATH}")
    except subprocess.CalledProcessError as e:
        print("\n--- ERROR EXECUTING FFMPEG ---", file=sys.stderr)
        print(f"Return Code: {e.returncode}", file=sys.stderr)
        print("\n--- FFMPEG STDERR: ---", file=sys.stderr)
        print(e.stderr.decode('utf-8'), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
```