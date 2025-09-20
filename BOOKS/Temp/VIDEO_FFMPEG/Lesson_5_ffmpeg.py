#!/usr/bin/env python3
import shutil, subprocess, sys, os

```python
#!/usr/bin/env python3

import sys
import os
import subprocess
import json

# --- Configuration ---
WIDTH = 3840
HEIGHT = 2160
FPS = 30
AUDIO_PATH = 'BOOKS/Temp/TTS/Lesson_5.wav'
OUTPUT_PATH = 'BOOKS/Temp/VIDEO_FFMPEG/Lesson_5_ffmpeg_output.mp4'
IMAGE_DIR = 'assets/images'

# --- Scene Timeline and Assets ---
# This data structure defines each scene, its duration, layers, and effects.
SCENES_DATA = [
    {
        "start": 0.0, "end": 4.06, "desc": "Attack while others retreat",
        "layers": [
            {'path': 'abstract_gears_background.jpg', 'effect': 'zoom', 'start': 1.1, 'end': 1.2},
            {'path': 'gears-midground.png', 'effect': 'pan_h', 'speed': -80},
            {'path': 'gears-foreground.png', 'effect': 'pan_h', 'speed': -150},
        ]
    },
    {
        "start": 4.06, "end": 9.02, "desc": "2008, financial system collapsing",
        "layers": [
            {'path': 'rainy-city.jpg', 'effect': 'zoom', 'start': 1.2, 'end': 1.1},
            {'path': 'falling-chart.png', 'effect': 'pan_v_zoom', 'y_speed': 60, 'start': 1.0, 'end': 1.3},
            {'path': 'rain_overlay.png', 'effect': 'pan_v', 'speed': 100},
            {'path': 'cracked_glass_overlay.png', 'effect': 'fade', 'start_time': 3.0, 'duration': 1.5},
        ]
    },
    {
        "start": 9.02, "end": 19.60, "desc": "Economy in free fall, survival mode",
        "layers": [
            {'path': 'empty_city_street_background.jpg', 'effect': 'zoom', 'start': 1.0, 'end': 1.15},
            {'path': 'sad-people.png', 'effect': 'float_v', 'speed': -15, 'start_y': 50},
            {'path': 'broken_gears.png', 'effect': 'float_v', 'speed': 20, 'start_y': -50},
        ]
    },
    {
        "start": 19.60, "end": 27.94, "desc": "Amazon pushes forward with the Kindle",
        "layers": [
            {'path': 'blueprint_bg.jpg', 'effect': 'pan_h', 'speed': 50},
            {'path': 'tech_city_background.jpg', 'effect': 'fade', 'start_time': 1.0, 'duration': 3.0},
            {'path': 'glowing_particles.png', 'effect': 'pan_v', 'speed': -120},
        ]
    },
    {
        "start": 27.94, "end": 44.02, "desc": "Investing while others fight for their lives",
        "layers": [
            {'path': 'data_center_background.jpg', 'effect': 'zoom', 'start': 1.3, 'end': 1.2},
            {'path': 'fortress.png', 'effect': 'zoom', 'start': 1.0, 'end': 1.1},
            {'path': 'server-racks-midground.png', 'effect': 'pan_h', 'speed': -60},
            {'path': 'data_stream_foreground.png', 'effect': 'pan_h', 'speed': 200},
        ]
    },
    {
        "start": 44.02, "end": 56.29, "desc": "Recessions clear the weak, strong get stronger",
        "layers": [
            {'path': 'dark_clouds.jpg', 'effect': 'pan_h', 'speed': -40},
            {'path': 'phoenix_from_ashes.png', 'effect': 'float_v_zoom', 'y_speed': -30, 'start': 1.0, 'end': 1.2},
            {'path': 'resilient-plant.png', 'effect': 'zoom', 'start': 1.2, 'end': 1.0},
        ]
    },
    {
        "start": 56.29, "end": -1, "desc": "Looking at the horizon",
        "layers": [
            {'path': 'tech_cityscape.jpg', 'effect': 'zoom', 'start': 1.0, 'end': 1.1},
            {'path': 'city-skyline-mid.png', 'effect': 'pan_h', 'speed': 25},
            {'path': 'glowing-data.png', 'effect': 'pan_v', 'speed': -50},
        ]
    }
]

def check_dependencies():
    """Checks for ffmpeg, ffprobe, and all required files."""
    for tool in ['ffmpeg', 'ffprobe']:
        if subprocess.run(['which', tool], capture_output=True, text=True).returncode != 0:
            print(f"ERROR: {tool} not found. Please install it and ensure it's in your PATH.", file=sys.stderr)
            sys.exit(1)

    required_files = [AUDIO_PATH]
    for scene in SCENES_DATA:
        for layer in scene['layers']:
            required_files.append(os.path.join(IMAGE_DIR, layer['path']))

    for f in required_files:
        if not os.path.isfile(f):
            print(f"ERROR: Required file not found: {f}", file=sys.stderr)
            sys.exit(1)
    print("All dependencies and files are present.")

def get_audio_duration(audio_path):
    """Gets the duration of the audio file in seconds."""
    command = [
        'ffprobe', '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        audio_path
    ]
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    return float(result.stdout.strip())

def construct_ffmpeg_command(total_duration):
    """Constructs the full ffmpeg command."""
    ffmpeg_inputs = []
    filter_complex_parts = []
    concat_streams = []
    input_idx = 0

    for i, scene in enumerate(SCENES_DATA):
        start_time = scene['start']
        end_time = scene['end'] if scene['end'] != -1 else total_duration
        scene_duration = end_time - start_time
        if scene_duration <= 0: continue
        
        scene_input_start_idx = input_idx
        
        for layer in scene['layers']:
            ffmpeg_inputs.extend(['-loop', '1', '-t', str(scene_duration), '-i', os.path.join(IMAGE_DIR, layer['path'])])
            input_idx += 1
            
        last_stream = ""
        for j, layer in enumerate(scene['layers']):
            stream_idx = scene_input_start_idx + j
            current_stream = f"[{stream_idx}:v]"
            
            # Initial scaling to ensure image is large enough for animation
            scaled_stream = f"[s{stream_idx}]"
            filter_complex_parts.append(f"{current_stream}scale=w='max(iw,if(gt(iw/ih,{WIDTH}/{HEIGHT}),{WIDTH}*1.5,-1))',h='max(ih,if(gt(iw/ih,{WIDTH}/{HEIGHT}),-1,{HEIGHT}*1.5))',setsar=1{scaled_stream}")
            current_stream = scaled_stream

            effect = layer['effect']
            
            if j == 0:
                processed_stream = f"[p{stream_idx}]"
                if effect == 'zoom':
                    start_s, end_s = layer['start'], layer['end']
                    rate = (end_s - start_s) / scene_duration
                    zoom_expr = f"'({start_s}+t*{rate})'"
                    filter_complex_parts.append(f"{current_stream}scale=w='iw*{zoom_expr}',h='ih*{zoom_expr}',crop={WIDTH}:{HEIGHT}{processed_stream}")
                elif effect in ['pan_h', 'pan_v']:
                    speed = layer['speed']
                    crop_x = f"'(iw-ow)/2 - t*{speed}'" if effect == 'pan_h' else "'(iw-ow)/2'"
                    crop_y = f"'(ih-oh)/2 - t*{speed}'" if effect == 'pan_v' else "'(ih-oh)/2'"
                    filter_complex_parts.append(f"{current_stream}crop={WIDTH}:{HEIGHT}:x={crop_x}:y={crop_y}{processed_stream}")
                else: # Default crop for base layer
                    filter_complex_parts.append(f"{current_stream}crop={WIDTH}:{HEIGHT}{processed_stream}")
                last_stream = processed_stream
            else:
                overlay_stream = f"[ov{i}_{j}]"
                x_expr, y_expr = f"(main_w-overlay_w)/2", f"(main_h-overlay_h)/2"
                processed_stream = current_stream

                if effect in ['pan_h', 'pan_v', 'float_v']:
                    speed = layer['speed']
                    if effect == 'pan_h': x_expr = f"main_w-overlay_w-(t*{speed})"
                    if effect == 'pan_v': y_expr = f"main_h-overlay_h-(t*{speed})"
                    if effect == 'float_v': y_expr = f"{layer.get('start_y',0)} + t*{speed}"
                elif effect in ['pan_v_zoom', 'float_v_zoom']:
                    y_speed = layer['y_speed']
                    start_s, end_s = layer['start'], layer['end']
                    rate = (end_s - start_s) / scene_duration
                    zoom_expr = f"'({start_s}+t*{rate})'"
                    temp_scaled = f"[temp_z{stream_idx}]"
                    filter_complex_parts.append(f"{current_stream}scale=w='iw*{zoom_expr}',h='ih*{zoom_expr}'{temp_scaled}")
                    processed_stream = temp_scaled
                    y_expr = f"(main_h-overlay_h)/2 + t*{y_speed}"
                elif effect == 'fade':
                    start_f, dur_f = layer['start_time'], layer['duration']
                    temp_fade = f"[temp_f{stream_idx}]"
                    filter_complex_parts.append(f"{current_stream}fade=in:st={start_f}:d={dur_f}:alpha=1{temp_fade}")
                    processed_stream = temp_fade

                filter_complex_parts.append(f"{last_stream}{processed_stream}overlay=x='{x_expr}':y='{y_expr}'{overlay_stream}")
                last_stream = overlay_stream
        
        scene_stream = f"[scene{i+1}]"
        filter_complex_parts.append(f"{last_stream}format=yuv420p,scale={WIDTH}:{HEIGHT},fps={FPS}{scene_stream}")
        concat_streams.append(scene_stream)
        
    ffmpeg_inputs.extend(['-i', AUDIO_PATH])
    audio_input_idx = input_idx

    concat_filter = f"{''.join(concat_streams)}concat=n={len(concat_streams)}:v=1:a=0[v]"
    filter_complex_parts.append(concat_filter)
    
    final_filter_complex = ";".join(filter_complex_parts)

    command = [
        'ffmpeg', '-y',
        *ffmpeg_inputs,
        '-filter_complex', final_filter_complex,
        '-map', '[v]',
        '-map', f'{audio_input_idx}:a',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
        '-c:a', 'aac', '-b:a', '192k',
        '-shortest',
        OUTPUT_PATH
    ]
    return command

def main():
    """Main function to generate and run the ffmpeg command."""
    check_dependencies()
    
    try:
        total_duration = get_audio_duration(AUDIO_PATH)
        print(f"Audio duration: {total_duration:.2f} seconds.")
    except (subprocess.CalledProcessError, ValueError) as e:
        print(f"ERROR: Could not get audio duration from {AUDIO_PATH}. Details: {e}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    command = construct_ffmpeg_command(total_duration)
    
    print("\n--- Running FFmpeg command ---\nThis may take a while...")
    
    try:
        subprocess.run(command, check=True, capture_output=False) # Change to True to see ffmpeg logs
        print(f"\nSUCCESS: Video saved to {OUTPUT_PATH}")
    except subprocess.CalledProcessError as e:
        print(f"\nERROR: FFmpeg command failed with exit code {e.returncode}.", file=sys.stderr)
        print("You can try running the command manually for more detailed error logs.", file=sys.stderr)
        # print(" ".join(map(str, command)), file=sys.stderr) # Uncomment to print failing command
        sys.exit(1)

if __name__ == '__main__':
    main()
```