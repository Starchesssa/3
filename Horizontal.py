
import subprocess

input_video = "Screen_Recording_20240710-155313_TikTok Lite.mp4"
output_video = "horizontal_output.mp4"

# FFmpeg filter: Scale to fit height (1080), pad to width (1920), and blur the background
vf_filter = (
    "format=yuv420p,"
    "scale=iw:ih,"
    "split=2[main][blurred];"
    "[blurred]scale=1920:1080,boxblur=10:1[bg];"
    "[bg][main]overlay=(W-w)/2:(H-h)/2"
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
