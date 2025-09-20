#!/usr/bin/env python3
import shutil, subprocess, sys, os

#!/usr/bin/env python3

import subprocess
import os
import shutil
import sys
import json

# --- Configuration ---
WIDTH = 3840
HEIGHT = 2160
FPS = 30
AUDIO_PATH = 'BOOKS/Temp/TTS/Lesson_7.wav'
IMAGE_DIR = 'assets/images'
OUTPUT_DIR = 'BOOKS/Temp/VIDEO_FFMPEG'
OUTPUT_FILENAME = 'Lesson_7_ffmpeg_output.mp4'
OUTPUT_PATH = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)

# --- Asset Mapping ---
# Assigns a logical name to each image file for easier reference in scene creation.
IMAGE_ASSETS = {
    # Scene 1: Innovation's cost
    's1_bg': 'blueprint_bg.jpg',
    's1_mid': 'gears-midground.png',
    's1_fg': 'falling-chart.png',
    # Scene 2: Past failures (Fire Phone)
    's2_bg': 'dark_clouds.jpg',
    's2_mid': 'city_background.jpg',
    's2_fg': 'broken_gears.png',
    's2_overlay': 'cracked_glass_overlay.png',
    # Scene 3: Disaster and humiliation
    's3_bg': 'rainy-city.jpg',
    's3_mid': 'sad-people.png',
    's3_overlay': 'rain_overlay.png',
    # Scene 4: The turning point
    's4_bg': 'winding-path.jpg',
    's4_fg': 'fortress.png',
    # Scene 5: Repurposing knowledge
    's5_bg': 'data_center_background.jpg',
    's5_mid': 'server-racks-midground.png',
    's5_fg': 'data_stream.png',
    # Scene 6: Success (Echo/Alexa)
    's6_bg': 'tech_cityscape.jpg',
    's6_mid': 'glowing_particles.png',
    's6_overlay': 'soundwaves_overlay.png',
    # Scene 7: Rebirth from ashes
    's7_bg': 'sunrise-field.jpg',
    's7_phoenix': 'phoenix_from_ashes.png',
    's7_plant': 'resilient-plant.png',
}

def check_requirements():
    """Checks for ffmpeg, ffprobe, and all required media files."""
    print("--- Checking requirements ---")
    if not shutil.which("ffmpeg"):
        sys.exit("Error: ffmpeg not found in PATH.")
    if not shutil.which("ffprobe"):
        sys.exit("Error: ffprobe not found in PATH.")
    
    required_files = [AUDIO_PATH] + [os.path.join(IMAGE_DIR, f) for f in set(IMAGE_ASSETS.values())]
    for f in required_files:
        if not os.path.isfile(f):
            sys.exit(f"Error: Required file not found: {f}")
        if not os.access(f, os.R_OK):
            sys.exit(f"Error: Cannot read file: {f}")
    print("All requirements met.")

def get_audio_duration(filepath):
    """Gets the duration of an audio file in seconds using ffprobe."""
    command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        filepath
    ]
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return float(result.stdout)
    except (subprocess.CalledProcessError, ValueError) as e:
        sys.exit(f"Error getting audio duration: {e}")

def main():
    """Constructs and executes the ffmpeg command."""
    check_requirements()
    
    total_duration = get_audio_duration(AUDIO_PATH)
    print(f"Audio duration: {total_duration:.2f} seconds.")

    # --- Scene Timeline ---
    scenes = [
        {'start': 0.0,    'end': 5.53},
        {'start': 5.53,   'end': 16.64},
        {'start': 16.64,  'end': 31.14},
        {'start': 31.14,  'end': 41.58},
        {'start': 41.58,  'end': 57.82},
        {'start': 57.82,  'end': 67.12},
        {'start': 67.12,  'end': total_duration},
    ]

    unique_images = sorted(list(set(IMAGE_ASSETS.values())))
    image_map = {name: i for i, name in enumerate(unique_images)}

    ffmpeg_cmd = ['ffmpeg', '-y']
    for img_file in unique_images:
        ffmpeg_cmd.extend(['-loop', '1', '-i', os.path.join(IMAGE_DIR, img_file)])
    ffmpeg_cmd.extend(['-i', AUDIO_PATH])

    filter_chains = []
    scene_outputs = []
    
    # --- Scene 1: The Price of Innovation (0.00 - 5.53) ---
    s1_dur = scenes[0]['end'] - scenes[0]['start']
    s1_bg, s1_mid, s1_fg = image_map[IMAGE_ASSETS['s1_bg']], image_map[IMAGE_ASSETS['s1_mid']], image_map[IMAGE_ASSETS['s1_fg']]
    filter_chains.append(
        f"[{s1_bg}:v]scale={WIDTH*1.2}:-1,crop={WIDTH}:{HEIGHT},zoompan=z='min(zoom+0.0005,1.2)':d={s1_dur*FPS}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'[s1_base];"
        f"[{s1_mid}:v]scale={WIDTH*0.4}:-1,rotate='t*5*PI/180':c=none:ow=rotw(iw):oh=roth(ih)[s1_gears];"
        f"[{s1_fg}:v]scale={WIDTH*0.4}:-1[s1_chart];"
        f"[s1_base][s1_gears]overlay=(W-w)/2:(H-h)/2[s1_bg_gears];"
        f"[s1_bg_gears][s1_chart]overlay=x='W/2':y='-h+(t/{s1_dur})*(H+h)'[s1_pre]"
    )
    
    # --- Scene 2: Ghosts of Failures Past (5.53 - 16.64) ---
    s2_dur = scenes[1]['end'] - scenes[1]['start']
    s2_bg, s2_mid, s2_fg, s2_over = image_map[IMAGE_ASSETS['s2_bg']], image_map[IMAGE_ASSETS['s2_mid']], image_map[IMAGE_ASSETS['s2_fg']], image_map[IMAGE_ASSETS['s2_overlay']]
    filter_chains.append(
        f"[{s2_mid}:v]scale={WIDTH*1.1}:-1,crop={WIDTH}:{HEIGHT}:x='t*20':y=0[s2_city];"
        f"[{s2_bg}:v]scale={WIDTH*1.2}:-1,crop={WIDTH}:{HEIGHT}:x='t*35':y=0[s2_clouds];"
        f"[{s2_fg}:v]scale={WIDTH*0.6}:-1[s2_b_gears];"
        f"[{s2_overlay}:v]scale={WIDTH}:{HEIGHT},format=rgba,colorchannelmixer=aa=0.7[s2_glass];"
        f"[s2_city][s2_clouds]overlay=0:0[s2_base];"
        f"[s2_base][s2_b_gears]overlay=x='W*0.1':y='H*0.1+sin(t*0.5)*20'[s2_bg_gears];"
        f"[s2_bg_gears][s2_glass]overlay=0:0[s2_pre]"
    )

    # --- Scene 3: Public Humiliation (16.64 - 31.14) ---
    s3_dur = scenes[2]['end'] - scenes[2]['start']
    s3_bg, s3_mid, s3_over = image_map[IMAGE_ASSETS['s3_bg']], image_map[IMAGE_ASSETS['s3_mid']], image_map[IMAGE_ASSETS['s3_overlay']]
    filter_chains.append(
        f"[{s3_bg}:v]scale={WIDTH*1.1}:-1,crop={WIDTH}:{HEIGHT}[s3_base];"
        f"[{s3_mid}:v]scale={WIDTH}:-1,crop={WIDTH}:{HEIGHT},zoompan=z='min(zoom+0.0003,1.1)':d={s3_dur*FPS}:x='iw/2-(iw/zoom/2)':y='ih*0.6-(ih/zoom/2)'[s3_people];"
        f"[{s3_over}:v]scale={WIDTH}:{HEIGHT}[s3_rain];"
        f"[s3_base][s3_people]overlay=(W-w)/2:H-h[s3_bg_people];"
        f"[s3_bg_people][s3_rain]overlay=x=0:y='mod(t*200,h)'[s3_pre]"
    )
    
    # --- Scene 4: A Different Path (31.14 - 41.58) ---
    s4_dur = scenes[3]['end'] - scenes[3]['start']
    s4_bg, s4_fg = image_map[IMAGE_ASSETS['s4_bg']], image_map[IMAGE_ASSETS['s4_fg']]
    filter_chains.append(
        f"[{s4_bg}:v]scale={WIDTH*1.5}:-1,zoompan=z='1.5-t/{s4_dur}*0.5':d={s4_dur*FPS}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'[s4_base];"
        f"[{s4_fg}:v]scale={WIDTH*0.35}:-1[s4_fortress];"
        f"[s4_base][s4_fortress]overlay=x='W*0.7-(t/{s4_dur})*W*0.2':y='H*0.2'[s4_pre]"
    )
    
    # --- Scene 5: Repurposed Knowledge (41.58 - 57.82) ---
    s5_dur = scenes[4]['end'] - scenes[4]['start']
    s5_bg, s5_mid, s5_fg = image_map[IMAGE_ASSETS['s5_bg']], image_map[IMAGE_ASSETS['s5_mid']], image_map[IMAGE_ASSETS['s5_fg']]
    filter_chains.append(
        f"[{s5_bg}:v]scale={WIDTH*1.2}:-1,crop={WIDTH}:{HEIGHT}:x='t*50':y=0[s5_base];"
        f"[{s5_mid}:v]scale={WIDTH*1.2}:-1[s5_racks];"
        f"[{s5_fg}:v]scale={WIDTH}:-1,format=rgba,colorchannelmixer=aa=0.7[s5_stream];"
        f"[s5_base][s5_racks]overlay=x='W-w-t*80':y='(H-h)/2'[s5_bg_racks];"
        f"[s5_bg_racks][s5_stream]overlay=x='-w+mod(t*400,W+w)':y='H*0.2'[s5_pre]"
    )
    
    # --- Scene 6: A New Category (57.82 - 67.12) ---
    s6_dur = scenes[5]['end'] - scenes[5]['start']
    s6_bg, s6_mid, s6_over = image_map[IMAGE_ASSETS['s6_bg']], image_map[IMAGE_ASSETS['s6_mid']], image_map[IMAGE_ASSETS['s6_overlay']]
    s6_zoom_rate = (1.2 - 1.0) / s6_dur
    filter_chains.append(
        f"[{s6_bg}:v]scale={WIDTH*1.2}:-1,zoompan=z='1+t*{s6_zoom_rate}':d={s6_dur*FPS}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'[s6_base];"
        f"[{s6_mid}:v]scale={WIDTH}:{HEIGHT},format=rgba,colorchannelmixer=aa=0.6[s6_particles];"
        f"[{s6_over}:v]scale=w='min(W,t*{WIDTH/s6_dur*2})':h='min(H,t*{HEIGHT/s6_dur*2})',format=rgba,colorchannelmixer=aa=0.5[s6_waves];"
        f"[s6_base][s6_particles]overlay=x=0:y='-h+mod(t*100, H+h)'[s6_bg_part];"
        f"[s6_bg_part][s6_waves]overlay=x='(W-w)/2':y='(H-h)/2'[s6_pre]"
    )

    # --- Scene 7: Success from Ashes (67.12 - end) ---
    s7_dur = scenes[6]['end'] - scenes[6]['start']
    s7_bg, s7_phoenix, s7_plant = image_map[IMAGE_ASSETS['s7_bg']], image_map[IMAGE_ASSETS['s7_phoenix']], image_map[IMAGE_ASSETS['s7_plant']]
    filter_chains.append(
        f"[{s7_bg}:v]scale={WIDTH*1.1}:-1,crop={WIDTH}:{HEIGHT},zoompan=z='min(zoom+0.0002,1.1)':d={s7_dur*FPS}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'[s7_base];"
        f"[{s7_phoenix}:v]scale={WIDTH*0.6}:-1,format=rgba,fade=in:st=0:d=2:alpha=1[s7_phx];"
        f"[{s7_plant}:v]scale={WIDTH*0.25}:-1[s7_plnt];"
        f"[s7_base][s7_phx]overlay=(W-w)/2:y='H*0.8-h-(t*15)'[s7_bg_phx];"
        f"[s7_bg_phx][s7_plnt]overlay=x='W*0.7':y='H-h'[s7_pre]"
    )
    
    # --- Final Processing and Concatenation ---
    for i, scene in enumerate(scenes):
        dur = scene['end'] - scene['start']
        scene_outputs.append(f"[s{i+1}_pre]trim=start=0:duration={dur},setpts=PTS-STARTPTS,format=yuv420p,scale={WIDTH}:{HEIGHT},fps={FPS}[s{i+1}v]")

    concat_inputs = "".join([f"[s{i+1}v]" for i in range(len(scenes))])
    concat_filter = f"{concat_inputs}concat=n={len(scenes)}:v=1:a=0[v]"
    
    full_filter_complex = ";".join(filter_chains + scene_outputs + [concat_filter])
    
    ffmpeg_cmd.extend([
        '-filter_complex', full_filter_complex,
        '-map', '[v]',
        '-map', f'{len(unique_images)}:a',
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '18',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-r', str(FPS),
        '-t', str(total_duration),
        OUTPUT_PATH
    ])

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("\n--- Running ffmpeg command ---")
    # print(" ".join(f"'{c}'" if " " in c else c for c in ffmpeg_cmd)) # Uncomment for full command debugging
    
    try:
        subprocess.run(ffmpeg_cmd, check=True)
        print(f"\n--- Success! ---")
        print(f"Video created at: {OUTPUT_PATH}")
    except subprocess.CalledProcessError as e:
        print(f"\n--- Error ---")
        print(f"ffmpeg failed with exit code {e.returncode}")
        print("Stderr:", e.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```
