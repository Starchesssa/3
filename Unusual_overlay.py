
import os
import subprocess

font_path = "FontsFree-Net-Proxima-Nova-Bold-It.otf.ttf"
input_folder = "Final_Videos"
output_folder = "Overlayed_Videos"
os.makedirs(output_folder, exist_ok=True)

videos = [f for f in os.listdir(input_folder) if f.endswith(".mp4")]

for video in videos:
    input_path = os.path.join(input_folder, video)
    output_path = os.path.join(output_folder, video)

    product_name = video.replace(".mp4", "").replace("_", " ").title()
    cta_text = "Product — link in the description 👇"

    cmd_probe = [
        "ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
        "stream=width,height", "-of", "csv=s=x:p=0", input_path
    ]
    try:
        output = subprocess.check_output(cmd_probe).decode().strip()
        width, height = map(int, output.split("x"))
        orientation = "vertical" if height > width else "horizontal"
    except Exception as e:
        print(f"[!] Could not probe video {video}: {e}")
        continue

    if orientation == "vertical":
        print(f"[J] Vertical video detected: {video}")

        drawtext_product = (
            f"drawtext=fontfile='{font_path}':"
            f"text='{product_name}':"
            f"fontsize=90:fontcolor=#C0C0C0:"
            f"box=1:boxcolor=black@0.8:boxborderw=5:"
            f"x=(w-text_w)/2:"
            f"y='if(lt(t,1), h+text_h, if(lt(t,2), h-(t-1)*(h-text_h-100), if(lt(t,5), h-text_h-100, NAN)))':"
            f"enable='lt(t,5)':"
            f"shadowcolor=black:shadowx=3:shadowy=3"
        )

        drawtext_cta = (
            f"drawtext=fontfile='{font_path}':"
            f"text='{cta_text}':"
            f"fontsize=60:fontcolor=white:"
            f"box=1:boxcolor=black@0.8:boxborderw=4:"
            f"x=(w-text_w)/2:"
            f"y='if(lt(t,5), NAN, if(lt(t,6), h+text_h, if(lt(t,10), h-text_h-30, NAN)))':"
            f"enable='gte(t,5)*lt(t,10)':"
            f"shadowcolor=black:shadowx=2:shadowy=2"
        )

        vf = (
            f"[0:v]scale=1280:720,boxblur=10:1[blurred];"
            f"[0:v]scale=-2:720[main];"
            f"[blurred][main]overlay=(W-w)/2:(H-h)/2,"
            f"{drawtext_product},{drawtext_cta}"
        )

        cmd_overlay = [
            "ffmpeg", "-y", "-i", input_path,
            "-vf", vf,
            "-c:v", "libx264", "-crf", "23", "-preset", "fast",
            output_path
        ]
        try:
            subprocess.run(cmd_overlay, check=True)
            print(f"[V] Overlayed: {output_path}")
        except subprocess.CalledProcessError:
            print(f"[X] FFmpeg failed for {video}")

    else:
        print(f"[+] Horizontal video detected: {video}")
        try:
            subprocess.run([
                "ffmpeg", "-y", "-i", input_path,
                "-c", "copy", output_path
            ], check=True)
            print(f"[V] Overlayed: {output_path}")
        except subprocess.CalledProcessError:
            print(f"[X] Copy failed for {video}")
