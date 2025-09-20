Here is a ready-to-run FFmpeg shell script to generate the parallax video.

### Instructions

1.  **Save the Code:** Save the following code as a shell script file (e.g., `create_video.sh`).
2.  **Place Assets:** Make sure your assets are in the correct paths:
    *   Audio file at `BOOKS/Temp/TTS/Intro.wav`.
    *   All image files inside the `assets/images/` directory.
3.  **Make Executable:** Open your terminal, navigate to the directory where you saved the file, and run `chmod +x create_video.sh`.
4.  **Run the Script:** Execute the script by running `./create_video.sh`.

The script will calculate all the necessary variables and then run a single, complex FFmpeg command to generate `parallax_video.mp4`.

### The Script (`create_video.sh`)

```bash
#!/bin/bash

# ==================================================================================
# FFmpeg Parallax Video Generator
# ==================================================================================
# This script creates a multi-scene parallax video using various effects,
# timed to a specific audio track.

# --- Configuration ---
WIDTH=3840
HEIGHT=2160
FPS=30
OUTPUT_FILE="parallax_video.mp4"
AUDIO_FILE="BOOKS/Temp/TTS/Intro.wav"
IMAGE_DIR="assets/images"
FADE_DUR=0.5 # Crossfade duration between scenes

# --- Pre-flight Checks ---
if [ ! -f "$AUDIO_FILE" ]; then
    echo "Error: Audio file not found at '$AUDIO_FILE'"
    exit 1
fi

command -v ffmpeg >/dev/null 2>&1 || { echo "Error: ffmpeg is not installed or not in your PATH." >&2; exit 1; }
command -v ffprobe >/dev/null 2>&1 || { echo "Error: ffprobe is not installed or not in your PATH." >&2; exit 1; }

# --- Calculations ---
echo "Calculating video parameters..."
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE")
if [ -z "$DURATION" ]; then
    echo "Error: Could not determine audio duration."
    exit 1
fi
echo "Audio duration: $DURATION seconds"

# --- Scene Timeline (Start Times) ---
S1_START=0.0
S2_START=7.0
S3_START=9.5
S4_START=13.5
S5_START=17.0
S6_START=23.0
S_END=$DURATION

# Calculate Scene Durations and End Times
S1_DUR=$(echo "$S2_START - $S1_START" | bc)
S1_END=$S2_START
S2_DUR=$(echo "$S3_START - $S2_START" | bc)
S2_END=$S3_START
S3_DUR=$(echo "$S4_START - $S3_START" | bc)
S3_END=$S4_START
S4_DUR=$(echo "$S5_START - $S4_START" | bc)
S4_END=$S5_START
S5_DUR=$(echo "$S6_START - $S5_START" | bc)
S5_END=$S6_START
S6_DUR=$(echo "$S_END - $S6_START" | bc)
S6_END=$S_END

# --- Asset Definitions ---
# IMPORTANT: The order of images here MUST match the order of the -i flags below.
INPUTS=(
    # Scene 1: "Follow the rules..." (Conventional)
    "${IMAGE_DIR}/blueprint_bg.jpg"                 # 0
    "${IMAGE_DIR}/stock-chart-midground.png"        # 1
    "${IMAGE_DIR}/gears-foreground.png"             # 2
    # Scene 2: "...be profitable." (Dreary)
    "${IMAGE_DIR}/rainy-city.jpg"                   # 3
    "${IMAGE_DIR}/sad-people.png"                   # 4
    "${IMAGE_DIR}/falling-chart.png"                # 5
    "${IMAGE_DIR}/rain_overlay.png"                 # 6
    # Scene 3: "...small, forgettable companies." (Isolated)
    "${IMAGE_DIR}/dark_clouds.jpg"                  # 7
    "${IMAGE_DIR}/empty_city_street_background.jpg" # 8
    "${IMAGE_DIR}/single-tree.png"                  # 9
    # Scene 4: "This is not the story..." (Hopeful)
    "${IMAGE_DIR}/sunrise-field.jpg"                # 10
    "${IMAGE_DIR}/mountains-far.png"                # 11
    "${IMAGE_DIR}/resilient-plant.png"              # 12
    "${IMAGE_DIR}/phoenix_from_ashes.png"           # 13
    # Scene 5: "...a system, a machine..." (Tech)
    "${IMAGE_DIR}/tech_cityscape.jpg"               # 14
    "${IMAGE_DIR}/digital_grid.png"                 # 15
    "${IMAGE_DIR}/data_stream.png"                  # 16
    "${IMAGE_DIR}/glowing-data.png"                 # 17
    # Scene 6: "...a machine that ate the world." (Consuming)
    "${IMAGE_DIR}/server-room.jpg"                  # 18
    "${IMAGE_DIR}/aws-logo.png"                     # 19
    "${IMAGE_DIR}/data_stream_foreground.png"       # 20
    "${IMAGE_DIR}/amazon_box_foreground.png"        # 21
    "${IMAGE_DIR}/cracked_glass_overlay.png"        # 22
)

# --- Build FFmpeg command inputs ---
FFMPEG_INPUTS=""
for img in "${INPUTS[@]}"; do
    if [ ! -f "$img" ]; then
        echo "Error: Image file not found at '$img'"
        exit 1
    fi
    FFMPEG_INPUTS+="-loop 1 -framerate $FPS -i \"$img\" "
done
FFMPEG_INPUTS+="-i \"$AUDIO_FILE\""
AUDIO_INPUT_INDEX=${#INPUTS[@]}

# ==================================================================================
# Build Filter Complex String
# ==================================================================================
FILTER_COMPLEX=""

# Create a base black canvas for the entire duration
FILTER_COMPLEX+="nullsrc=s=${WIDTH}x${HEIGHT}:d=${DURATION}:r=${FPS}[base];"

# --- SCENE 1: Horizontal Pan (Right) ---
# Effect: Classic parallax scroll. Foreground moves faster than the background.
S1_OUT_FADE_START=$(echo "$S1_END - $FADE_DUR" | bc)
# Layer 1 (BG): blueprint_bg.jpg [0]
SCALE_W_S1_L1=$(echo "$WIDTH * 1.1" | bc)
PAN_DIST_S1_L1=100; SPEED_S1_L1=$(echo "$PAN_DIST_S1_L1 / $S1_DUR" | bc)
FILTER_COMPLEX+="[0:v]scale=${SCALE_W_S1_L1}:-1,format=yuva420p,fade=in:st=${S1_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S1_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s1_l1];"
FILTER_COMPLEX+="[base][s1_l1]overlay=x='-($SPEED_S1_L1*(t-${S1_START}))':y='(H-h)/2':enable='between(t,${S1_START},${S1_END})'[v1_1];"
# Layer 2 (MG): stock-chart-midground.png [1]
SCALE_W_S1_L2=$(echo "$WIDTH * 1.2" | bc)
PAN_DIST_S1_L2=200; SPEED_S1_L2=$(echo "$PAN_DIST_S1_L2 / $S1_DUR" | bc)
FILTER_COMPLEX+="[1:v]scale=${SCALE_W_S1_L2}:-1,format=yuva420p,fade=in:st=${S1_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S1_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s1_l2];"
FILTER_COMPLEX+="[v1_1][s1_l2]overlay=x='-($SPEED_S1_L2*(t-${S1_START}))':y='(H-h)/2':enable='between(t,${S1_START},${S1_END})'[v1_2];"
# Layer 3 (FG): gears-foreground.png [2]
SCALE_W_S1_L3=$(echo "$WIDTH * 1.3" | bc)
PAN_DIST_S1_L3=300; SPEED_S1_L3=$(echo "$PAN_DIST_S1_L3 / $S1_DUR" | bc)
FILTER_COMPLEX+="[2:v]scale=${SCALE_W_S1_L3}:-1,format=yuva420p,fade=in:st=${S1_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S1_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s1_l3];"
FILTER_COMPLEX+="[v1_2][s1_l3]overlay=x='-($SPEED_S1_L3*(t-${S1_START}))':y='(H-h)/2':enable='between(t,${S1_START},${S1_END})'[v1];"

# --- SCENE 2: Vertical Pan (Down) ---
# Effect: A "falling" or sinking feeling to match the dreary mood.
S2_IN_FADE_START=$S2_START; S2_OUT_FADE_START=$(echo "$S2_END - $FADE_DUR" | bc)
# Layer 1 (BG): rainy-city.jpg [3]
SCALE_H_S2_L1=$(echo "$HEIGHT * 1.1" | bc)
PAN_DIST_S2_L1=50; SPEED_S2_L1=$(echo "$PAN_DIST_S2_L1 / $S2_DUR" | bc)
FILTER_COMPLEX+="[3:v]scale=-1:${SCALE_H_S2_L1},format=yuva420p,fade=in:st=${S2_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S2_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s2_l1];"
FILTER_COMPLEX+="[v1][s2_l1]overlay=x='(W-w)/2':y='-($SPEED_S2_L1*(t-${S2_START}))':enable='between(t,${S2_START},${S2_END})'[v2_1];"
# Layer 2 (MG1): sad-people.png [4]
SCALE_H_S2_L2=$(echo "$HEIGHT * 1.15" | bc)
PAN_DIST_S2_L2=75; SPEED_S2_L2=$(echo "$PAN_DIST_S2_L2 / $S2_DUR" | bc)
FILTER_COMPLEX+="[4:v]scale=-1:${SCALE_H_S2_L2},format=yuva420p,fade=in:st=${S2_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S2_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s2_l2];"
FILTER_COMPLEX+="[v2_1][s2_l2]overlay=x='(W-w)/2':y='-($SPEED_S2_L2*(t-${S2_START}))':enable='between(t,${S2_START},${S2_END})'[v2_2];"
# Layer 3 (MG2): falling-chart.png [5]
SCALE_H_S2_L3=$(echo "$HEIGHT * 1.2" | bc)
PAN_DIST_S2_L3=100; SPEED_S2_L3=$(echo "$PAN_DIST_S2_L3 / $S2_DUR" | bc)
FILTER_COMPLEX+="[5:v]scale=-1:${SCALE_H_S2_L3},format=yuva420p,fade=in:st=${S2_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S2_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s2_l3];"
FILTER_COMPLEX+="[v2_2][s2_l3]overlay=x='(W-w)/2':y='-($SPEED_S2_L3*(t-${S2_START}))':enable='between(t,${S2_START},${S2_END})'[v2_3];"
# Layer 4 (FG): rain_overlay.png [6]
FILTER_COMPLEX+="[6:v]scale=${WIDTH}:${HEIGHT},format=yuva420p,fade=in:st=${S2_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S2_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s2_l4];"
FILTER_COMPLEX+="[v2_3][s2_l4]overlay=enable='between(t,${S2_START},${S2_END})'[v2];"

# --- SCENE 3: Slow Zoom In ---
# Effect: Creates focus and a sense of isolation by slowly moving into the scene.
S3_IN_FADE_START=$S3_START; S3_OUT_FADE_START=$(echo "$S3_END - $FADE_DUR" | bc)
# Layer 1 (BG): dark_clouds.jpg [7]
IS_S3_L1=1.5; ZR_S3_L1=0.04; CW="'iw/($IS_S3_L1-(t-$S3_START)*$ZR_S3_L1)'"; CH="'ih/($IS_S3_L1-(t-$S3_START)*$ZR_S3_L1)'"
FILTER_COMPLEX+="[7:v]scale=w=${WIDTH}*${IS_S3_L1}:h=${HEIGHT}*${IS_S3_L1},format=yuva420p,fade=in:st=${S3_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S3_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s3_l1_faded];"
FILTER_COMPLEX+="[s3_l1_faded]crop=w=${CW}:h=${CH}:x='(iw-ow)/2':y='(ih-oh)/2',scale=${WIDTH}:${HEIGHT}[s3_l1_p];[v2][s3_l1_p]overlay=enable='between(t,${S3_START},${S3_END})'[v3_1];"
# Layer 2 (MG): empty_city_street_background.jpg [8]
IS_S3_L2=1.6; ZR_S3_L2=0.06; CW="'iw/($IS_S3_L2-(t-$S3_START)*$ZR_S3_L2)'"; CH="'ih/($IS_S3_L2-(t-$S3_START)*$ZR_S3_L2)'"
FILTER_COMPLEX+="[8:v]scale=w=${WIDTH}*${IS_S3_L2}:h=${HEIGHT}*${IS_S3_L2},format=yuva420p,fade=in:st=${S3_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S3_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s3_l2_faded];"
FILTER_COMPLEX+="[s3_l2_faded]crop=w=${CW}:h=${CH}:x='(iw-ow)/2':y='(ih-oh)/2',scale=${WIDTH}:${HEIGHT}[s3_l2_p];[v3_1][s3_l2_p]overlay=enable='between(t,${S3_START},${S3_END})'[v3_2];"
# Layer 3 (FG): single-tree.png [9]
IS_S3_L3=1.8; ZR_S3_L3=0.1; CW="'iw/($IS_S3_L3-(t-$S3_START)*$ZR_S3_L3)'"; CH="'ih/($IS_S3_L3-(t-$S3_START)*$ZR_S3_L3)'"
FILTER_COMPLEX+="[9:v]scale=w=${WIDTH}*${IS_S3_L3}:h=${HEIGHT}*${IS_S3_L3},format=yuva420p,fade=in:st=${S3_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S3_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s3_l3_faded];"
FILTER_COMPLEX+="[s3_l3_faded]crop=w=${CW}:h=${CH}:x='(iw-ow)/2':y='(ih-oh)/2',scale=${WIDTH}:${HEIGHT}[s3_l3_p];[v3_2][s3_l3_p]overlay=enable='between(t,${S3_START},${S3_END})'[v3];"

# --- SCENE 4: Vertical Pan (Up) ---
# Effect: A "rising" or revealing motion (Ken Burns Up) for a hopeful tone.
S4_IN_FADE_START=$S4_START; S4_OUT_FADE_START=$(echo "$S4_END - $FADE_DUR" | bc)
# Layer 1 (BG): sunrise-field.jpg [10]
SCALE_H_S4_L1=$(echo "$HEIGHT * 1.1" | bc); PAN_DIST_S4_L1=50; YS=$(echo "0 - $PAN_DIST_S4_L1" | bc); SP=$(echo "$PAN_DIST_S4_L1 / $S4_DUR" | bc)
FILTER_COMPLEX+="[10:v]scale=-1:${SCALE_H_S4_L1},format=yuva420p,fade=in:st=${S4_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S4_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s4_l1];"
FILTER_COMPLEX+="[v3][s4_l1]overlay=x='(W-w)/2':y='${YS}+(${SP}*(t-${S4_START}))':enable='between(t,${S4_START},${S4_END})'[v4_1];"
# Layer 2 (MG1): mountains-far.png [11]
SCALE_H_S4_L2=$(echo "$HEIGHT * 1.2" | bc); PAN_DIST_S4_L2=100; YS=$(echo "0 - $PAN_DIST_S4_L2" | bc); SP=$(echo "$PAN_DIST_S4_L2 / $S4_DUR" | bc)
FILTER_COMPLEX+="[11:v]scale=-1:${SCALE_H_S4_L2},format=yuva420p,fade=in:st=${S4_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S4_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s4_l2];"
FILTER_COMPLEX+="[v4_1][s4_l2]overlay=x='(W-w)/2':y='${YS}+(${SP}*(t-${S4_START}))':enable='between(t,${S4_START},${S4_END})'[v4_2];"
# Layer 3 (MG2): resilient-plant.png [12]
SCALE_H_S4_L3=$(echo "$HEIGHT * 0.5" | bc); PAN_DIST_S4_L3=150; YS=$(echo "$HEIGHT - ($HEIGHT*0.2)" | bc); SP=$(echo "$PAN_DIST_S4_L3 / $S4_DUR" | bc)
FILTER_COMPLEX+="[12:v]scale=-1:${SCALE_H_S4_L3},format=yuva420p,fade=in:st=${S4_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S4_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s4_l3];"
FILTER_COMPLEX+="[v4_2][s4_l3]overlay=x='(W-w)/2':y='${YS}-(${SP}*(t-${S4_START}))':enable='between(t,${S4_START},${S4_END})'[v4_3];"
# Layer 4 (FG): phoenix_from_ashes.png [13]
SCALE_H_S4_L4=$(echo "$HEIGHT * 1.3" | bc); PAN_DIST_S4_L4=200; YS=$(echo "0 - $PAN_DIST_S4_L4" | bc); SP=$(echo "$PAN_DIST_S4_L4 / $S4_DUR" | bc)
FILTER_COMPLEX+="[13:v]scale=-1:${SCALE_H_S4_L4},format=yuva420p,fade=in:st=${S4_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S4_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s4_l4];"
FILTER_COMPLEX+="[v4_3][s4_l4]overlay=x='(W-w)/2':y='${YS}+(${SP}*(t-${S4_START}))':enable='between(t,${S4_START},${S4_END})'[v4];"

# --- SCENE 5: Fast Horizontal Pan (Left) ---
# Effect: Dynamic, energetic motion to represent a complex, fast-moving system.
S5_IN_FADE_START=$S5_START; S5_OUT_FADE_START=$(echo "$S5_END - $FADE_DUR" | bc)
# Layer 1 (BG): tech_cityscape.jpg [14]
SCALE_W_S5_L1=$(echo "$WIDTH * 1.2" | bc); PAN_DIST_S5_L1=400; SP=$(echo "$PAN_DIST_S5_L1 / $S5_DUR" | bc)
FILTER_COMPLEX+="[14:v]scale=${SCALE_W_S5_L1}:-1,format=yuva420p,fade=in:st=${S5_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S5_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s5_l1];"
FILTER_COMPLEX+="[v4][s5_l1]overlay=x='-(${SP}*(t-${S5_START}))':y='(H-h)/2':enable='between(t,${S5_START},${S5_END})'[v5_1];"
# Layer 2 (MG1): digital_grid.png [15]
SCALE_W_S5_L2=$(echo "$WIDTH * 1.4" | bc); PAN_DIST_S5_L2=600; SP=$(echo "$PAN_DIST_S5_L2 / $S5_DUR" | bc)
FILTER_COMPLEX+="[15:v]scale=${SCALE_W_S5_L2}:-1,format=yuva420p,fade=in:st=${S5_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S5_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s5_l2];"
FILTER_COMPLEX+="[v5_1][s5_l2]overlay=x='-(${SP}*(t-${S5_START}))':y='(H-h)/2':enable='between(t,${S5_START},${S5_END})'[v5_2];"
# Layer 3 (MG2): data_stream.png [16]
SCALE_W_S5_L3=$(echo "$WIDTH * 1.6" | bc); PAN_DIST_S5_L3=800; SP=$(echo "$PAN_DIST_S5_L3 / $S5_DUR" | bc)
FILTER_COMPLEX+="[16:v]scale=${SCALE_W_S5_L3}:-1,format=yuva420p,fade=in:st=${S5_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S5_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s5_l3];"
FILTER_COMPLEX+="[v5_2][s5_l3]overlay=x='-(${SP}*(t-${S5_START}))':y='(H-h)/2':enable='between(t,${S5_START},${S5_END})'[v5_3];"
# Layer 4 (FG): glowing-data.png [17]
SCALE_W_S5_L4=$(echo "$WIDTH * 1.8" | bc); PAN_DIST_S5_L4=1000; SP=$(echo "$PAN_DIST_S5_L4 / $S5_DUR" | bc)
FILTER_COMPLEX+="[17:v]scale=${SCALE_W_S5_L4}:-1,format=yuva420p,fade=in:st=${S5_IN_FADE_START}:d=${FADE_DUR}:alpha=1,fade=out:st=${S5_OUT_FADE_START}:d=${FADE_DUR}:alpha=1[s5_l4];"
FILTER_COMPLEX+="[v5_3][s5_l4]overlay=x='-(${SP}*(t-${S5_START}))':y='(H-h)/2':enable='between(t,${S5_START},${S5_END})'[v5];"

# --- SCENE 6: Aggressive Zoom In ---
# Effect: A powerful, consuming zoom to signify "eating the world".
S6_IN_FADE_START=$S6_START
# Layer 1 (BG): server-room.jpg [18]
IS_S6_L1=1.5; ZR_S6_L1=0.20; CW="'iw/($IS_S6_L1-(t-$S6_START)*$ZR_S6_L1)'"; CH="'ih/($IS_S6_L1-(t-$S6_START)*$ZR_S6_L1)'"
FILTER_COMPLEX+="[18:v]scale=w=${WIDTH}*${IS_S6_L1}:h=${HEIGHT}*${IS_S6_L1},format=yuva420p,fade=in:st=${S6_IN_FADE_START}:d=${FADE_DUR}:alpha=1[s6_l1_faded];"
FILTER_COMPLEX+="[s6_l1_faded]crop=w=${CW}:h=${CH}:x='(iw-ow)/2':y='(ih-oh)/2',scale=${WIDTH}:${HEIGHT}[s6_l1_p];[v5][s6_l1_p]overlay=enable='between(t,${S6_START},${S6_END})'[v6_1];"
# Layer 2 (MG1): aws-logo.png [19]
IS_S6_L2=1.8; ZR_S6_L2=0.25; CW="'iw/($IS_S6_L2-(t-$S6_START)*$ZR_S6_L2)'"; CH="'ih/($IS_S6_L2-(t-$S6_START)*$ZR_S6_L2)'"
FILTER_COMPLEX+="[19:v]scale=w=${WIDTH}*${IS_S6_L2}:h=${HEIGHT}*${IS_S6_L2},format=yuva420p,fade=in:st=${S6_IN_FADE_START}:d=${FADE_DUR}:alpha=1[s6_l2_faded];"
FILTER_COMPLEX+="[s6_l2_faded]crop=w=${CW}:h=${CH}:x='(iw-ow)/2':y='(ih-oh)/2',scale=${WIDTH}:${HEIGHT}[s6_l2_p];[v6_1][s6_l2_p]overlay=enable='between(t,${S6_START},${S6_END})'[v6_2];"
# Layer 3 (MG2): data_stream_foreground.png [20]
IS_S6_L3=2.0; ZR_S6_L3=0.30; CW="'iw/($IS_S6_L3-(t-$S6_START)*$ZR_S6_L3)'"; CH="'ih/($IS_S6_L3-(t-$S6_START)*$ZR_S6_L3)'"
FILTER_COMPLEX+="[20:v]scale=w=${WIDTH}*${IS_S6_L3}:h=${HEIGHT}*${IS_S6_L3},format=yuva420p,fade=in:st=${S6_IN_FADE_START}:d=${FADE_DUR}:alpha=1[s6_l3_faded];"
FILTER_COMPLEX+="[s6_l3_faded]crop=w=${CW}:h=${CH}:x='(iw-ow)/2':y='(ih-oh)/2',scale=${WIDTH}:${HEIGHT}[s6_l3_p];[v6_2][s6_l3_p]overlay=enable='between(t,${S6_START},${S6_END})'[v6_3];"
# Layer 4 (FG): amazon_box_foreground.png [21]
IS_S6_L4=2.2; ZR_S6_L4=0.35; CW="'iw/($IS_S6_L4-(t-$S6_START)*$ZR_S6_L4)'"; CH="'ih/($IS_S6_L4-(t-$S6_START)*$ZR_S6_L4)'"
FILTER_COMPLEX+="[21:v]scale=w=${WIDTH}*${IS_S6_L4}:h=${HEIGHT}*${IS_S6_L4},format=yuva420p,fade=in:st=${S6_IN_FADE_START}:d=${FADE_DUR}:alpha=1[s6_l4_faded];"
FILTER_COMPLEX+="[s6_l4_faded]crop=w=${CW}:h=${CH}:x='(iw-ow)/2':y='(ih-oh)/2',scale=${WIDTH}:${HEIGHT}[s6_l4_p];[v6_3][s6_l4_p]overlay=enable='between(t,${S6_START},${S6_END})'[v6_4];"
# Layer 5 (FX): cracked_glass_overlay.png [22]
CRACK_FADE_IN_TIME=$(echo "$S_END - 1.5" | bc)
FILTER_COMPLEX+="[22:v]scale=${WIDTH}:${HEIGHT},format=yuva420p,fade=in:st=${CRACK_FADE_IN_TIME}:d=1.0:alpha=1[s6_l5];"
FILTER_COMPLEX+="[v6_4][s6_l5]overlay=enable='gte(t,${CRACK_FADE_IN_TIME})'[v_final];"

# --- Finalize Filter ---
# Ensure the final output has a standard pixel format for compatibility.
FILTER_COMPLEX+="[v_final]format=yuv420p[v]"

# ==================================================================================
# Execute FFmpeg Command
# ==================================================================================
echo "Starting FFmpeg render... This may take a while."

# The 'eval' command is used to properly handle the quoted paths in FFMPEG_INPUTS.
eval ffmpeg -y \
    $FFMPEG_INPUTS \
    -filter_complex "$FILTER_COMPLEX" \
    -map "[v]" \
    -map "${AUDIO_INPUT_INDEX}:a" \
    -c:v libx264 -preset fast -crf 23 \
    -c:a aac -b:a 192k \
    -t "$DURATION" \
    "$OUTPUT_FILE"

echo "=================================================="
echo "Render complete! Output file: $OUTPUT_FILE"
echo "=================================================="
```