Here is a ready-to-run FFmpeg shell script to generate the parallax video.

### Instructions:

1.  **Save the Code:** Save the following code as a shell script file, for example, `generate_video.sh`.
2.  **Organize Files:**
    *   Place the script in your project's root directory.
    *   Ensure your images are inside a subdirectory named `assets/images/`.
    *   Ensure your audio file is at `BOOKS/Temp/TTS/Lesson_6.wav`.
3.  **Make Executable:** Open a terminal and run `chmod +x generate_video.sh` to make the script executable.
4.  **Install a Font:** The script uses the "Roboto" font. Make sure you have it installed, or change the `fontfile` path to a `.ttf` or `.otf` file on your system (e.g., `/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf` on Linux or `/System/Library/Fonts/Supplemental/Arial.ttf` on macOS).
5.  **Run the Script:** Execute the script from your terminal by running `./generate_video.sh`.

The script will generate the final video as `Lesson_6_Parallax.mp4`.

---

### `generate_video.sh`

```bash
#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
WIDTH=3840
HEIGHT=2160
FPS=30
OUTPUT_FILE="Lesson_6_Parallax.mp4"

# --- Asset Paths ---
AUDIO_FILE="BOOKS/Temp/TTS/Lesson_6.wav"
IMG_DIR="assets/images"
# IMPORTANT: Update this path to a font file on your system
FONT_FILE="/usr/share/fonts/truetype/roboto/Roboto-Bold.ttf" 

# --- Verify Assets ---
if [ ! -f "$AUDIO_FILE" ]; then
    echo "Error: Audio file not found at $AUDIO_FILE"
    exit 1
fi
if [ ! -d "$IMG_DIR" ]; then
    echo "Error: Image directory not found at $IMG_DIR"
    exit 1
fi
if [ ! -f "$FONT_FILE" ]; then
    echo "Error: Font file not found at $FONT_FILE"
    echo "Please update the FONT_FILE variable in the script."
    exit 1
fi

# --- Get Audio Duration ---
DURATION=$(ffprobe -i "$AUDIO_FILE" -show_entries format=duration -v quiet -of csv="p=0")
echo "Audio duration: ${DURATION}s"

# --- Prepare FFmpeg Inputs and Filter Chains ---

# Create a list of all unique images to be used as inputs
# This prevents adding the same image as an input multiple times
mapfile -t IMAGE_FILES < <(find "${IMG_DIR}" -type f \( -iname "*.jpg" -o -iname "*.png" \) | sort -u)

# Build the input arguments for ffmpeg
FFMPEG_INPUTS=""
for img in "${IMAGE_FILES[@]}"; do
    FFMPEG_INPUTS+=" -loop 1 -t ${DURATION} -i \"${img}\""
done

# Function to get the index of an image file for mapping
get_img_index() {
    local img_name=$1
    local i=0
    for file in "${IMAGE_FILES[@]}"; do
        if [[ "$file" == *"$img_name" ]]; then
            # Add 1 because audio is input 0
            echo $((i + 1))
            return
        fi
        ((i++))
    done
    echo "Error: Image $img_name not found!" >&2
    exit 1
}

# --- Build the Complex Filter Graph ---
FILTER_COMPLEX=""

# Scene 1: (0.00 - 4.30) "invade new territories" - Pan Up-Right + Zoom
S1_START=0.00
S1_END=4.30
S1_DUR=$(echo "$S1_END - $S1_START" | bc)
S1_BG_IMG=$(get_img_index "blueprint_bg.jpg")
S1_MG1_IMG=$(get_img_index "gears-midground.png")
S1_MG2_IMG=$(get_img_index "abstract_gears_background.jpg")
S1_FG_IMG=$(get_img_index "fortress.png")
FILTER_COMPLEX+="
[${S1_BG_IMG}:v]scale=${WIDTH}*1.2:-1,crop=${WIDTH}:${HEIGHT}[s1_bg];
[${S1_MG1_IMG}:v]scale=${WIDTH}*1.3:-1,crop=${WIDTH}:${HEIGHT}[s1_mg1];
[${S1_MG2_IMG}:v]scale=${WIDTH}*1.35:-1,crop=${WIDTH}:${HEIGHT}[s1_mg2];
[${S1_FG_IMG}:v]scale=${WIDTH}*1.4:-1,crop=${WIDTH}:${HEIGHT}[s1_fg];
color=s=${WIDTH}x${HEIGHT}:d=${S1_DUR}:c=black[s1_base];
[s1_base][s1_bg]overlay=x='(t/${S1_DUR})*100':y='(t/${S1_DUR})*-80'[s1_tmp1];
[s1_tmp1][s1_mg1]overlay=x='(t/${S1_DUR})*150':y='(t/${S1_DUR})*-120'[s1_tmp2];
[s1_tmp2][s1_mg2]overlay=x='(t/${S1_DUR})*170':y='(t/${S1_DUR})*-140'[s1_tmp3];
[s1_tmp3][s1_fg]overlay=x='(t/${S1_DUR})*200':y='(t/${S1_DUR})*-160',
zoompan=z='min(zoom+0.0005,1.1)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${WIDTH}x${HEIGHT},
trim=duration=${S1_DUR},setpts=PTS-STARTPTS[v1];
"

# Scene 2: (4.30 - 11.08) "AWS is a monster" - Fast Zoom In
S2_START=4.30
S2_END=11.08
S2_DUR=$(echo "$S2_END - $S2_START" | bc)
S2_BG_IMG=$(get_img_index "tech_city_background.jpg")
S2_MG_IMG=$(get_img_index "server-racks-midground.png")
S2_FG_IMG=$(get_img_index "aws-logo.png")
S2_OL_IMG=$(get_img_index "glowing_particles.png")
FILTER_COMPLEX+="
[${S2_BG_IMG}:v]scale=${WIDTH}*2:-1,crop=${WIDTH}:${HEIGHT}[s2_bg];
[${S2_MG_IMG}:v]scale=${WIDTH}*2.2:-1,crop=${WIDTH}:${HEIGHT}[s2_mg];
[${S2_FG_IMG}:v]scale=${WIDTH}*0.6:-1[s2_fg_scaled];
[${S2_OL_IMG}:v]scale=${WIDTH}:-1[s2_ol_scaled];
color=s=${WIDTH}x${HEIGHT}:d=${S2_DUR}:c=black[s2_base];
[s2_base][s2_bg]overlay=(W-w)/2:(H-h)/2,zoompan=z='min(zoom+0.0015,1.5)':d=1:s=${WIDTH}x${HEIGHT}[s2_tmp1];
[s2_tmp1][s2_mg]overlay=(W-w)/2:(H-h)/2,zoompan=z='min(zoom+0.0018,1.6)':d=1:s=${WIDTH}x${HEIGHT}[s2_tmp2];
[s2_tmp2][s2_fg_scaled]overlay=(W-w)/2:(H-h)/2[s2_tmp3];
[s2_tmp3][s2_ol_scaled]overlay=(W-w)/2:(H-h)/2:eval=frame,format=yuva444p,fade=in:st=0:d=1:alpha=1,
trim=duration=${S2_DUR},setpts=PTS-STARTPTS[v2];
"

# Scene 3: (11.08 - 17.42) "$17 billion" - Pan Up, data stream
S3_START=11.08
S3_END=17.42
S3_DUR=$(echo "$S3_END - $S3_START" | bc)
S3_BG_IMG=$(get_img_index "tech_cityscape.jpg")
S3_MG_IMG=$(get_img_index "stock-chart-midground.png")
S3_FG_IMG=$(get_img_index "data_stream_foreground.png")
FILTER_COMPLEX+="
[${S3_BG_IMG}:v]scale=-1:${HEIGHT}*1.2,crop=${WIDTH}:${HEIGHT}[s3_bg];
[${S3_MG_IMG}:v]scale=${WIDTH}*0.8:-1[s3_mg_scaled];
[${S3_FG_IMG}:v]scale=${WIDTH}:-1[s3_fg_scaled];
color=s=${WIDTH}x${HEIGHT}:d=${S3_DUR}:c=black[s3_base];
[s3_base][s3_bg]overlay=x=0:y='-(t/${S3_DUR})*200'[s3_tmp1];
[s3_tmp1][s3_mg_scaled]overlay=x=50:y='H-h-50-(t/${S3_DUR})*300'[s3_tmp2];
[s3_tmp2][s3_fg_scaled]overlay=x=0:y='-h+mod(t*250,h*2)',
trim=duration=${S3_DUR},setpts=PTS-STARTPTS[v3];
"

# Scene 4: (17.42 - 24.22) "retail vs AWS" - Crossfade
S4_START=17.42
S4_END=24.22
S4_DUR=$(echo "$S4_END - $S4_START" | bc)
S4_XFADE_TIME=20.50
S4_XFADE_OFFSET=$(echo "$S4_XFADE_TIME - $S4_START" | bc)
S4A_DUR=$(echo "$S4_XFADE_TIME - $S4_START + 1" | bc)
S4B_DUR=$(echo "$S4_END - $S4_XFADE_TIME + 1" | bc)
S4A_BG=$(get_img_index "empty_city_street_background.jpg")
S4A_MG=$(get_img_index "amazon_warehouse_midground.png")
S4A_FG=$(get_img_index "amazon_box_foreground.png")
S4B_BG=$(get_img_index "server-room.jpg")
S4B_MG=$(get_img_index "cloud_servers_midground.png")
S4B_FG=$(get_img_index "glowing-data.png")
FILTER_COMPLEX+="
[${S4A_BG}:v]scale=${WIDTH}*1.1:-1,crop=${WIDTH}:${HEIGHT}[s4a_bg];
[${S4A_MG}:v]scale=${WIDTH}*1.2:-1,crop=${WIDTH}:${HEIGHT}[s4a_mg];
[${S4A_FG}:v]scale=${WIDTH}*0.4:-1[s4a_fg_scaled];
color=s=${WIDTH}x${HEIGHT}:d=${S4A_DUR}:c=black[s4a_base];
[s4a_base][s4a_bg]overlay[s4a_t1]; [s4a_t1][s4a_mg]overlay[s4a_t2]; [s4a_t2][s4a_fg_scaled]overlay=x=W-w-100:y=H-h-100,
trim=duration=${S4A_DUR},setpts=PTS-STARTPTS[v4a];

[${S4B_BG}:v]scale=-1:${HEIGHT}*1.5,crop=${WIDTH}:${HEIGHT}[s4b_bg];
[${S4B_MG}:v]scale=-1:${HEIGHT}*1.6,crop=${WIDTH}:${HEIGHT}[s4b_mg];
[${S4B_FG}:v]scale=${WIDTH}:-1[s4b_fg_scaled];
color=s=${WIDTH}x${HEIGHT}:d=${S4B_DUR}:c=black[s4b_base];
[s4b_base][s4b_bg]overlay=y=0,zoompan=z='1.2-t/${S4B_DUR}*0.2':d=1:s=${WIDTH}x${HEIGHT}[s4b_t1];
[s4b_t1][s4b_mg]overlay=y=0,zoompan=z='1.3-t/${S4B_DUR}*0.2':d=1:s=${WIDTH}x${HEIGHT}[s4b_t2];
[s4b_t2][s4b_fg_scaled]overlay,
trim=duration=${S4B_DUR},setpts=PTS-STARTPTS[v4b];

[v4a][v4b]xfade=transition=fade:duration=1:offset=${S4_XFADE_OFFSET},
trim=duration=${S4_DUR},setpts=PTS-STARTPTS[v4];
"

# Scene 5: (24.22 - 35.08) "war chest to attack" - Dramatic Pan Down
S5_START=24.22
S5_END=35.08
S5_DUR=$(echo "$S5_END - $S5_START" | bc)
S5_BG_IMG=$(get_img_index "dark_clouds.jpg")
S5_MG_IMG=$(get_img_index "mountains-far.png")
S5_FG_IMG=$(get_img_index "broken_gears.png")
FILTER_COMPLEX+="
[${S5_BG_IMG}:v]scale=-1:${HEIGHT}*1.5,crop=${WIDTH}:${HEIGHT}[s5_bg];
[${S5_MG_IMG}:v]scale=${WIDTH}:-1[s5_mg_scaled];
[${S5_FG_IMG}:v]scale=${WIDTH}*1.2:-1[s5_fg_scaled];
color=s=${WIDTH}x${HEIGHT}:d=${S5_DUR}:c=black[s5_base];
[s5_base][s5_bg]overlay=x=0:y='-300+(t/${S5_DUR})*300'[s5_tmp1];
[s5_tmp1][s5_mg_scaled]overlay=x=0:y='H-h+(t/${S5_DUR})*150'[s5_tmp2];
[s5_tmp2][s5_fg_scaled]overlay=x='(W-w)/2':y='(H-h)/2+(t/${S5_DUR})*100',
trim=duration=${S5_DUR},setpts=PTS-STARTPTS[v5];
"

# Scene 6: (35.08 - 42.30) "buying whole foods" - Pan Left Cityscape
S6_START=35.08
S6_END=42.30
S6_DUR=$(echo "$S6_END - $S6_START" | bc)
S6_BG_IMG=$(get_img_index "city-background.jpg")
S6_MG_IMG=$(get_img_index "buildings_midground.png")
S6_FG_IMG=$(get_img_index "buildings-foreground.png")
FILTER_COMPLEX+="
[${S6_BG_IMG}:v]scale=${WIDTH}*1.2:-1,crop=${WIDTH}:${HEIGHT}[s6_bg];
[${S6_MG_IMG}:v]scale=${WIDTH}*1.4:-1,crop=${WIDTH}:${HEIGHT}[s6_mg];
[${S6_FG_IMG}:v]scale=${WIDTH}*1.6:-1,crop=${WIDTH}:${HEIGHT}[s6_fg];
color=s=${WIDTH}x${HEIGHT}:d=${S6_DUR}:c=black[s6_base];
[s6_base][s6_bg]overlay=x='-(t/${S6_DUR})*150':y=0[s6_tmp1];
[s6_tmp1][s6_mg]overlay=x='-(t/${S6_DUR})*250':y=0[s6_tmp2];
[s6_tmp2][s6_fg]overlay=x='-(t/${S6_DUR})*400':y=0,
trim=duration=${S6_DUR},setpts=PTS-STARTPTS[v6];
"

# Scene 7: (42.30 - 49.68) "world was stunned" - Shake + Cracked Glass
S7_START=42.30
S7_END=49.68
S7_DUR=$(echo "$S7_END - $S7_START" | bc)
S7_BG_IMG=$(get_img_index "rainy-city.jpg")
S7_MG_IMG=$(get_img_index "modern_city.png")
S7_FG_IMG=$(get_img_index "cracked_glass_overlay.png")
FILTER_COMPLEX+="
[${S7_BG_IMG}:v]scale=${WIDTH}*1.1:-1,crop=${WIDTH}:${HEIGHT},
frei0r=shake:p=20[s7_bg];
[${S7_MG_IMG}:v]scale=${WIDTH}:-1[s7_mg_scaled];
[${S7_FG_IMG}:v]scale=${WIDTH}:${HEIGHT}[s7_fg_scaled];
color=s=${WIDTH}x${HEIGHT}:d=${S7_DUR}:c=black[s7_base];
[s7_base][s7_bg]overlay[s7_tmp1];
[s7_tmp1][s7_mg_scaled]overlay=x=0:y='H-h'[s7_tmp2];
[s7_tmp2][s7_fg_scaled]overlay,format=yuva444p,fade=in:st=0.5:d=1.5:alpha=1,
trim=duration=${S7_DUR},setpts=PTS-STARTPTS[v7];
"

# Scene 8: (49.68 - 61.52) "competitors plummeted" - Pan Down + Rain
S8_START=49.68
S8_END=61.52
S8_DUR=$(echo "$S8_END - $S8_START" | bc)
S8_BG_IMG=$(get_img_index "city_background.jpg")
S8_MG_IMG=$(get_img_index "falling-chart.png")
S8_FG_IMG=$(get_img_index "sad-people.png")
S8_OL_IMG=$(get_img_index "rain_overlay.png")
FILTER_COMPLEX+="
[${S8_BG_IMG}:v]scale=-1:${HEIGHT}*1.2,crop=${WIDTH}:${HEIGHT}[s8_bg];
[${S8_MG_IMG}:v]scale=${WIDTH}*0.7:-1[s8_mg_scaled];
[${S8_FG_IMG}:v]scale=${WIDTH}*0.9:-1[s8_fg_scaled];
[${S8_OL_IMG}:v]scale=${WIDTH}:${HEIGHT}[s8_ol_scaled];
color=s=${WIDTH}x${HEIGHT}:d=${S8_DUR}:c=black[s8_base];
[s8_base][s8_bg]overlay=x=0:y='-(t/${S8_DUR})*100'[s8_tmp1];
[s8_tmp1][s8_mg_scaled]overlay=x='(W-w)/2':y='-h+(t/${S8_DUR})*(H+h)'[s8_tmp2];
[s8_tmp2][s8_fg_scaled]overlay=x='(W-w)/2':y='H-h',
format=yuva444p,fade=in:st=0:d=2:alpha=1[s8_tmp3];
[s8_tmp3][s8_ol_scaled]overlay=x=0:y=0,
trim=duration=${S8_DUR},setpts=PTS-STARTPTS[v8];
"

# Scene 9: (61.52 - 72.72) "different game" - Hopeful zoom out
S9_START=61.52
S9_END=72.72
S9_DUR=$(echo "$S9_END - $S9_START" | bc)
S9_BG_IMG=$(get_img_index "sunrise-field.jpg")
S9_MG_IMG=$(get_img_index "winding-path.jpg")
S9_FG_IMG=$(get_img_index "resilient-plant.png")
S9_OL_IMG=$(get_img_index "tech-overlay-foreground.png")
FILTER_COMPLEX+="
[${S9_BG_IMG}:v]scale=${WIDTH}:-1[s9_bg_scaled];
[${S9_MG_IMG}:v]scale=${WIDTH}*1.8:-1,crop=${WIDTH}:${HEIGHT}[s9_mg];
[${S9_FG_IMG}:v]scale=${WIDTH}*2.0:-1,crop=${WIDTH}:${HEIGHT}[s9_fg];
[${S9_OL_IMG}:v]scale=${WIDTH}:${HEIGHT}[s9_ol_scaled];
color=s=${WIDTH}x${HEIGHT}:d=${S9_DUR}:c=black[s9_base];
[s9_base][s9_bg_scaled]overlay[s9_tmp1];
[s9_tmp1][s9_mg]overlay=x=0:y=0,zoompan=z='1.5-t/${S9_DUR}*0.5':d=1:s=${WIDTH}x${HEIGHT}[s9_tmp2];
[s9_tmp2][s9_fg]overlay=x=0:y=0,zoompan=z='1.7-t/${S9_DUR}*0.5':d=1:s=${WIDTH}x${HEIGHT}[s9_tmp3];
[s9_tmp3][s9_ol_scaled]overlay,format=yuva444p,fade=in:st=1:d=2:alpha=1,
trim=duration=${S9_DUR},setpts=PTS-STARTPTS[v9];
"

# --- Filler Scene to use remaining images ---
# This scene will be short and crossfaded with the end of scene 9 to use up all assets.
REMAINING_DUR=$(echo "$DURATION - 72.72" | bc)
F_START=72.72
F_END=${DURATION}
F_DUR=$(echo "$F_END - $F_START" | bc)
F_BG=$(get_img_index "sky-background.jpg")
F_MG1=$(get_img_index "forest-midground.png")
F_MG2=$(get_img_index "single-tree.png")
F_OL=$(get_img_index "phoenix_from_ashes.png")
# Using more leftover images
F_BG2=$(get_img_index "bright_sky.jpg")
F_MG3=$(get_img_index "data_center_background.jpg") # Assuming two files with similar names, gets the first match.
F_FG2=$(get_img_index "gears-foreground.png")

# To keep it simple, we'll create one more scene for the very end
FILTER_COMPLEX+="
[$(get_img_index 'bright_sky.jpg')]scale=${WIDTH}:-1[f_bg];
[$(get_img_index 'forest-midground.png')]scale=${WIDTH}*1.2:-1[f_mg];
[$(get_img_index 'single-tree.png')]scale=${WIDTH}*0.5:-1[f_fg];
color=s=${WIDTH}x${HEIGHT}:d=${F_DUR}:c=black[f_base];
[f_base][f_bg]overlay[f_t1];
[f_t1][f_mg]overlay=y=H-h[f_t2];
[f_t2][f_fg]overlay=x='(W-w)/2':y='H-h',
trim=duration=${F_DUR},setpts=PTS-STARTPTS[v10];
"

# --- Concatenate Scenes ---
# We have 10 scenes now, covering the full duration.
# Note: The sum of scene durations must match the concat input stream count.
# We will concatenate v1 through v9 and then fade to v10.
S9_END_TRIM=$(echo "$S9_END - $S9_START" | bc)
v9_DUR=$(echo "$S9_END_TRIM - 1" | bc)
FILTER_COMPLEX+="
[v9]trim=duration=${v9_DUR}[v9_trimmed];
[v9_trimmed][v10]xfade=transition=fade:duration=1:offset=0[v9_and_v10];
[v1][v2][v3][v4][v5][v6][v7][v8][v9_and_v10]concat=n=9:v=1:a=0[video_base];
"

# --- Add Text Overlays ---
# It's more manageable to chain drawtext filters.
TEXT_PARAMS="fontfile='${FONT_FILE}':fontsize=90:fontcolor=white@0.9:shadowcolor=black@0.7:shadowx=3:shadowy=3:box=1:boxcolor=black@0.4:boxborderw=10"
FILTER_COMPLEX+="
[video_base]
drawtext=enable='between(t,0.00,0.50)':text='Key':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,0.50,0.94)':text='lesson.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,1.50,4.30)':text='Use your cash cow to invade new territories.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,5.02,6.36)':text='It is now 2017.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,7.18,8.82)':text='AWS is a monster.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,9.38,11.08)':text='It is a money printing machine.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,11.82,17.42)':text='In 2017 alone, AWS would generate over \$17 billion in revenue.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,17.94,22.64)':text='And unlike the low margin retail business, AWS was incredibly profitable.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,23.06,24.22)':text='It was a cash cow.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,24.74,26.70)':text='So what do you do with all that cash?':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,27.18,28.74)':text='You could give it back to shareholders.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,28.74,30.36)':text='You could play it safe,':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,30.76,35.08)':text='or you could use it as a war chest to attack a completely new industry.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,35.68,42.30)':text='Amazon announced it was buying whole foods for \$13.7 billion.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,43.12,43.80)':text='In cash,':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,44.42,45.66)':text='the world was stunned.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,46.16,49.68)':text='The king of e-commerce was buying a brick and mortar grocery chain.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,50.04,55.76)':text='On the day of the announcement, stocks of competing grocery stores plummeted.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,56.08,61.52)':text='They lost more in market value that day than the \$13.7 billion Amazon paid.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,62.10,70.48)':text='Amazon was using AWS to fund an invasion into the old-world business of selling milk and eggs.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS},
drawtext=enable='between(t,70.84,72.72)':text='They were playing a different game.':x=(w-text_w)/2:y=h-th-150:${TEXT_PARAMS}
[video_final]
"

# --- Execute FFmpeg Command ---
echo "Starting FFmpeg render..."
echo "This may take a long time."

# Note: The backslash before '$' in drawtext is to escape it for ffmpeg, not the shell.
eval ffmpeg -y -i \"$AUDIO_FILE\" ${FFMPEG_INPUTS} \
    -filter_complex "${FILTER_COMPLEX}" \
    -map "[video_final]" -map 0:a \
    -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p \
    -c:a aac -b:a 192k \
    -r ${FPS} -t ${DURATION} \
    "${OUTPUT_FILE}"

echo "Video generation complete: ${OUTPUT_FILE}"
```