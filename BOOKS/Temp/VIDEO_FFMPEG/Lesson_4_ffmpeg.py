#!/usr/bin/env python3
import shutil, subprocess, sys, os

#!/usr/bin/env python3
import subprocess
import sys
import os

# --- Configuration ---
WIDTH = 3840
HEIGHT = 2160
FPS = 30
OUTPUT_FILE = 'BOOKS/Temp/VIDEO_FFMPEG/Lesson_4_ffmpeg_output.mp4'
AUDIO_FILE = 'BOOKS/Temp/TTS/Lesson_4.wav'
IMAGE_DIR = 'assets/images'

# --- Asset List ---
REQUIRED_IMAGES = [
    'blueprint_bg.jpg', 'gears-midground.png', 'gears-foreground.png',
    'city_background.jpg', 'amazon_warehouse_midground.png', 'amazon_box_foreground.png',
    'data-center-background.jpg', 'server-racks-midground.png', 'data_overlay_foreground.png',
    'server-room.jpg', 'glowing-data.png', 'cracked_glass_overlay.png',
    'sunrise-field.jpg', 'mountains-far.png', 'dark_clouds.png',
    'abstract_gears_background.jpg', 'glowing_particles.png', 'tech-overlay-foreground.png',
    'tech_cityscape.jpg', 'cloud_servers_midground.png', 'aws-logo.png',
    'tech_city_background.jpg', 'stock-chart-midground.png', 'data_stream_foreground.png',
]

def check_requirements():
    """Checks for ffmpeg, ffprobe, and all required assets."""
    for tool in ['ffmpeg', 'ffprobe']:
        if subprocess.run(['which', tool], capture_output=True, text=True).returncode != 0:
            print(f"ERROR: {tool} not found. Please install it and ensure it's in your PATH.", file=sys.stderr)
            sys.exit(1)

    if not os.path.isfile(AUDIO_FILE):
        print(f"ERROR: Audio file not found at '{AUDIO_FILE}'", file=sys.stderr)
        sys.exit(1)

    for img in REQUIRED_IMAGES:
        if not os.path.isfile(os.path.join(IMAGE_DIR, img)):
            print(f"ERROR: Image file not found at '{os.path.join(IMAGE_DIR, img)}'", file=sys.stderr)
            sys.exit(1)

    output_dir = os.path.dirname(OUTPUT_FILE)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)

def get_audio_duration(file_path):
    """Gets the duration of an audio file using ffprobe."""
    command = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file_path]
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    return float(result.stdout)

def build_ffmpeg_command(total_duration):
    """Constructs the full ffmpeg command."""
    scene_boundaries = [0.0, 4.84, 10.20, 21.00, 31.14, 39.02, 47.42, 58.06, total_duration]
    scenes = [{'start': scene_boundaries[i], 'end': scene_boundaries[i+1], 'duration': scene_boundaries[i+1] - scene_boundaries[i]} for i in range(len(scene_boundaries) - 1)]

    ffmpeg_cmd = ['ffmpeg', '-y']
    input_map = {name: i for i, name in enumerate(REQUIRED_IMAGES)}
    for img_name in REQUIRED_IMAGES:
        ffmpeg_cmd.extend(['-loop', '1', '-framerate', str(FPS), '-i', os.path.join(IMAGE_DIR, img_name)])
    
    audio_input_index = len(REQUIRED_IMAGES)
    ffmpeg_cmd.extend(['-i', AUDIO_FILE])

    filter_complex = []
    
    # --- Scene 1: Conceptual Intro (Parallax Zoom In) ---
    s1_dur = scenes[0]['duration']
    bg_s, bg_e = 1.0, 1.1; mg_s, mg_e = 1.0, 1.2; fg_s, fg_e = 1.0, 1.3
    filter_complex.extend([
        f"color=c=black:s={WIDTH}x{HEIGHT}:d={s1_dur}[s1_base]",
        f"[{input_map['blueprint_bg.jpg']}:v]scale=w='{WIDTH}*({bg_s}+(t/{s1_dur})*({bg_e-bg_s}))':h=-1[s1_bg_anim]",
        f"[{input_map['gears-midground.png']}:v]scale=w='{WIDTH}*({mg_s}+(t/{s1_dur})*({mg_e-mg_s}))':h=-1[s1_mg_anim]",
        f"[{input_map['gears-foreground.png']}:v]scale=w='{WIDTH}*({fg_s}+(t/{s1_dur})*({fg_e-fg_s}))':h=-1[s1_fg_anim]",
        f"[s1_base][s1_bg_anim]overlay=x='(W-w)/2':y='(H-h)/2'[s1_l1]",
        f"[s1_l1][s1_mg_anim]overlay=x='(W-w)/2':y='(H-h)/2'[s1_l2]",
        f"[s1_l2][s1_fg_anim]overlay=x='(W-w)/2':y='(H-h)/2',trim=duration={s1_dur},setpts=PTS-STARTPTS[v1]",
    ])

    # --- Scene 2: Amazon E-commerce (Horizontal Parallax) ---
    s2_dur = scenes[1]['duration']
    filter_complex.extend([
        f"[{input_map['city_background.jpg']}:v]scale={WIDTH}:-1,crop={WIDTH}:{HEIGHT}[s2_bg]",
        f"[{input_map['amazon_warehouse_midground.png']}:v]scale={WIDTH*0.7}:-1[s2_mg_scaled]",
        f"[{input_map['amazon_box_foreground.png']}:v]scale={WIDTH*0.25}:-1[s2_fg_scaled]",
        f"[s2_bg][s2_mg_scaled]overlay=x='-w+(W/2+w/2)*t/{s2_dur}':y='H-h*1.1'[s2_l1]",
        f"[s2_l1][s2_fg_scaled]overlay=x='(W-w)-(W/2)*t/{s2_dur}':y='H-h',trim=duration={s2_dur},setpts=PTS-STARTPTS[v2]",
    ])

    # --- Scene 3: Internal Struggle (Oppressive Zoom) ---
    s3_dur = scenes[2]['duration']
    bg_s, bg_e = 1.0, 1.15; mg_s, mg_e = 1.0, 1.25; fg_s, fg_e = 1.0, 1.0
    filter_complex.extend([
        f"color=c=black:s={WIDTH}x{HEIGHT}:d={s3_dur}[s3_base]",
        f"[{input_map['data-center-background.jpg']}:v]scale=w='{WIDTH}*({bg_s}+(t/{s3_dur})*({bg_e-bg_s}))':h=-1[s3_bg_anim]",
        f"[{input_map['server-racks-midground.png']}:v]scale=w='{WIDTH}*({mg_s}+(t/{s3_dur})*({mg_e-mg_s}))':h=-1[s3_mg_anim]",
        f"[{input_map['data_overlay_foreground.png']}:v]scale={WIDTH}:{HEIGHT}[s3_fg_scaled]",
        f"[s3_base][s3_bg_anim]overlay=x='(W-w)/2':y='(H-h)/2'[s3_l1]",
        f"[s3_l1][s3_mg_anim]overlay=x='(W-w)/2':y='(H-h)/2'[s3_l2]",
        f"[s3_l2][s3_fg_scaled]overlay,format=rgba,colorchannelmixer=aa='min(1,t/2)',trim=duration={s3_dur},setpts=PTS-STARTPTS[v3]",
    ])

    # --- Scene 4: The Beast (Vertical Float) ---
    s4_dur = scenes[3]['duration']
    filter_complex.extend([
        f"[{input_map['server-room.jpg']}:v]scale={WIDTH*1.05}:-1,crop={WIDTH}:{HEIGHT}[s4_bg]",
        f"[{input_map['glowing-data.png']}:v]scale={WIDTH}:-1[s4_mg_scaled]",
        f"[{input_map['cracked_glass_overlay.png']}:v]scale={WIDTH}:{HEIGHT}[s4_fg_scaled]",
        f"[s4_bg][s4_mg_scaled]overlay=x='(W-w)/2':y='(H-h)/2+sin(t*0.5)*20'[s4_l1]",
        f"[s4_l1][s4_fg_scaled]overlay,trim=duration={s4_dur},setpts=PTS-STARTPTS[v4]",
    ])

    # --- Scene 5: The Pivot (Vertical Reveal) ---
    s5_dur = scenes[4]['duration']
    cloud_speed = (HEIGHT * 1.1) / s5_dur
    filter_complex.extend([
        f"[{input_map['sunrise-field.jpg']}:v]scale=w='{WIDTH}*(1+(t/{s5_dur})*0.1)':h=-1,crop={WIDTH}:{HEIGHT}[s5_bg_anim]",
        f"[{input_map['mountains-far.png']}:v]scale={WIDTH*1.1}:-1[s5_mg_scaled]",
        f"[{input_map['dark_clouds.png']}:v]scale={WIDTH*1.2}:-1[s5_fg_scaled]",
        f"[s5_bg_anim][s5_mg_scaled]overlay=x='(W-w)/2':y='H-h'[s5_l1]",
        f"[s5_l1][s5_fg_scaled]overlay=x='(W-w)/2':y='-t*{cloud_speed:.2f}',trim=duration={s5_dur},setpts=PTS-STARTPTS[v5]",
    ])

    # --- Scene 6: "Aha!" Moment (Parallax Zoom Out) ---
    s6_dur = scenes[5]['duration']
    bg_s, bg_e = 1.3, 1.0; mg_s, mg_e = 1.4, 1.0; fg_s, fg_e = 1.5, 1.0
    filter_complex.extend([
        f"color=c=black:s={WIDTH}x{HEIGHT}:d={s6_dur}[s6_base]",
        f"[{input_map['abstract_gears_background.jpg']}:v]scale=w='{WIDTH}*({bg_s}+(t/{s6_dur})*({bg_e-bg_s}))':h=-1[s6_bg_anim]",
        f"[{input_map['glowing_particles.png']}:v]scale=w='{WIDTH}*({mg_s}+(t/{s6_dur})*({mg_e-mg_s}))':h=-1[s6_mg_anim]",
        f"[{input_map['tech-overlay-foreground.png']}:v]scale=w='{WIDTH}*({fg_s}+(t/{s6_dur})*({fg_e-fg_s}))':h=-1[s6_fg_anim]",
        f"[s6_base][s6_bg_anim]overlay=x='(W-w)/2':y='(H-h)/2'[s6_l1]",
        f"[s6_l1][s6_mg_anim]overlay=x='(W-w)/2':y='(H-h)/2'[s6_l2]",
        f"[s6_l2][s6_fg_anim]overlay=x='(W-w)/2':y='(H-h)/2',trim=duration={s6_dur},setpts=PTS-STARTPTS[v6]",
    ])

    # --- Scene 7: AWS Launch ---
    s7_dur = scenes[6]['duration']
    pan_speed = 50 / s7_dur
    filter_complex.extend([
        f"[{input_map['tech_cityscape.jpg']}:v]scale={WIDTH+50}:-1,crop={WIDTH}:{HEIGHT}:x='t*{pan_speed:.2f}':y=0[s7_bg_anim]",
        f"[{input_map['cloud_servers_midground.png']}:v]scale={WIDTH*0.8}:-1[s7_mg_scaled]",
        f"[{input_map['aws-logo.png']}:v]scale={WIDTH*0.25}:-1[s7_fg_scaled]",
        f"[s7_bg_anim][s7_mg_scaled]overlay=x='(W-w)/2':y='(H-h)/2+sin(t*0.4)*15'[s7_l1]",
        f"[s7_l1][s7_fg_scaled]overlay=x='(W-w)/2':y='(H-h)/2',format=rgba,colorchannelmixer=aa='if(lt(t,1),0,min(1,(t-1)/2))',trim=duration={s7_dur},setpts=PTS-STARTPTS[v7]",
    ])

    # --- Scene 8: Revolution ---
    s8_dur = scenes[7]['duration']
    filter_complex.extend([
        f"[{input_map['tech_city_background.jpg']}:v]scale=w='{WIDTH}*(1.0+(t/{s8_dur})*0.1)':h=-1,crop={WIDTH}:{HEIGHT}[s8_bg_anim]",
        f"[{input_map['stock-chart-midground.png']}:v]scale={WIDTH*0.6}:-1[s8_mg_scaled]",
        f"[{input_map['data_stream_foreground.png']}:v]scale={WIDTH}:-1[s8_fg_scaled]",
        f"[s8_bg_anim][s8_mg_scaled]overlay=x='W*0.05':y='H-(H*0.9+h)*t/{s8_dur}'[s8_l1]",
        f"[s8_l1][s8_fg_scaled]overlay=x=0:y='H*0.1+sin(t*0.8)*20',trim=duration={s8_dur},setpts=PTS-STARTPTS[v8]",
    ])

    # --- Concatenation and Formatting ---
    concat_streams = "".join([f"[v{i+1}]" for i in range(len(scenes))])
    filter_complex.append(f"{concat_streams}concat=n={len(scenes)}:v=1:a=0,format=yuv420p,fps={FPS}[v]")
    
    ffmpeg_cmd.extend(['-filter_complex', ";".join(filter_complex)])
    ffmpeg_cmd.extend(['-map', '[v]', '-map', f'{audio_input_index}:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-shortest', OUTPUT_FILE])
    
    return ffmpeg_cmd

def main():
    """Main execution function."""
    check_requirements()
    
    try:
        total_duration = get_audio_duration(AUDIO_FILE)
    except (subprocess.CalledProcessError, ValueError) as e:
        print(f"ERROR: Could not get audio duration. {e}", file=sys.stderr)
        sys.exit(1)
        
    ffmpeg_command = build_ffmpeg_command(total_duration)
    
    print("--- Executing FFmpeg command ---")
    try:
        subprocess.run(ffmpeg_command, check=True)
        print(f"\nSUCCESS: Video saved to {OUTPUT_FILE}")
    except subprocess.CalledProcessError as e:
        print(f"\nERROR: FFmpeg command failed with exit code {e.returncode}.", file=sys.stderr)
        # Uncomment the following lines for detailed ffmpeg error output
        # if e.stderr:
        #     print("--- FFmpeg stderr ---", file=sys.stderr)
        #     print(e.stderr.decode('utf-8', errors='ignore'), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```
