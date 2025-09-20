#!/usr/bin/env python3
import shutil, subprocess, sys, os

```python
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
AUDIO_PATH = 'BOOKS/Temp/TTS/Lesson_3.wav'
IMAGE_DIR = 'assets/images'
OUTPUT_DIR = 'BOOKS/Temp/VIDEO_FFMPEG'
OUTPUT_PATH = os.path.join(OUTPUT_DIR, 'Lesson_3_ffmpeg_output.mp4')
CRF = 18
PRESET = 'slow'
AUDIO_BITRATE = '192k'

# --- Timeline and Scene Assets ---
SCENE_DATA = [
    {
        "end_time": 5.38,
        "layers": [
            {'img': 'blueprint_bg.jpg', 'type': 'background'},
            {'img': 'gears-midground.png', 'type': 'midground'},
            {'img': 'gears-foreground.png', 'type': 'foreground'},
        ],
        "technique": "zoom_3d"
    },
    {
        "end_time": 14.18,
        "layers": [
            {'img': 'rainy-city.jpg', 'type': 'background'},
            {'img': 'city-skyline-mid.png', 'type': 'midground'},
            {'img': 'rain_overlay.png', 'type': 'overlay'},
            {'img': 'cracked_glass_overlay.png', 'type': 'overlay_static'},
        ],
        "technique": "pan_horizontal"
    },
    {
        "end_time": 24.40,
        "layers": [
            {'img': 'dark_clouds.jpg', 'type': 'background'},
            {'img': 'stock-chart-midground.png', 'type': 'midground'},
            {'img': 'resilient-plant.png', 'type': 'foreground'},
        ],
        "technique": "pan_vertical_reveal"
    },
    {
        "end_time": 33.38,
        "layers": [
            {'img': 'data-center-background.jpg', 'type': 'background'},
            {'img': 'server-racks-midground.png', 'type': 'midground'},
            {'img': 'data_stream.png', 'type': 'overlay'},
        ],
        "technique": "push_in_zoom"
    },
    {
        "end_time": 48.24,
        "layers": [
            {'img': 'sunrise-field.jpg', 'type': 'background'},
            {'img': 'fortress.png', 'type': 'midground'},
            {'img': 'phoenix_from_ashes.png', 'type': 'foreground'},
        ],
        "technique": "growth_and_rise"
    },
    {
        "end_time": -1, # Will be replaced by total duration
        "layers": [
            {'img': 'tech_city_background.jpg', 'type': 'background'},
            {'img': 'aws-logo.png', 'type': 'midground'},
            {'img': 'data_stream_foreground.png', 'type': 'overlay'},
        ],
        "technique": "final_pan"
    }
]

def check_dependencies():
    """Checks for required command-line tools and input files."""
    if not shutil.which('ffmpeg'):
        print("Error: ffmpeg is not installed or not in PATH.", file=sys.stderr)
        sys.exit(1)
    if not shutil.which('ffprobe'):
        print("Error: ffprobe is not installed or not in PATH.", file=sys.stderr)
        sys.exit(1)
    if not os.path.isfile(AUDIO_PATH):
        print(f"Error: Audio file not found at '{AUDIO_PATH}'", file=sys.stderr)
        sys.exit(1)
    for scene in SCENE_DATA:
        for layer in scene['layers']:
            if not os.path.isfile(os.path.join(IMAGE_DIR, layer['img'])):
                print(f"Error: Image file not found: '{os.path.join(IMAGE_DIR, layer['img'])}'", file=sys.stderr)
                sys.exit(1)

def get_audio_duration(filepath):
    """Gets the duration of an audio file in seconds."""
    command = [
        'ffprobe',
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        filepath
    ]
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    return float(result.stdout)

def build_scene_filter(scene_idx, start_time, duration, layers, technique, image_map):
    """Builds the filter string for a single scene."""
    W, H, D = WIDTH, HEIGHT, duration
    chains = []
    last_stream = ""

    # Background Layer
    bg_idx = image_map[layers[0]['img']]
    if technique == "zoom_3d":
        zoom_rate = 1 + 0.1 * (1 / D)
        chains.append(f"[{bg_idx}:v]trim=duration={D},setpts=PTS-STARTPTS,scale=w='iw*{zoom_rate*1.1}':h='ih*{zoom_rate*1.1}',crop=w={W}:h={H}:x='(iw-ow)/2':y='(ih-oh)/2',format=yuv420p[s{scene_idx}_v0]")
    elif technique == "pan_horizontal":
        pan_dist = 150
        chains.append(f"[{bg_idx}:v]trim=duration={D},setpts=PTS-STARTPTS,scale={W+pan_dist}:-1,crop=w={W}:h={H}:x='{pan_dist}*t/{D}':y=0,format=yuv420p[s{scene_idx}_v0]")
    elif technique == "pan_vertical_reveal":
        pan_dist = (2400-H)
        chains.append(f"[{bg_idx}:v]trim=duration={D},setpts=PTS-STARTPTS,scale=-1:2400,crop=w={W}:h={H}:x=0:y='{pan_dist}*(1-t/{D})',format=yuv420p[s{scene_idx}_v0]")
    elif technique == "push_in_zoom":
        z = f"1+0.1*t/{D}"
        chains.append(f"[{bg_idx}:v]trim=duration={D},setpts=PTS-STARTPTS,scale=w='iw*({z})':h='ih*({z})',crop={W}:{H}:(iw-ow)/2:(ih-oh)/2,format=yuv420p[s{scene_idx}_v0]")
    elif technique == "growth_and_rise":
        chains.append(f"[{bg_idx}:v]trim=duration={D},setpts=PTS-STARTPTS,scale={W+100}:-1,crop=w={W}:h={H}:x='100*t/{D}':y=0,format=yuv420p[s{scene_idx}_v0]")
    elif technique == "final_pan":
        chains.append(f"[{bg_idx}:v]trim=duration={D},setpts=PTS-STARTPTS,scale={W+200}:-1,crop=w={W}:h={H}:x='200*(1-t/{D})':y=0,format=yuv420p[s{scene_idx}_v0]")
    last_stream = f"[s{scene_idx}_v0]"

    # Overlay Layers
    for i, layer in enumerate(layers[1:], 1):
        img_idx = image_map[layer['img']]
        in_stream = last_stream
        out_stream = f"[s{scene_idx}_v{i}]"
        layer_pre = f"[s{scene_idx}_l{i}_pre]"

        # Animation logic for the layer
        anim_chain = ""
        overlay_pos = ""
        if technique == "zoom_3d": # Parallax zoom
            z = f"1 + {0.15 + i*0.1}*t/{D}"
            anim_chain = f"scale=w='iw*({z})':h='-1'"
            overlay_pos = f"x=(W-w)/2:y=(H-h)/2"
        elif technique == "pan_horizontal":
            if layer['type'] == 'midground':
                pan_dist = 250
                anim_chain = f"scale={W+pan_dist}:-1"
                overlay_pos = f"x='{pan_dist}*t/{D}':y=(H-h)"
            elif layer['type'] == 'overlay':
                anim_chain = "null" # no scaling needed for scrolling overlay
                overlay_pos = f"x=0:y='mod(t*200,{H+h})-h'"
            elif layer['type'] == 'overlay_static':
                anim_chain = f"scale={W}:{H}"
                overlay_pos = "x=0:y=0"
        elif technique == "pan_vertical_reveal":
            if layer['type'] == 'midground': # stock chart rising
                anim_chain = "scale=w=iw*0.8:h=-1"
                overlay_pos = f"x=W*0.1:y='H - h*(t/{D})*0.8'"
            elif layer['type'] == 'foreground': # plant growing
                s = f"0.8+0.25*t/{D}"
                anim_chain = f"scale=w='iw*({s})':h='-1'"
                overlay_pos = "x=(W-w)/2:y=H-h"
        elif technique == "push_in_zoom":
             if layer['type'] == 'midground':
                z = f"1 + {0.15 + i*0.05}*t/{D}"
                anim_chain = f"scale=w='iw*({z})':h='-1'"
                overlay_pos = f"x=(W-w)/2:y=(H-h)/2"
             elif layer['type'] == 'overlay':
                anim_chain = "scale=w=W:h=-1"
                overlay_pos = f"x='-w+(W+w)*t/{D}':y='H/2.5'"
        elif technique == "growth_and_rise":
            if layer['type'] == 'midground': # fortress
                s = f"0.6 + 0.4*t/{D}"
                anim_chain = f"scale=w='iw*({s})':h='-1'"
                overlay_pos = f"x=(W-w)/2:y=H-h"
            elif layer['type'] == 'foreground': # phoenix
                s = f"0.5 + 0.2*t/{D}"
                fade_alpha = f"colorchannelmixer=aa='min(1, t/({D}/2))'"
                anim_chain = f"format=rgba,{fade_alpha},scale=w='iw*({s})':h='-1'"
                overlay_pos = f"x=(W-w)/2:y='H*0.8 - (H/2)*t/{D}'"
        elif technique == "final_pan":
            if layer['type'] == 'midground': # aws logo
                s = f"0.8 + 0.2*t/{D}"
                fade_alpha = f"colorchannelmixer=aa='min(1, 2*t/{D})'"
                anim_chain = f"format=rgba,{fade_alpha},scale=w='iw*({s})':h='-1'"
                overlay_pos = f"x=W*0.6:y=H*0.4"
            elif layer['type'] == 'overlay': # data stream
                anim_chain = f"scale=w={W}:h=-1"
                overlay_pos = f"x='-w+(W+w)*2*t/{D}':y='H-h'"

        chains.append(f"[{img_idx}:v]trim=duration={D},setpts=PTS-STARTPTS,{anim_chain}{layer_pre}")
        chains.append(f"{in_stream}{layer_pre}overlay={overlay_pos}{out_stream}")
        last_stream = out_stream

    final_scene_stream = f"[scene{scene_idx}_v]"
    chains.append(f"{last_stream}setdar=16/9{final_scene_stream}")
    return ";".join(chains), final_scene_stream

def main():
    """Main script execution."""
    check_dependencies()
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    try:
        total_duration = get_audio_duration(AUDIO_PATH)
    except (subprocess.CalledProcessError, ValueError) as e:
        print(f"Error getting audio duration: {e}", file=sys.stderr)
        sys.exit(1)
        
    if SCENE_DATA[-1]["end_time"] == -1:
        SCENE_DATA[-1]["end_time"] = total_duration

    # --- Build ffmpeg command ---
    ffmpeg_cmd = ['ffmpeg', '-y']
    
    # Collect unique images and build input list
    unique_images = sorted(list(set(layer['img'] for scene in SCENE_DATA for layer in scene['layers'])))
    image_map = {name: i for i, name in enumerate(unique_images)}
    for img_name in unique_images:
        ffmpeg_cmd.extend(['-loop', '1', '-i', os.path.join(IMAGE_DIR, img_name)])
    
    audio_input_index = len(unique_images)
    ffmpeg_cmd.extend(['-i', AUDIO_PATH])

    # Build filter complex
    filter_chains = []
    scene_outputs = []
    last_end_time = 0.0

    for i, scene in enumerate(SCENE_DATA):
        start_time = last_end_time
        duration = scene['end_time'] - start_time
        if duration <= 0: continue
        
        scene_filter, scene_stream_name = build_scene_filter(
            i, start_time, duration, scene['layers'], scene['technique'], image_map
        )
        filter_chains.append(scene_filter)
        scene_outputs.append(scene_stream_name)
        last_end_time = scene['end_time']

    concat_filter = f"{''.join(scene_outputs)}concat=n={len(scene_outputs)}:v=1:a=0[final_v]"
    filter_chains.append(concat_filter)
    
    final_filter_complex = ";".join(filter_chains)

    ffmpeg_cmd.extend([
        '-filter_complex', final_filter_complex,
        '-map', '[final_v]',
        '-map', f'{audio_input_index}:a:0',
        '-c:v', 'libx264',
        '-preset', PRESET,
        '-crf', str(CRF),
        '-c:a', 'aac',
        '-b:a', AUDIO_BITRATE,
        '-r', str(FPS),
        '-pix_fmt', 'yuv420p',
        '-t', str(total_duration),
        OUTPUT_PATH
    ])
    
    print("--- FFMPEG COMMAND ---")
    print(" ".join(f"'{arg}'" if " " in arg else arg for arg in ffmpeg_cmd))
    print("----------------------")
    print(f"Generating video, this might take a while...")

    try:
        subprocess.run(ffmpeg_cmd, check=True)
        print(f"\nSuccessfully created video: {OUTPUT_PATH}")
    except subprocess.CalledProcessError as e:
        print(f"\nError during ffmpeg execution:", file=sys.stderr)
        print(f"Command: {' '.join(e.cmd)}", file=sys.stderr)
        print(f"Return code: {e.returncode}", file=sys.stderr)
        if e.stdout:
            print(f"stdout: {e.stdout}", file=sys.stderr)
        if e.stderr:
            print(f"stderr: {e.stderr}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()

```