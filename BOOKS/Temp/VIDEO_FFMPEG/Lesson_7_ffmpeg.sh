Here is a ready-to-run Bash script that generates the FFmpeg command for your parallax video.

### Instructions:

1.  **Save the code:** Save the following block of code as a shell script file, for example, `create_parallax.sh`.
2.  **Organize your files:**
    *   Place the script in the same parent directory as your `assets` and `BOOKS` folders.
    *   Your image files should be in `assets/images/`.
    *   Your audio file should be at `BOOKS/Temp/TTS/Lesson_7.wav`.
3.  **Make the script executable:** Open your terminal and run `chmod +x create_parallax.sh`.
4.  **Run the script:** Execute it by running `./create_parallax.sh`.

The script will first print the full `ffmpeg` command it's about to run and then execute it.

---

### `create_parallax.sh`

```bash
#!/bin/bash
set -e

# --- Configuration ---
WIDTH=3840
HEIGHT=2160
FPS=30
OUTPUT_FILE="parallax_lesson_7.mp4"
AUDIO_FILE="BOOKS/Temp/TTS/Lesson_7.wav"
IMAGE_DIR="assets/images"
TRANSITION_DUR=0.7 # Duration of crossfade between scenes in seconds

# --- Asset Check & Preparation ---
if [ ! -f "$AUDIO_FILE" ]; then
    echo "Error: Audio file not found at $AUDIO_FILE"
    exit 1
fi
if [ ! -d "$IMAGE_DIR" ]; then
    echo "Error: Image directory not found at $IMAGE_DIR"
    exit 1
fi

# Get audio duration
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE")
echo "Audio duration: $DURATION seconds"

# --- Define Image Inputs ---
# This ensures all images are available to FFmpeg.
# We map them to specific scenes in the filter graph below.
INPUTS_CMD=""
IMAGE_FILES=()
mapfile -t IMAGE_FILES < <(find "$IMAGE_DIR" -type f \( -name "*.jpg" -o -name "*.png" \))

for i in "${!IMAGE_FILES[@]}"; do
    INPUTS_CMD+="-i \"${IMAGE_FILES[i]}\" "
done

# Helper function for floating point arithmetic
calc() {
    awk "BEGIN {print $1}"
}

# --- Filter Graph Generation ---

# Each scene will be a self-contained filter chain producing one video stream.
# Then we will crossfade them together in order.

# =========================================================================
# Scene 1: (0.00s -> 15.12s) "The price of innovation... the fire phone..."
# Effect: Slow pan right & slight zoom-in, giving a sense of unease and history.
# =========================================================================
S1_START=0.0
S1_END=15.12
S1_DUR=$(calc "$S1_END - $S1_START")

# Layer definitions (Image Index, Scale, Start X, End X, Start Y, End Y)
# Background moves the least, foreground the most.
S1_L1=("blueprint_bg.jpg"             1.15   0     -150    0      0)    # BG
S1_L2=("city-skyline-mid.png"         1.20 -200    -400    0      0)    # Mid
S1_L3=("broken_gears.png"             1.25 -100    -500  -100    50)    # Mid 2
S1_L4=("falling-chart.png"            0.8   2000    100   200    200)   # FG
S1_L5=("cracked_glass_overlay.png"    1.0    0       0     0      0)    # Overlay

SCENE_1_FILTER=""
LAST_STREAM="[canvas1]"
SCENE_1_FILTER+="color=c=black:s=${WIDTH}x${HEIGHT}:d=${S1_DUR}:r=${FPS}[canvas1];"

for i in {1..5}; do
    LAYER_VAR="S1_L$i"
    declare -a LAYER=("${!LAYER_VAR}")
    IMG_NAME="${LAYER[0]}"
    SCALE=$(calc "${LAYER[1]}")
    X_START=$(calc "${LAYER[2]}")
    X_END=$(calc "${LAYER[3]}")
    Y_START=$(calc "${LAYER[4]}")
    Y_END=$(calc "${LAYER[5]}")

    # Find the index of the image in the main IMAGE_FILES array
    IMG_INDEX=-1
    for j in "${!IMAGE_FILES[@]}"; do
        if [[ "${IMAGE_FILES[j]}" == *"$IMG_NAME"* ]]; then
            IMG_INDEX=$j
            break
        fi
    done
    if [ $IMG_INDEX -eq -1 ]; then echo "Image $IMG_NAME not found!"; exit 1; fi

    W_SCALED=$(calc "$WIDTH * $SCALE")
    H_SCALED=$(calc "$HEIGHT * $SCALE")
    X_RATE=$(calc "($X_END - $X_START) / $S1_DUR")
    Y_RATE=$(calc "($Y_END - $Y_START) / $S1_DUR")

    SCENE_1_FILTER+="[$IMG_INDEX:v]scale=${W_SCALED}:${H_SCALED}[s1_img$i];"
    SCENE_1_FILTER+="${LAST_STREAM}[s1_img$i]overlay=x='$X_START+(t)*$X_RATE':y='$Y_START+(t)*$Y_RATE':shortest=1[s1_v$i];"
    LAST_STREAM="[s1_v$i]"
done
SCENE_1_OUT="[scene1_final]"
SCENE_1_FILTER+="${LAST_STREAM}null${SCENE_1_OUT};"

# =========================================================================
# Scene 2: (15.12s -> 36.30s) "Complete disaster... a normal company would fire the team."
# Effect: Vertical tilt down with a zoom-out, expressing failure and despair.
# =========================================================================
S2_START=$S1_END
S2_END=36.30
S2_DUR=$(calc "$S2_END - $S2_START")

S2_L1=("empty_city_street_background.jpg" 1.25   0       0    -150     0)    # BG
S2_L2=("sad-people.png"                   1.0   200     200    800    200)   # Mid
S2_L3=("stock-chart-midground.png"        1.30  -100    -100   -300    100)   # FG
S2_L4=("rain_overlay.png"                 1.5    0       0      0    1000)   # Overlay (looping)

SCENE_2_FILTER=""
LAST_STREAM="[canvas2]"
SCENE_2_FILTER+="color=c=black:s=${WIDTH}x${HEIGHT}:d=${S2_DUR}:r=${FPS}[canvas2];"

for i in {1..4}; do
    LAYER_VAR="S2_L$i"
    declare -a LAYER=("${!LAYER_VAR}")
    IMG_NAME="${LAYER[0]}"
    SCALE=$(calc "${LAYER[1]}")
    X_START=$(calc "${LAYER[2]}")
    X_END=$(calc "${LAYER[3]}")
    Y_START=$(calc "${LAYER[4]}")
    Y_END=$(calc "${LAYER[5]}")

    IMG_INDEX=-1
    for j in "${!IMAGE_FILES[@]}"; do
        if [[ "${IMAGE_FILES[j]}" == *"$IMG_NAME"* ]]; then IMG_INDEX=$j; break; fi
    done
    if [ $IMG_INDEX -eq -1 ]; then echo "Image $IMG_NAME not found!"; exit 1; fi

    W_SCALED=$(calc "$WIDTH * $SCALE")
    H_SCALED=$(calc "$HEIGHT * $SCALE")
    X_RATE=$(calc "($X_END - $X_START) / $S2_DUR")
    Y_RATE=$(calc "($Y_END - $Y_START) / $S2_DUR")
    
    Y_EXPR="'$Y_START+(t)*$Y_RATE'"
    # Special handling for looping rain overlay
    if [[ "$IMG_NAME" == "rain_overlay.png" ]]; then
        Y_EXPR="mod(t*300, H)" # Loop the rain vertically
    fi

    SCENE_2_FILTER+="[$IMG_INDEX:v]scale=${W_SCALED}:${H_SCALED}[s2_img$i];"
    SCENE_2_FILTER+="${LAST_STREAM}[s2_img$i]overlay=x='$X_START+(t)*$X_RATE':y=${Y_EXPR}:shortest=1[s2_v$i];"
    LAST_STREAM="[s2_v$i]"
done
SCENE_2_OUT="[scene2_final]"
SCENE_2_FILTER+="${LAST_STREAM}null${SCENE_2_OUT};"

# =========================================================================
# Scene 3: (36.30s -> 57.82s) "Amazon did not... the lessons they learned... repurposed."
# Effect: A dolly zoom IN combined with an upward tilt, signifying a change in perspective and building hope.
# =========================================================================
S3_START=$S2_END
S3_END=57.82
S3_DUR=$(calc "$S3_END - $S3_START")

S3_L1=("abstract_gears_background.jpg" 1.40    0      -200    0     -150)  # BG
S3_L2=("server-racks-midground.png"    1.25  -150     -300  -150    -300)  # Mid
S3_L3=("data_stream.png"               1.10    0      -400    0     -450)  # FG
S3_L4=("glowing_particles.png"         1.0     0       0     0      0)     # Overlay

SCENE_3_FILTER=""
LAST_STREAM="[canvas3]"
SCENE_3_FILTER+="color=c=black:s=${WIDTH}x${HEIGHT}:d=${S3_DUR}:r=${FPS}[canvas3];"

for i in {1..4}; do
    LAYER_VAR="S3_L$i"
    declare -a LAYER=("${!LAYER_VAR}")
    IMG_NAME="${LAYER[0]}"
    SCALE=$(calc "${LAYER[1]}")
    X_START=$(calc "${LAYER[2]}")
    X_END=$(calc "${LAYER[3]}")
    Y_START=$(calc "${LAYER[4]}")
    Y_END=$(calc "${LAYER[5]}")

    IMG_INDEX=-1
    for j in "${!IMAGE_FILES[@]}"; do
        if [[ "${IMAGE_FILES[j]}" == *"$IMG_NAME"* ]]; then IMG_INDEX=$j; break; fi
    done
    if [ $IMG_INDEX -eq -1 ]; then echo "Image $IMG_NAME not found!"; exit 1; fi

    W_SCALED=$(calc "$WIDTH * $SCALE")
    H_SCALED=$(calc "$HEIGHT * $SCALE")
    X_RATE=$(calc "($X_END - $X_START) / $S3_DUR")
    Y_RATE=$(calc "($Y_END - $Y_START) / $S3_DUR")

    SCENE_3_FILTER+="[$IMG_INDEX:v]scale=${W_SCALED}:${H_SCALED}[s3_img$i];"
    SCENE_3_FILTER+="${LAST_STREAM}[s3_img$i]overlay=x='$X_START+(t)*$X_RATE':y='$Y_START+(t)*$Y_RATE':shortest=1[s3_v$i];"
    LAST_STREAM="[s3_v$i]"
done
SCENE_3_OUT="[scene3_final]"
SCENE_3_FILTER+="${LAST_STREAM}null${SCENE_3_OUT};"

# =========================================================================
# Scene 4: (57.82s -> End) "Create Echo... phoenix from ashes... successes."
# Effect: A slow, inspiring zoom-out revealing a hopeful landscape.
# =========================================================================
S4_START=$S3_END
S4_END=$DURATION
S4_DUR=$(calc "$S4_END - $S4_START")

S4_L1=("bright_sky.jpg"        1.30  -200      0     -150     0) # BG
S4_L2=("mountains-far.png"     1.20  -100      0     -100     0) # Mid
S4_L3=("phoenix_from_ashes.png" 0.7  1200   1200      900   400) # Mid 2
S4_L4=("resilient-plant.png"    0.5  300    300     1800  1200) # FG

SCENE_4_FILTER=""
LAST_STREAM="[canvas4]"
SCENE_4_FILTER+="color=c=black:s=${WIDTH}x${HEIGHT}:d=${S4_DUR}:r=${FPS}[canvas4];"

for i in {1..4}; do
    LAYER_VAR="S4_L$i"
    declare -a LAYER=("${!LAYER_VAR}")
    IMG_NAME="${LAYER[0]}"
    SCALE=$(calc "${LAYER[1]}")
    X_START=$(calc "${LAYER[2]}")
    X_END=$(calc "${LAYER[3]}")
    Y_START=$(calc "${LAYER[4]}")
    Y_END=$(calc "${LAYER[5]}")

    IMG_INDEX=-1
    for j in "${!IMAGE_FILES[@]}"; do
        if [[ "${IMAGE_FILES[j]}" == *"$IMG_NAME"* ]]; then IMG_INDEX=$j; break; fi
    done
    if [ $IMG_INDEX -eq -1 ]; then echo "Image $IMG_NAME not found!"; exit 1; fi

    W_SCALED=$(calc "$WIDTH * $SCALE")
    H_SCALED=$(calc "$HEIGHT * $SCALE")
    X_RATE=$(calc "($X_END - $X_START) / $S4_DUR")
    Y_RATE=$(calc "($Y_END - $Y_START) / $S4_DUR")

    SCENE_4_FILTER+="[$IMG_INDEX:v]scale=${W_SCALED}:${H_SCALED}[s4_img$i];"
    SCENE_4_FILTER+="${LAST_STREAM}[s4_img$i]overlay=x='$X_START+(t)*$X_RATE':y='$Y_START+(t)*$Y_RATE':shortest=1[s4_v$i];"
    LAST_STREAM="[s4_v$i]"
done
SCENE_4_OUT="[scene4_final]"
SCENE_4_FILTER+="${LAST_STREAM}null${SCENE_4_OUT};"

# =========================================================================
# Stitch scenes together with xfade transitions
# =========================================================================
OFFSET1=$(calc "$S1_DUR - $TRANSITION_DUR")
OFFSET2=$(calc "$OFFSET1 + $S2_DUR - $TRANSITION_DUR")
OFFSET3=$(calc "$OFFSET2 + $S3_DUR - $TRANSITION_DUR")

TRANSITIONS_FILTER=""
TRANSITIONS_FILTER+="${SCENE_1_OUT}${SCENE_2_OUT}xfade=transition=fade:duration=${TRANSITION_DUR}:offset=${OFFSET1}[v12];"
TRANSITIONS_FILTER+="[v12]${SCENE_3_OUT}xfade=transition=fade:duration=${TRANSITION_DUR}:offset=${OFFSET2}[v123];"
TRANSITIONS_FILTER+="[v123]${SCENE_4_OUT}xfade=transition=fade:duration=${TRANSITION_DUR}:offset=${OFFSET3}[final_video];"

# --- Assemble the final FFmpeg command ---
FILTER_COMPLEX="${SCENE_1_FILTER}${SCENE_2_FILTER}${SCENE_3_FILTER}${SCENE_4_FILTER}${TRANSITIONS_FILTER}"

# The final audio stream index is the number of image files
AUDIO_STREAM_INDEX=${#IMAGE_FILES[@]}

FULL_CMD="ffmpeg -y \
${INPUTS_CMD} \
-i \"${AUDIO_FILE}\" \
-filter_complex \"${FILTER_COMPLEX}\" \
-map \"[final_video]\" \
-map ${AUDIO_STREAM_INDEX}:a \
-c:v libx264 -pix_fmt yuv420p -r ${FPS} -preset veryfast -crf 20 \
-c:a aac -b:a 192k \
-shortest \
\"${OUTPUT_FILE}\""

# --- Execute the command ---
echo "--- FFmpeg Command ---"
echo "${FULL_CMD}"
echo "----------------------"
echo "Executing FFmpeg... This may take a while."

eval "${FULL_CMD}"

echo "Video generation complete: ${OUTPUT_FILE}"
```