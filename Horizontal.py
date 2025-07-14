
import subprocess

input_video = "Screen_Recording_20240710-155313_TikTok Lite.mp4"
output_video = "horizontal_output.mp4"

# Apply a strong blur and center the main video with max height 1080
vf_filter = (
    "format=yuv420p,"
    "split=2[main][blurred];"
    "[blurred]scale=1920:1080,boxblur=30:1[bg];"
    "[main]scale=-2:1080[fg];"
    "[bg][fg]overlay=(W-w)/2:(H-h)/2"
)

cmd = [
    "ffmpeg", "-y",
    "-i", input_video,
    "-filter_complex", vf_filter,
    "-c:a", "copy",
    output_video
]

try:
    subprocess.run(cmd, check=True)
    print(f"[✓] Converted to horizontal 16:9: {output_video}")
except subprocess.CalledProcessError as e:
    print("[X] FFmpeg failed:", e)
