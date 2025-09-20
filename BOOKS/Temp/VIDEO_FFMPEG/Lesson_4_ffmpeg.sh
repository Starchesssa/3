Here is a ready-to-run bash script that generates the parallax video using FFmpeg.

### Instructions:

1.  **Save the code:** Save the following script as a file named `generate_parallax.sh`.
2.  **Organize files:** Make sure your files are in the following structure:
    ```
    .
    ├── generate_parallax.sh
    ├── assets/
    │   └── images/
    │       ├── abstract_gears_background.jpg
    │       ├── amazon_box_foreground.png
    │       ├── ... (all your other images) ...
    └── BOOKS/
        └── Temp/
            └── TTS/
                └── Lesson_4.wav
    ```
3.  **Make it executable:** Open your terminal and run `chmod +x generate_parallax.sh`.
4.  **Run the script:** Execute the script by running `./generate_parallax.sh`.

The script will calculate all parameters and then execute the final FFmpeg command. The output will be `lesson_4_parallax.mp4`.

---

### `generate_parallax.sh`

```bash
#!/bin/bash
set -e

# --- CONFIGURATION ---
AUDIO_FILE="BOOKS/Temp/TTS/Lesson_4.wav"
IMAGE_DIR="assets/images"
OUTPUT_FILE="lesson_4_parallax.mp4"
W=3840
H=2160
FPS=30
FADE_DUR=1 # Crossfade duration between scenes in seconds

# --- VERIFY DEPENDENCIES ---
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg could not be found. Please install it."
    exit 1
fi
if ! command -v ffprobe &> /dev/null; then
    echo "ffprobe could not be found. Please install it."
    exit 1
fi
if ! command -v bc &> /dev/null; then
    echo "bc could not be found. Please install it."
    exit 1
fi

# --- GET AUDIO DURATION ---
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE")
echo "Audio duration detected: $DURATION seconds"

# --- DEFINE IMAGE ASSETS ---
# To make the filter_complex graph more readable, we map images to variables.
# This order MUST match the order of the -i flags in the ffmpeg command.
# Scene 1
IMG_S1_BG="$IMAGE_DIR/city_background.jpg"
IMG_S1_MG1="$IMAGE_DIR/stock-chart-midground.png"
IMG_S1_MG2="$IMAGE_DIR/amazon_warehouse_midground.png"
IMG_S1_FG="$IMAGE_DIR/amazon_box_foreground.png"
# Scene 2
IMG_S2_BG="$IMAGE_DIR/data_center_background.jpg"
IMG_S2_MG="$IMAGE_DIR/server-racks-midground.png"
IMG_S2_FG="$IMAGE_DIR/gears-midground.png"
IMG_S2_OV="$IMAGE_DIR/data_stream_foreground.png"
# Scene 3
IMG_S3_BG="$IMAGE_DIR/rainy-city.jpg"
IMG_S3_MG="$IMAGE_DIR/falling-chart.png"
IMG_S3_OV="$IMAGE_DIR/cracked_glass_overlay.png"
# Scene 4
IMG_S4_BG="$IMAGE_DIR/sunrise-field.jpg"
IMG_S4_MG="$IMAGE_DIR/winding-path.jpg"
IMG_S4_FG="$IMAGE_DIR/resilient-plant.png"
# Scene 5
IMG_S5_BG="$IMAGE_DIR/tech_cityscape.jpg"
IMG_S5_MG="$IMAGE_DIR/cloud_servers_midground.png"
IMG_S5_FG="$IMAGE_DIR/aws-logo.png"
IMG_S5_OV="$IMAGE_DIR/digital_grid.png"
IMG_S5_E="$IMAGE_DIR/broken_gears.png"
# Scene 6
IMG_S6_BG="$IMAGE_DIR/bright_sky.jpg"
IMG_S6_MG="$IMAGE_DIR/phoenix_from_ashes.png"
IMG_S6_FG="$IMAGE_DIR/modern_city.png"
IMG_S6_OV="$IMAGE_DIR/glowing_particles.png"


# --- TIMELINE & SCENE DEFINITIONS ---
# Define scene start and end times based on the narration.
S1_START=0.0;    S1_END=9.76
S2_START=9.76;   S2_END=28.00
S3_START=28.00;  S3_END=37.06 # Problem
S4_START=37.06;  S4_END=47.02 # Opportunity/Solution
S5_START=47.02;  S5_END=64.42
S6_START=64.42;  S6_END=$(echo "$DURATION" | bc)

# Calculate durations for interpolation
S1_DUR=$(bc <<< "$S1_END - $S1_START")
S2_DUR=$(bc <<< "$S2_END - $S2_START")
S3_DUR=$(bc <<< "$S4_START - $S3_START") # Scene 3 fades into Scene 4
S4_DUR=$(bc <<< "$S4_END - $S3_START") # Scene 4 fades from Scene 3
S5_DUR=$(bc <<< "$S5_END - $S5_START")
S6_DUR=$(bc <<< "$S6_END - $S6_START")

# --- BUILD THE FFMPEG COMMAND ---

# NOTE on Parallax Logic:
# - Scaling: Layers are scaled slightly larger than the screen (e.g., 1.1x, 1.2x) to allow movement without showing edges.
# - Movement: We use the lerp() function for smooth interpolation of position and scale over the scene's duration.
#   - `lerp(start, end, (t - SCENE_START) / SCENE_DURATION)`
# - Depth: Foreground layers move more/faster than background layers to create a sense of depth.
# - Fades: Layers have fade-in and fade-out filters applied to create smooth transitions between scenes.

FILTER_COMPLEX="
# Create a black canvas for the entire duration
color=s=${W}x${H}:c=black:d=$DURATION:r=$FPS [canvas];

# --- SCENE 1: The Public Face of Amazon (0.00 - 9.76) ---
# Effect: Slow pan right + zoom in
[0:v] setpts=PTS-STARTPTS, scale=w=${W}*1.1:h=-1, crop=$W:$H, format=rgba, fade=out:st=$(bc <<< "$S1_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s1_bg];
[1:v] setpts=PTS-STARTPTS, scale=w=${W}*0.5:h=-1, format=rgba, fade=out:st=$(bc <<< "$S1_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s1_mg1];
[2:v] setpts=PTS-STARTPTS, scale=w=${W}*1.2:h=-1, crop=$W:$H, format=rgba, fade=out:st=$(bc <<< "$S1_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s1_mg2];
[3:v] setpts=PTS-STARTPTS, scale=w=${W}*0.3:h=-1, format=rgba, fade=out:st=$(bc <<< "$S1_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s1_fg];

[canvas][s1_bg] overlay=x='lerp(0, -${W}*0.1, (t-$S1_START)/$S1_DUR)':y=0:enable='between(t,$S1_START,$S1_END)' [cv1];
[cv1][s1_mg2] overlay=x='lerp(-${W}*0.1, ${W}*0.1, (t-$S1_START)/$S1_DUR)':y='H-h':enable='between(t,$S1_START,$S1_END)' [cv2];
[cv2][s1_mg1] overlay=x='(W-w)/2':y='(H-h)/2':enable='between(t,$S1_START,$S1_END)' [cv3];
[cv3][s1_fg] overlay=x='lerp(W*0.7, W*0.8, (t-$S1_START)/$S1_DUR)':y='lerp(H*0.6, H*0.5, (t-$S1_START)/$S1_DUR)':enable='between(t,$S1_START,$S1_END)' [canvas_s1_done];


# --- SCENE 2: The Internal Beast (9.76 - 28.00) ---
# Effect: Dolly zoom in + slow rotation
[4:v] setpts=PTS-STARTPTS, scale=w=${W}*1.5:h=-1, crop=$W:$H, format=rgba, fade=in:st=$S2_START:d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S2_END - $FADE_DUR"):d=$FADE_DUR:alpha=1, rotate='0.005*t' [s2_bg];
[5:v] setpts=PTS-STARTPTS, scale=w=${W}*1.2:h=-1, crop=$W:$H, format=rgba, fade=in:st=$S2_START:d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S2_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s2_mg];
[6:v] setpts=PTS-STARTPTS, scale=w=${W}:h=-1, format=rgba, fade=in:st=$S2_START:d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S2_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s2_fg];
[7:v] setpts=PTS-STARTPTS, scale=w=${W}:h=-1, format=rgba, fade=in:st=$S2_START:d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S2_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s2_ov];

[canvas_s1_done][s2_bg] overlay=x=0:y=0:enable='between(t,$S2_START,$S2_END)' [cv4];
[cv4][s2_mg] overlay=x='lerp(-${W}*0.1, 0, (t-$S2_START)/$S2_DUR)':y=0:enable='between(t,$S2_START,$S2_END)' [cv5];
[cv5][s2_fg] overlay=x='(W-w)/2':y='(H-h)/2':enable='between(t,$S2_START,$S2_END)' [cv6];
[cv6][s2_ov] overlay=x=0:y=0:enable='between(t,$S2_START,$S2_END)', zoompan=z='min(zoom+0.0005,1.1)':d=1:s=${W}x${H}:fps=$FPS [canvas_s2_done];


# --- SCENE 3: The Problem (28.00 - 37.06) ---
# Effect: Pan down, sinking feeling.
[8:v] setpts=PTS-STARTPTS, scale=w=${W}*1.2:h=-1, crop=$W:$H, format=rgba, fade=in:st=$S3_START:d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S4_START - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s3_bg];
[9:v] setpts=PTS-STARTPTS, scale=w=${W}*0.6:h=-1, format=rgba, fade=in:st=$S3_START:d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S4_START - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s3_mg];
[10:v] setpts=PTS-STARTPTS, scale=w=${W}:h=-1, format=rgba, fade=in:st=$S3_START:d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S4_START - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s3_ov];

[canvas_s2_done][s3_bg] overlay=x=0:y='lerp(0, -${H}*0.1, (t-$S3_START)/$S3_DUR)':enable='between(t,$S3_START,$S4_START)' [cv7];
[cv7][s3_mg] overlay=x='(W-w)/2':y='lerp(-h, (H-h)/2, (t-$S3_START)/$S3_DUR)':enable='between(t,$S3_START,$S4_START)' [cv8];
[cv8][s3_ov] overlay=x=0:y=0:enable='between(t,$S3_START,$S4_START)' [canvas_s3_done];


# --- SCENE 4: The Opportunity (37.06 - 47.02) ---
# Effect: Pan up, rising feeling. Crossfades with Scene 3.
[11:v] setpts=PTS-STARTPTS, scale=w=${W}*1.2:h=-1, crop=$W:$H, format=rgba, fade=in:st=$(bc <<< "$S4_START - $FADE_DUR"):d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S4_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s4_bg];
[12:v] setpts=PTS-STARTPTS, scale=w=${W}*1.1:h=-1, crop=$W:$H, format=rgba, fade=in:st=$(bc <<< "$S4_START - $FADE_DUR"):d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S4_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s4_mg];
[13:v] setpts=PTS-STARTPTS, scale=w=${W}*0.4:h=-1, format=rgba, fade=in:st=$(bc <<< "$S4_START - $FADE_DUR"):d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S4_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s4_fg];

[canvas_s3_done][s4_bg] overlay=x=0:y='lerp(-${H}*0.2, 0, (t-$S3_START)/$S4_DUR)':enable='between(t,$S3_START,$S4_END)' [cv9];
[cv9][s4_mg] overlay=x=0:y='lerp(0, -${H}*0.1, (t-$S3_START)/$S4_DUR)':enable='between(t,$S3_START,$S4_END)' [cv10];
[cv10][s4_fg] overlay=x='W/2-w/2':y='H-h':enable='between(t,$S3_START,$S4_END)' [canvas_s4_done];


# --- SCENE 5: Birth of AWS (47.02 - 64.42) ---
# Effect: Zoom out, revealing the new landscape.
[14:v] setpts=PTS-STARTPTS, scale=w=${W}*1.2:h=-1, crop=$W:$H, format=rgba, fade=in:st=$S5_START:d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S5_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s5_bg];
[15:v] setpts=PTS-STARTPTS, scale=w=${W}*1.1:h=-1, crop=$W:$H, format=rgba, fade=in:st=$S5_START:d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S5_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s5_mg];
[16:v] setpts=PTS-STARTPTS, format=rgba, fade=in:st=$S5_START:d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S5_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s5_fg];
[17:v] setpts=PTS-STARTPTS, scale=${W}:-1, format=rgba, fade=in:st=$S5_START:d=$FADE_DUR:alpha=1, fade=out:st=$(bc <<< "$S5_END - $FADE_DUR"):d=$FADE_DUR:alpha=1 [s5_ov];
[18:v] setpts=PTS-STARTPTS, scale=${W}*0.5:-1, format=rgba, fade=in:st=63:d=0.2:alpha=1, fade=out:st=63.8:d=0.2:alpha=1 [s5_e];

[canvas_s4_done][s5_bg] overlay=x=0:y=0:enable='between(t,$S5_START,$S5_END)' [cv11];
[cv11][s5_mg] overlay=x='lerp(0, -${W}*0.1, (t-$S5_START)/$S5_DUR)':y=0:enable='between(t,$S5_START,$S5_END)' [cv12];
[cv12][s5_ov] overlay=x=0:y=0:enable='between(t,$S5_START,$S5_END)' [cv13];
[cv13]zoompan=z='if(lte(zoom,1.0),1.2,max(1.0,zoom-0.001))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=$FPS [cv13_z];
[cv13_z][s5_fg] overlay=x='(W-w)/2':y='(H-h)/2':enable='between(t,$S5_START,$S5_END)', scale=w='min(W*0.8, lerp(W*0.1, W*0.3, (t-$S5_START)/$S5_DUR))':h=-1 [cv14];
[cv14][s5_e] overlay=x='(W-w)/2':y='(H-h)/2':enable='between(t,63,64)' [canvas_s5_done];


# --- SCENE 6: The Revolution (64.42 - END) ---
# Effect: Strong upward pan.
[19:v] setpts=PTS-STARTPTS, scale=w=${W}*1.1:h=-1, crop=$W:$H, format=rgba, fade=in:st=$S6_START:d=$FADE_DUR:alpha=1 [s6_bg];
[20:v] setpts=PTS-STARTPTS, scale=w=${W}*0.7:h=-1, format=rgba, fade=in:st=$S6_START:d=$FADE_DUR:alpha=1 [s6_mg];
[21:v] setpts=PTS-STARTPTS, scale=w=${W}*1.4:h=-1, crop=$W:$H, format=rgba, fade=in:st=$S6_START:d=$FADE_DUR:alpha=1 [s6_fg];
[22:v] setpts=PTS-STARTPTS, scale=w=${W}:h=-1, format=rgba, fade=in:st=$S6_START:d=$FADE_DUR:alpha=1 [s6_ov];

[canvas_s5_done][s6_bg] overlay=x=0:y='lerp(-${H}*0.1, 0, (t-$S6_START)/$S6_DUR)':enable='between(t,$S6_START,$S6_END)' [cv15];
[cv15][s6_fg] overlay=x='lerp(-${W}*0.2, -${W}*0.1, (t-$S6_START)/$S6_DUR)':y='lerp(0, -${H}*0.2, (t-$S6_START)/$S6_DUR)':enable='between(t,$S6_START,$S6_END)' [cv16];
[cv16][s6_mg] overlay=x='(W-w)/2':y='lerp(H*0.8, H*0.2, (t-$S6_START)/$S6_DUR)':enable='between(t,$S6_START,$S6_END)' [cv17];
[cv17][s6_ov] overlay=x=0:y='-50*t':enable='between(t,$S6_START,$S6_END)' [final_video];

[final_video]format=yuv420p[v]
"

# Execute the final FFmpeg command
ffmpeg \
    -i "$IMG_S1_BG" \
    -i "$IMG_S1_MG1" \
    -i "$IMG_S1_MG2" \
    -i "$IMG_S1_FG" \
    -i "$IMG_S2_BG" \
    -i "$IMG_S2_MG" \
    -i "$IMG_S2_FG" \
    -i "$IMG_S2_OV" \
    -i "$IMG_S3_BG" \
    -i "$IMG_S3_MG" \
    -i "$IMG_S3_OV" \
    -i "$IMG_S4_BG" \
    -i "$IMG_S4_MG" \
    -i "$IMG_S4_FG" \
    -i "$IMG_S5_BG" \
    -i "$IMG_S5_MG" \
    -i "$IMG_S5_FG" \
    -i "$IMG_S5_OV" \
    -i "$IMG_S5_E" \
    -i "$IMG_S6_BG" \
    -i "$IMG_S6_MG" \
    -i "$IMG_S6_FG" \
    -i "$IMG_S6_OV" \
    -i "$AUDIO_FILE" \
    -filter_complex "$FILTER_COMPLEX" \
    -map "[v]" \
    -map 23:a:0 \
    -c:v libx264 -preset veryfast -crf 20 \
    -c:a aac -b:a 192k \
    -t "$DURATION" \
    -y "$OUTPUT_FILE"

echo "Video generation complete: $OUTPUT_FILE"
```