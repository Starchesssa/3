#!/usr/bin/env python3
import shutil, subprocess, sys, os

```python
#!/usr/bin/env python3

import subprocess
import shutil
import os
import sys
import json
from pathlib import Path

# --- Configuration ---
WIDTH = 3840
HEIGHT = 2160
FPS = 30
AUDIO_PATH = Path('BOOKS/Temp/TTS/Intro.wav')
OUTPUT_DIR = Path('BOOKS/Temp/VIDEO_FFMPEG/')
OUTPUT_PATH = OUTPUT_DIR / 'Intro_ffmpeg_output.mp4'

# --- Asset Definitions ---
# Using a dictionary to easily reference assets in the script
ASSETS = {
    # Scene 1: "They tell you to follow the rules... spreadsheet"
    "s1_bg": "assets/images/blueprint_bg.jpg",
    "s1_mid1": "assets/images/gears-midground.png",
    "s1_mid2": "assets/images/stock-chart-midground.png",
    "s1_fg": "assets/images/tech-overlay-foreground.png",

    # Scene 2: "small, forgettable companies"
    "s2_bg": "assets/images/rainy-city.jpg",
    "s2_mid": "assets/images/sad-people.png",
    "s2_fg": "assets/images/rain_overlay.png",

    # Scene 3: "not the story of one of those companies"
    "s3_bg": "assets/images/sunrise-field.jpg",
    "s3_mid": "assets/images/resilient-plant.png",
    "s3_fg": "assets/images/glowing_particles.png",

    # Scene 4: "a machine that ate the world"
    "s4_bg": "assets/images/data_center_background.jpg",
    "s4_mid1": "assets/images/server-racks-midground.png",
    "s4_mid2": "assets/images/cloud_servers_midground.png",
    "s4_fg": "assets/images/data_stream_foreground.png",
}

def check_dependencies():
    """Check for ffmpeg, ffprobe, and required files."""
    if not shutil.which("ffmpeg"):
        print("Error: ffmpeg not found in PATH.", file=sys.stderr)
        sys.exit(1)
    if not shutil.which("ffprobe"):
        print("Error: ffprobe not found in PATH.", file=sys.stderr)
        sys.exit(1)

    if not AUDIO_PATH.is_file():
        print(f"Error: Audio file not found at {AUDIO_PATH}", file=sys.stderr)
        sys.exit(1)

    for key, path in ASSETS.items():
        if not Path(path).is_file():
            print(f"Error: Image asset '{key}' not found at {path}", file=sys.stderr)
            sys.exit(1)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def get_audio_duration(file_path):
    """Get the duration of an audio file in seconds."""
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(file_path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return float(result.stdout.strip())

def main():
    """Construct and run the ffmpeg command."""
    check_dependencies()

    total_duration = get_audio_duration(AUDIO_PATH)

    # --- Timeline and Scene Durations ---
    # Durations are calculated to match the provided timeline, with crossfades in mind.
    scene1_end = 7.1
    scene2_end = 13.5
    scene3_end = 16.9
    
    scene1_dur = scene1_end
    scene2_dur = scene2_end - scene1_end
    scene3_dur = scene3_end - scene2_end
    scene4_dur = total_duration - scene3_end
    
    xfade_dur = 0.75
    
    # Calculate xfade offsets
    xfade1_offset = scene1_dur - xfade_dur
    xfade2_offset = scene1_dur + scene2_dur - xfade_dur
    xfade3_offset = scene1_dur + scene2_dur + scene3_dur - xfade_dur

    # --- Build ffmpeg command ---
    
    # Unique list of inputs to pass to ffmpeg
    unique_assets = sorted(list(set(ASSETS.values())))
    input_args = []
    video_stream_map = {}
    for i, asset_path in enumerate(unique_assets):
        input_args.extend(["-i", asset_path])
        video_stream_map[asset_path] = f"[{i}:v]"
    
    # Add audio input
    audio_input_index = len(unique_assets)
    input_args.extend(["-i", str(AUDIO_PATH)])

    # --- Filter Complex String ---
    # This is the core of the video generation, where each scene is constructed.

    filter_complex = f"""
    # --- Input Stream Preparation ---
    # Scale all inputs to a slightly larger size for panning/zooming without black borders.
    # The 'force_original_aspect_ratio=decrease' and 'pad' ensure 16:9 without distortion.
    {video_stream_map[ASSETS['s1_bg']]}scale={WIDTH}*1.1:-1,crop=w={WIDTH}:h={HEIGHT},format=yuv420p[s1_bg_base];
    {video_stream_map[ASSETS['s1_mid1']]}scale={WIDTH}*1.2:-1,format=rgba[s1_mid1_base];
    {video_stream_map[ASSETS['s1_mid2']]}scale={WIDTH}*1.3:-1,format=rgba[s1_mid2_base];
    {video_stream_map[ASSETS['s1_fg']]}scale={WIDTH}:-1,format=rgba[s1_fg_base];

    {video_stream_map[ASSETS['s2_bg']]}scale={WIDTH}*1.3:-1,crop=w={WIDTH}:h={HEIGHT},format=yuv420p[s2_bg_base];
    {video_stream_map[ASSETS['s2_mid']]}scale={WIDTH}*0.6:-1,format=rgba[s2_mid_base];
    {video_stream_map[ASSETS['s2_fg']]}scale={WIDTH}:{HEIGHT},format=rgba,loop=loop=-1:size=2,setpts=N/FRAME_RATE/TB[s2_fg_base];

    {video_stream_map[ASSETS['s3_bg']]}scale={WIDTH}*1.2:-1,crop=w={WIDTH}:h={HEIGHT},format=yuv420p[s3_bg_base];
    {video_stream_map[ASSETS['s3_mid']]}scale={WIDTH}*0.4:-1,format=rgba[s3_mid_base];
    {video_stream_map[ASSETS['s3_fg']]}scale={WIDTH}:-1,format=rgba,loop=loop=-1:size=2,setpts=N/FRAME_RATE/TB[s3_fg_base];

    {video_stream_map[ASSETS['s4_bg']]}scale={WIDTH}*2:-1,crop=w={WIDTH}:h={HEIGHT},format=yuv420p[s4_bg_base];
    {video_stream_map[ASSETS['s4_mid1']]}scale={WIDTH}*2.2:-1,format=rgba[s4_mid1_base];
    {video_stream_map[ASSETS['s4_mid2']]}scale={WIDTH}*2.4:-1,format=rgba[s4_mid2_base];
    {video_stream_map[ASSETS['s4_fg']]}scale={WIDTH}*2.6:-1,format=rgba[s4_fg_base];

    # --- Scene 1: Slow Horizontal Parallax ---
    [s1_bg_base]trim=duration={scene1_dur},setpts=PTS-STARTPTS[s1_bg_final];
    [s1_bg_final][s1_mid1_base]overlay=x='(W-w)/2 - W*0.02*t/{scene1_dur}':y='(H-h)/2'[s1_c1];
    [s1_c1][s1_mid2_base]overlay=x='(W-w)/2 + W*0.04*t/{scene1_dur}':y='(H-h)/2'[s1_c2];
    [s1_c2][s1_fg_base]overlay=x=0:y=0,format=yuv420p[v_scene1];

    # --- Scene 2: Slow Zoom Out + Vertical Float ---
    [s2_bg_base]zoompan=z='max(1.3-0.1*t/{scene2_dur},1)':d={scene2_dur}*30:x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2':s={WIDTH}x{HEIGHT},trim=duration={scene2_dur},setpts=PTS-STARTPTS[s2_bg_final];
    [s2_bg_final][s2_mid_base]overlay=x='(W-w)/2':y='-h+(H+h)*(t/{scene2_dur})*0.6',trim=duration={scene2_dur}[s2_c1];
    [s2_c1][s2_fg_base]overlay,format=yuv420p[v_scene2];

    # --- Scene 3: Gentle Zoom In + Particle Float ---
    [s3_bg_base]zoompan=z='min(1+0.1*t/{scene3_dur},1.3)':d={scene3_dur}*30:x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2':s={WIDTH}x{HEIGHT},trim=duration={scene3_dur},setpts=PTS-STARTPTS[s3_bg_final];
    [s3_bg_final][s3_mid_base]overlay=x='(W-w)/2':y='(H-h)/2'[s3_c1];
    [s3_c1][s3_fg_base]overlay=x=0:y='-H*0.1*t/{scene3_dur}',format=yuv420p[v_scene3];

    # --- Scene 4: Fast Pseudo-3D Zoom ---
    [s4_bg_base]zoompan=z='min(1+0.3*t/{scene4_dur},2)':d={scene4_dur}*30:x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2':s={WIDTH}x{HEIGHT},trim=duration={scene4_dur},setpts=PTS-STARTPTS[s4_bg_final];
    [s4_mid1_base]trim=duration={scene4_dur},setpts=PTS-STARTPTS[s4_m1_trim];
    [s4_mid2_base]trim=duration={scene4_dur},setpts=PTS-STARTPTS[s4_m2_trim];
    [s4_fg_base]trim=duration={scene4_dur},setpts=PTS-STARTPTS[s4_fg_trim];
    [s4_bg_final][s4_m1_trim]overlay=x='(main_w-overlay_w)/2':y='(main_h-overlay_h)/2':eval=frame[s4_c1];
    [s4_c1][s4_m2_trim]overlay=x='(main_w-overlay_w)/2-50*t/{scene4_dur}':y='(main_h-overlay_h)/2':eval=frame[s4_c2];
    [s4_c2][s4_fg_trim]overlay=x='(main_w-overlay_w)/2+80*t/{scene4_dur}':y='(main_h-overlay_h)/2':eval=frame,
    scale={WIDTH}:{HEIGHT},
    zoompan=z='min(1+0.5*t/{scene4_dur},2)':d={scene4_dur}*30:x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2':s={WIDTH}x{HEIGHT},
    format=yuv420p[v_scene4];
    
    # --- Scene Concatenation with Crossfades ---
    [v_scene1][v_scene2]xfade=transition=fade:duration={xfade_dur}:offset={xfade1_offset}[v12];
    [v12][v_scene3]xfade=transition=fade:duration={xfade_dur}:offset={xfade2_offset}[v123];
    [v123][v_scene4]xfade=transition=fade:duration={xfade_dur}:offset={xfade3_offset},
    format=yuv420p[v_final]
    """

    ffmpeg_cmd = [
        "ffmpeg",
        "-y",
        *input_args,
        "-filter_complex", "".join(filter_complex.splitlines()),
        "-map", "[v_final]",
        "-map", f"{audio_input_index}:a",
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-r", str(FPS),
        "-t", str(total_duration),
        str(OUTPUT_PATH)
    ]

    print("--- FFMPEG COMMAND ---")
    # A bit of shell-like formatting for readability
    print(" ".join(f'"{arg}"' if " " in arg else arg for arg in ffmpeg_cmd))
    print("----------------------")
    print(f"Generating video... this may take a while.")

    try:
        subprocess.run(ffmpeg_cmd, check=True)
        print(f"\nSuccess! Video saved to: {OUTPUT_PATH}")
    except subprocess.CalledProcessError as e:
        print(f"\nError during ffmpeg execution: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
```