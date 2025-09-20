#!/usr/bin/env python3
import shutil, subprocess, sys, os

```python
#!/usr/bin/env python3

import subprocess
import sys
import os
import json
import shutil

# --- Configuration ---
WIDTH = 3840
HEIGHT = 2160
FPS = 30
OUTPUT_VIDEO_CODEC = 'libx264'
OUTPUT_VIDEO_PRESET = 'slow'
OUTPUT_VIDEO_CRF = '18'
OUTPUT_AUDIO_CODEC = 'aac'
OUTPUT_AUDIO_BITRATE = '192k'

AUDIO_PATH = 'BOOKS/Temp/TTS/Lesson_8.wav'
IMAGE_DIR = 'assets/images'
OUTPUT_DIR = 'BOOKS/Temp/VIDEO_FFMPEG'
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'Lesson_8_ffmpeg_output.mp4')

# --- Main Script ---

def check_requirements(required_files, required_commands):
    """Checks for required files and command-line tools."""
    for cmd in required_commands:
        if not shutil.which(cmd):
            print(f"Error: Required command '{cmd}' not found in PATH.", file=sys.stderr)
            sys.exit(1)
            
    for file_path in required_files:
        if not os.path.isfile(file_path):
            print(f"Error: Required input file not found: {file_path}", file=sys.stderr)
            sys.exit(1)

def get_audio_duration(file_path):
    """Gets the duration of an audio file using ffprobe."""
    command = [
        'ffprobe',
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        file_path
    ]
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"Error getting duration for {file_path}: {e}", file=sys.stderr)
        sys.exit(1)

def build_ffmpeg_command(total_duration):
    """Constructs the full ffmpeg command."""
    
    # --- Timeline and Scene Definitions ---
    scenes = [
        {'start': 0.00, 'end': 4.42, 'id': 1},
        {'start': 4.42, 'end': 9.52, 'id': 2},
        {'start': 9.52, 'end': 18.16, 'id': 3},
        {'start': 18.16, 'end': 27.06, 'id': 4},
        {'start': 27.06, 'end': 35.48, 'id': 5},
        {'start': 35.48, 'end': 42.02, 'id': 6},
        {'start': 42.02, 'end': 55.08, 'id': 7},
        {'start': 55.08, 'end': total_duration, 'id': 8},
    ]

    for s in scenes:
        s['duration'] = s['end'] - s['start']

    # --- Image Inputs ---
    # Define a unique list of images used across all scenes
    image_map = {
        'blueprint': 'blueprint_bg.jpg',
        'gears_mid': 'gears-midground.png',
        'tech_ov': 'tech-overlay-foreground.png',
        'dark_clouds': 'dark_clouds.jpg',
        'empty_street': 'empty_city_street_background.jpg',
        'rain': 'rain_overlay.png',
        'rainy_city': 'rainy-city.jpg',
        'sad_people': 'sad-people.png',
        'biohazard': 'biohazard_symbol_overlay.png',
        'abs_gears': 'abstract_gears_background.jpg',
        'warehouse': 'amazon_warehouse_midground.png',
        'data_stream': 'data_stream_foreground.png',
        'data_center': 'data_center_background.jpg',
        'servers': 'server-racks-midground.png',
        'drone': 'delivery_drone_foreground.png',
        'gears_bg': 'gears-background.png',
        'broken_gears': 'broken_gears.png',
        'cracked_glass': 'cracked_glass_overlay.png',
        'tech_city': 'tech_cityscape.jpg',
        'chart': 'stock-chart-midground.png',
        'particles': 'glowing_particles.png',
        'bright_sky': 'bright_sky.jpg',
        'fortress': 'fortress.png',
        'plant': 'resilient-plant.png'
    }

    # Build input list and map keys to stream indices
    ffmpeg_inputs = []
    input_indices = {}
    current_idx = 0
    for key, filename in image_map.items():
        ffmpeg_inputs.extend(['-i', os.path.join(IMAGE_DIR, filename)])
        input_indices[key] = current_idx
        current_idx += 1
    
    # Add audio input at the end
    audio_input_idx = len(image_map)
    ffmpeg_inputs.extend(['-i', AUDIO_PATH])

    # --- Filter Complex Construction ---
    filters = []

    # Scene 1: The Premise (0.00 - 4.42s) - Pseudo-3D Zoom
    s = scenes[0]
    dur = s['duration']
    bg_idx, mid_idx, fg_idx = input_indices['blueprint'], input_indices['gears_mid'], input_indices['tech_ov']
    zoom_rate = 0.05
    filters.append(
        f"[{bg_idx}:v]scale={WIDTH*1.5:.0f}x-1,zoompan=z='1+{zoom_rate}*t/{dur}':d={dur*FPS}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={WIDTH}x{HEIGHT}[bg1];"
        f"[{mid_idx}:v]scale={WIDTH*0.6:.0f}x-1[mid1_scaled];"
        f"[{fg_idx}:v]scale={WIDTH}x-1,format=rgba,colorchannelmixer=aa=0.7[fg1_scaled];"
        f"[bg1][mid1_scaled]overlay=x='(W-w)/2+t*10':y='(H-h)/2-t*5'[s1_base];"
        f"[s1_base][fg1_scaled]overlay=x='-t*30':y=0,format=yuv420p,fps={FPS},trim=duration={dur},setpts=PTS-STARTPTS[v_scene1]"
    )

    # Scene 2: The World Stops (4.42 - 9.52s) - Slow Zoom Out
    s = scenes[1]
    dur = s['duration']
    bg_idx, mid_idx, fg_idx = input_indices['dark_clouds'], input_indices['empty_street'], input_indices['rain']
    filters.append(
        f"[{mid_idx}:v]scale={WIDTH*1.2:.0f}x-1,zoompan=z='max(1.2-0.03*t,1.0)':d={dur*FPS}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={WIDTH}x{HEIGHT}[bg2];"
        f"[{bg_idx}:v]scale={WIDTH}x-1[mid2_scaled];"
        f"[{fg_idx}:v]scale={WIDTH}x-1,format=rgba,colorchannelmixer=aa=0.5[fg2_scaled];"
        f"[bg2][mid2_scaled]overlay=x='0':y='-H*0.2',format=yuv420p[s2_base];"
        f"[s2_base][fg2_scaled]overlay=x=0:y='mod(t*150,h)',format=yuv420p,fps={FPS},trim=duration={dur},setpts=PTS-STARTPTS[v_scene2]"
    )
    
    # Scene 3: The Pandemic (9.52 - 18.16s) - Pulsing Overlay
    s = scenes[2]
    dur = s['duration']
    bg_idx, mid_idx, fg_idx = input_indices['rainy_city'], input_indices['sad_people'], input_indices['biohazard']
    filters.append(
        f"[{bg_idx}:v]scale={WIDTH*1.1:.0f}x-1,zoompan=z='1+0.01*t/{dur}':d={dur*FPS}:x='iw/2-(iw/zoom/2)':y='H-ih':s={WIDTH}x{HEIGHT}[bg3];"
        f"[{mid_idx}:v]scale={WIDTH*0.8:.0f}x-1,format=rgba,colorchannelmixer=aa='0.6*sin(t*0.5)'[mid3_scaled];"
        f"[{fg_idx}:v]scale=w='{WIDTH*0.3:.0f}*(1+0.05*sin(t*2*PI))':h=-1[fg3_scaled];"
        f"[bg3][mid3_scaled]overlay=x='(W-w)/2':y='H*0.1'[s3_base];"
        f"[s3_base][fg3_scaled]overlay=x='W*0.05':y='H*0.05',format=yuv420p,fps={FPS},trim=duration={dur},setpts=PTS-STARTPTS[v_scene3]"
    )

    # Scene 4: Amazon's Rise (18.16 - 27.06s) - Upward Motion
    s = scenes[3]
    dur = s['duration']
    bg_idx, mid_idx, fg_idx = input_indices['abs_gears'], input_indices['warehouse'], input_indices['data_stream']
    filters.append(
        f"[{bg_idx}:v]scale={WIDTH}x-1[bg4];"
        f"[{mid_idx}:v]scale={WIDTH*1.5:.0f}x-1,zoompan=z='min(zoom+0.0005, 1.1)':d={dur*FPS}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={WIDTH}x{HEIGHT}[mid4];"
        f"[{fg_idx}:v]scale={WIDTH}x-1,format=rgba,colorchannelmixer=aa=0.6[fg4_scaled];"
        f"[bg4][mid4]overlay[s4_base];"
        f"[s4_base][fg4_scaled]overlay=x=0:y='H-mod(t*200,H+h)',format=yuv420p,fps={FPS},trim=duration={dur},setpts=PTS-STARTPTS[v_scene4]"
    )

    # Scene 5: The Ultimate Test (27.06 - 35.48s) - Horizontal Parallax
    s = scenes[4]
    dur = s['duration']
    bg_idx, mid_idx, fg_idx = input_indices['data_center'], input_indices['servers'], input_indices['drone']
    filters.append(
        f"[{bg_idx}:v]scale={WIDTH*1.2:.0f}x-1[bg5_scaled];"
        f"[{mid_idx}:v]scale={WIDTH*1.4:.0f}x-1[mid5_scaled];"
        f"[{fg_idx}:v]scale={WIDTH*0.3:.0f}x-1[fg5_scaled];"
        f"[bg5_scaled][mid5_scaled]overlay=x='-w+(w-W)-(t/{dur})*(w-W)*0.5':y='(H-h)/2'[s5_base];"
        f"[s5_base][fg5_scaled]overlay=x='W-(t/{dur})*(W+w)':y='H*0.1',format=yuv420p,fps={FPS},trim=duration={dur},setpts=PTS-STARTPTS[v_scene5]"
    )

    # Scene 6: Strain but No Break (35.48 - 42.02s) - Fade In/Out Overlay
    s = scenes[5]
    dur = s['duration']
    bg_idx, mid_idx, fg_idx = input_indices['gears_bg'], input_indices['broken_gears'], input_indices['cracked_glass']
    filters.append(
        f"[{bg_idx}:v]scale={WIDTH}x{HEIGHT},setsar=1[bg6];"
        f"[{mid_idx}:v]scale={WIDTH*0.8:.0f}x-1[mid6_scaled];"
        f"[{fg_idx}:v]scale={WIDTH}x{HEIGHT},format=rgba,colorchannelmixer=aa='if(lt(t,{dur/2}),t/({dur/2}),1-((t-{dur/2})/({dur/2})))*0.8'[fg6_scaled];"
        f"[bg6][mid6_scaled]overlay=x='(W-w)/2':y='(H-h)/2'[s6_base];"
        f"[s6_base][fg6_scaled]overlay,format=yuv420p,fps={FPS},trim=duration={dur},setpts=PTS-STARTPTS[v_scene6]"
    )

    # Scene 7: Explosive Growth (42.02 - 55.08s) - Upward Chart
    s = scenes[6]
    dur = s['duration']
    bg_idx, mid_idx, fg_idx = input_indices['tech_city'], input_indices['chart'], input_indices['particles']
    filters.append(
        f"[{bg_idx}:v]scale={WIDTH*1.3:.0f}x-1,zoompan=z='min(zoom+0.001, 1.2)':d={dur*FPS}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={WIDTH}x{HEIGHT}[bg7];"
        f"[{mid_idx}:v]scale={WIDTH*0.8:.0f}x-1[mid7_scaled];"
        f"[{fg_idx}:v]scale={WIDTH}x-1,format=rgba,colorchannelmixer=aa=0.7[fg7_scaled];"
        f"[bg7][mid7_scaled]overlay=x='W/2-w/2':y='H - (t/{dur})*(H*0.8)'[s7_base];"
        f"[s7_base][fg7_scaled]overlay=x=0:y='-mod(t*100, H)',format=yuv420p,fps={FPS},trim=duration={dur},setpts=PTS-STARTPTS[v_scene7]"
    )

    # Scene 8: Validation (55.08 - end) - Triumphant Slow Zoom
    s = scenes[7]
    dur = s['duration']
    bg_idx, mid_idx, fg_idx = input_indices['bright_sky'], input_indices['fortress'], input_indices['plant']
    filters.append(
        f"[{bg_idx}:v]scale={WIDTH*1.2:.0f}x-1[bg8_scaled];"
        f"[{mid_idx}:v]scale={WIDTH*1.3:.0f}x-1[mid8_scaled];"
        f"[{fg_idx}:v]scale={WIDTH*0.3:.0f}x-1[fg8_scaled];"
        f"[bg8_scaled][mid8_scaled]overlay=x='(t/{dur})*(W-w)':y='(H-h)/2'[s8_base1];"
        f"[s8_base1]zoompan=z='1+0.03*t/{dur}':d={dur*FPS}:s={WIDTH}x{HEIGHT}[s8_base2];"
        f"[s8_base2][fg8_scaled]overlay=x='W*0.1':y='H-h-H*0.1+sin(t)*10',format=yuv420p,fps={FPS},trim=duration={dur},setpts=PTS-STARTPTS[v_scene8]"
    )

    # Concatenate all scenes
    concat_filter = "".join([f"[v_scene{i+1}]" for i in range(len(scenes))])
    concat_filter += f"concat=n={len(scenes)}:v=1:a=0[v_out]"
    filters.append(concat_filter)

    filter_complex = ";".join(filters)
    
    # --- Final Command Assembly ---
    command = ['ffmpeg', '-y']
    command.extend(ffmpeg_inputs)
    command.extend([
        '-filter_complex', filter_complex,
        '-map', '[v_out]',
        '-map', f'{audio_input_idx}:a',
        '-c:v', OUTPUT_VIDEO_CODEC,
        '-preset', OUTPUT_VIDEO_PRESET,
        '-crf', OUTPUT_VIDEO_CRF,
        '-c:a', OUTPUT_AUDIO_CODEC,
        '-b:a', OUTPUT_AUDIO_BITRATE,
        '-r', str(FPS),
        '-pix_fmt', 'yuv420p',
        '-shortest',
        OUTPUT_FILE
    ])
    
    return command

def main():
    """Main function to generate and run the ffmpeg command."""
    # Collect all required image files for validation
    required_images = [
        'blueprint_bg.jpg', 'gears-midground.png', 'tech-overlay-foreground.png',
        'dark_clouds.jpg', 'empty_city_street_background.jpg', 'rain_overlay.png',
        'rainy-city.jpg', 'sad-people.png', 'biohazard_symbol_overlay.png',
        'abstract_gears_background.jpg', 'amazon_warehouse_midground.png', 'data_stream_foreground.png',
        'data_center_background.jpg', 'server-racks-midground.png', 'delivery_drone_foreground.png',
        'gears-background.png', 'broken_gears.png', 'cracked_glass_overlay.png',
        'tech_cityscape.jpg', 'stock-chart-midground.png', 'glowing_particles.png',
        'bright_sky.jpg', 'fortress.png', 'resilient-plant.png'
    ]
    required_files = [AUDIO_PATH] + [os.path.join(IMAGE_DIR, f) for f in required_images]
    
    check_requirements(required_files, ['ffmpeg', 'ffprobe'])
    
    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Get total duration from audio
    total_duration = get_audio_duration(AUDIO_PATH)
    
    # Build and execute command
    ffmpeg_command = build_ffmpeg_command(total_duration)
    
    print("--- FFMPEG COMMAND ---")
    print(" ".join(f'"{arg}"' if " " in arg else arg for arg in ffmpeg_command))
    print("----------------------")
    print(f"Generating video... This may take a while.")
    
    try:
        subprocess.run(ffmpeg_command, check=True)
        print(f"\nSuccessfully created video: {OUTPUT_FILE}")
    except subprocess.CalledProcessError as e:
        print(f"\nError during ffmpeg execution: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```