#!/usr/bin/env python3
import shutil, subprocess, sys, os

#!/usr/bin/env python3

import subprocess
import os
import sys
import shutil

def main():
    """
    Constructs and executes a single ffmpeg command to generate a parallax video
    from a set of images and an audio file.
    """
    # --- Configuration ---
    WIDTH = 3840
    HEIGHT = 2160
    FPS = 30
    AUDIO_PATH = 'BOOKS/Temp/TTS/Lesson_9.wav'
    OUTPUT_DIR = 'BOOKS/Temp/VIDEO_FFMPEG'
    OUTPUT_NAME = 'Lesson_9_ffmpeg_output.mp4'
    OUTPUT_PATH = os.path.join(OUTPUT_DIR, OUTPUT_NAME)
    IMAGE_DIR = 'assets/images'
    PRESET = 'slow'
    CRF = 18

    # --- Asset Definitions ---
    IMAGE_FILES = [
        'winding-path.jpg', 'sky-background.jpg', 'mountains-far.png',
        'city-background.jpg', 'city-skyline-mid.png',
        'dark_clouds.jpg', 'falling-chart.png', 'rain_overlay.png', 'cracked_glass_overlay.png',
        'blueprint_bg.jpg', 'amazon_warehouse_midground.png', 'sad-people.png', 'amazon_box_foreground.png',
        'abstract_gears_background.jpg', 'gears-midground.png', 'gears-foreground.png', 'stock-chart-midground.png',
        'data_center_background.jpg', 'cloud_servers_midground.png', 'aws-logo.png', 'data_stream_foreground.png',
        'rainy-city.jpg', 'fortress.png', 'glowing_particles.png',
        'sunrise-field.jpg', 'resilient-plant.png', 'phoenix_from_ashes.png'
    ]

    # --- Dependency and File Checks ---
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        print("Error: ffmpeg and ffprobe must be installed and in your PATH.", file=sys.stderr)
        sys.exit(1)

    required_files = [AUDIO_PATH] + [os.path.join(IMAGE_DIR, f) for f in set(IMAGE_FILES)]
    for f_path in required_files:
        if not os.path.isfile(f_path):
            print(f"Error: Required file not found: {f_path}", file=sys.stderr)
            sys.exit(1)

    # --- Get Audio Duration ---
    try:
        duration_cmd = [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", AUDIO_PATH
        ]
        result = subprocess.run(duration_cmd, capture_output=True, text=True, check=True)
        total_duration = float(result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError) as e:
        print(f"Error getting audio duration: {e}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Audio duration: {total_duration:.2f}s. Generating video...")

    # --- Scene Timing ---
    scene_times = [0.0, 4.22, 10.20, 17.60, 29.50, 44.26, 57.54, 71.84, total_duration]
    scenes = [{'start': scene_times[i], 'end': scene_times[i+1], 'duration': scene_times[i+1] - scene_times[i]}
              for i in range(len(scene_times) - 1)]

    # --- Build ffmpeg command ---
    ffmpeg_cmd = ['ffmpeg', '-y']

    unique_images = sorted(list(set(IMAGE_FILES)))
    image_map = {name: i for i, name in enumerate(unique_images)}
    for image_name in unique_images:
        ffmpeg_cmd.extend(['-loop', '1', '-i', os.path.join(IMAGE_DIR, image_name)])
    
    audio_input_index = len(unique_images)
    ffmpeg_cmd.extend(['-i', AUDIO_PATH])

    filter_complex_parts = []
    
    # Scene 1: Winding Path (0.00 - 4.22)
    d = scenes[0]['duration']
    bg, mg, fg = image_map['sky-background.jpg'], image_map['mountains-far.png'], image_map['winding-path.jpg']
    filter_complex_parts.extend([
        f"[{bg}:v]scale={WIDTH*1.1:.0f}:-1,crop=w={WIDTH}:h={HEIGHT}:x='(iw-ow)/2':y='t/{d:.2f}*(ih-{HEIGHT})'[s1_bg]",
        f"[{mg}:v]scale={WIDTH*1.2:.0f}:-1[s1_mg_scaled]",
        f"[{fg}:v]scale={WIDTH*1.3:.0f}:-1[s1_fg_base]",
        f"[s1_bg][s1_mg_scaled]overlay=x='(W-w)/2+t/{d:.2f}*100':y=H-h[s1_tmp]",
        f"[s1_fg_base]zoompan=z='1+0.1*t/{d:.2f}':d={int(d*FPS)}:s={WIDTH}x{HEIGHT}:fps={FPS}[s1_fg_zoom]",
        f"[s1_tmp][s1_fg_zoom]overlay,trim=duration={d:.2f},setpts=PTS-STARTPTS[scene1]"
    ])

    # Scene 2: Reopening (4.22 - 10.20)
    d = scenes[1]['duration']
    bg, mg = image_map['city-background.jpg'], image_map['city-skyline-mid.png']
    filter_complex_parts.extend([
        f"[{bg}:v]scale={WIDTH*1.2:.0f}:-1,zoompan=z='1+0.05*t/{d:.2f}':d={int(d*FPS)}:s={WIDTH}x{HEIGHT}[s2_bg]",
        f"[{mg}:v]scale={WIDTH*1.3:.0f}:-1[s2_mg_scaled]",
        f"[s2_bg][s2_mg_scaled]overlay=x='(W-w)/2-t/{d:.2f}*120':y=H-h,trim=duration={d:.2f},setpts=PTS-STARTPTS[scene2]"
    ])

    # Scene 3: Downturn (10.20 - 17.60)
    d = scenes[2]['duration']
    bg, chart, rain, crack = image_map['dark_clouds.jpg'], image_map['falling-chart.png'], image_map['rain_overlay.png'], image_map['cracked_glass_overlay.png']
    filter_complex_parts.extend([
        f"[{bg}:v]scale={WIDTH*1.1:.0f}:-1,crop={WIDTH}:{HEIGHT}:x='(iw-ow)*t/{d:.2f}'[s3_bg]",
        f"[{chart}:v]scale={WIDTH*0.7:.0f}:-1[s3_chart]",
        f"[{rain}:v]format=rgba,colorchannelmixer=aa=0.4[s3_rain]",
        f"[{crack}:v]format=rgba,colorchannelmixer=aa=0.6[s3_crack]",
        f"[s3_bg][s3_chart]overlay=x='(W-w)/2':y='-h+(H+h)*(t/{d:.2f})'[s3_tmp1]",
        f"[s3_tmp1][s3_rain]overlay=format=auto[s3_tmp2]",
        f"[s3_tmp2][s3_crack]overlay=format=auto,trim=duration={d:.2f},setpts=PTS-STARTPTS[scene3]"
    ])

    # Scene 4: Amazon Correction (17.60 - 29.50)
    d = scenes[3]['duration']
    bg, wh, ppl, box = image_map['blueprint_bg.jpg'], image_map['amazon_warehouse_midground.png'], image_map['sad-people.png'], image_map['amazon_box_foreground.png']
    filter_complex_parts.extend([
        f"[{bg}:v]scale={WIDTH*1.2:.0f}:-1,zoompan=z='1.2-0.05*t/{d:.2f}':d={int(d*FPS)}:s={WIDTH}x{HEIGHT}[s4_bg]",
        f"[{wh}:v]scale={WIDTH*1.1:.0f}:-1[s4_wh]",
        f"[{ppl}:v]scale={WIDTH}:-1,fade=in:st=1:d=1.5:alpha=1,fade=out:st={d-2:.2f}:d=1.5:alpha=1[s4_ppl]",
        f"[{box}:v]scale={WIDTH*0.15:.0f}:-1[s4_box]",
        f"[s4_bg][s4_wh]overlay=x='(W-w)/2':y='(H-h)/2'[s4_tmp1]",
        f"[s4_tmp1][s4_ppl]overlay=format=auto[s4_tmp2]",
        f"[s4_tmp2][s4_box]overlay=x='-w+(W+w)*t/{d:.2f}':y='H*0.75',trim=duration={d:.2f},setpts=PTS-STARTPTS[scene4]"
    ])

    # Scene 5: The Machine (29.50 - 44.26)
    d = scenes[4]['duration']
    bg, mg, fg, chart = image_map['abstract_gears_background.jpg'], image_map['gears-midground.png'], image_map['gears-foreground.png'], image_map['stock-chart-midground.png']
    filter_complex_parts.extend([
        f"[{bg}:v]scale={WIDTH}:{HEIGHT},rotate='t*2*PI/{d*2:.2f}':ow={WIDTH}:oh={HEIGHT}:c=black@0[s5_bg]",
        f"[{mg}:v]scale={WIDTH*0.9:.0f}:-1,rotate='-t*2*PI/{d:.2f}':c=none[s5_mg]",
        f"[{fg}:v]scale={WIDTH*0.6:.0f}:-1,rotate='t*2*PI/{d*0.75:.2f}':c=none[s5_fg]",
        f"[{chart}:v]scale={WIDTH}:-1,fade=out:st={d-2:.2f}:d=2:alpha=1[s5_chart]",
        f"[s5_bg][s5_mg]overlay=x='(W-w)/2':y='(H-h)/2'[s5_tmp1]",
        f"[s5_tmp1][s5_fg]overlay=x='W*0.6':y='H*0.6'[s5_tmp2]",
        f"[s5_tmp2][s5_chart]overlay=format=auto,trim=duration={d:.2f},setpts=PTS-STARTPTS[scene5]"
    ])

    # Scene 6: AWS Engine (44.26 - 57.54)
    d = scenes[5]['duration']
    bg, mg, logo, data = image_map['data_center_background.jpg'], image_map['cloud_servers_midground.png'], image_map['aws-logo.png'], image_map['data_stream_foreground.png']
    filter_complex_parts.extend([
        f"[{bg}:v]scale={WIDTH*1.2:.0f}:-1,zoompan=z='1+0.05*t/{d:.2f}':d={int(d*FPS)}:s={WIDTH}x{HEIGHT}[s6_bg]",
        f"[{mg}:v]scale={WIDTH}:-1[s6_mg]",
        f"[{logo}:v]scale={WIDTH*0.25:.0f}:-1,fade=in:st=1:d=1.5:alpha=1,fade=out:st={d-2.5:.2f}:d=1.5:alpha=1[s6_logo]",
        f"[{data}:v]scale={WIDTH}:-1,format=rgba,colorchannelmixer=aa=0.6[s6_data]",
        f"[s6_bg][s6_mg]overlay=x=0:y='-50*sin(t*PI/{d:.2f})'[s6_tmp1]",
        f"[s6_tmp1][s6_logo]overlay=x='(W-w)/2':y='(H-h)/2'[s6_tmp2]",
        f"[s6_tmp2][s6_data]overlay=x=0:y=0:format=auto,trim=duration={d:.2f},setpts=PTS-STARTPTS[scene6]"
    ])

    # Scene 7: Cash Cow Fortress (57.54 - 71.84)
    d = scenes[6]['duration']
    bg, mg, rain, glow = image_map['rainy-city.jpg'], image_map['fortress.png'], image_map['rain_overlay.png'], image_map['glowing_particles.png']
    filter_complex_parts.extend([
        f"[{bg}:v]scale={WIDTH*1.1:.0f}:-1,crop=w={WIDTH}:h={HEIGHT}:x='(iw-ow)*t/{d:.2f}'[s7_bg]",
        f"[{mg}:v]scale={WIDTH*0.7:.0f}:-1[s7_mg]",
        f"[{rain}:v]format=rgba,colorchannelmixer=aa=0.4[s7_rain]",
        f"[{glow}:v]scale={WIDTH}:-1,format=rgba,colorchannelmixer=aa=0.5[s7_glow]",
        f"[s7_bg][s7_mg]overlay=x='(W-w)/2':y=H-h[s7_tmp1]",
        f"[s7_tmp1][s7_rain]overlay=format=auto[s7_tmp2]",
        f"[s7_tmp2][s7_glow]overlay=x=0:y='-h+(t/{d:.2f})*(H+h)':format=auto,trim=duration={d:.2f},setpts=PTS-STARTPTS[scene7]"
    ])

    # Scene 8: Resilience and Sunrise (71.84 - end)
    d = scenes[7]['duration']
    bg, plant, phoenix = image_map['sunrise-field.jpg'], image_map['resilient-plant.png'], image_map['phoenix_from_ashes.png']
    filter_complex_parts.extend([
        f"[{bg}:v]scale={WIDTH*1.2:.0f}:-1,zoompan=z='1+0.1*t/{d:.2f}':d={int(d*FPS)}:s={WIDTH}x{HEIGHT},eq=brightness='0.08*t/{d:.2f}':contrast=1.05[s8_bg]",
        f"[{plant}:v]scale={WIDTH*0.2:.0f}:-1[s8_plant_base]",
        f"[{phoenix}:v]scale={WIDTH*0.5:.0f}:-1,fade=in:st={d*0.3:.2f}:d={d*0.5:.2f}:alpha=1[s8_phoenix]",
        f"[s8_plant_base]scale=w='iw*(1+0.5*t/{d:.2f})':h=-1[s8_plant_growing]",
        f"[s8_bg][s8_plant_growing]overlay=x='(W-w)/2':y=H-h[s8_tmp1]",
        f"[s8_tmp1][s8_phoenix]overlay=x='(W-w)/2':y='(H-h)/2-t/{d:.2f}*150',trim=duration={d:.2f},setpts=PTS-STARTPTS[scene8]"
    ])
    
    # --- Concatenation and Final Output ---
    concat_streams = "".join([f"[scene{i+1}]" for i in range(len(scenes))])
    filter_complex_parts.append(f"{concat_streams}concat=n={len(scenes)}:v=1:a=0[final_v]")

    ffmpeg_cmd.extend(['-filter_complex', ";".join(filter_complex_parts)])
    ffmpeg_cmd.extend([
        '-map', '[final_v]', '-map', f'{audio_input_index}:a',
        '-c:v', 'libx264', '-preset', PRESET, '-crf', str(CRF),
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
        '-shortest', OUTPUT_PATH
    ])
    
    try:
        subprocess.run(ffmpeg_cmd, check=True)
        print(f"\nVideo created successfully: {OUTPUT_PATH}")
    except subprocess.CalledProcessError as e:
        print(f"\nffmpeg command failed with exit code {e.returncode}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```
