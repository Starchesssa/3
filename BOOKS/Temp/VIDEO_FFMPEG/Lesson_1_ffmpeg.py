#!/usr/bin/env python3
import shutil, subprocess, sys, os


import subprocess
import os
import shutil
import sys
import json

# --- Configuration ---
WIDTH = 3840
HEIGHT = 2160
FPS = 30
AUDIO_PATH = 'BOOKS/Temp/TTS/Lesson_1.wav'
IMAGE_DIR = 'assets/images'
OUTPUT_DIR = 'BOOKS/Temp/VIDEO_FFMPEG'
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'Lesson_1_ffmpeg_output.mp4')

# --- Timeline and Scene Definition ---
SCENES = [
    {
        "start": 0.00, "end": 5.76, "effect": "pan_right_to_left",
        "layers": [
            'bright_sky.jpg', 'mountains-far.png', 'winding-path.jpg', 'single-tree.png'
        ]
    },
    {
        "start": 5.76, "end": 14.28, "effect": "zoom_in_float_up",
        "layers": [
            'city_background.jpg', 'stock-chart-midground.png', 'glowing_particles.png'
        ]
    },
    {
        "start": 14.28, "end": 24.16, "effect": "rainy_static_subject",
        "layers": [
            'rainy-city.jpg', 'amazon_box_foreground.png', 'rain_overlay.png'
        ]
    },
    {
        "start": 24.16, "end": 33.86, "effect": "perspective_zoom_out",
        "layers": [
            'blueprint_bg.jpg', 'gears-midground.png', 'tech-overlay-foreground.png'
        ]
    },
    {
        "start": 33.86, "end": 42.54, "effect": "vertical_parallax",
        "layers": [
            'tech_city_background.jpg', 'cloud_servers_midground.png', 'data_stream_foreground.png'
        ]
    },
    {
        "start": 42.54, "end": 53.28, "effect": "zoom_in_animated_overlay",
        "layers": [
            'sky-background.jpg', 'city-skyline-mid.png', 'falling-chart.png'
        ]
    },
    {
        "start": 53.28, "end": 60.60, "effect": "opacity_pulse",
        "layers": [
            'empty_city_street_background.jpg', 'amazon_box_foreground.png', 'glowing-data.png'
        ]
    },
    {
        "start": 60.60, "end": -1, "effect": "reverse_dolly_reveal", # -1 means end of audio
        "layers": [
            'data_center_background.jpg', 'server-racks-midground.png', 'aws-logo.png'
        ]
    },
]

def check_dependencies():
    """Checks for ffmpeg, ffprobe, and required files."""
    if not shutil.which("ffmpeg"):
        sys.exit("Error: ffmpeg not found in PATH.")
    if not shutil.which("ffprobe"):
        sys.exit("Error: ffprobe not found in PATH.")
    
    if not os.path.isfile(AUDIO_PATH):
        sys.exit(f"Error: Audio file not found at {AUDIO_PATH}")
        
    for scene in SCENES:
        for layer in scene['layers']:
            if not os.path.isfile(os.path.join(IMAGE_DIR, layer)):
                sys.exit(f"Error: Image file not found: {os.path.join(IMAGE_DIR, layer)}")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)

def get_audio_duration(file_path):
    """Gets the duration of an audio file using ffprobe."""
    command = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", file_path
    ]
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    return float(result.stdout.strip())

def build_ffmpeg_command(total_duration):
    """Constructs the full ffmpeg command."""
    inputs = []
    filter_complex_parts = []
    scene_outputs = []
    current_input_index = 1 # 0 is audio

    # Add audio input
    inputs.extend(['-i', AUDIO_PATH])

    for i, scene in enumerate(SCENES):
        start_time = scene['start']
        end_time = scene['end'] if scene['end'] != -1 else total_duration
        duration = end_time - start_time

        scene_img_indices = []
        for layer_filename in scene['layers']:
            inputs.extend(['-i', os.path.join(IMAGE_DIR, layer_filename)])
            scene_img_indices.append(current_input_index)
            current_input_index += 1
            
        # --- Scene-specific filter generation ---
        
        # All layers must be formatted for alpha blending
        for idx in scene_img_indices:
            filter_complex_parts.append(f"[{idx}:v]format=yuva420p[v{idx}]")

        # Create chain for the scene
        last_v_stream = f"v{scene_img_indices[0]}"
        
        if scene['effect'] == 'pan_right_to_left':
            w, h, d = WIDTH, HEIGHT, duration
            pan_dist_bg = int((w * 1.05 - w))
            filter_complex_parts.append(f"[{last_v_stream}]scale={w*1.05}:-1,crop={w}:{h}:(t/{d})*{pan_dist_bg}:0[s{i}_l0]")
            last_v_stream = f"s{i}_l0"
            for j, v_idx in enumerate(scene_img_indices[1:], 1):
                scale = 1.1 + j * 0.1
                pan_dist = int((w * scale - w))
                filter_complex_parts.append(f"[v{v_idx}]scale={w*scale}:-1,crop={w}:{h}:(t/{d})*{pan_dist}:0[s{i}_l{j}_fg]")
                filter_complex_parts.append(f"[{last_v_stream}][s{i}_l{j}_fg]overlay[s{i}_l{j}]")
                last_v_stream = f"s{i}_l{j}"

        elif scene['effect'] == 'zoom_in_float_up':
            d = duration
            filter_complex_parts.append(f"[{last_v_stream}]scale={WIDTH*1.5}:-1,zoompan=z='min(zoom+0.0005,1.1)':d={d*FPS}:s={WIDTH}x{HEIGHT}[s{i}_l0]")
            last_v_stream = f"s{i}_l0"
            filter_complex_parts.append(f"[v{scene_img_indices[1]}]scale={WIDTH*0.6}:-1[s{i}_l1_fg_scaled]")
            filter_complex_parts.append(f"[{last_v_stream}][s{i}_l1_fg_scaled]overlay=x=(W-w)/2:y=H-(t/{d})*H*1.2[s{i}_l1]")
            last_v_stream = f"s{i}_l1"
            fade_dur = 1
            filter_complex_parts.append(f"[v{scene_img_indices[2]}]fade=t=in:st=0:d={fade_dur},fade=t=out:st={d-fade_dur}:d={fade_dur}[s{i}_l2_fg]")
            filter_complex_parts.append(f"[{last_v_stream}][s{i}_l2_fg]overlay[s{i}_l2]")
            last_v_stream = f"s{i}_l2"

        elif scene['effect'] == 'rainy_static_subject':
            d = duration
            filter_complex_parts.append(f"[{last_v_stream}]scale={WIDTH*1.1}:-1,crop={WIDTH}:{HEIGHT}:0:(t/{d})*({WIDTH*1.1*9/16}-{HEIGHT})[s{i}_l0]")
            last_v_stream = f"s{i}_l0"
            filter_complex_parts.append(f"[v{scene_img_indices[1]}]scale='iw*(1+0.01*sin(t*PI*2))':-1[s{i}_l1_fg_scaled]")
            filter_complex_parts.append(f"[{last_v_stream}][s{i}_l1_fg_scaled]overlay=x=(W-w)/2:y=(H-h)/2[s{i}_l1]")
            last_v_stream = f"s{i}_l1"
            filter_complex_parts.append(f"[v{scene_img_indices[2]}]overlay=x=0:y=mod(t*{FPS}*10,{HEIGHT}):format=auto[s{i}_l2]")
            last_v_stream = f"[{last_v_stream}][s{i}_l2]overlay"

        elif scene['effect'] == 'perspective_zoom_out':
            d = duration
            for j, v_idx in enumerate(scene_img_indices):
                start_scale, end_scale = 2.0 - j * 0.3, 1.0
                start_x, end_x = -WIDTH * 0.2 * j, 0
                scale_expr = f"{start_scale} - (t/{d})*({start_scale-end_scale})"
                x_expr = f"{start_x} - (t/{d})*({start_x-end_x})"
                filter_complex_parts.append(f"[v{v_idx}]scale=iw*({scale_expr}):-1[s{i}_l{j}_scaled]")
                if j == 0:
                    filter_complex_parts.append(f"[s{i}_l{j}_scaled]crop={WIDTH}:{HEIGHT}:(iw-W)/2+{x_expr}:(ih-H)/2[s{i}_l{j}]")
                else:
                    filter_complex_parts.append(f"[{last_v_stream}][s{i}_l{j}_scaled]overlay=x=(W-w)/2+{x_expr}:y=(H-h)/2[s{i}_l{j}]")
                last_v_stream = f"s{i}_l{j}"

        elif scene['effect'] == 'vertical_parallax':
            d = duration
            filter_complex_parts.append(f"[{last_v_stream}]scale={WIDTH}:-1,crop={WIDTH}:{HEIGHT}:0:(t/{d})*(ih-{HEIGHT})*0.2[s{i}_l0]")
            last_v_stream = f"s{i}_l0"
            filter_complex_parts.append(f"[v{scene_img_indices[1]}]scale={WIDTH}:-1[s{i}_l1_fg_s]")
            filter_complex_parts.append(f"[{last_v_stream}][s{i}_l1_fg_s]overlay=y=H-(t/{d})*(H+ih)*1.1[s{i}_l1]")
            last_v_stream = f"s{i}_l1"
            filter_complex_parts.append(f"[v{scene_img_indices[2]}]scale={WIDTH}:-1[s{i}_l2_fg_s]")
            filter_complex_parts.append(f"[{last_v_stream}][s{i}_l2_fg_s]overlay=x=-(W)+(t/{d})*(W*2):y=(H-h)/2[s{i}_l2]")
            last_v_stream = f"s{i}_l2"

        elif scene['effect'] == 'zoom_in_animated_overlay':
            d = duration
            filter_complex_parts.append(f"[{last_v_stream}]scale={WIDTH*1.3}:-1,zoompan=z='min(zoom+0.001,1.1)':d={d*FPS}:s={WIDTH}x{HEIGHT}[s{i}_l0]")
            last_v_stream = f"s{i}_l0"
            filter_complex_parts.append(f"[v{scene_img_indices[1]}]scale={WIDTH*1.2}:-1[s{i}_l1_fg_s]")
            filter_complex_parts.append(f"[{last_v_stream}][s{i}_l1_fg_s]overlay=x=0:y=H-ih[s{i}_l1]")
            last_v_stream = f"s{i}_l1"
            y_expr = f"-h+(t/{d})*({HEIGHT}+h)"
            filter_complex_parts.append(f"[v{scene_img_indices[2]}]overlay=x=(W-w)/2:y={y_expr}[s{i}_l2]")
            last_v_stream = f"[{last_v_stream}][s{i}_l2]overlay"

        elif scene['effect'] == 'opacity_pulse':
            filter_complex_parts.append(f"[{last_v_stream}]format=gray,scale={WIDTH}:{HEIGHT}[s{i}_l0]")
            last_v_stream = f"s{i}_l0"
            filter_complex_parts.append(f"[v{scene_img_indices[1]}]scale=iw*0.3:-1[s{i}_l1_fg_s]")
            filter_complex_parts.append(f"[{last_v_stream}][s{i}_l1_fg_s]overlay=x=W-w-100:y=H-h-100[s{i}_l1]")
            last_v_stream = f"s{i}_l1"
            filter_complex_parts.append(f"[v{scene_img_indices[2]}]lut=a='val*abs(sin(t*3))'[s{i}_l2_fg]")
            filter_complex_parts.append(f"[{last_v_stream}][s{i}_l2_fg]overlay[s{i}_l2]")
            last_v_stream = f"s{i}_l2"

        elif scene['effect'] == 'reverse_dolly_reveal':
            d = duration
            for j, v_idx in enumerate(scene_img_indices[:-1]):
                start_scale, end_scale = 1.5 - j * 0.2, 1.0
                scale_expr = f"{start_scale} - (t/{d})*({start_scale-end_scale})"
                filter_complex_parts.append(f"[v{v_idx}]scale=iw*({scale_expr}):-1[s{i}_l{j}_scaled]")
                if j == 0:
                    filter_complex_parts.append(f"[s{i}_l{j}_scaled]crop={WIDTH}:{HEIGHT}[s{i}_l{j}]")
                else:
                    filter_complex_parts.append(f"[{last_v_stream}][s{i}_l{j}_scaled]overlay=x=(W-w)/2:y=(H-h)/2[s{i}_l{j}]")
                last_v_stream = f"s{i}_l{j}"
            fade_in_dur = 2
            filter_complex_parts.append(f"[v{scene_img_indices[-1]}]scale={WIDTH}*0.2:-1,fade=t=in:st=1:d={fade_in_dur}:alpha=1[s{i}_logo_fg]")
            filter_complex_parts.append(f"[{last_v_stream}][s{i}_logo_fg]overlay=x=(W-w)/2:y=(H-h)/2[s{i}_l_final]")
            last_v_stream = f"s{i}_l_final"

        filter_complex_parts.append(f"[{last_v_stream}]trim=duration={duration},setpts=PTS-STARTPTS[s{i}]")
        scene_outputs.append(f"[s{i}]")

    concat_filter = f"{''.join(scene_outputs)}concat=n={len(SCENES)}:v=1:a=0,format=yuv420p[v]"
    filter_complex_parts.append(concat_filter)
    
    final_filter_complex = ";".join(filter_complex_parts)

    command = [
        'ffmpeg', '-y',
        *inputs,
        '-filter_complex', final_filter_complex,
        '-map', '[v]',
        '-map', '0:a',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
        '-c:a', 'aac', '-b:a', '192k',
        '-r', str(FPS),
        '-t', str(total_duration),
        OUTPUT_FILE
    ]
    return command

def main():
    """Main function to generate the video."""
    try:
        check_dependencies()
        total_duration = get_audio_duration(AUDIO_PATH)
        
        if SCENES and SCENES[-1]['end'] == -1:
             SCENES[-1]['end'] = total_duration

        command = build_ffmpeg_command(total_duration)
        
        print(f"Executing ffmpeg command to create {OUTPUT_FILE}...")
        subprocess.run(command, check=True)
        
        print("\nVideo generation successful!")
        print(f"Output file: {OUTPUT_FILE}")

    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"\nAn error occurred: {e}", file=sys.stderr)
        if hasattr(e, 'stderr') and e.stderr:
            print(f"ffmpeg stderr:\n{e.stderr}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```
