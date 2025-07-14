
import subprocess

input_video = "Screen_Recording_20240710-155313_TikTok Lite.mp4"
output_video = "horizontal_output.mp4"

# FFmpeg complex filter:
# 1. Create blurred background
# 2. Slightly enlarge main video (crop 1350px height to center)
# 3. Overlay main on top of blur
vf_filter = (
    "format=yuv420p,"
    "scale=iw:ih,"
    "split=2[main][blurred];"
    "[blurred]scale=1920:1080,boxblur=20:1[bg];"
    "[main]scale=-1:1350,crop=720:1080:(in_w-720)/2:0[fg];"
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
