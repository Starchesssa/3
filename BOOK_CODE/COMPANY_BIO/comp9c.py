
import cv2
import numpy as np
from pathlib import Path
import subprocess
import random

IMG_DIR = Path("BOOKS/Temp/IMG")
MAP_DIR = Path("BOOKS/Temp/MAPPINGS")
TEMP_DIR = Path("BOOKS/Temp/FRAMES")
OUT_DIR = Path("BOOKS/Temp/VIDEO")

TEMP_DIR.mkdir(parents=True, exist_ok=True)
OUT_DIR.mkdir(parents=True, exist_ok=True)

FPS = 30


# -------------------------------
# Parse timeline
# -------------------------------
def parse_timeline(map_file):
    lines = map_file.read_text(encoding="utf-8").splitlines()
    result = []
    for line in lines:
        try:
            idx, time, _ = line.split("|")
            start, end = time.split("-->")
            result.append((int(idx.strip()), float(start), float(end)))
        except:
            continue
    return result


# -------------------------------
# Depth-based warp
# -------------------------------
def warp_frame(image, depth, shift_x, shift_y, t):
    d = cv2.normalize(depth.astype(np.float32), None, 0, 1.0, cv2.NORM_MINMAX)

    move_x = d * shift_x * t
    move_y = d * shift_y * t

    h, w = depth.shape
    x, y = np.meshgrid(np.arange(w), np.arange(h))

    x2 = (x - move_x).astype(np.float32)
    y2 = (y - move_y).astype(np.float32)

    warped = cv2.remap(image, x2, y2, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return warped


# -------------------------------
# Animation style functions
# -------------------------------
def style_push_in(img, depth, t):
    return warp_frame(img, depth, 0, 0, t)

def style_pull_out(img, depth, t):
    return warp_frame(img, depth, 0, 0, 1 - t)

def style_pan_left(img, depth, t):
    return warp_frame(img, depth, 15, 0, t)

def style_pan_right(img, depth, t):
    return warp_frame(img, depth, -15, 0, t)

def style_tilt_up(img, depth, t):
    return warp_frame(img, depth, 0, 12, t)

def style_tilt_down(img, depth, t):
    return warp_frame(img, depth, 0, -12, t)


# -------------------------------
# NEW STYLE 7 – Oscillating parallax + zoom
# -------------------------------
def style_7(img, depth, t):
    h, w = img.shape[:2]

    # Convert grayscale depth to normalized float
    d = cv2.normalize(depth.astype(np.float32), None, 0, 1.0, cv2.NORM_MINMAX)

    # Oscillation motion
    angle = t * 2 * np.pi
    shift_x = np.sin(angle) * 20      # left-right
    shift_y = np.cos(angle) * 12      # up-down

    # Depth-based offsets
    move_x = d * shift_x
    move_y = d * shift_y

    x, y = np.meshgrid(np.arange(w), np.arange(h))

    x2 = (x - move_x).astype(np.float32)
    y2 = (y - move_y).astype(np.float32)

    warped = cv2.remap(img, x2, y2, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

    # Depth-based zoom oscillation
    zoom = 1 + 0.05 * np.sin(angle)
    zw, zh = int(w / zoom), int(h / zoom)

    cx, cy = w // 2, h // 2
    x1, y1 = cx - zw // 2, cy - zh // 2
    crop = warped[y1:y1+zh, x1:x1+zw]

    return cv2.resize(crop, (w, h))


# --------------------------------
# Register all 7 styles
# --------------------------------
STYLES = [
    style_push_in,
    style_pull_out,
    style_pan_left,
    style_pan_right,
    style_tilt_up,
    style_tilt_down,
    style_7,        # Added new 7th style
]


# -------------------------------
# Create frames
# -------------------------------
def create_clip(image_path, depth_path, duration, base_name, index, style_fn):
    img = cv2.imread(str(image_path))
    depth = cv2.imread(str(depth_path), cv2.IMREAD_GRAYSCALE)

    if img is None or depth is None:
        print(f"❌ Missing image/depth for {index}, skipping.")
        return

    total_frames = int(duration * FPS)

    for f in range(total_frames):
        t = f / (total_frames - 1)
        frame = style_fn(img, depth, t)

        out_path = TEMP_DIR / f"{base_name}_{index}_{f:05}.jpg"
        cv2.imwrite(str(out_path), frame)


# -------------------------------
# FFmpeg join
# -------------------------------
def combine_video(base_name):
    output = OUT_DIR / f"{base_name}.mp4"

    cmd = f"""
    ffmpeg -y -framerate {FPS} -pattern_type glob -i '{TEMP_DIR}/{base_name}_*.jpg' \
    -c:v libx264 -preset fast -pix_fmt yuv420p {output}
    """

    subprocess.call(cmd, shell=True)
    print(f"🎬 Saved video → {output}")


# -------------------------------
# Process one folder
# -------------------------------
def process_folder(folder):
    base = folder.name
    map_file = MAP_DIR / f"{base}_timeline.txt"

    if not map_file.exists():
        print(f"⚠ No mapping for {base}, skipping.")
        return

    timeline = parse_timeline(map_file)
    print(f"\n🎞 Processing video for {base}")

    for f in TEMP_DIR.glob("*"):
        f.unlink()

    last_style = None

    for index, start, end in timeline:
        img_path = folder / f"{index}_image.jpg"
        depth_path = folder / f"{index}_depth.png"
        duration = end - start

        available_styles = [s for s in STYLES if s != last_style]
        style_fn = random.choice(available_styles)
        last_style = style_fn

        print(f"   → Image {index}: {duration}s | Style: {style_fn.__name__}")

        create_clip(img_path, depth_path, duration, base, index, style_fn)

    combine_video(base)


# -------------------------------
# MAIN
# -------------------------------
def main():
    print("\n🚀 ADVANCED DEPTH VIDEO MAKER STARTED\n")
    for folder in IMG_DIR.iterdir():
        if folder.is_dir():
            process_folder(folder)
    print("\n🎉 ALL VIDEOS CREATED!\n")


if __name__ == "__main__":
    main()
