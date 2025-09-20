Here is the complete, ready-to-run FFmpeg shell script to generate the parallax video.

**Instructions:**
1.  Save the code below as a shell script file (e.g., `create_parallax.sh`).
2.  Make sure you have `ffmpeg` and `ffprobe` installed and in your system's PATH.
3.  Place the script in the same root directory as your `BOOKS` and `assets` folders.
4.  Make the script executable: `chmod +x create_parallax.sh`.
5.  Run the script from your terminal: `./create_parallax.sh`.

The script will generate `lesson_5_parallax.mp4` in the same directory.

```bash
#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
AUDIO_FILE="BOOKS/Temp/TTS/Lesson_5.wav"
IMAGE_DIR="assets/images"
OUTPUT_FILE="lesson_5_parallax.mp4"
WIDTH=3840
HEIGHT=2160
FPS=30

# --- 1. Verify Assets and Get Audio Duration ---
if [ ! -f "$AUDIO_FILE" ]; then
    echo "Error: Audio file not found at $AUDIO_FILE"
    exit 1
fi

DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE")
if [ -z "$DURATION" ]; then
    echo "Error: Could not determine audio duration."
    exit 1
fi
echo "Audio duration: $DURATION seconds. Generating video..."

# --- 2. Define Image Inputs in Processing Order ---
# This specific order is crucial as it maps to the input stream index in the filter graph (e.g., image_files[0] becomes 1:v)
image_files=(
    # Scene 1: "Key lesson..." (4 layers)
    "$IMAGE_DIR/blueprint_bg.jpg"
    "$IMAGE_DIR/gears-background.png"
    "$IMAGE_DIR/gears-midground.png"
    "$IMAGE_DIR/gears-foreground.png"
    # Scene 2: "2008 collapse" (5 layers)
    "$IMAGE_DIR/city-background.jpg"
    "$IMAGE_DIR/city-skyline-mid.png"
    "$IMAGE_DIR/stock-chart-midground.png"
    "$IMAGE_DIR/falling-chart.png"
    "$IMAGE_DIR/cracked_glass_overlay.png"
    # Scene 3: "Economy in free fall" (4 layers)
    "$IMAGE_DIR/dark_clouds.jpg"
    "$IMAGE_DIR/empty_city_street_background.jpg"
    "$IMAGE_DIR/sad-people.png"
    "$IMAGE_DIR/rain_overlay.png"
    # Scene 4: "Businesses hoarding cash" (4 layers)
    "$IMAGE_DIR/abstract_gears_background.jpg"
    "$IMAGE_DIR/buildings_midground.png"
    "$IMAGE_DIR/broken_gears.png"
    "$IMAGE_DIR/biohazard_symbol_overlay.png"
    # Scene 5: "Amazon pushes forward" (5 layers)
    "$IMAGE_DIR/tech_city_background.jpg"
    "$IMAGE_DIR/modern_city.png"
    "$IMAGE_DIR/data_stream.png"
    "$IMAGE_DIR/glowing-data.png"
    "$IMAGE_DIR/glowing_particles.png"
    # Scene 6: "The Kindle" (5 layers)
    "$IMAGE_DIR/data-center-background.jpg"
    "$IMAGE_DIR/cloud_servers_midground.png"
    "$IMAGE_DIR/aws-logo.png"
    "$IMAGE_DIR/data_stream_foreground.png"
    "$IMAGE_DIR/soundwaves_overlay.png"
    # Scene 7: "Building hardware" (5 layers)
    "$IMAGE_DIR/city_background.jpg"
    "$IMAGE_DIR/amazon_warehouse_midground.png"
    "$IMAGE_DIR/buildings-foreground.png"
    "$IMAGE_DIR/amazon_box_foreground.png"
    "$IMAGE_DIR/delivery_drone_foreground.png"
    # Scene 8: "Recessions clearing event" (4 layers)
    "$IMAGE_DIR/rainy-city.jpg"
    "$IMAGE_DIR/phoenix_from_ashes.png"
    "$IMAGE_DIR/fortress.png"
    "$IMAGE_DIR/resilient-plant.png"
    # Scene 9: "Grabbing market share" (5 layers)
    "$IMAGE_DIR/tech_cityscape.jpg"
    "$IMAGE_DIR/server-racks-midground.png"
    "$IMAGE_DIR/digital_grid.png"
    "$IMAGE_DIR/data_overlay_foreground.png"
    "$IMAGE_DIR/tech-overlay-foreground.png"
    # Scene 10: "Looking at the horizon" (5 layers)
    "$IMAGE_DIR/bright_sky.jpg"
    "$IMAGE_DIR/mountains-far.png"
    "$IMAGE_DIR/forest-midground.png"
    "$IMAGE_DIR/winding-path.jpg"
    "$IMAGE_DIR/single-tree.png"
)

# Verify all image files exist
for img in "${image_files[@]}"; do
    if [ ! -f "$img" ]; then
        echo "Error: Image file not found at $img"
        exit 1
    fi
done

# Prepare the -i arguments for ffmpeg
input_args=""
for img in "${image_files[@]}"; do
    input_args+=" -loop 1 -i \"$img\""
done

# --- 3. Define Scene Timelines and Durations ---
# Based on the provided timeline text
T0=0.00;   S1_START=$T0; S1_END=4.06;   S1_DUR=$(echo "$S1_END - $S1_START" | bc)
T1=4.06;   S2_START=$T1; S2_END=9.02;   S2_DUR=$(echo "$S2_END - $S2_START" | bc)
T2=9.02;   S3_START=$T2; S3_END=13.36;  S3_DUR=$(echo "$S3_END - $S3_START" | bc)
T3=13.36;  S4_START=$T3; S4_END=19.60;  S4_DUR=$(echo "$S4_END - $S4_START" | bc)
T4=19.60;  S5_START=$T4; S5_END=25.40;  S5_DUR=$(echo "$S5_END - $S5_START" | bc)
T5=25.40;  S6_START=$T5; S6_END=34.94;  S6_DUR=$(echo "$S6_END - $S6_START" | bc)
T6=34.94;  S7_START=$T6; S7_END=44.02;  S7_DUR=$(echo "$S7_END - $S7_START" | bc)
T7=44.02;  S8_START=$T7; S8_END=49.46;  S8_DUR=$(echo "$S8_END - $S8_START" | bc)
T8=49.46;  S9_START=$T8; S9_END=56.29;  S9_DUR=$(echo "$S9_END - $S9_START" | bc)
T9=56.29;  S10_START=$T9; S10_END=$DURATION; S10_DUR=$(echo "$S10_END - $S10_START" | bc)

# --- 4. Build the Filter Complex String ---
# Each scene's filter chain is created independently and then concatenated.
# Note: Input video streams start from 1:v because 0:a is the audio.
filter_complex="
# --- SCENE 1: Zoom & Pan (0.00 - 4.06) ---
# Inputs: 1:v, 2:v, 3:v, 4:v
[1:v]scale=${WIDTH}*1.2:-1,zoompan=z='min(zoom+0.0005,1.2)':d=ceil(${S1_DUR}*${FPS}):s=${WIDTH}x${HEIGHT},trim=duration=${S1_DUR},setpts=PTS-STARTPTS[s1_base];
[2:v]scale=${WIDTH}*1.25:-1,format=rgba[s1_l1];
[3:v]scale=${WIDTH}*1.3:-1,format=rgba[s1_l2];
[4:v]scale=${WIDTH}*1.35:-1,format=rgba[s1_l3];
[s1_base][s1_l1]overlay=x='(W-w)/2 - 40*t':y='(H-h)/2'[s1_c1];
[s1_c1][s1_l2]overlay=x='(W-w)/2 + 30*t':y='(H-h)/2'[s1_c2];
[s1_c2][s1_l3]overlay=x='(W-w)/2 - 70*t':y='(H-h)/2',trim=duration=${S1_DUR},setpts=PTS-STARTPTS[v1];

# --- SCENE 2: Vertical Pan & Falling Objects (4.06 - 9.02) ---
# Inputs: 5:v, 6:v, 7:v, 8:v, 9:v
[5:v]scale=-1:${HEIGHT}*1.3,crop=${WIDTH}:${HEIGHT}[s2_base_full];
[6:v]scale=${WIDTH}*1.1:-1,format=rgba[s2_l1];
[7:v]scale=${WIDTH}*0.4:-1,format=rgba[s2_l2];
[8:v]scale=${WIDTH}*0.5:-1,format=rgba[s2_l3];
[9:v]scale=${WIDTH}:${HEIGHT},format=rgba,fade=in:st=1:d=1:alpha=1[s2_l4];
[s2_base_full]crop=${WIDTH}:${HEIGHT}:x=0:y='t/${S2_DUR}*(ih-${HEIGHT})',trim=duration=${S2_DUR},setpts=PTS-STARTPTS[s2_base];
[s2_base][s2_l1]overlay=x='(W-w)/2':y='(t/${S2_DUR})*150 - 50'[s2_c1];
[s2_c1][s2_l2]overlay=x='${WIDTH}*0.1':y='-h + (t/${S2_DUR})*(${HEIGHT}+h)*1.2'[s2_c2];
[s2_c2][s2_l3]overlay=x='${WIDTH}*0.5':y='-h + (t/${S2_DUR})*(${HEIGHT}+h)*1.1'[s2_c3];
[s2_c3][s2_l4]overlay,trim=duration=${S2_DUR},setpts=PTS-STARTPTS[v2];

# --- SCENE 3: Slow Vertical Pan & Rain (9.02 - 13.36) ---
# Inputs: 10:v, 11:v, 12:v, 13:v
[10:v]scale=${WIDTH}:-1,crop=${WIDTH}:${HEIGHT}[s3_base];
[11:v]scale=${WIDTH}*1.1:-1,format=rgba[s3_l1];
[12:v]scale=${WIDTH}*0.8:-1,format=rgba[s3_l2];
[13:v]scale=${WIDTH}:-1,format=rgba[s3_l3];
[s3_base][s3_l1]overlay=x='(W-w)/2':y='-50 - 40*t'[s3_c1];
[s3_c1][s3_l2]overlay=x='(W-w)/2':y='H-h'[s3_c2];
[s3_c2][s3_l3]overlay=y='-h+mod(400*t,h)',trim=duration=${S3_DUR},setpts=PTS-STARTPTS[v3];

# --- SCENE 4: Zoom Out (13.36 - 19.60) ---
# Inputs: 14:v, 15:v, 16:v, 17:v
[14:v]scale=${WIDTH}*1.5:-1,zoompan=z='max(1.5-t/${S4_DUR}*0.4,1)':d=ceil(${S4_DUR}*${FPS}):s=${WIDTH}x${HEIGHT},trim=duration=${S4_DUR},setpts=PTS-STARTPTS[s4_base];
[15:v]scale=${WIDTH}*0.9:-1,format=rgba[s4_l1];
[16:v]scale=${WIDTH}*0.7:-1,format=rgba[s4_l2];
[17:v]scale=${WIDTH}*0.2:-1,format=rgba,fade=in:st=0.5:d=1:alpha=1,fade=out:st=$(echo "$S4_DUR-1.5"|bc):d=1:alpha=1[s4_l3];
[s4_base][s4_l1]overlay=x=50:y='H-h-50'[s4_c1];
[s4_c1][s4_l2]overlay=x='W-w-100':y=100[s4_c2];
[s4_c2][s4_l3]overlay=x='(W-w)/2':y='(H-h)/2',trim=duration=${S4_DUR},setpts=PTS-STARTPTS[v4];

# --- SCENE 5: Fast Horizontal Pan (19.60 - 25.40) ---
# Inputs: 18:v, 19:v, 20:v, 21:v, 22:v
[18:v]scale=${WIDTH}*1.3:-1,crop=${WIDTH}:${HEIGHT}[s5_base_full];
[19:v]scale=${WIDTH}*1.2:-1,format=rgba[s5_l1];
[20:v]scale=${WIDTH}:-1,format=rgba[s5_l2];
[21:v]scale=${WIDTH}:-1,format=rgba[s5_l3];
[22:v]scale=${WIDTH}:-1,format=rgba[s5_l4];
[s5_base_full]crop=${WIDTH}:${HEIGHT}:y=0:x='(t/${S5_DUR})*(iw-W)',trim=duration=${S5_DUR},setpts=PTS-STARTPTS[s5_base];
[s5_base][s5_l1]overlay=x='-w/3 + (t/${S5_DUR})*150':y='(H-h)/2'[s5_c1];
[s5_c1][s5_l2]overlay=x='-w+mod(400*t,W+w)':y='H*0.2'[s5_c2];
[s5_c2][s5_l3]overlay=x='mod(-450*t,W+w)':y='H*0.6'[s5_c3];
[s5_c3][s5_l4]overlay=x=0:y=0,trim=duration=${S5_DUR},setpts=PTS-STARTPTS[v5];

# --- SCENE 6: Slow Dolly/Zoom (25.40 - 34.94) ---
# Inputs: 23:v, 24:v, 25:v, 26:v, 27:v
[23:v]scale=${WIDTH}*1.4:-1,zoompan=z='min(zoom+0.0003,1.4)':d=ceil(${S6_DUR}*${FPS}):s=${WIDTH}x${HEIGHT},trim=duration=${S6_DUR},setpts=PTS-STARTPTS[s6_base];
[24:v]scale=${WIDTH}*1.3:-1,format=rgba[s6_l1];
[25:v]scale=${WIDTH}*0.2:-1,format=rgba,fade=in:st=1:d=1:alpha=1[s6_l2];
[26:v]scale=${WIDTH}:-1,format=rgba[s6_l3];
[27:v]scale=${WIDTH}:-1,format=rgba[s6_l4];
[s6_base][s6_l1]overlay=x='(W-w)/2-50*t':y='(H-h)/2'[s6_c1];
[s6_c1][s6_l2]overlay=x='(W-w)/2':y='(H-h)/2'[s6_c2];
[s6_c2][s6_l3]overlay=x='-w+mod(300*t,W+w)':y=0[s6_c3];
[s6_c3][s6_l4]overlay=x=0:y=0:eval=init,trim=duration=${S6_DUR},setpts=PTS-STARTPTS[v6];

# --- SCENE 7: Build Up & Animated Object (34.94 - 44.02) ---
# Inputs: 28:v, 29:v, 30:v, 31:v, 32:v
[28:v]scale=${WIDTH}:-1,crop=${WIDTH}:${HEIGHT}[s7_base];
[29:v]scale=${WIDTH}*1.2:-1,format=rgba[s7_l1];
[30:v]scale=${WIDTH}*1.4:-1,format=rgba[s7_l2];
[31:v]scale=${WIDTH}*0.4:-1,format=rgba[s7_l3];
[32:v]scale=${WIDTH}*0.2:-1,format=rgba[s7_l4];
[s7_base][s7_l1]overlay=x='(W-w)/2':y='H-h - t*20'[s7_c1];
[s7_c1][s7_l2]overlay=x='(W-w)/2':y='H-h - t*30'[s7_c2];
[s7_c2][s7_l3]overlay=x='${WIDTH}*0.1':y='${HEIGHT}*0.8-h'[s7_c3];
[s7_c3][s7_l4]overlay=x='-w+(W+w)*(t/${S7_DUR})':y='H*0.1',trim=duration=${S7_DUR},setpts=PTS-STARTPTS[v7];

# --- SCENE 8: Weak to Strong Transition (44.02 - 49.46) ---
# Inputs: 33:v, 34:v, 35:v, 36:v
[33:v]scale=${WIDTH}*1.2:-1,zoompan=z='min(zoom+0.001,1.2)':d=ceil(${S8_DUR}*${FPS}):s=${WIDTH}x${HEIGHT},trim=duration=${S8_DUR},setpts=PTS-STARTPTS[s8_base];
[34:v]scale=${WIDTH}*0.6:-1,format=rgba,fade=in:st=1:d=1.5:alpha=1[s8_l1];
[35:v]scale=${WIDTH}*0.8:-1,format=rgba,fade=in:st=0.5:d=1.5:alpha=1[s8_l2];
[36:v]scale=${WIDTH}*0.3:-1,format=rgba,fade=in:st=2:d=1.5:alpha=1[s8_l3];
[s8_base][s8_l2]overlay=x='(W-w)/2':y='(H-h)/2'[s8_c1];
[s8_c1][s8_l1]overlay=x='(W-w)/2':y='(H-h)/2'[s8_c2];
[s8_c2][s8_l3]overlay=x='W*0.1':y='H-h',trim=duration=${S8_DUR},setpts=PTS-STARTPTS[v8];

# --- SCENE 9: Dynamic Tech City (49.46 - 56.29) ---
# Inputs: 37:v, 38:v, 39:v, 40:v, 41:v
[37:v]scale=${WIDTH}*1.4:-1,zoompan=z='min(zoom+0.0008,1.4)':x='iw/2-(iw/zoom/2)+t*10':y='ih/2-(ih/zoom/2)',d=ceil(${S9_DUR}*${FPS}):s=${WIDTH}x${HEIGHT},trim=duration=${S9_DUR},setpts=PTS-STARTPTS[s9_base];
[38:v]scale=${WIDTH}*1.2:-1,format=rgba[s9_l1];
[39:v]scale=${WIDTH}:-1,format=rgba[s9_l2];
[40:v]scale=${WIDTH}:-1,format=rgba,fade=in:st=0:d=1:alpha=1[s9_l3];
[41:v]scale=${WIDTH}:-1,format=rgba,fade=in:st=0:d=1:alpha=1[s9_l4];
[s9_base][s9_l1]overlay=x='(W-w)/2':y='(H-h)/2'[s9_c1];
[s9_c1][s9_l2]overlay=x=0:y='-h+mod(200*t,H+h)'[s9_c2];
[s9_c2][s9_l3]overlay=x=0:y=0[s9_c3];
[s9_c3][s9_l4]overlay=x=0:y=0,trim=duration=${S9_DUR},setpts=PTS-STARTPTS[v9];

# --- SCENE 10: Horizon Pan (56.29 - End) ---
# Inputs: 42:v, 43:v, 44:v, 45:v, 46:v
[42:v]scale=${WIDTH}*1.2:-1,crop=${WIDTH}:${HEIGHT}[s10_base_full];
[43:v]scale=${WIDTH}*1.1:-1,format=rgba[s10_l1];
[44:v]scale=${WIDTH}*1.2:-1,format=rgba[s10_l2];
[45:v]scale=${WIDTH}*1.3:-1,format=rgba[s10_l3];
[46:v]scale=${WIDTH}*0.4:-1,format=rgba[s10_l4];
[s10_base_full]crop=${WIDTH}:${HEIGHT}:y=0:x='(1-(t/${S10_DUR}))*(iw-W)',trim=duration=${S10_DUR},setpts=PTS-STARTPTS[s10_base];
[s10_base][s10_l1]overlay=x='(W-w)/2 + 20*(t/${S10_DUR})':y='(H-h)/2'[s10_c1];
[s10_c1][s10_l2]overlay=x='(W-w)/2 + 40*(t/${S10_DUR})':y='H-h'[s10_c2];
[s10_c2][s10_l3]overlay=x='(W-w)/2 + 80*(t/${S10_DUR})':y='H-h'[s10_c3];
[s10_c3][s10_l4]overlay=x='W*0.6':y='H-h*0.9',trim=duration=${S10_DUR},setpts=PTS-STARTPTS[v10];

# --- 5. Concatenate All Scenes ---
[v1][v2][v3][v4][v5][v6][v7][v8][v9][v10]concat=n=10:v=1:a=0[final_video]
"

# --- 6. Execute FFmpeg Command ---
echo "Starting FFmpeg process... This may take a while."
ffmpeg -y \
    -i "$AUDIO_FILE" \
    $input_args \
    -filter_complex "$filter_complex" \
    -map "[final_video]" \
    -map 0:a \
    -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p \
    -c:a aac -b:a 192k \
    -r $FPS \
    -shortest \
    "$OUTPUT_FILE"

echo "Video generation complete! Output file: $OUTPUT_FILE"
```