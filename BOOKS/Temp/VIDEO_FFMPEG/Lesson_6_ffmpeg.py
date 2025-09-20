#!/usr/bin/env python3
import shutil, subprocess, sys, os

```python
#!/usr/bin/env python3

import subprocess
import os
import sys
import shutil
import json

# --- Configuration ---
WIDTH = 3840
HEIGHT = 2160
FPS = 30
AUDIO_PATH = 'BOOKS/Temp/TTS/Lesson_6.wav'
OUTPUT_PATH = 'BOOKS/Temp/VIDEO_FFMPEG/Lesson_6_ffmpeg_output.mp4'
IMAGE_DIR = 'assets/images'

# List of all image assets required for the video
# This also defines the order of `-i` flags for ffmpeg
IMAGE_ASSETS = [
    # Scene 1
    'abstract_gears_background.jpg', # 0
    'glowing-data.png',              # 1
    'fortress.png',                  # 2
    'tech_overlay_foreground.png',   # 3
    # Scene 2
    'data_center_background.jpg',    # 4
    'server-racks-midground.png',    # 5
    'aws-logo.png',                  # 6
    'data_stream_foreground.png',    # 7
    # Scene 3
    'tech_city_background.jpg',      # 8
    'stock-chart-midground.png',     # 9
    'glowing_particles.png',         # 10
    # Scene 4
    'blueprint_bg.jpg',              # 11
    # 'fortress.png' is reused (2)
    'winding-path.png',              # 12
    # Scene 5
    'city_background.jpg',           # 13
    'amazon_warehouse_midground.png',# 14
    'delivery_drone_foreground.png', # 15
    # Scene 6
    'rainy-city.jpg',                # 16
    'falling-chart.png',             # 17
    'cracked_glass_overlay.png',     # 18
    # Scene 7
    'server-room.jpg',               # 19
    'data_stream.png',               # 20
    'sunrise-field.jpg',             # 21
]

def check_requirements():
    """Checks for ffmpeg, ffprobe, and all required media files."""
    if not shutil.which("ffmpeg"):
        sys.exit("Error: ffmpeg not found. Please install ffmpeg and ensure it's in your PATH.")
    if not shutil.which("ffprobe"):
        sys.exit("Error: ffprobe not found. Please install ffprobe and ensure it's in your PATH.")

    if not os.path.isfile(AUDIO_PATH):
        sys.exit(f"Error: Audio file not found at '{AUDIO_PATH}'")

    for img in sorted(list(set(IMAGE_ASSETS))): # check unique filenames
        path = os.path.join(IMAGE_DIR, img)
        if not os.path.isfile(path):
            sys.exit(f"Error: Image file not found at '{path}'")

    output_dir = os.path.dirname(OUTPUT_PATH)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

def get_audio_duration(file_path):
    """Gets the duration of an audio file in seconds using ffprobe."""
    command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        file_path,
    ]
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError) as e:
        sys.exit(f"Error getting audio duration: {e}")

def main():
    """Constructs and executes the ffmpeg command."""
    check_requirements()
    total_duration = get_audio_duration(AUDIO_PATH)

    # --- Timeline and Scene Durations ---
    scenes = [
        (0.0, 4.30),      # S1: "invade new territories"
        (4.30, 11.08),    # S2: "AWS is a monster"
        (11.08, 24.22),   # S3: "$17 billion"
        (24.22, 35.08),   # S4: "war chest"
        (35.08, 49.68),   # S5: "buying whole foods"
        (49.68, 61.52),   # S6: "stocks plummeted"
        (61.52, total_duration) # S7: "a different game"
    ]
    durations = [end - start for start, end in scenes]

    filter_complex_parts = []

    # --- Scene 1: Cash Cow Invasion (0.00 - 4.30) ---
    d1 = durations[0]
    bg_zoom_start, bg_zoom_end = 1.1, 1.0
    filter_complex_parts.append(f"""
        [0:v]format=yuv420p,scale={WIDTH*bg_zoom_start:.0f}x{HEIGHT*bg_zoom_start:.0f},
            zoompan=z='{bg_zoom_start}-({bg_zoom_start}-{bg_zoom_end})*t/{d1}':
            x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d={d1*FPS},
            scale={WIDTH}:{HEIGHT}[s1_bg];
        [1:v]scale={WIDTH}:-1[s1_l1];
        [2:v]scale={WIDTH//3}:-1[s1_l2];
        [3:v]format=yuva444p,
            colorchannelmixer=aa='if(lt(t,1),t/1,1)'[s1_fg];
        [s1_bg][s1_l1]overlay=x='-w+(t/{d1})*({WIDTH}+w)':y='H*0.6',eval=frame[s1_tmp1];
        [s1_tmp1][s1_l2]overlay=x='(W-w)/2':y='(H-h)/2',eval=frame[s1_tmp2];
        [s1_tmp2][s1_fg]overlay,
            trim=duration={d1},setpts=PTS-STARTPTS[v_s1]
    """)

    # --- Scene 2: AWS The Monster (4.30 - 11.08) ---
    d2 = durations[1]
    bg_pan_dist = WIDTH * 0.1
    mg1_pan_dist = WIDTH * 0.3
    fg_pan_dist = WIDTH + (WIDTH * 1.5)
    filter_complex_parts.append(f"""
        [4:v]scale={WIDTH*(1+0.1):.0f}:-1,crop={WIDTH}:{HEIGHT}:0:0,format=yuv420p[s2_bg];
        [5:v]scale={WIDTH*(1+0.3):.0f}:-1[s2_l1];
        [6:v]scale={WIDTH//4}:-1[s2_l2];
        [7:v]scale={WIDTH*1.5:.0f}:-1[s2_fg];
        [s2_bg][s2_l1]overlay=x='(t/{d2})*{mg1_pan_dist}':y='(H-h)/2',eval=frame[s2_tmp1];
        [s2_tmp1]overlay=x='(t/{d2})*{bg_pan_dist}',eval=frame[s2_tmp2];
        [s2_tmp2][s2_l2]overlay=x='W/2-w/2':y='H/2-h/2+sin(t*2)*20',eval=frame[s2_tmp3];
        [s2_tmp3][s2_fg]overlay=x='-w+(t/{d2})*{fg_pan_dist:.2f}',eval=frame,
            trim=duration={d2},setpts=PTS-STARTPTS[v_s2]
    """)

    # --- Scene 3: Money Printing Machine (11.08 - 24.22) ---
    d3 = durations[2]
    bg_pan_dist_y = HEIGHT * 0.1
    filter_complex_parts.append(f"""
        [8:v]scale=-1:{HEIGHT*(1+0.1):.0f},crop={WIDTH}:{HEIGHT}:0:0,format=yuv420p[s3_bg];
        [9:v]scale={WIDTH//2}:-1[s3_l1];
        [10:v]format=yuva444p[s3_fg];
        [s3_bg]overlay=y='(t/{d3})*{bg_pan_dist_y}',eval=frame[s3_tmp1];
        [s3_tmp1][s3_l1]overlay=x='W/2-w/2':y='H-(t/{d3})*(H+h)',eval=frame[s3_tmp2];
        [s3_tmp2][s3_fg]overlay=y='H-mod(t*200, H+h)',format=yuv420p,
            trim=duration={d3},setpts=PTS-STARTPTS[v_s3]
    """)

    # --- Scene 4: War Chest (24.22 - 35.08) ---
    d4 = durations[3]
    bg_zoom_s4 = 1.2
    fortress_start_scale = 0.5
    fortress_end_scale = 0.2
    path_start_scale = 0.1
    path_end_scale = 0.8
    filter_complex_parts.append(f"""
        [11:v]format=yuv420p,scale={WIDTH*bg_zoom_s4:.0f}x-1,
            zoompan=z='1+(t/{d4})*({bg_zoom_s4}-1)':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d={d4*FPS},
            scale={WIDTH}:{HEIGHT}[s4_bg];
        [2:v]format=yuva444p,
            scale=w='iw*({fortress_start_scale}-(t/{d4})*({fortress_start_scale}-{fortress_end_scale}))':h=-1[s4_l1];
        [12:v]format=yuva444p,
            scale=w='iw*({path_start_scale}+(t/{d4})*({path_end_scale}-{path_start_scale}))':h=-1[s4_l2];
        [s4_bg][s4_l1]overlay=x='W*0.1':y='H*0.1',eval=frame[s4_tmp1];
        [s4_tmp1][s4_l2]overlay=x='W/2-w/2':y='H/2-h/2',eval=frame,
            trim=duration={d4},setpts=PTS-STARTPTS[v_s4]
    """)

    # --- Scene 5: Buying Whole Foods (35.08 - 49.68) ---
    d5 = durations[4]
    filter_complex_parts.append(f"""
        [13:v]scale={WIDTH*1.1:.0f}:-1,crop={WIDTH}:{HEIGHT},format=yuv420p[s5_bg];
        [14:v]scale={WIDTH*1.2:.0f}:-1[s5_l1];
        [15:v]scale={WIDTH//3}:-1[s5_fg];
        [s5_bg]overlay=x='-(t/{d5})*({WIDTH}*0.1)',eval=frame[s5_tmp1];
        [s5_tmp1][s5_l1]overlay=x='-(t/{d5})*({WIDTH}*0.2)':y='H-h',eval=frame[s5_tmp2];
        [s5_tmp2][s5_fg]overlay=x='W-(t/{d5})*(W+w)':y='H*0.1',eval=frame,
            trim=duration={d5},setpts=PTS-STARTPTS[v_s5]
    """)

    # --- Scene 6: Stocks Plummeted (49.68 - 61.52) ---
    d6 = durations[5]
    filter_complex_parts.append(f"""
        [16:v]scale=-1:{HEIGHT*1.1:.0f},crop={WIDTH}:{HEIGHT},format=yuv420p[s6_bg];
        [17:v]scale={WIDTH//2}:-1[s6_l1];
        [18:v]format=yuva444p,
            colorchannelmixer=aa='if(lt(t,1),t/1*0.7,0.7)'[s6_fg];
        [s6_bg]overlay=y='-(t/{d6})*({HEIGHT}*0.1)',eval=frame[s6_tmp1];
        [s6_tmp1][s6_l1]overlay=x='(W-w)/2':y='-h+(t/{d6})*(H+h)',eval=frame[s6_tmp2];
        [s6_tmp2][s6_fg]overlay,
            trim=duration={d6},setpts=PTS-STARTPTS[v_s6]
    """)
    
    # --- Scene 7: A Different Game (61.52 - end) ---
    d7 = durations[6]
    filter_complex_parts.append(f"""
        [19:v]scale={WIDTH}:{HEIGHT},format=yuv420p[s7_bg];
        [20:v]loop=-1:size={FPS*d7},
             scale={WIDTH}:-1[s7_l1];
        [21:v]scale={WIDTH}:{HEIGHT},format=yuv420p[s7_fg];
        [s7_bg][s7_l1]overlay=x='-w+mod(t*400,{WIDTH}+w)':y='(H-h)/2',eval=frame[s7_tmp1];
        [s7_tmp1][s7_fg]overlay=x='W - (min(t,{d7}/2)/({d7}/2))*(W/2+10)':y=0,
            trim=duration={d7},setpts=PTS-STARTPTS[v_s7]
    """)

    # --- Concatenate all scenes ---
    concat_filter = "".join([f"[v_s{i+1}]" for i in range(len(scenes))])
    concat_filter += f"concat=n={len(scenes)}:v=1:a=0,format=yuv420p[v]"
    filter_complex_parts.append(concat_filter)

    # --- Build final command ---
    image_inputs = []
    unique_images = sorted(list(set(IMAGE_ASSETS)))
    for img in unique_images:
        image_inputs.extend(['-i', os.path.join(IMAGE_DIR, img)])
    
    image_map = {name: i for i, name in enumerate(unique_images)}
    
    # Remap filter graph indices to match the unique sorted input list
    final_filter_graph = ";".join(filter_complex_parts)
    for i, original_name in enumerate(IMAGE_ASSETS):
        final_filter_graph = final_filter_graph.replace(f'[{i}:v]', f'[{image_map[original_name]}:v]')

    audio_input_index = len(unique_images)
    
    command = [
        'ffmpeg', '-y',
        *image_inputs,
        '-i', AUDIO_PATH,
        '-filter_complex', final_filter_graph,
        '-map', '[v]',
        '-map', f'{audio_input_index}:a',
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '18',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-r', str(FPS),
        '-shortest',
        OUTPUT_PATH,
    ]

    print("--- Running FFmpeg command ---")
    # print(" ".join(command)) # Uncomment for debugging
    try:
        subprocess.run(command, check=True)
        print(f"\n✅ Success! Video saved to {OUTPUT_PATH}")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ FFmpeg command failed with exit code {e.returncode}")
        print(f"   Stderr: {e.stderr}")
        print(f"   Stdout: {e.stdout}")

if __name__ == '__main__':
    main()
```