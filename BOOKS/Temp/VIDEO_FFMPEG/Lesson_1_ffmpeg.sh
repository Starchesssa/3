Here is a ready-to-run Bash script that generates the specified parallax video using FFmpeg.

### Instructions

1.  **Save the code:** Save the following script as `generate_video.sh`.
2.  **Prerequisites:**
    *   Ensure you have `ffmpeg` and `ffprobe` installed and accessible in your system's PATH.
    *   The `bc` command-line calculator is used for floating-point arithmetic; it's standard on most Linux and macOS systems.
    *   The asset structure must match the script's expectations:
        ```
        .
        ├── generate_video.sh
        ├── BOOKS/
        │   └── Temp/
        │       └── TTS/
        │           └── Lesson_1.wav
        └── assets/
            └── images/
                ├── abstract_gears_background.jpg
                ├── amazon_box_foreground.png
                ├── ... (all other images) ...
        ```
3.  **Make the script executable:** Open your terminal and run `chmod +x generate_video.sh`.
4.  **Run the script:** Execute the script from your terminal with `./generate_video.sh`.

The script will print the determined audio duration and then start the FFmpeg process, which may take some time depending on your computer's performance. The final video will be saved as `parallax_output.mp4`.

---

### `generate_video.sh`

```bash
#!/bin/bash

# --- Configuration ---
AUDIO_FILE="BOOKS/Temp/TTS/Lesson_1.wav"
IMAGE_DIR="assets/images"
OUTPUT_FILE="parallax_output.mp4"

# --- Video Settings ---
FPS=30
W=3840 # Width
H=2160 # Height

# --- Safety Check ---
if [ ! -f "$AUDIO_FILE" ]; then
    echo "Error: Audio file not found at '$AUDIO_FILE'"
    exit 1
fi
if [ ! -d "$IMAGE_DIR" ]; then
    echo "Error: Image directory not found at '$IMAGE_DIR'"
    exit 1
fi

# --- Pre-computation ---
echo "Calculating video duration from audio..."
# Get audio duration using ffprobe
DURATION=$(ffprobe -i "$AUDIO_FILE" -show_entries format=duration -v quiet -of csv="p=0")
if [ -z "$DURATION" ]; then
    echo "Error: Could not determine audio duration. Is ffprobe installed correctly?"
    exit 1
fi
echo "Audio duration is $DURATION seconds."

# --- Scene Timings (based on provided timeline) ---
S1_START=0.0
S1_END=5.76
S2_END=12.38
S3_END=18.02
S4_END=24.16
S5_END=31.86
S6_END=36.50
S7_END=45.80
S8_END=53.28
S9_END=60.60
S10_END=$DURATION

S1_DUR=$(echo "$S1_END - $S1_START" | bc)
S2_DUR=$(echo "$S2_END - $S1_END" | bc)
S3_DUR=$(echo "$S3_END - $S2_END" | bc)
S4_DUR=$(echo "$S4_END - $S3_END" | bc)
S5_DUR=$(echo "$S5_END - $S4_END" | bc)
S6_DUR=$(echo "$S6_END - $S5_END" | bc)
S7_DUR=$(echo "$S7_END - $S6_END" | bc)
S8_DUR=$(echo "$S8_END - $S7_END" | bc)
S9_DUR=$(echo "$S9_END - $S8_END" | bc)
S10_DUR=$(echo "$S10_END - $S9_END" | bc)

# --- Image Input List ---
# This list defines the order of '-i' flags and corresponds to the filtergraph stream indexes.
# The audio file is input 0. Images start from input 1.
IMAGE_INPUTS=(
    # Scene 1
    "blueprint_bg.jpg"
    "gears-background.png"
    "winding-path.jpg"
    "gears-midground.png"
    "gears-foreground.png"
    # Scene 2
    "tech_city_background.jpg"
    "modern_city.png"
    "digital_grid.png"
    "glowing_particles.png"
    "glowing-data.png"
    # Scene 3
    "city_background.jpg"
    "buildings_midground.png"
    "stock-chart-midground.png"
    "aws-logo.png"
    # Scene 4
    "dark_clouds.jpg"
    "city-skyline-mid.png"
    "soundwaves_overlay.png"
    "rain_overlay.png"
    # Scene 5
    "rainy-city.jpg"
    "sad-people.png"
    "broken_gears.png"
    "falling-chart.png"
    "cracked_glass_overlay.png"
    # Scene 6
    "data-center-background.jpg"
    "server-racks-midground.png"
    "amazon_warehouse_midground.png"
    "amazon_box_foreground.png"
    "delivery_drone_foreground.png"
    # Scene 7
    "sky-background.jpg"
    "mountains-far.png"
    "single-tree.png"
    "phoenix_from_ashes.png"
    "bright_sky.jpg"
    # Scene 8
    "empty_city_street_background.jpg"
    "buildings-foreground.png"
    "abstract_gears_background.jpg"
    "biohazard_symbol_overlay.png"
    # Scene 9
    "sunrise-field.jpg"
    "forest-midground.png"
    "fortress.png"
    "resilient-plant.png"
    "data_overlay_foreground.png"
    # Scene 10
    "tech_cityscape.jpg"
    "server-room.jpg"
    "cloud_servers_midground.png"
    "data_stream.png"
    "data_stream_foreground.png"
    "tech-overlay-foreground.png"
)

# Build the `-i` flags for ffmpeg
FFMPEG_INPUTS=""
for img in "${IMAGE_INPUTS[@]}"; do
    FFMPEG_INPUTS+=" -i \"$IMAGE_DIR/$img\""
done

# --- FFmpeg Command ---
# Using eval to correctly parse the quoted input strings
eval "ffmpeg -y \
-i \"$AUDIO_FILE\" \
$FFMPEG_INPUTS \
-filter_complex \"
/* --- Scene 1: Vision (0 - 5.76s) --- */
/* Effect: Slow zoom in + horizontal pan */
[1:v]scale=${W}*1.1:-1,format=rgba,zoompan=z='min(zoom+0.0002,1.2)':d=${S1_DUR}*${FPS}:s=${W}x${H}:fps=${FPS}[s1_l1];
[2:v]scale=${W}*1.2:-1,format=rgba[s1_l2_scaled];
[3:v]scale=${W}*1.1:-1,format=rgba[s1_l3_scaled];
[4:v]scale=${W}*1.3:-1,format=rgba[s1_l4_scaled];
[5:v]scale=${W}*1.4:-1,format=rgba[s1_l5_scaled];
[s1_l1][s1_l2_scaled]overlay=x='(W-w)/2 - t/${S1_DUR}*100':y='(H-h)/2'[s1_v1];
[s1_v1][s1_l3_scaled]overlay=x='W-w - t/${S1_DUR}*150':y='H-h'[s1_v2];
[s1_v2][s1_l4_scaled]overlay=x='(W-w)/2 + t/${S1_DUR}*250':y='(H-h)/2'[s1_v3];
[s1_v3][s1_l5_scaled]overlay=x='(W-w)/2 - t/${S1_DUR}*350':y='(H-h)/2',trim=duration=${S1_DUR}[scene1];

/* --- Scene 2: Dot-com Boom (5.76 - 12.38s) --- */
/* Effect: Upward pan */
nullsrc=s=${W}x${H}:r=${FPS}:d=${S2_DUR}[s2_base];
[6:v]scale=${W}*1.2:-1,format=rgba[s2_l1_scaled];
[7:v]scale=${W}*1.2:-1,format=rgba[s2_l2_scaled];
[8:v]scale=-1:${H}*1.3,format=rgba[s2_l3_scaled];
[9:v]scale=${W}*1.5:-1,format=rgba[s2_l4_scaled];
[10:v]scale=-1:${H}*1.6,format=rgba[s2_l5_scaled];
[s2_base][s2_l1_scaled]overlay=x='(W-w)/2':y='-(h-H)*(t/${S2_DUR})'[s2_v1];
[s2_v1][s2_l2_scaled]overlay=x='(W-w)/2':y='H-h'[s2_v2];
[s2_v2][s2_l3_scaled]overlay=x='W/4-w/2':y='t/${S2_DUR}*(H+h)-h'[s2_v3];
[s2_v3][s2_l4_scaled]overlay=y=0:x='(t/${S2_DUR})*(W+w)-w'[s2_v4];
[s2_v4][s2_l5_scaled]overlay=x='W-w':y='(H+h)-(t/${S2_DUR})*(H+h)',trim=duration=${S2_DUR}[scene2];

/* --- Scene 3: Stocks Go Up (12.38 - 18.02s) --- */
/* Effect: Fast zoom into a focal point */
[11:v]scale=${W}*1.5:-1,format=rgba,zoompan=z='1.5-t/${S3_DUR}*0.4':x='W/2-(iw/2)/z':y='H/2-(ih/2)/z':d=${S3_DUR}*${FPS}:s=${W}x${H}:fps=${FPS}[s3_l1];
[12:v]scale=${W}*1.1:-1,format=rgba[s3_l2_scaled];
[13:v]scale=${W}*0.8:-1,format=rgba[s3_l3_scaled];
[14:v]scale=${W}*0.1:-1,format=rgba[s3_l4_scaled];
[s3_l1][s3_l2_scaled]overlay=x='(W-w)/2':y='H-h'[s3_v1];
[s3_v1][s3_l3_scaled]overlay=x='(W-w)/2':y='(H-h)/2 + 50*sin(t*2)'[s3_v2];
[s3_v2][s3_l4_scaled]overlay=x='W*0.8':y='H*0.1',trim=duration=${S3_DUR}[scene3];

/* --- Scene 4: Doubt (18.02 - 24.16s) --- */
/* Effect: Ominous downward pan with overlays */
nullsrc=s=${W}x${H}:r=${FPS}:d=${S4_DUR}[s4_base];
[15:v]scale=-1:${H}*1.3,format=rgba[s4_l1_scaled];
[16:v]scale=${W}*1.2:-1,format=rgba[s4_l2_scaled];
[17:v]scale=${W}*1.2:-1,format=rgba[s4_l3_scaled];
[18:v]scale=${W}*1.0:-1,format=rgba[s4_l4_scaled];
[s4_base][s4_l1_scaled]overlay=x='(W-w)/2':y='(h-H)*(t/${S4_DUR}) - (h-H)'[s4_v1];
[s4_v1][s4_l2_scaled]overlay=x='(W-w)/2':y='(H-h)/2'[s4_v2];
[s4_v2][s4_l3_scaled]overlay=x=0:y=0:eval=frame,opacity=0.4[s4_v3];
[s4_v3][s4_l4_scaled]overlay=x=0:y=0:eval=frame,opacity=0.6,trim=duration=${S4_DUR}[scene4];

/* --- Scene 5: Crash (24.16 - 31.86s) --- */
/* Effect: Diagonal pan with multiple falling/cracking elements */
nullsrc=s=${W}x${H}:r=${FPS}:d=${S5_DUR}[s5_base];
[19:v]scale=${W}*1.3:-1,format=rgba[s5_l1_scaled];
[20:v]scale=${W}*0.5:-1,format=rgba[s5_l2_scaled];
[21:v]scale=${W}*0.6:-1,format=rgba[s5_l3_scaled];
[22:v]scale=${W}*0.7:-1,format=rgba[s5_l4_scaled];
[23:v]scale=${W}*1.0:-1,format=rgba[s5_l5_scaled];
[s5_base][s5_l1_scaled]overlay=x='-t/${S5_DUR}*300':y='-t/${S5_DUR}*150'[s5_v1];
[s5_v1][s5_l2_scaled]overlay=x='W/2-w/2':y='H-h',opacity=0.8[s5_v2];
[s5_v2][s5_l3_scaled]overlay=x='t/${S5_DUR}*W':y='(H-h)/2',opacity=0.7[s5_v3];
[s5_v3][s5_l4_scaled]overlay=x='W/2-w/2':y='-h+(t/${S5_DUR})*(H+h)'[s5_v4];
[s5_v4][s5_l5_scaled]overlay=x=0:y=0,fade=in:st=0:d=1:alpha=1,trim=duration=${S5_DUR}[scene5];

/* --- Scene 6: Everything Store (31.86 - 36.50s) --- */
/* Effect: Wide horizontal pan revealing scale, independent object movement */
nullsrc=s=${W}x${H}:r=${FPS}:d=${S6_DUR}[s6_base];
[24:v]scale=${W}*1.5:-1,format=rgba[s6_l1_scaled];
[25:v]scale=${W}*1.4:-1,format=rgba[s6_l2_scaled];
[26:v]scale=${W}*1.3:-1,format=rgba[s6_l3_scaled];
[27:v]scale=${W}*0.4:-1,format=rgba[s6_l4_scaled];
[28:v]scale=${W}*0.3:-1,format=rgba[s6_l5_scaled];
[s6_base][s6_l1_scaled]overlay=x='-(w-W)*(t/${S6_DUR})':y=0[s6_v1];
[s6_v1][s6_l2_scaled]overlay=x='-(w-W)*(t/${S6_DUR})*0.8':y='H-h'[s6_v2];
[s6_v2][s6_l3_scaled]overlay=x='(W-w)/2':y='H-h'[s6_v3];
[s6_v3][s6_l4_scaled]overlay=x='W-(t/${S6_DUR})*(W+w)':y='H*0.75-h/2'[s6_v4];
[s6_v4][s6_l5_scaled]overlay=x='-w+(t/${S6_DUR})*(W+w)':y='H*0.1',trim=duration=${S6_DUR}[scene6];

/* --- Scene 7: Long Term (36.50 - 45.80s) --- */
/* Effect: Gentle rotation and zoom */
[33:v]scale=${W}*1.5:-1,format=rgba,zoompan=z='min(zoom+0.0001,1.1)':d=${S7_DUR}*${FPS}:s=${W}x${H}:fps=${FPS},rotate='t*0.005*PI/180'[s7_l1];
[29:v]scale=${W}*1.1:-1,format=rgba[s7_l2_scaled];
[30:v]scale=${W}*1.2:-1,format=rgba[s7_l3_scaled];
[31:v]scale=${W}*0.4:-1,format=rgba[s7_l4_scaled];
[32:v]scale=${W}*0.5:-1,format=rgba[s7_l5_scaled];
[s7_l1][s7_l2_scaled]overlay=x='(W-w)/2':y='(H-h)/2'[s7_v1];
[s7_v1][s7_l3_scaled]overlay=x='(W-w)/2':y='H-h'[s7_v2];
[s7_v2][s7_l4_scaled]overlay=x='W*0.2-w/2':y='H-h'[s7_v3];
[s7_v3][s7_l5_scaled]overlay=x='W/2-w/2':y='(H-h)/2',fade=in:st=1:d=2:alpha=1,trim=duration=${S7_DUR}[scene7];

/* --- Scene 8: Unprofitable (45.80 - 53.28s) --- */
/* Effect: Static shot with a slow, ominous zoom and pulsing overlay */
[34:v]scale=${W}*1.2:-1,format=rgba,zoompan=z='min(zoom+0.0001,1.05)':d=${S8_DUR}*${FPS}:s=${W}x${H}:fps=${FPS}[s8_l1];
[35:v]scale=${W}*1.1:-1,format=rgba[s8_l2_scaled];
[36:v]scale=${W}:-1,format=rgba[s8_l3_scaled];
[37:v]scale=${W}*0.2:-1,format=rgba[s8_l4_scaled];
[s8_l1][s8_l2_scaled]overlay=x='(W-w)/2':y='H-h'[s8_v1];
[s8_v1][s8_l3_scaled]overlay=x=0:y=0:eval=frame,opacity=0.15[s8_v2];
[s8_v2][s8_l4_scaled]overlay=x='W-w-20':y=20,opacity='0.2+0.1*sin(t*2)',trim=duration=${S8_DUR}[scene8];

/* --- Scene 9: The Bet (53.28 - 60.60s) --- */
/* Effect: Ken Burns (pan + zoom) */
[38:v]scale=${W}*1.5:-1,format=rgba,zoompan=z='min(zoom+0.0005,1.3)':x='iw/2-(iw/zoom/2)+t*5':y='ih/2-(ih/zoom/2)':d=${S9_DUR}*${FPS}:s=${W}x${H}:fps=${FPS}[s9_l1];
[39:v]scale=${W}*1.2:-1,format=rgba[s9_l2_scaled];
[40:v]scale=${W}*0.8:-1,format=rgba[s9_l3_scaled];
[41:v]scale=${W}*0.4:-1,format=rgba[s9_l4_scaled];
[42:v]scale=${W}*1.0:-1,format=rgba[s9_l5_scaled];
[s9_l1][s9_l2_scaled]overlay=x='(W-w)/2':y='(H-h)/2'[s9_v1];
[s9_v1][s9_l3_scaled]overlay=x='W-w':y='H-h'[s9_v2];
[s9_v2][s9_l4_scaled]overlay=x=100:y='H-h'[s9_v3];
[s9_v3][s9_l5_scaled]overlay=x=0:y=0,opacity=0.5,trim=duration=${S9_DUR}[scene9];

/* --- Scene 10: Global Empire (60.60 - end) --- */
/* Effect: Multi-directional parallax, revealing complexity */
nullsrc=s=${W}x${H}:r=${FPS}:d=${S10_DUR}[s10_base];
[43:v]scale=${W}*1.2:-1,format=rgba[s10_l1_scaled];
[44:v]scale=${W}*1.3:-1,format=rgba[s10_l2_scaled];
[45:v]scale=${W}*1.4:-1,format=rgba[s10_l3_scaled];
[46:v]scale=-1:${H}*1.5,format=rgba[s10_l4_scaled];
[47:v]scale=-1:${H}*1.6,format=rgba[s10_l5_scaled];
[48:v]scale=${W}:-1,format=rgba[s10_l6_scaled];
[s10_base][s10_l1_scaled]overlay=x='(W-w)/2-t/${S10_DUR}*100':y='-t/${S10_DUR}*50'[s10_v1];
[s10_v1][s10_l2_scaled]overlay=x='(W-w)/2':y='H-h'[s10_v2];
[s10_v2][s10_l3_scaled]overlay=x='t/${S10_DUR}*200':y='(H-h)/2'[s10_v3];
[s10_v3][s10_l4_scaled]overlay=x='W/2-w/2':y='-h+(t/${S10_DUR})*(H+h)'[s10_v4];
[s10_v4][s10_l5_scaled]overlay=x='(W-w)/2':y='H-(t/${S10_DUR})*(H+h)'[s10_v5];
[s10_v5][s10_l6_scaled]overlay=x=0:y=0,opacity=0.4,trim=duration=${S10_DUR}[scene10];

/* --- Concatenate Scenes --- */
[scene1][scene2][scene3][scene4][scene5][scene6][scene7][scene8][scene9][scene10]concat=n=10:v=1:a=0[v]
\" \
-map \"[v]\" -map 0:a \
-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
-c:a aac -b:a 192k \
-shortest \"$OUTPUT_FILE\"
"
```