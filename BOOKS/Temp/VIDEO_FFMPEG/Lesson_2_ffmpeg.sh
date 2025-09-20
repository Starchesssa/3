Here is a ready-to-run FFmpeg shell script to generate the parallax video based on your requirements.

### Instructions:

1.  Save the code below as a shell script file (e.g., `generate_video.sh`).
2.  Make sure the script, the `assets/` directory, and the `BOOKS/` directory are in the correct relative locations.
3.  Give the script execution permissions: `chmod +x generate_video.sh`.
4.  Run the script from your terminal: `./generate_video.sh`.

The script will calculate all necessary parameters and then execute a single, complex FFmpeg command to produce `lesson_2_parallax.mp4`.

---

### `generate_video.sh`

```bash
#!/bin/bash

# ==============================================================================
# FFmpeg Parallax Video Generator
# ==============================================================================
# This script creates a multi-layered parallax video with various effects
# synchronized to an audio track.

# --- Configuration ---
set -e # Exit immediately if a command exits with a non-zero status.

WIDTH=3840
HEIGHT=2160
FPS=30
ASSETS_DIR="assets/images"
AUDIO_FILE="BOOKS/Temp/TTS/Lesson_2.wav"
OUTPUT_FILE="lesson_2_parallax.mp4"

# --- Pre-flight Checks ---
command -v ffmpeg >/dev/null 2>&1 || { echo >&2 "Error: ffmpeg is not installed. Aborting."; exit 1; }
command -v ffprobe >/dev/null 2>&1 || { echo >&2 "Error: ffprobe is not installed. Aborting."; exit 1; }
[ -f "$AUDIO_FILE" ] || { echo >&2 "Error: Audio file not found at '$AUDIO_FILE'"; exit 1; }
[ -d "$ASSETS_DIR" ] || { echo >&2 "Error: Assets directory not found at '$ASSETS_DIR'"; exit 1; }

# --- Get Audio Duration ---
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE")
if [ -z "$DURATION" ]; then
    echo "Error: Could not determine audio duration."
    exit 1
fi
echo "Audio duration detected: $DURATION seconds"

# --- Timeline & Scene Definitions ---
# We define scenes to switch visual styles and parallax effects.
S1_START=0.0;   S1_END=5.8
S2_START=5.8;   S2_END=11.5
S3_START=11.5;  S3_END=16.9
S4_START=16.9;  S4_END=25.0
S5_START=25.0;  S5_END=33.5
S6_START=33.5;  S6_END=42.4
S7_START=42.4;  S7_END=50.0
S8_START=50.0;  S8_END=${DURATION} # Final scene lasts until the audio ends.

# --- Pre-calculate Scene Durations and Parallax Speeds ---
# This avoids doing complex arithmetic inside the FFmpeg filtergraph string.

# Scene 1: "The market is a mood swing." - Gentle Horizontal Pan
S1_DUR=$(echo "$S1_END - $S1_START" | bc)
S1_BG_SPEED=$(echo "50 / $S1_DUR" | bc -l)
S1_MG_SPEED=$(echo "150 / $S1_DUR" | bc -l)
S1_FG_SPEED=$(echo "300 / $S1_DUR" | bc -l)

# Scene 2: "The bubble burst." - Fast Downward Vertical Pan (Crash)
S2_DUR=$(echo "$S2_END - $S2_START" | bc)
S2_BG_SPEED=$(echo "80 / $S2_DUR" | bc -l)
S2_MG_SPEED=$(echo "200 / $S2_DUR" | bc -l)
S2_FG_SPEED=$(echo "450 / $S2_DUR" | bc -l)

# Scene 3: ".com companies vanished." - Slow Zoom Out
S3_DUR=$(echo "$S3_END - $S3_START" | bc)
S3_DUR_FRAMES=$(echo "$S3_DUR * $FPS" | bc)
S3_ZOOM_RATE=0.08

# Scene 4: "Wall Street turned on Amazon." - Diagonal Pan + Rain
S4_DUR=$(echo "$S4_END - $S4_START" | bc)
S4_X_SPEED=$(echo "100 / $S4_DUR" | bc -l)
S4_Y_SPEED=$(echo "60 / $S4_DUR" | bc -l)

# Scene 5: "Crashed... 90% drop." - Zoom In + Cracked Glass
S5_DUR=$(echo "$S5_END - $S5_START" | bc)
S5_DUR_FRAMES=$(echo "$S5_DUR * $FPS" | bc)
S5_ZOOM_RATE=0.05

# Scene 6: "Panic... cut costs." - Shaky Cam + Blueprint/Gears
S6_DUR=$(echo "$S6_END - $S6_START" | bc)
S6_BG_SPEED=$(echo "40 / $S6_DUR" | bc -l)
S6_MG_SPEED=$(echo "90 / $S6_DUR" | bc -l)

# Scene 7: "Bezos kept building." - Smooth Upward Pan
S7_DUR=$(echo "$S7_END - $S7_START" | bc)
S7_BG_SPEED=$(echo "120 / $S7_DUR" | bc -l)
S7_MG_SPEED=$(echo "250 / $S7_DUR" | bc -l)
S7_FG_SPEED=$(echo "400 / $S7_DUR" | bc -l)

# Scene 8: "Survive the storm." - Layered Fade-in & Slow Zoom
S8_DUR=$(echo "$S8_END - $S8_START" | bc)
S8_DUR_FRAMES=$(echo "$S8_DUR * $FPS" | bc)

# --- FFmpeg Input Files ---
# Map images to scenes for clarity.
FFMPEG_INPUTS=(
    # Scene 1 Assets
    "-i" "$ASSETS_DIR/abstract_gears_background.jpg"  #0
    "-i" "$ASSETS_DIR/stock-chart-midground.png"      #1
    "-i" "$ASSETS_DIR/gears-midground.png"            #2
    # Scene 2 Assets
    "-i" "$ASSETS_DIR/dark_clouds.jpg"                #3
    "-i" "$ASSETS_DIR/city-skyline-mid.png"           #4
    "-i" "$ASSETS_DIR/falling-chart.png"              #5
    # Scene 3 Assets
    "-i" "$ASSETS_DIR/empty_city_street_background.jpg" #6
    "-i" "$ASSETS_DIR/sad-people.png"                 #7
    "-i" "$ASSETS_DIR/broken_gears.png"               #8
    # Scene 4 Assets
    "-i" "$ASSETS_DIR/rainy-city.jpg"                 #9
    "-i" "$ASSETS_DIR/amazon_warehouse_midground.png" #10
    "-i" "$ASSETS_DIR/rain_overlay.png"               #11
    # Scene 5 Assets
    "-i" "$ASSETS_DIR/city_background.jpg"            #12
    "-i" "$ASSETS_DIR/buildings-foreground.png"       #13
    "-i" "$ASSETS_DIR/cracked_glass_overlay.png"      #14
    # Scene 6 Assets
    "-i" "$ASSETS_DIR/blueprint_bg.jpg"               #15
    "-i" "$ASSETS_DIR/gears-background.png"           #16
    "-i" "$ASSETS_DIR/tech-overlay-foreground.png"    #17
    # Scene 7 Assets
    "-i" "$ASSETS_DIR/tech_city_background.jpg"       #18
    "-i" "$ASSETS_DIR/server-racks-midground.png"     #19
    "-i" "$ASSETS_DIR/data_stream_foreground.png"     #20
    # Scene 8 Assets
    "-i" "$ASSETS_DIR/sunrise-field.jpg"              #21
    "-i" "$ASSETS_DIR/fortress.png"                   #22
    "-i" "$ASSETS_DIR/phoenix_from_ashes.png"         #23
)

# --- Main Filter Complex String ---
FILTER_COMPLEX="
# Create a base canvas for the entire duration
color=c=black:s=${WIDTH}x${HEIGHT}:d=${DURATION}[base];

# --- [SCENE 1] Prep & Scale (0.0 - 5.8s) ---
[0:v]scale=${WIDTH}*1.05:-1,crop=${WIDTH}:${HEIGHT},format=yuva444p[s1_bg];
[1:v]scale=${WIDTH}*1.1:-1,format=yuva444p[s1_mg1];
[2:v]scale=${WIDTH}*1.2:-1,format=yuva444p[s1_mg2];

# --- [SCENE 2] Prep & Scale (5.8 - 11.5s) ---
[3:v]scale=${WIDTH}:-1,crop=${WIDTH}:${HEIGHT},format=yuva444p[s2_bg];
[4:v]scale=${WIDTH}*1.2:-1,format=yuva444p[s2_mg];
[5:v]scale=${WIDTH}*0.6:-1,format=yuva444p[s2_fg];

# --- [SCENE 3] Prep & Scale (11.5 - 16.9s) ---
[6:v]scale=${WIDTH}:-1,crop=${WIDTH}:${HEIGHT},format=yuva444p[s3_bg];
[7:v]scale=${WIDTH}*0.5:-1,format=yuva444p[s3_mg];
[8:v]scale=${WIDTH}*0.7:-1,format=yuva444p[s3_fg];

# --- [SCENE 4] Prep & Scale (16.9 - 25.0s) ---
[9:v]scale=${WIDTH}*1.1:-1,crop=${WIDTH}:${HEIGHT},format=yuva444p[s4_bg];
[10:v]scale=${WIDTH}*1.2:-1,format=yuva444p[s4_mg];
[11:v]scale=${WIDTH}:${HEIGHT},format=yuva444p[s4_ol];

# --- [SCENE 5] Prep & Scale (25.0 - 33.5s) ---
[12:v]scale=${WIDTH}:-1,crop=${WIDTH}:${HEIGHT},format=yuva444p[s5_bg];
[13:v]scale=${WIDTH}*1.3:-1,format=yuva444p[s5_fg];
[14:v]scale=${WIDTH}:${HEIGHT},format=yuva444p[s5_ol];

# --- [SCENE 6] Prep & Scale (33.5 - 42.4s) ---
[15:v]scale=${WIDTH}*1.05:-1,crop=${WIDTH}:${HEIGHT},format=yuva444p[s6_bg];
[16:v]scale=${WIDTH}*1.1:-1,format=yuva444p[s6_mg];
[17:v]scale=${WIDTH}:${HEIGHT},format=yuva444p[s6_ol];

# --- [SCENE 7] Prep & Scale (42.4 - 50.0s) ---
[18:v]scale=${WIDTH}*1.2:-1,crop=${WIDTH}:${HEIGHT},format=yuva444p[s7_bg];
[19:v]scale=${WIDTH}*1.3:-1,format=yuva444p[s7_mg];
[20:v]scale=${WIDTH}*1.4:-1,format=yuva444p[s7_fg];

# --- [SCENE 8] Prep & Scale (50.0 - END) ---
[21:v]scale=${WIDTH}:-1,crop=${WIDTH}:${HEIGHT},format=yuva444p[s8_bg];
[22:v]scale=${WIDTH}*0.7:-1,format=yuva444p[s8_mg1];
[23:v]scale=${WIDTH}*0.8:-1,format=yuva444p[s8_mg2];

# --- Scene 1 Composition: Horizontal Pan ---
[base][s1_bg]overlay=x='-${S1_BG_SPEED}*t':y=0[v1_l1];
[v1_l1][s1_mg1]overlay=x='W/2-w/2':y='H/2-h/2 - ${S1_MG_SPEED}*t*0.2'[v1_l2];
[v1_l2][s1_mg2]overlay=x='W-w - ${S1_FG_SPEED}*t':y='H-h':shortest=1[s1_comp];
[s1_comp]trim=start=${S1_START}:end=${S1_END},setpts=PTS-STARTPTS[v1];

# --- Scene 2 Composition: Vertical Crash ---
[base][s2_bg]overlay=x=0:y=0[v2_l1];
[v2_l1][s2_mg]overlay=x='(W-w)/2':y='-h+${S2_MG_SPEED}*t'[v2_l2];
[v2_l2][s2_fg]overlay=x='W/2-w/2+50*sin(t*2)':y='-h+${S2_FG_SPEED}*t':shortest=1[s2_comp];
[s2_comp]trim=start=${S2_START}:end=${S2_END},setpts=PTS-STARTPTS[v2];

# --- Scene 3 Composition: Slow Zoom Out ---
[base][s3_bg]overlay=x=0:y=0[v3_l1];
[v3_l1][s3_mg]overlay=x=100:y='H-h-100'[v3_l2];
[v3_l2][s3_fg]overlay=x='W-w-200':y=200:shortest=1[s3_comp];
[s3_comp]trim=start=${S3_START}:end=${S3_END},setpts=PTS-STARTPTS,
zoompan=z='max(1.0, 1.5-${S3_ZOOM_RATE}*t)':d=${S3_DUR_FRAMES}:s=${WIDTH}x${HEIGHT}:x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2'[v3];

# --- Scene 4 Composition: Diagonal Pan ---
[base][s4_bg]overlay=x='W-w+${S4_X_SPEED}*t':y='H-h+${S4_Y_SPEED}*t'[v4_l1];
[v4_l1][s4_mg]overlay=x='-w+${S4_X_SPEED}*2.5*t':y='(H-h)/2'[v4_l2];
[v4_l2][s4_ol]overlay:shortest=1[s4_comp];
[s4_comp]trim=start=${S4_START}:end=${S4_END},setpts=PTS-STARTPTS[v4];

# --- Scene 5 Composition: Zoom In ---
[base][s5_bg]overlay=x=0:y=0[v5_l1];
[v5_l1][s5_fg]overlay=x='(W-w)/2':y='H-h'[v5_l2];
[v5_l2][s5_ol]overlay:shortest=1[s5_comp];
[s5_comp]trim=start=${S5_START}:end=${S5_END},setpts=PTS-STARTPTS,
zoompan=z='min(1.5, 1+${S5_ZOOM_RATE}*t)':d=${S5_DUR_FRAMES}:s=${WIDTH}x${HEIGHT}:x='iw/2-(iw/zoom)/2':y='ih*0.8-(ih/zoom)*0.8'[v5];

# --- Scene 6 Composition: Shaky Cam ---
[base][s6_bg]overlay=x='-${S6_BG_SPEED}*t':y=0[v6_l1];
[v6_l1][s6_mg]overlay=x=0:y='(H-h)/2'[v6_l2];
[v6_l2][s6_ol]overlay=x=0:y=0:shortest=1[s6_comp];
[s6_comp]trim=start=${S6_START}:end=${S6_END},setpts=PTS-STARTPTS,frei0r.shake=x=5:y=5[v6];

# --- Scene 7 Composition: Upward Pan ---
[base][s7_bg]overlay=x=0:y='H-h+${S7_BG_SPEED}*t'[v7_l1];
[v7_l1][s7_mg]overlay=x='(W-w)/2':y='H-h+${S7_MG_SPEED}*t'[v7_l2];
[v7_l2][s7_fg]overlay=x=0:y='H-h+${S7_FG_SPEED}*t':shortest=1[s7_comp];
[s7_comp]trim=start=${S7_START}:end=${S7_END},setpts=PTS-STARTPTS[v7];

# --- Scene 8 Composition: Layered Fade-in Zoom ---
[s8_bg]fade=in:st=0:d=1.5[s8_bg_faded];
[s8_mg1]fade=in:st=0.5:d=1.5,format=yuva444p[s8_mg1_faded];
[s8_mg2]fade=in:st=1.0:d=1.5,format=yuva444p[s8_mg2_faded];
[base][s8_bg_faded]overlay=x=0:y=0[v8_l1];
[v8_l1][s8_mg1_faded]overlay=x='(W-w)/2':y='H-h-150'[v8_l2];
[v8_l2][s8_mg2_faded]overlay=x='(W-w)/2':y='(H-h)/2':shortest=1[s8_comp];
[s8_comp]trim=start=${S8_START}:end=${S8_END},setpts=PTS-STARTPTS,
zoompan=z='min(1.3, 1+0.02*t)':d=${S8_DUR_FRAMES}:s=${WIDTH}x${HEIGHT}:x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2'[v8];

# --- Final Concatenation ---
# Chain all the scenes together to form the final video stream.
[v1][v2][v3][v4][v5][v6][v7][v8]concat=n=8:v=1:a=0[final_v];
"

# --- Execute FFmpeg Command ---
echo "Starting FFmpeg process... This may take a while."

AUDIO_INPUT_INDEX=$((${#FFMPEG_INPUTS[@]}/2))

ffmpeg -y \
    "${FFMPEG_INPUTS[@]}" \
    -i "$AUDIO_FILE" \
    -filter_complex "${FILTER_COMPLEX}" \
    -map "[final_v]" \
    -map "${AUDIO_INPUT_INDEX}:a" \
    -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -r $FPS \
    -c:a aac -b:a 192k \
    -shortest \
    "$OUTPUT_FILE"

echo "=========================================="
echo "Video generation complete!"
echo "Output file: $OUTPUT_FILE"
echo "=========================================="
```