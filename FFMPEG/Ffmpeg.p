import json
import sys
import os

# =========================
# Reveal Effect Definitions
# =========================
REVEALS = {
    "3d_left": lambda s, e: (
        f"scale='iw*(1.3-0.3*(t-{s})/{e})':ih*(1.3-0.3*(t-{s})/{e})',"
        f"overlay=x='(W-w)/2 - (1-(t-{s})/{e})*400':y='(H-h)/2'"
    ),
    "3d_right": lambda s, e: (
        f"scale='iw*(1.3-0.3*(t-{s})/{e})':ih*(1.3-0.3*(t-{s})/{e})',"
        f"overlay=x='(W-w)/2 + (1-(t-{s})/{e})*400':y='(H-h)/2'"
    ),
    "bottom_slide": lambda s, e: (
        f"overlay=x='(W-w)/2':y='H - ((t-{s})/({e}-{s}))*H'"
    ),
    "top_reveal": lambda s, e: (
        f"overlay=x='(W-w)/2':y='-h + ((t-{s})/({e}-{s}))*H'"
    ),
    "fade_in": lambda s, e: (
        f"format=rgba,colorchannelmixer=aa='(t-{s})/({e}-{s})'"
    ),
    "zoom_in": lambda s, e: (
        f"scale='iw*(0.5+(t-{s})/({e}-{s})*0.5)':ih*(0.5+(t-{s})/({e}-{s})*0.5)',"
        f"overlay=x='(W-w)/2':y='(H-h)/2'"
    ),
    "zoom_out": lambda s, e: (
        f"scale='iw*(1.5 - 0.5*(t-{s})/({e}-{s}))':ih*(1.5 - 0.5*(t-{s})/({e}-{s}))',"
        f"overlay=x='(W-w)/2':y='(H-h)/2'"
    ),
    "slide_in_left": lambda s, e: (
        f"overlay=x='-w + ((t-{s})/({e}-{s}))*((W/2)+(w/2))':y='(H-h)/2'"
    ),
    "slide_in_right": lambda s, e: (
        f"overlay=x='W + w - ((t-{s})/({e}-{s}))*((W/2)+(w/2))':y='(H-h)/2'"
    ),
    "slide_in_diag": lambda s, e: (
        f"overlay=x='W - ((t-{s})/({e}-{s}))*((W/2)+(w/2))':y='H - ((t-{s})/({e}-{s}))*((H/2)+(h/2))'"
    ),
    "background_zoomout": lambda s, e: (
        f"scale='iw*(1.2-0.2*(t-{s})/({e}-{s}))':ih*(1.2-0.2*(t-{s})/({e}-{s}))',"
        f"overlay=x='(W-w)/2':y='(H-h)/2'"
    )
}

# =========================
# Layer Ordering
# =========================
LAYER_ORDER = {
    "background": 0,
    "midground": 1,
    "foreground": 2
}

# =========================
# Build FFmpeg Command
# =========================
def build_ffmpeg(json_file, images_dir="FFMPEG/Images", output="output.mp4"):
    with open(json_file, "r") as f:
        data = json.load(f)

    input_parts = []
    filter_parts = []
    idx = 0

    # Load all images from the folder automatically
    existing_images = set(os.listdir(images_dir))

    for item in data:
        if "image" in item:
            image_file = item["image"]
            if image_file not in existing_images:
                raise FileNotFoundError(f"Image {image_file} not found in {images_dir}")
            input_parts.append(f"-loop 1 -t {item['end'] - item['start']} -i {os.path.join(images_dir, image_file)}")
        else:
            continue

    # Sort images by layer to keep background < mid < fore
    sorted_items = sorted([i for i in data if "image" in i],
                          key=lambda x: LAYER_ORDER.get(x["layer"], 99))

    for item in sorted_items:
        start = item["time"][0] if "time" in item else item["start"]
        end = item["time"][1] if "time" in item else item["end"]
        reveal = item["reveal"]

        if reveal not in REVEALS:
            raise ValueError(f"Unknown reveal: {reveal}")

        filter_expr = REVEALS[reveal](start, end)
        filter_parts.append(f"[{idx}:v]{filter_expr}[v{idx}]")
        idx += 1

    filter_complex = ";".join(filter_parts)
    cmd = f"ffmpeg {' '.join(input_parts)} -filter_complex \"{filter_complex}\" -pix_fmt yuv420p {output}"
    return cmd


# =========================
# CLI
# =========================
if __name__ == "__main__":
    json_path = "FFMPEG/Json/your.json"
    output_file = "output.mp4"

    command = build_ffmpeg(json_path, "FFMPEG/Images", output_file)
    print("\nGenerated FFmpeg Command:\n")
    print(command)
