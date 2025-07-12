
import os
import subprocess

# Define directories
final_videos_dir = "Final_Videos"
output_dir = "Overlayed_Videos"
font_path = "/storage/emulated/0/Download/FontsFree-Net-Proxima-Nova-Bold-It.otf.ttf"

# Make sure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Define dictionary of video files and their corresponding overlay text
video_text_map = {
    "group_2.mp4": "Smart indoor system",
    "group_9.mp4": "Room humidifier",
    "group_17.mp4": "Smart hydroponics system",
    "group_19.mp4": "Workout safety system",
    "group_20.mp4": "Wireless router",
    "group_21.mp4": "Smart pet feeder",
    "group_22.mp4": "Smart bed",
    "group_27.mp4": "Intelligent clock",
    "group_30.mp4": "Hair styling tool",
    "group_12.mp4": "Water Saving Faucet Sensor"
}

# Loop through each video and overlay the corresponding text
for filename, label in video_text_map.items():
    input_path = os.path.join(final_videos_dir, filename)
    output_path = os.path.join(output_dir, filename)

    # Skip if input file doesn't exist
    if not os.path.exists(input_path):
        print(f"[!] Missing video: {input_path}")
        continue

    # Detect orientation
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
             "stream=width,height", "-of", "csv=s=x:p=0", input_path],
            capture_output=True, text=True, check=True
        )
        width, height = map(int, result.stdout.strip().split('x'))
        is_vertical = height > width
    except Exception as e:
        print(f"[!] Failed to get resolution for {filename}: {e}")
        continue

    # Build drawtext filter
    drawtext = (
        f"drawtext=fontfile='{font_path}':text='{label}':"
        "fontsize=90:fontcolor=#C0C0C0:box=1:boxcolor=black@0.8:boxborderw=5:"
        "x=(w-text_w)/2:y='if(lt(t,1), h+text_h, if(lt(t,2), h-(t-1)*(h-text_h-100), "
        "if(lt(t,7), h-text_h-100, NAN)))':"
        "enable='lt(t,7)':shadowcolor=black:shadowx=3:shadowy=3"
    )

    if is_vertical:
        print(f"[↓] Vertical video detected: {filename}")
        filter_complex = (
            "[0:v]scale=1280:720,boxblur=10:1[blurred];"
            "[0:v]scale=-2:720[main];"
            "[blurred][main]overlay=(W-w)/2:(H-h)/2,"
            + drawtext
        )
    else:
        print(f"[→] Horizontal video detected: {filename}")
        filter_complex = drawtext

    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-vf", filter_complex,
        "-c:v", "libx264", "-crf", "23", "-preset", "fast",
        output_path
    ]

    try:
        subprocess.run(cmd, check=True)
        print(f"[✓] Overlayed: {output_path}")
    except subprocess.CalledProcessError as e:
        print(f"[✗] FFmpeg failed for {filename}:\n{e}")

print("\n[✔] Done overlaying videos.")
