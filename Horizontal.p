
import subprocess

input_file = "Screen_Recording_20240710-155313_TikTok Lite.mp4"  # Replace with your input video filename
output_file = "horizontal_output.mp4"

ffmpeg_command = [
    "ffmpeg", "-y",
    "-i", input_file,
    "-lavfi",
    "[0:v]scale=ih*16/9:-1,"
    "boxblur=luma_radius=min(h\\,w)/20:luma_power=1:"
    "chroma_radius=min(cw\\,ch)/20:chroma_power=1[bg];"
    "[bg][0:v]overlay=(W-w)/2:(H-h)/2,"
    "crop=h=iw*9/16",
    "-c:v", "libx264",       # Use x264 encoder
    "-crf", "23",            # Lower CRF = better quality (range: 18–28)
    "-preset", "medium",     # Can be: ultrafast, superfast, fast, medium, slow, veryslow
    "-movflags", "+faststart",  # Good for web playback
    output_file
]

try:
    subprocess.run(ffmpeg_command, check=True)
    print("✅ Video processed successfully.")
except subprocess.CalledProcessError as e:
    print("❌ FFmpeg failed:", e)
