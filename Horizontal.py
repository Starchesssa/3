
import subprocess

input_video = "Screen_Recording_20240710-155313_TikTok Lite.mp4"
output_video = "horizontal_output.mp4"

vf_filter = (
    "format=yuv420p,"
    "split[main][bg];"
    "[bg]scale=ih*16/9:-1,crop=1920:1080,gblur=sigma=60[blurred];"
    "[main]scale=iw*1.1:ih*1.1[zoomed];"
    "[blurred][zoomed]overlay=(W-w)/2:(H-h)/2"
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
    print(f"[✓] Done! Saved as {output_video}")
except subprocess.CalledProcessError as e:
    print("[X] FFmpeg failed:", e)
