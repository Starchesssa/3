Here is a ready-to-run Bash script to generate the parallax video using FFmpeg.

### Prerequisites

1.  **FFmpeg & FFprobe**: Make sure `ffmpeg` and `ffprobe` are installed and available in your system's PATH.
2.  **`bc`**: The script uses the `bc` command for floating-point arithmetic. It's a standard utility on most Linux/macOS systems.
3.  **Asset Paths**: The script assumes the following directory structure:
    ```
    .
    ├── generate_video.sh  (this script)
    ├── assets/
    │   └── images/
    │       ├── abstract_gears_background.jpg
    │       ├── aws-logo.png
    │       └── ... (all other image files)
    └── BOOKS/
        └── Temp/
            └── TTS/
                └── Lesson_9.wav
    ```
4.  **Permissions**: Make the script executable: `chmod +x generate_video.sh`.

---

### The Script (`generate_video.sh`)

```bash
#!/bin/bash
set -e

# =================================================================================
# Parallax Video Generator Script
# =================================================================================

# --- Configuration ---
WIDTH=3840
HEIGHT=2160
FPS=30
TRANSITION_DUR=0.8 # Duration of fade transition between scenes
OUTPUT_FILE="lesson_9_parallax.mp4"
AUDIO_FILE="BOOKS/Temp/TTS/Lesson_9.wav"
IMAGE_DIR="assets/images"

# --- Verify Dependencies ---
command -v ffmpeg >/dev/null 2>&1 || { echo >&2 "ffmpeg is required but not installed. Aborting."; exit 1; }
command -v ffprobe >/dev/null 2>&1 || { echo >&2 "ffprobe is required but not installed. Aborting."; exit 1; }
command -v bc >/dev/null 2>&1 || { echo >&2 "bc is required but not installed. Aborting."; exit 1; }
if [ ! -f "$AUDIO_FILE" ]; then
    echo "Error: Audio file not found at '$AUDIO_FILE'"
    exit 1
fi
if [ ! -d "$IMAGE_DIR" ]; then
    echo "Error: Image directory not found at '$IMAGE_DIR'"
    exit 1
fi

# --- Timing Calculation ---
echo "Calculating audio duration and scene timings..."
TOTAL_DURATION=$(ffprobe -i "$AUDIO_FILE" -show_entries format=duration -v quiet -of csv="p=0")

# Scene start times from timeline
S_STARTS=(0.00 4.22 10.82 17.60 28.03 35.42 44.26 53.42 70.36 82.28)
NUM_SCENES=${#S_STARTS[@]}
S_DURATIONS=()
S_CUMULATIVE_DUR=()
CURRENT_CUMULATIVE_DUR=0

for i in $(seq 0 $(($NUM_SCENES - 1))); do
    START_TIME=${S_STARTS[$i]}
    if [ $i -lt $(($NUM_SCENES - 1)) ]; then
        END_TIME=${S_STARTS[$(($i + 1))]}
    else
        END_TIME=$TOTAL_DURATION
    fi
    
    DUR=$(echo "$END_TIME - $START_TIME" | bc)
    S_DURATIONS+=($DUR)
    
    CURRENT_CUMULATIVE_DUR=$(echo "$CURRENT_CUMULATIVE_DUR + $DUR" | bc)
    S_CUMULATIVE_DUR+=($CURRENT_CUMULATIVE_DUR)
done

echo "Total video duration will be ${TOTAL_DURATION}s, split into ${NUM_SCENES} scenes."

# --- Asset Mapping ---
# Map all unique image files to an array. The order corresponds to the -i flags.
# This makes the filtergraph easier to read with indices like [0:v], [1:v], etc.
IMAGE_ASSETS=(
    "$IMAGE_DIR/mountains-far.png"
    "$IMAGE_DIR/winding-path.jpg"
    "$IMAGE_DIR/forest-midground.png"
    "$IMAGE_DIR/single-tree.png"
    "$IMAGE_DIR/sky-background.jpg"
    "$IMAGE_DIR/city-background.jpg"
    "$IMAGE_DIR/modern_city.png"
    "$IMAGE_DIR/buildings-foreground.png"
    "$IMAGE_DIR/soundwaves_overlay.png"
    "$IMAGE_DIR/dark_clouds.jpg"
    "$IMAGE_DIR/stock-chart-midground.png"
    "$IMAGE_DIR/falling-chart.png"
    "$IMAGE_DIR/rain_overlay.png"
    "$IMAGE_DIR/cracked_glass_overlay.png"
    "$IMAGE_DIR/rainy-city.jpg"
    "$IMAGE_DIR/amazon_warehouse_midground.png"
    "$IMAGE_DIR/empty_city_street_background.jpg"
    "$IMAGE_DIR/sad-people.png"
    "$IMAGE_DIR/amazon_box_foreground.png"
    "$IMAGE_DIR/blueprint_bg.jpg"
    "$IMAGE_DIR/gears-midground.png"
    "$IMAGE_DIR/broken_gears.png"
    "$IMAGE_DIR/biohazard_symbol_overlay.png"
    "$IMAGE_DIR/gears-background.png"
    "$IMAGE_DIR/abstract_gears_background.jpg"
    "$IMAGE_DIR/server-racks-midground.png"
    "$IMAGE_DIR/gears-foreground.png"
    "$IMAGE_DIR/tech-overlay-foreground.png"
    "$IMAGE_DIR/data-center-background.jpg"
    "$IMAGE_DIR/server-room.jpg"
    "$IMAGE_DIR/cloud_servers_midground.png"
    "$IMAGE_DIR/aws-logo.png"
    "$IMAGE_DIR/glowing-data.png"
    "$IMAGE_DIR/tech_cityscape.jpg"
    "$IMAGE_DIR/fortress.png"
    "$IMAGE_DIR/data_stream_foreground.png"
    "$IMAGE_DIR/delivery_drone_foreground.png"
    "$IMAGE_DIR/bright_sky.jpg"
    "$IMAGE_DIR/buildings_midground.png"
    "$IMAGE_DIR/resilient-plant.png"
    "$IMAGE_DIR/digital_grid.png"
    "$IMAGE_DIR/sunrise-field.jpg"
    "$IMAGE_DIR/phoenix_from_ashes.png"
    "$IMAGE_DIR/glowing_particles.png"
    "$IMAGE_DIR/data_stream.png"
    "$IMAGE_DIR/city_skyline-mid.png"
    "$IMAGE_DIR/tech_city_background.jpg"
    "$IMAGE_DIR/data_overlay_foreground.png"
    "$IMAGE_DIR/gears-midground.png"
)

# --- FFmpeg Command Assembly ---
FFMPEG_INPUTS=""
for asset in "${IMAGE_ASSETS[@]}"; do
    if [ ! -f "$asset" ]; then
        echo "Error: Image asset not found at '$asset'"
        exit 1
    fi
    FFMPEG_INPUTS+="-loop 1 -i \"$asset\" "
done
AUDIO_INPUT_INDEX=${#IMAGE_ASSETS[@]}
FFMPEG_INPUTS+="-i \"$AUDIO_FILE\""

FILTER_COMPLEX=""

# --- Scene Filtergraph Generation ---
# We create each scene as a separate, self-contained video clip.
# Then we use the xfade filter to transition between them.

echo "Building filtergraph for scenes..."

# Scene 1: "growth is never a straight line" (Horizontal Pan Parallax)
DUR1=${S_DURATIONS[0]}
BG_PAN1=20; MG1_PAN1=40; MG2_PAN1=85; FG_PAN1=110;
FILTER_COMPLEX+="
color=c=black:s=${WIDTH}x${HEIGHT}:d=$DUR1[s1_base];
[0:v]scale=${WIDTH}*1.1:-1,crop=${WIDTH}:${HEIGHT}[s1_l1];
[1:v]scale=${WIDTH}*1.2:-1,crop=${WIDTH}:${HEIGHT}[s1_l2];
[2:v]scale=${WIDTH}*1.3:-1,crop=${WIDTH}:${HEIGHT}[s1_l3];
[3:v]scale=${WIDTH}*1.4:-1,crop=${WIDTH}:${HEIGHT}[s1_l4];
[s1_base][s1_l1]overlay=x='-${BG_PAN1}*t':y=0[s1_v1];
[s1_v1][s1_l2]overlay=x='-${MG1_PAN1}*t':y=0[s1_v2];
[s1_v2][s1_l3]overlay=x='-${MG2_PAN1}*t':y=0[s1_v3];
[s1_v3][s1_l4]overlay=x='-${FG_PAN1}*t':y='(H-h)/2'[s1];
"

# Scene 2: "arrive at 2022... new reality" (Zoom Parallax)
DUR2=${S_DURATIONS[1]}
BG_Z2=0.01; MG1_Z2=0.03; MG2_Z2=0.05; FG_Z2=0.08
FILTER_COMPLEX+="
color=c=black:s=${WIDTH}x${HEIGHT}:d=$DUR2[s2_base];
[4:v]scale='iw*(1+${BG_Z2}*t)':'ih*(1+${BG_Z2}*t)',crop=${WIDTH}:${HEIGHT}[s2_l1];
[5:v]scale='iw*(1+${MG1_Z2}*t)':'ih*(1+${MG1_Z2}*t)',crop=${WIDTH}:${HEIGHT}[s2_l2];
[6:v]scale='iw*(1+${MG2_Z2}*t)':'ih*(1+${MG2_Z2}*t)',crop=${WIDTH}:${HEIGHT}[s2_l3];
[7:v]scale='iw*(1+${FG_Z2}*t)':'ih*(1+${FG_Z2}*t)',crop=${WIDTH}:${HEIGHT}[s2_l4];
[8:v]scale=${WIDTH}:${HEIGHT}[s2_ol1];
[s2_base][s2_l1]overlay=(W-w)/2:(H-h)/2[s2_v1];
[s2_v1][s2_l2]overlay=(W-w)/2:(H-h)/2[s2_v2];
[s2_v2][s2_l3]overlay=(W-w)/2:(H-h)/2[s2_v3];
[s2_v3][s2_l4]overlay=(W-w)/2:(H-h)/2[s2_v4];
[s2_v4][s2_ol1]overlay=0:0:eval=frame,format=yuva444p,colorchannelmixer=aa=0.5*sin(2*PI*t/($DUR2/2))[s2];
"

# Scene 3: "Inflation... boom is over" (Downward Motion)
DUR3=${S_DURATIONS[2]}
CHART_FALL_SPEED=$(echo "($HEIGHT+500)/$DUR3" | bc -l)
RAIN_SPEED=200
FILTER_COMPLEX+="
color=c=black:s=${WIDTH}x${HEIGHT}:d=$DUR3[s3_base];
[9:v]scale=${WIDTH}:-1,crop=${WIDTH}:${HEIGHT}[s3_l1];
[10:v]scale=w=${WIDTH}/2:h=-1[s3_l2];
[11:v]scale=w=${WIDTH}/1.5:h=-1[s3_l3];
[12:v]scale=${WIDTH}:${HEIGHT}[s3_ol1];
[13:v]scale=${WIDTH}:${HEIGHT}[s3_ol2];
[s3_base][s3_l1]overlay=0:0[s3_v1];
[s3_v1][s3_l2]overlay=x='(W-w)/2':y=-200[s3_v2];
[s3_v2][s3_l3]overlay=x='(W-w)/2':y='-500+${CHART_FALL_SPEED}*t'[s3_v3];
[s3_v3][s3_ol1]overlay='0:mod(t*${RAIN_SPEED},h)'[s3_v4];
[s3_v4][s3_ol2]overlay=0:0[s3];
"

# Scene 4: "Amazon stock fell..." (Dolly Zoom / Vertical Pan)
DUR4=${S_DURATIONS[3]}
BG_Z4=0.05
FG_Z4_S=1.5; FG_Z4_E=1.0; FG_Z4_RATE=$(echo "($FG_Z4_E - $FG_Z4_S) / $DUR4" | bc -l)
SAD_PAN4=50
FILTER_COMPLEX+="
color=c=black:s=${WIDTH}x${HEIGHT}:d=$DUR4[s4_base];
[14:v]scale='iw*(1+${BG_Z4}*t)':'ih*(1+${BG_Z4}*t)',crop=${WIDTH}:${HEIGHT}[s4_l1];
[15:v]scale='iw*(${FG_Z4_S}+t*${FG_Z4_RATE})':-1,crop=${WIDTH}:${HEIGHT}[s4_l2];
[16:v]scale=${WIDTH}:${HEIGHT}[s4_l3];
[17:v]scale=w=${WIDTH}/3:h=-1[s4_l4];
[18:v]scale=w=${WIDTH}/4:h=-1[s4_l5];
[s4_base][s4_l1]overlay=0:0[s4_v1];
[s4_v1][s4_l3]overlay=0:0,format=yuva444p,colorchannelmixer=aa=0.4[s4_v2];
[s4_v2][s4_l2]overlay=x='(W-w)/2':y='(H-h)/2'[s4_v3];
[s4_v3][s4_l4]overlay=x='W/2':y='H/2 - ${SAD_PAN4}*t'[s4_v4];
[s4_v4][s4_l5]overlay=x='W/4':y='-h + (t/${DUR4})*(H+h)'[s4];
"

# Scene 5: "had to correct... layoffs" (Rotational/Mechanical)
DUR5=${S_DURATIONS[4]}
ROT_SPEED1=5; ROT_SPEED2=-8;
FILTER_COMPLEX+="
color=c=black:s=${WIDTH}x${HEIGHT}:d=$DUR5[s5_base];
[19:v]scale=${WIDTH}:${HEIGHT}[s5_l1];
[20:v]rotate='${ROT_SPEED1}*t*PI/180':fillcolor=none[s5_l2_rot];
[20:v]scale=w=iw*0.8:h=-1[s5_l2]; [s5_l2][s5_l2_rot]overlay=(W-w)/2:(H-h)/2[s5_l2_final];
[21:v]scale=w=iw*0.6:h=-1[s5_l3];
[22:v]scale=w=iw*0.4:h=-1[s5_l4];
[s5_base][s5_l1]overlay=0:0[s5_v1];
[s5_v1][s5_l2_final]overlay=x='(W-w)/2':y='(H-h)/2'[s5_v2];
[s5_v2][s5_l3]overlay=x='W/2-w/2+100*sin(t)':y='H/2-h/2+50*cos(t)'[s5_v3];
[s5_v3][s5_l4]overlay=x='(W-w)/2':y='(H-h)/2',format=yuva444p,colorchannelmixer=aa='0.3*(1+sin(2*PI*t/3))'[s5];
"

# Scene 6: "the machine" (Complex Rotation)
DUR6=${S_DURATIONS[5]}
FILTER_COMPLEX+="
color=c=black:s=${WIDTH}x${HEIGHT}:d=$DUR6[s6_base];
[23:v]scale=${WIDTH}:${HEIGHT}[s6_l1];
[24:v]scale=${WIDTH}:${HEIGHT}[s6_l2];
[25:v]scale=${WIDTH}:${HEIGHT}[s6_l3];
[26:v]rotate='-15*t*PI/180':fillcolor=none,scale=w=iw*1.2:h=-1[s6_l4];
[27:v]scale=${WIDTH}:${HEIGHT}[s6_ol1];
[s6_base][s6_l1]overlay=0:0[s6_v1];
[s6_v1][s6_l2]overlay=x=0:y=0,format=yuva444p,colorchannelmixer=aa=0.7[s6_v2];
[s6_v2][s6_l3]overlay=x='(W-w)/2':y='(H-h)/2-100*t'[s6_v3];
[s6_v3][s6_l4]overlay=x='(W-w)/2':y='(H-h)/2'[s6_v4];
[s6_v4][s6_ol1]overlay=x=0:y=0,format=yuva444p,colorchannelmixer=aa='if(mod(floor(t*4),2),0.5,0)'[s6];
"

# Scene 7: "AWS, was still growing" (Horizontal Pan + Scale)
DUR7=${S_DURATIONS[6]}
BG_PAN7=30; MG1_PAN7=50; MG2_PAN7=80;
LOGO_S=0.3; LOGO_E=0.4; LOGO_RATE=$(echo "($LOGO_E - $LOGO_S) / $DUR7" | bc -l)
FILTER_COMPLEX+="
color=c=black:s=${WIDTH}x${HEIGHT}:d=$DUR7[s7_base];
[28:v]scale=${WIDTH}*1.2:-1,crop=${WIDTH}:${HEIGHT}[s7_l1];
[29:v]scale=${WIDTH}*1.3:-1,crop=${WIDTH}:${HEIGHT}[s7_l2];
[30:v]scale=${WIDTH}*1.4:-1,crop=${WIDTH}:${HEIGHT}[s7_l3];
[31:v]scale='iw*(${LOGO_S}+t*${LOGO_RATE})':-1[s7_l4];
[32:v]scale=${WIDTH}*1.5:-1[s7_ol1];
[s7_base][s7_l1]overlay=x='-${BG_PAN7}*t':y=0[s7_v1];
[s7_v1][s7_l2]overlay=x='-${MG1_PAN7}*t':y=0[s7_v2];
[s7_v2][s7_l3]overlay=x='-${MG2_PAN7}*t':y=0[s7_v3];
[s7_v3][s7_l4]overlay=x='(W-w)/2':y='(H-h)/2'[s7_v4];
[s7_v4][s7_ol1]overlay=x='-W/3 + (t/${DUR7})*W*1.5':y=0[s7];
"

# Scene 8: "keeping the empire afloat" (Zoom + Animation)
DUR8=${S_DURATIONS[7]}
BG_Z8=0.02; MG1_Z8=0.04;
DRONE_SPEED=$(echo "$WIDTH+400" | bc -l)
FILTER_COMPLEX+="
color=c=black:s=${WIDTH}x${HEIGHT}:d=$DUR8[s8_base];
[33:v]scale='iw*(1+${BG_Z8}*t)':-1,crop=${WIDTH}:${HEIGHT}[s8_l1];
[28:v]scale='iw*(1+${MG1_Z8}*t)':-1,crop=${WIDTH}:${HEIGHT}[s8_l2];
[34:v]scale=${WIDTH}:${HEIGHT}[s8_l3];
[35:v]scale=${WIDTH}:${HEIGHT}[s8_l4];
[36:v]scale=w=${WIDTH}/4:h=-1[s8_l5];
[s8_base][s8_l1]overlay=x='(W-w)/2':y='(H-h)/2'[s8_v1];
[s8_v1][s8_l2]overlay=x='(W-w)/2':y='(H-h)/2',format=yuva444p,colorchannelmixer=aa=0.6[s8_v2];
[s8_v2][s8_l3]overlay=x='(W-w)/2':y='(H-h)/2',format=yuva444p,colorchannelmixer=aa=0.4[s8_v3];
[s8_v3][s8_l4]overlay=x=0:y='h-mod(t*150,2*h)'[s8_v4];
[s8_v4][s8_l5]overlay=x='-w+(t/${DUR8})*${DRONE_SPEED}':y='H*0.6+50*sin(t*2)'[s8];
"

# Scene 9: "system is more resilient" (Growth)
DUR9=${S_DURATIONS[8]}
PLANT_S=0.5; PLANT_E=0.7; PLANT_RATE=$(echo "($PLANT_E - $PLANT_S) / $DUR9" | bc -l)
FILTER_COMPLEX+="
color=c=black:s=${WIDTH}x${HEIGHT}:d=$DUR9[s9_base];
[37:v]scale=${WIDTH}:${HEIGHT}[s9_l1];
[38:v]scale=${WIDTH}:${HEIGHT}[s9_l2];
[39:v]scale='iw*(${PLANT_S}+t*${PLANT_RATE})':-1[s9_l3];
[40:v]scale=${WIDTH}:${HEIGHT}[s9_ol1];
[s9_base][s9_l1]overlay=0:0[s9_v1];
[s9_v1][s9_l2]overlay=0:0[s9_v2];
[s9_v2][s9_l3]overlay=x='(W-w)/2':y='H-h'[s9_v3];
[s9_v3][s9_ol1]overlay=x=0:y=0,format=yuva444p,colorchannelmixer=aa='0.2*(1+cos(2*PI*t/4))'[s9];
"

# Scene 10: "only one left" (Rise and Ascend)
DUR10=${S_DURATIONS[9]}
PHOENIX_RISE=$(echo "2*H/3 / $DUR10" | bc -l)
SUN_RISE=$(echo "H/4 / $DUR10" | bc -l)
PARTICLE_SPEED=250
FILTER_COMPLEX+="
color=c=black:s=${WIDTH}x${HEIGHT}:d=$DUR10[s10_base];
[41:v]scale=${WIDTH}*1.2:-1,crop=${WIDTH}:${HEIGHT}[s10_l1];
[42:v]scale=w=${WIDTH}/2.5:h=-1[s10_l2];
[43:v]scale=${WIDTH}:${HEIGHT}[s10_ol1];
[44:v]scale=${WIDTH}:${HEIGHT}[s10_ol2];
[s10_base][s10_l1]overlay=x='(W-w)/2':y='-${SUN_RISE}*t'[s10_v1];
[s10_v1][s10_l2]overlay=x='(W-w)/2':y='H*0.9-h - ${PHOENIX_RISE}*t'[s10_v2];
[s10_v2][s10_ol1]overlay=x=0:y='-h+mod(t*${PARTICLE_SPEED},2*h)'[s10_v3];
[s10_v3][s10_ol2]overlay=x=0:y='h-mod(t*100,2*h)',format=yuva444p,colorchannelmixer=aa=0.5[s10];
"

# --- Scene Chaining with xfade ---
echo "Building xfade chain..."
XFADE_FILTER=""
LAST_V="s1"
OFFSET=${S_DURATIONS[0]}

for i in $(seq 1 $(($NUM_SCENES - 1))); do
    SCENE_CLIP="s$(($i + 1))"
    DUR=${S_DURATIONS[$i]}
    XFADE_OFFSET=$(echo "$OFFSET - $TRANSITION_DUR" | bc)
    
    if [ $i -eq $(($NUM_SCENES - 1)) ]; then
        OUTPUT_V="final_v"
    else
        OUTPUT_V="v$i"
    fi
    
    XFADE_FILTER+="[$LAST_V][$SCENE_CLIP]xfade=transition=fade:duration=$TRANSITION_DUR:offset=$XFADE_OFFSET[$OUTPUT_V];"
    LAST_V=$OUTPUT_V
    OFFSET=$(echo "$OFFSET + $DUR" | bc)
done

FILTER_COMPLEX+=$XFADE_FILTER

# --- Final Execution ---
echo "Starting FFmpeg process... This may take a long time."
eval "ffmpeg -y \
    $FFMPEG_INPUTS \
    -filter_complex \"$FILTER_COMPLEX\" \
    -map '[$OUTPUT_V]' -map $AUDIO_INPUT_INDEX:a \
    -c:v libx264 -preset slow -crf 18 \
    -c:a aac -b:a 192k \
    -r $FPS -pix_fmt yuv420p \
    -shortest \"$OUTPUT_FILE\""

echo "======================================================"
echo "Done! Video saved as '$OUTPUT_FILE'"
echo "======================================================"
```