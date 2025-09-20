Here is a ready-to-run Bash script to generate the parallax video using FFmpeg.

### Instructions

1.  **Save the Code**: Save the following code block as a shell script file, for example, `create_parallax.sh`.
2.  **Prerequisites**:
    *   Make sure you have `ffmpeg` and `ffprobe` installed and accessible in your system's PATH.
    *   Ensure you have the `bc` command-line calculator installed (it's standard on most Linux distros).
3.  **File Structure**: Your files must be organized as follows:
    ```
    .
    ├── create_parallax.sh  (this script)
    ├── assets/
    │   └── images/
    │       ├── abstract_gears_background.jpg
    │       ├── aws-logo.png
    │       └── ... (all other images)
    └── BOOKS/
        └── Temp/
            └── TTS/
                └── Lesson_8.wav
    ```
4.  **Font Path**: **IMPORTANT!** Edit the `FONT_PATH` variable in the script to point to a valid TrueType font file (`.ttf`) on your system.
    *   **Linux**: A common path is `/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf`.
    *   **macOS**: Look in `/System/Library/Fonts/` or `~/Library/Fonts/`.
    *   **Windows (using WSL/Git Bash)**: You can use `/mnt/c/Windows/Fonts/arial.ttf`.
5.  **Execute**: Open your terminal, navigate to the directory where you saved the script, make it executable, and run it:
    ```sh
    chmod +x create_parallax.sh
    ./create_parallax.sh
    ```

The script will print the full `ffmpeg` command it's running and will generate the final video as `Lesson_8_parallax.mp4`.

---

### `create_parallax.sh`

```bash
#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
OUTPUT_FILE="Lesson_8_parallax.mp4"
AUDIO_FILE="BOOKS/Temp/TTS/Lesson_8.wav"
IMAGE_DIR="assets/images"

# Video Properties
W=3840
H=2160
FPS=30

# IMPORTANT: Set this to a valid font file on your system
FONT_PATH="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
if [ ! -f "$FONT_PATH" ]; then
    echo "ERROR: Font file not found at '$FONT_PATH'"
    echo "Please edit the FONT_PATH variable in this script."
    exit 1
fi

# --- Get Audio Duration ---
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE")
echo "Audio duration: $DURATION seconds"

# --- Asset & Input Management ---
# Array of images to use as layers. Order matters for input stream indexing.
IMAGE_ASSETS=(
    "abstract_gears_background.jpg" #0
    "blueprint_bg.jpg" #1
    "broken_gears.png" #2
    "gears-background.png" #3
    "tech-overlay-foreground.png" #4
    "city_background.jpg" #5
    "city-skyline-mid.png" #6
    "buildings-foreground.png" #7
    "dark_clouds.jpg" #8
    "empty_city_street_background.jpg" #9
    "rain_overlay.png" #10
    "biohazard_symbol_overlay.png" #11
    "rainy-city.jpg" #12
    "sad-people.png" #13
    "cracked_glass_overlay.png" #14
    "gears-midground.png" #15
    "gears-foreground.png" #16
    "tech_cityscape.jpg" #17
    "fortress.png" #18
    "digital_grid.png" #19
    "server-room.jpg" #20
    "server-racks-midground.png" #21
    "cloud_servers_midground.png" #22
    "delivery_drone_foreground.png" #23
    "tech_city_background.jpg" #24
    "falling-chart.png" #25
    "data_stream_foreground.png" #26
    "data_center_background.jpg" #27
    "amazon_warehouse_midground.png" #28
    "amazon_box_foreground.png" #29
    "sky-background.jpg" #30
    "stock-chart-midground.png" #31
    "glowing_particles.png" #32
    "resilient-plant.png" #33
    "glowing-data.png" #34
    "sunrise-field.jpg" #35
    "mountains-far.png" #36
    "forest-midground.png" #37
    "aws-logo.png" #38
)

# Build the -i input list for ffmpeg
FFMPEG_INPUTS=""
for asset in "${IMAGE_ASSETS[@]}"; do
    FFMPEG_INPUTS+="-i \"$IMAGE_DIR/$asset\" "
done
AUDIO_INPUT_INDEX=${#IMAGE_ASSETS[@]}
FFMPEG_INPUTS+="-i \"$AUDIO_FILE\""

# --- Filtergraph Generation ---

# We oversize images to allow movement without showing black borders
SCALE_W=$(echo "$W * 1.2" | bc)
SCALE_H=$(echo "$H * 1.2" | bc)

# Part 1: Prepare and scale all image inputs
FILTER_COMPLEX="color=c=black:s=${W}x${H}:d=${DURATION}[base];"
for i in "${!IMAGE_ASSETS[@]}"; do
    FILTER_COMPLEX+="[${i}:v]scale=${SCALE_W}:${SCALE_H}:force_original_aspect_ratio=decrease,pad=${SCALE_W}:${SCALE_H}:-1:-1:color=black@0,format=yuva420p[img${i}];"
done

# --- Helper function for Parallax Calculations ---
# Usage: gen_pan_eq "X" "START_X" "END_X" "SCENE_START" "SCENE_DUR"
# Returns the full FFmpeg expression string for x or y
gen_pan_eq() {
    local axis="$1"
    local start_pos="$2"
    local end_pos="$3"
    local scene_start="$4"
    local scene_dur="$5"
    local speed=$(echo "scale=4; ($end_pos - $start_pos) / $scene_dur" | bc)
    echo "'$start_pos + $speed * (t - $scene_start)'"
}

# --- Part 2: Scene Composition ---

# Scene 1 (0.00 - 4.42): "Crisis Test System" - Panning
S1_START=0.0; S1_END=4.42; S1_DUR=$(echo "$S1_END - $S1_START" | bc)
S1_BG_X=$(gen_pan_eq "x" 0 -50 "$S1_START" "$S1_DUR")
S1_M1_X=$(gen_pan_eq "x" -50 100 "$S1_START" "$S1_DUR")
S1_M2_X=$(gen_pan_eq "x" 100 -150 "$S1_START" "$S1_DUR")
S1_FG_X=$(gen_pan_eq "x" -200 300 "$S1_START" "$S1_DUR")
FILTER_COMPLEX+="[img1][img3]overlay=x=$S1_BG_X:y=0[s1_l1];"
FILTER_COMPLEX+="[s1_l1][img2]overlay=x=$S1_M1_X:y=100[s1_l2];"
FILTER_COMPLEX+="[s1_l2][img4]overlay=x=$S1_FG_X:y=0[scene1];"

# Scene 2 (4.42 - 9.52): "World Stops" - Zooming
S2_START=4.42; S2_END=9.52; S2_DUR=$(echo "$S2_END - $S2_START" | bc)
S2_BG_Z_EQ="1 + 0.1 * (t-$S2_START)/$S2_DUR"   # Slow zoom
S2_M_Z_EQ="1 + 0.15 * (t-$S2_START)/$S2_DUR"  # Medium zoom
S2_FG_Z_EQ="1 + 0.2 * (t-$S2_START)/$S2_DUR"   # Fast zoom
FILTER_COMPLEX+="[img5]scale=w='iw*$S2_BG_Z_EQ':h='ih*$S2_BG_Z_EQ'[s2_bg_z];"
FILTER_COMPLEX+="[img6]scale=w='iw*$S2_M_Z_EQ':h='ih*$S2_M_Z_EQ'[s2_m_z];"
FILTER_COMPLEX+="[img7]scale=w='iw*$S2_FG_Z_EQ':h='ih*$S2_FG_Z_EQ'[s2_fg_z];"
FILTER_COMPLEX+="[s2_bg_z][s2_m_z]overlay=x=(W-w)/2:y=(H-h)/2[s2_l1];"
FILTER_COMPLEX+="[s2_l1][s2_fg_z]overlay=x=(W-w)/2:y=(H-h)/2[s2_l2];"
FILTER_COMPLEX+="[s2_l2][img8]overlay=x=0:y=0:format=auto[scene2];"

# Scene 3 (9.52 - 13.76): "Pandemic Shutdown" - Vertical Scroll & Static
S3_START=9.52; S3_END=13.76; S3_DUR=$(echo "$S3_END - $S3_START" | bc)
S3_RAIN_Y=$(gen_pan_eq "y" -${H} 0 "$S3_START" "$S3_DUR")
FILTER_COMPLEX+="[img9][img10]overlay=x=0:y=$S3_RAIN_Y:format=auto[s3_l1];"
FILTER_COMPLEX+="[s3_l1][img11]overlay=x=(W-w)/2:y=(H-h)/2[scene3];"

# Scene 4 (13.76 - 18.16): "Lockdown" - Gentle Pan Down
S4_START=13.76; S4_END=18.16; S4_DUR=$(echo "$S4_END - $S4_START" | bc)
S4_SAD_Y=$(gen_pan_eq "y" 0 150 "$S4_START" "$S4_DUR")
FILTER_COMPLEX+="[img12][img13]overlay=x=(W-w)/2:y=$S4_SAD_Y[s4_l1];"
FILTER_COMPLEX+="[s4_l1][img14]overlay=x=0:y=0[scene4];"

# Scene 5 (18.16 - 24.52): "The Amazon Machine" - Rotation
S5_START=18.16; S5_END=24.52; S5_DUR=$(echo "$S5_END - $S5_START" | bc)
S5_BG_ROT_EQ="2 * (t-$S5_START)/$S5_DUR * PI/180"   # Slow clockwise
S5_M_ROT_EQ="-4 * (t-$S5_START)/$S5_DUR * PI/180"  # Medium counter-clockwise
S5_FG_ROT_EQ="8 * (t-$S5_START)/$S5_DUR * PI/180"   # Fast clockwise
FILTER_COMPLEX+="[img0]rotate=a=$S5_BG_ROT_EQ:c=none:ow=rotw(iw):oh=roth(ih)[s5_bg_r];"
FILTER_COMPLEX+="[img15]rotate=a=$S5_M_ROT_EQ:c=none:ow=rotw(iw):oh=roth(ih)[s5_m_r];"
FILTER_COMPLEX+="[img16]rotate=a=$S5_FG_ROT_EQ:c=none:ow=rotw(iw):oh=roth(ih)[s5_fg_r];"
FILTER_COMPLEX+="[s5_bg_r][s5_m_r]overlay=x=(W-w)/2:y=(H-h)/2[s5_l1];"
FILTER_COMPLEX+="[s5_l1][s5_fg_r]overlay=x=(W-w)/2:y=(H-h)/2[scene5];"

# Scene 6 (24.52 - 27.06): "Essential Infrastructure" - Upward Scroll
S6_START=24.52; S6_END=27.06; S6_DUR=$(echo "$S6_END - $S6_START" | bc)
S6_GRID_Y=$(gen_pan_eq "y" ${H} 0 "$S6_START" "$S6_DUR")
FILTER_COMPLEX+="[img17][img18]overlay=x=(W-w)/2:y=(H-h)/2[s6_l1];"
FILTER_COMPLEX+="[s6_l1][img19]overlay=x=0:y=$S6_GRID_Y[scene6];"

# Scene 7 (27.06 - 35.48): "The Ultimate Test" - Dolly Zoom (simulated)
S7_START=27.06; S7_END=35.48; S7_DUR=$(echo "$S7_END - $S7_START" | bc)
S7_BG_Z_EQ="1 + 0.2 * (t-$S7_START)/$S7_DUR"   # BG zooms in
S7_FG_Z_EQ="1.2 - 0.2 * (t-$S7_START)/$S7_DUR" # FG zooms out
FILTER_COMPLEX+="[img20]scale=w='iw*$S7_BG_Z_EQ':h='ih*$S7_BG_Z_EQ'[s7_bg_z];"
FILTER_COMPLEX+="[img23]scale=w='iw*$S7_FG_Z_EQ':h='ih*$S7_FG_Z_EQ'[s7_fg_z];"
FILTER_COMPLEX+="[s7_bg_z][img21]overlay=x=(W-w)/2:y=(H-h)/2[s7_l1];"
FILTER_COMPLEX+="[s7_l1][img22]overlay=x=(W-w)/2+100:y=(H-h)/2-50[s7_l2];"
FILTER_COMPLEX+="[s7_l2][s7_fg_z]overlay=x=(W-w)/2:y=(H-h)/2[scene7];"

# Scene 8 (35.48 - 39.92): "Strained but Not Broken" - Diagonal Pan
S8_START=35.48; S8_END=39.92; S8_DUR=$(echo "$S8_END - $S8_START" | bc)
S8_CHART_X=$(gen_pan_eq "x" 100 800 "$S8_START" "$S8_DUR")
S8_CHART_Y=$(gen_pan_eq "y" 100 1000 "$S8_START" "$S8_DUR")
S8_STREAM_X=$(gen_pan_eq "x" -${W} ${W} "$S8_START" "$S8_DUR")
FILTER_COMPLEX+="[img24][img25]overlay=x=$S8_CHART_X:y=$S8_CHART_Y[s8_l1];"
FILTER_COMPLEX+="[s8_l1][img26]overlay=x=$S8_STREAM_X:y=H/3[scene8];"

# Scene 9 (39.92 - 47.82): "Hiring Spree" - Fast Pan Right
S9_START=39.92; S9_END=47.82; S9_DUR=$(echo "$S9_END - $S9_START" | bc)
S9_BG_X=$(gen_pan_eq "x" -200 0 "$S9_START" "$S9_DUR")
S9_M_X=$(gen_pan_eq "x" -300 0 "$S9_START" "$S9_DUR")
S9_FG_X=$(gen_pan_eq "x" -500 0 "$S9_START" "$S9_DUR")
FILTER_COMPLEX+="[img27][img28]overlay=x=$S9_M_X:y=(H-h)/2[s9_l1];"
FILTER_COMPLEX+="[s9_l1][img29]overlay=x=$S9_FG_X:y=(H-h)/2+200[scene9];"

# Scene 10 (47.82 - 55.08): "Revenue Explodes" - Pan Up
S10_START=47.82; S10_END=55.08; S10_DUR=$(echo "$S10_END - $S10_START" | bc)
S10_CHART_Y=$(gen_pan_eq "y" 200 -300 "$S10_START" "$S10_DUR")
S10_PARTICLES_Y=$(gen_pan_eq "y" ${H} -${H} "$S10_START" "$S10_DUR")
FILTER_COMPLEX+="[img30][img31]overlay=x=(W-w)/2:y=$S10_CHART_Y[s10_l1];"
FILTER_COMPLEX+="[s10_l1][img32]overlay=x=0:y=$S10_PARTICLES_Y[scene10];"

# Scene 11 (55.08 - 62.22): "Ultimate Validation" - Fade & Zoom
S11_START=55.08; S11_END=62.22; S11_DUR=$(echo "$S11_END - $S11_START" | bc)
S11_BG_FADE_EQ="1 - (t-$S11_START)/$S11_DUR" # Fade out
S11_PLANT_Z_EQ="1 + 0.3 * (t-$S11_START)/$S11_DUR" # Slow zoom in
S11_DATA_X=$(gen_pan_eq "x" -300 300 "$S11_START" "$S11_DUR")
FILTER_COMPLEX+="[base][img8]blend=all_expr='A*PA+$S11_BG_FADE_EQ*B*(1-PA)'[s11_bg_f];"
FILTER_COMPLEX+="[img33]scale=w='iw*$S11_PLANT_Z_EQ':h='ih*$S11_PLANT_Z_EQ'[s11_plant_z];"
FILTER_COMPLEX+="[s11_bg_f][s11_plant_z]overlay=x=(W-w)/2:y=(H-h)/2[s11_l1];"
FILTER_COMPLEX+="[s11_l1][img34]overlay=x=$S11_DATA_X:y=(H-h)/2[scene11];"

# Scene 12 (62.22 - END): "Paid Off" - Gentle Zoom Out & Fade In Logo
S12_START=62.22; S12_END=${DURATION}; S12_DUR=$(echo "$S12_END - $S12_START" | bc)
S12_Z_EQ="1.2 - 0.2 * (t-$S12_START)/$S12_DUR" # Zoom out
S12_LOGO_FADE_IN_START=$(echo "$S12_START + $S12_DUR * 0.5" | bc)
FILTER_COMPLEX+="[img35]scale=w='iw*$S12_Z_EQ':h='ih*$S12_Z_EQ'[s12_bg_z];"
FILTER_COMPLEX+="[s12_bg_z][img36]overlay=x=(W-w)/2:y=(H-h)/2[s12_l1];"
FILTER_COMPLEX+="[s12_l1][img37]overlay=x=(W-w)/2:y=(H-h)/2+200[s12_l2];"
FILTER_COMPLEX+="[s12_l2][img38]overlay=x=(W-w)/2:y=(H-h)/2:enable='gt(t,$S12_LOGO_FADE_IN_START)',fade=in:st=$S12_LOGO_FADE_IN_START:d=1[scene12];"

# --- Part 3: Scene Assembly ---
FILTER_COMPLEX+="\
[base][scene1]overlay=enable='between(t,$S1_START,$S1_END)'[v1]; \
[v1][scene2]overlay=enable='between(t,$S2_START,$S2_END)'[v2]; \
[v2][scene3]overlay=enable='between(t,$S3_START,$S3_END)'[v3]; \
[v3][scene4]overlay=enable='between(t,$S4_START,$S4_END)'[v4]; \
[v4][scene5]overlay=enable='between(t,$S5_START,$S5_END)'[v5]; \
[v5][scene6]overlay=enable='between(t,$S6_START,$S6_END)'[v6]; \
[v6][scene7]overlay=enable='between(t,$S7_START,$S7_END)'[v7]; \
[v7][scene8]overlay=enable='between(t,$S8_START,$S8_END)'[v8]; \
[v8][scene9]overlay=enable='between(t,$S9_START,$S9_END)'[v9]; \
[v9][scene10]overlay=enable='between(t,$S10_START,$S10_END)'[v10]; \
[v10][scene11]overlay=enable='between(t,$S11_START,$S11_END)'[v11]; \
[v11][scene12]overlay=enable='between(t,$S12_START,$S12_END)'[video_no_subs];"

# --- Part 4: Subtitles ---
# Define text style for readability
TEXT_STYLE="fontfile='$FONT_PATH':fontsize=96:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=10:x=(w-text_w)/2:y=h-th-h*0.1"
FILTER_COMPLEX+="\
[video_no_subs]\
drawtext=$TEXT_STYLE:text='Key':enable='between(t,0.00,0.42)',\
drawtext=$TEXT_STYLE:text='lesson.':enable='between(t,0.42,0.86)',\
drawtext=$TEXT_STYLE:text='Your':enable='between(t,1.38,1.56)',\
drawtext=$TEXT_STYLE:text='system':enable='between(t,1.56,2.06)',\
drawtext=$TEXT_STYLE:text='is':enable='between(t,2.06,2.32)',\
drawtext=$TEXT_STYLE:text='only':enable='between(t,2.32,2.76)',\
drawtext=$TEXT_STYLE:text='tested':enable='between(t,2.76,3.26)',\
drawtext=$TEXT_STYLE:text='in':enable='between(t,3.26,3.52)',\
drawtext=$TEXT_STYLE:text='a':enable='between(t,3.52,3.62)',\
drawtext=$TEXT_STYLE:text='true':enable='between(t,3.62,3.90)',\
drawtext=$TEXT_STYLE:text='crisis.':enable='between(t,3.90,4.42)',\
drawtext=$TEXT_STYLE:text='Late':enable='between(t,5.26,5.52)',\
drawtext=$TEXT_STYLE:text='2019':enable='between(t,5.52,6.26)',\
drawtext=$TEXT_STYLE:text='rolled':enable='between(t,6.26,6.78)',\
drawtext=$TEXT_STYLE:text='into':enable='between(t,6.78,7.12)',\
drawtext=$TEXT_STYLE:text='2020,':enable='between(t,7.12,7.72)',\
drawtext=$TEXT_STYLE:text='and':enable='between(t,7.92,8.40)',\
drawtext=$TEXT_STYLE:text='the':enable='between(t,8.40,8.66)',\
drawtext=$TEXT_STYLE:text='world':enable='between(t,8.66,8.92)',\
drawtext=$TEXT_STYLE:text='stopped.':enable='between(t,8.92,9.52)',\
drawtext=$TEXT_STYLE:text='A':enable='between(t,9.98,10.14)',\
drawtext=$TEXT_STYLE:text='global':enable='between(t,10.14,10.52)',\
drawtext=$TEXT_STYLE:text='pandemic':enable='between(t,10.52,11.12)',\
drawtext=$TEXT_STYLE:text='called':enable='between(t,11.12,11.46)',\
drawtext=$TEXT_STYLE:text='COVID':enable='between(t,11.46,11.82)',\
drawtext=$TEXT_STYLE:text='-19':enable='between(t,11.82,12.36)',\
drawtext=$TEXT_STYLE:text='shut':enable='between(t,12.36,12.78)',\
drawtext=$TEXT_STYLE:text='down':enable='between(t,12.78,13.04)',\
drawtext=$TEXT_STYLE:text='everything.':enable='between(t,13.04,13.76)',\
drawtext=$TEXT_STYLE:text='Stores':enable='between(t,14.28,14.68)',\
drawtext=$TEXT_STYLE:text='closed,':enable='between(t,14.68,15.02)',\
drawtext=$TEXT_STYLE:text='offices':enable='between(t,15.44,15.82)',\
drawtext=$TEXT_STYLE:text='closed,':enable='between(t,15.82,16.24)',\
drawtext=$TEXT_STYLE:text='people':enable='between(t,16.58,16.90)',\
drawtext=$TEXT_STYLE:text='were':enable='between(t,16.90,17.10)',\
drawtext=$TEXT_STYLE:text='locked':enable='between(t,17.10,17.42)',\
drawtext=$TEXT_STYLE:text='in':enable='between(t,17.42,17.66)',\
drawtext=$TEXT_STYLE:text='their':enable='between(t,17.66,17.82)',\
drawtext=$TEXT_STYLE:text='homes.':enable='between(t,17.82,18.16)',\
drawtext=$TEXT_STYLE:text='And':enable='between(t,18.68,18.80)',\
drawtext=$TEXT_STYLE:text='suddenly,':enable='between(t,18.80,19.28)',\
drawtext=$TEXT_STYLE:text='the':enable='between(t,19.62,19.70)',\
drawtext=$TEXT_STYLE:text='machine':enable='between(t,19.70,20.10)',\
drawtext=$TEXT_STYLE:text='that':enable='between(t,20.10,20.40)',\
drawtext=$TEXT_STYLE:text='Amazon':enable='between(t,20.40,20.70)',\
drawtext=$TEXT_STYLE:text='had':enable='between(t,20.70,21.04)',\
drawtext=$TEXT_STYLE:text='been':enable='between(t,21.04,21.20)',\
drawtext=$TEXT_STYLE:text='building':enable='between(t,21.20,21.54)',\
drawtext=$TEXT_STYLE:text='for':enable='between(t,21.54,21.78)',\
drawtext=$TEXT_STYLE:text='25':enable='between(t,21.78,22.38)',\
drawtext=$TEXT_STYLE:text='years':enable='between(t,22.38,22.88)',\
drawtext=$TEXT_STYLE:text='was':enable='between(t,22.88,23.26)',\
drawtext=$TEXT_STYLE:text='not':enable='between(t,23.26,23.54)',\
drawtext=$TEXT_STYLE:text='just':enable='between(t,23.54,23.86)',\
drawtext=$TEXT_STYLE:text='a':enable='between(t,23.86,24.02)',\
drawtext=$TEXT_STYLE:text='convenience.':enable='between(t,24.02,24.52)',\
drawtext=$TEXT_STYLE:text='It':enable='between(t,24.98,25.12)',\
drawtext=$TEXT_STYLE:text='became':enable='between(t,25.12,25.48)',\
drawtext=$TEXT_STYLE:text='essential':enable='between(t,25.48,26.26)',\
drawtext=$TEXT_STYLE:text='infrastructure.':enable='between(t,26.26,27.06)',\
drawtext=$TEXT_STYLE:text='The':enable='between(t,27.06,27.70)',\
drawtext=$TEXT_STYLE:text='warehouses,':enable='between(t,27.70,28.28)',\
drawtext=$TEXT_STYLE:text='the':enable='between(t,28.60,28.64)',\
drawtext=$TEXT_STYLE:text='delivery':enable='between(t,28.64,28.94)',\
drawtext=$TEXT_STYLE:text='trucks,':enable='between(t,28.94,29.38)',\
drawtext=$TEXT_STYLE:text='the':enable='between(t,29.70,29.78)',\
drawtext=$TEXT_STYLE:text='website,':enable='between(t,29.78,30.24)',\
drawtext=$TEXT_STYLE:text='the':enable='between(t,30.52,30.60)',\
drawtext=$TEXT_STYLE:text='cloud':enable='between(t,30.60,30.90)',\
drawtext=$TEXT_STYLE:text='servers,':enable='between(t,30.90,31.34)',\
drawtext=$TEXT_STYLE:text='powering':enable='between(t,31.58,31.92)',\
drawtext=$TEXT_STYLE:text='Netflix':enable='between(t,31.92,32.14)',\
drawtext=$TEXT_STYLE:text='and':enable='between(t,32.14,32.58)',\
drawtext=$TEXT_STYLE:text='Zoom,':enable='between(t,32.58,32.82)',\
drawtext=$TEXT_STYLE:text='it':enable='between(t,33.16,33.36)',\
drawtext=$TEXT_STYLE:text='was':enable='between(t,33.36,33.48)',\
drawtext=$TEXT_STYLE:text='all':enable='between(t,33.48,33.84)',\
drawtext=$TEXT_STYLE:text='put':enable='between(t,33.84,34.12)',\
drawtext=$TEXT_STYLE:text='to':enable='between(t,34.12,34.38)',\
drawtext=$TEXT_STYLE:text='the':enable='between(t,34.38,34.50)',\
drawtext=$TEXT_STYLE:text='ultimate':enable='between(t,34.50,34.94)',\
drawtext=$TEXT_STYLE:text='test.':enable='between(t,34.94,35.48)',\
drawtext=$TEXT_STYLE:text='The':enable='between(t,35.84,36.08)',\
drawtext=$TEXT_STYLE:text='system':enable='between(t,36.08,36.50)',\
drawtext=$TEXT_STYLE:text='strained,':enable='between(t,36.50,37.14)',\
drawtext=$TEXT_STYLE:text='delivery':enable='between(t,37.44,37.74)',\
drawtext=$TEXT_STYLE:text='time':enable='between(t,37.74,38.04)',\
drawtext=$TEXT_STYLE:text='slipped,':enable='between(t,38.04,38.44)',\
drawtext=$TEXT_STYLE:text='but':enable='between(t,38.80,38.94)',\
drawtext=$TEXT_STYLE:text='it':enable='between(t,38.94,39.08)',\
drawtext=$TEXT_STYLE:text='did':enable='between(t,39.08,39.24)',\
drawtext=$TEXT_STYLE:text='not':enable='between(t,39.24,39.56)',\
drawtext=$TEXT_STYLE:text='break.':enable='between(t,39.56,39.92)',\
drawtext=$TEXT_STYLE:text='While':enable='between(t,40.48,40.70)',\
drawtext=$TEXT_STYLE:text='other':enable='between(t,40.70,41.00)',\
drawtext=$TEXT_STYLE:text='businesses':enable='between(t,41.00,41.50)',\
drawtext=$TEXT_STYLE:text='collapsed,':enable='between(t,41.50,42.02)',\
drawtext=$TEXT_STYLE:text='Amazon':enable='between(t,42.48,42.72)',\
drawtext=$TEXT_STYLE:text='hired.':enable='between(t,42.72,43.24)',\
drawtext=$TEXT_STYLE:text='They':enable='between(t,43.62,43.86)',\
drawtext=$TEXT_STYLE:text='hired':enable='between(t,43.86,44.14)',\
drawtext=$TEXT_STYLE:text='175':enable='between(t,44.14,45.14)',\
drawtext=$TEXT_STYLE:text=',000':enable='between(t,45.14,46.02)',\
drawtext=$TEXT_STYLE:text='new':enable='between(t,46.02,46.26)',\
drawtext=$TEXT_STYLE:text='workers':enable='between(t,46.26,46.58)',\
drawtext=$TEXT_STYLE:text='in':enable='between(t,46.58,46.84)',\
drawtext=$TEXT_STYLE:text='just':enable='between(t,46.84,47.12)',\
drawtext=$TEXT_STYLE:text='a':enable='between(t,47.12,47.36)',\
drawtext=$TEXT_STYLE:text='few':enable='between(t,47.36,47.48)',\
drawtext=$TEXT_STYLE:text='months.':enable='between(t,47.48,47.82)',\
drawtext=$TEXT_STYLE:text='Their':enable='between(t,48.38,48.56)',\
drawtext=$TEXT_STYLE:text='revenue':enable='between(t,48.56,48.98)',\
drawtext=$TEXT_STYLE:text='for':enable='between(t,48.98,49.22)',\
drawtext=$TEXT_STYLE:text='the':enable='between(t,49.22,49.32)',\
drawtext=$TEXT_STYLE:text='second':enable='between(t,49.32,49.64)',\
drawtext=$TEXT_STYLE:text='quarter':enable='between(t,49.64,50.02)',\
drawtext=$TEXT_STYLE:text='of':enable='between(t,50.02,50.18)',\
drawtext=$TEXT_STYLE:text='2020':enable='between(t,50.18,50.70)',\
drawtext=$TEXT_STYLE:text='exploded,':enable='between(t,50.70,51.78)',\
drawtext=$TEXT_STYLE:text='up':enable='between(t,52.08,52.28)',\
drawtext=$TEXT_STYLE:text='40':enable='between(t,52.28,52.74)',\
drawtext=$TEXT_STYLE:text='%':enable='between(t,52.74,53.10)',\
drawtext=$TEXT_STYLE:text='to':enable='between(t,53.10,53.44)',\
drawtext=$TEXT_STYLE:text='$88':enable='between(t,53.44,53.96)',\
drawtext=$TEXT_STYLE:text='.9':enable='between(t,53.96,54.60)',\
drawtext=$TEXT_STYLE:text='billion.':enable='between(t,54.60,55.08)',\
drawtext=$TEXT_STYLE:text='The':enable='between(t,55.84,56.36)',\
drawtext=$TEXT_STYLE:text='pandemic':enable='between(t,56.36,56.88)',\
drawtext=$TEXT_STYLE:text='was':enable='between(t,56.88,57.18)',\
drawtext=$TEXT_STYLE:text='a':enable='between(t,57.18,57.30)',\
drawtext=$TEXT_STYLE:text='tragedy':enable='between(t,57.30,57.74)',\
drawtext=$TEXT_STYLE:text='for':enable='between(t,57.74,58.00)',\
drawtext=$TEXT_STYLE:text='the':enable='between(t,58.00,58.12)',\
drawtext=$TEXT_STYLE:text='world,':enable='between(t,58.12,58.42)',\
drawtext=$TEXT_STYLE:text='but':enable='between(t,58.66,58.88)',\
drawtext=$TEXT_STYLE:text='for':enable='between(t,58.88,59.06)',\
drawtext=$TEXT_STYLE:text='Amazon\'s':enable='between(t,59.06,59.68)',\
drawtext=$TEXT_STYLE:text='business':enable='between(t,59.68,59.94)',\
drawtext=$TEXT_STYLE:text='model,':enable='between(t,59.94,60.32)',\
drawtext=$TEXT_STYLE:text='it':enable='between(t,60.52,60.70)',\
drawtext=$TEXT_STYLE:text='was':enable='between(t,60.70,60.84)',\
drawtext=$TEXT_STYLE:text='the':enable='between(t,60.84,61.02)',\
drawtext=$TEXT_STYLE:text='ultimate':enable='between(t,61.02,61.52)',\
drawtext=$TEXT_STYLE:text='validation.':enable='between(t,61.52,62.22)',\
drawtext=$TEXT_STYLE:text='Every':enable='between(t,62.80,63.20)',\
drawtext=$TEXT_STYLE:text='bet':enable='between(t,63.20,63.46)',\
drawtext=$TEXT_STYLE:text='they':enable='between(t,63.46,63.66)',\
drawtext=$TEXT_STYLE:text='had':enable='between(t,63.66,63.82)',\
drawtext=$TEXT_STYLE:text='ever':enable='between(t,63.82,64.18)',\
drawtext=$TEXT_STYLE:text='made':enable='between(t,64.18,64.44)',\
drawtext=$TEXT_STYLE:text='on':enable='between(t,64.44,64.60)',\
drawtext=$TEXT_STYLE:text='logistics,':enable='between(t,64.60,65.10)',\
drawtext=$TEXT_STYLE:text='on':enable='between(t,65.42,65.52)',\
drawtext=$TEXT_STYLE:text='infrastructure,':enable='between(t,65.52,66.08)',\
drawtext=$TEXT_STYLE:text='on':enable='between(t,66.50,66.62)',\
drawtext=$TEXT_STYLE:text='long':enable='between(t,66.62,66.88)',\
drawtext=$TEXT_STYLE:text='-term':enable='between(t,66.88,67.12)',\
drawtext=$TEXT_STYLE:text='thinking,':enable='between(t,67.12,67.58)',\
drawtext=$TEXT_STYLE:text='paid':enable='between(t,67.98,68.12)',\
drawtext=$TEXT_STYLE:text='off':enable='between(t,68.12,68.46)',\
drawtext=$TEXT_STYLE:text='in':enable='between(t,68.46,68.68)',\
drawtext=$TEXT_STYLE:text='the':enable='between(t,68.68,68.78)',\
drawtext=$TEXT_STYLE:text='moment':enable='between(t,68.78,69.10)',\
drawtext=$TEXT_STYLE:text='the':enable='between(t,69.10,69.32)',\
drawtext=$TEXT_STYLE:text='world':enable='between(t,69.32,69.60)',\
drawtext=$TEXT_STYLE:text='needed':enable='between(t,69.60,69.96)',\
drawtext=$TEXT_STYLE:text='it':enable='between(t,69.96,70.14)',\
drawtext=$TEXT_STYLE:text='most.':enable='between(t,70.14,70.40)'\
[final_v]"


# --- Part 5: Final FFMPEG Command ---
echo "--- GENERATED FFMPEG COMMAND ---"
COMMAND="ffmpeg -y $FFMPEG_INPUTS \
-filter_complex \"$FILTER_COMPLEX\" \
-map \"[final_v]\" -map $AUDIO_INPUT_INDEX:a \
-c:v libx264 -preset fast -crf 20 \
-pix_fmt yuv420p \
-r $FPS \
-c:a aac -b:a 192k \
-shortest \
\"$OUTPUT_FILE\""

echo "$COMMAND"
echo "---------------------------------"
echo "Executing FFmpeg... This may take a while."

# Execute the command
eval "$COMMAND"

echo "Done! Video saved as '$OUTPUT_FILE'"
```