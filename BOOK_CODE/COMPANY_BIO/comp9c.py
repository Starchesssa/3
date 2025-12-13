
#!/usr/bin/env python3
"""
advanced_depth_video.py (CINEMATIC VERSION)

Generates realistic, subtle depth-based parallax videos.

Folders (UNCHANGED):
BOOKS/Temp/IMG/<base>/
BOOKS/Temp/MAPPINGS/<base>_timeline.txt
BOOKS/Temp/FRAMES/
BOOKS/Temp/VIDEO/

Requirements:
pip install opencv-python numpy
ffmpeg installed
"""

import cv2
import numpy as np
from pathlib import Path
import subprocess
import random
import math

# ---------------------------
# Config (SAFE CINEMATIC)
# ---------------------------
IMG_DIR = Path("BOOKS/Temp/IMG")
MAP_DIR = Path("BOOKS/Temp/MAPPINGS")
TEMP_DIR = Path("BOOKS/Temp/FRAMES")
OUT_DIR = Path("BOOKS/Temp/VIDEO")

TEMP_DIR.mkdir(parents=True, exist_ok=True)
OUT_DIR.mkdir(parents=True, exist_ok=True)

FPS = 30
DEPTH_BLUR = (31, 31)   # smoother = safer

# ---------------------------
# Utilities
# ---------------------------
def normalize_depth(depth):
    """Normalize depth map to 0..1 (cinematic safe)."""
    d = depth.astype(np.float32)

    if DEPTH_BLUR:
        d = cv2.GaussianBlur(d, DEPTH_BLUR, 0)

    mn, mx = d.min(), d.max()
    if mx - mn < 1e-6:
        return np.zeros_like(d)

    d = (d - mn) / (mx - mn)
    return np.clip(d, 0.0, 1.0)


def cinematic_depth_pan(img, d, shift_x, shift_y):
    """
    Cinematic parallax:
    - No perspective warp
    - No geometry distortion
    - Depth used ONLY as motion weight
    """
    h, w = d.shape

    dx = (d - 0.5) * shift_x
    dy = (d - 0.5) * shift_y

    x, y = np.meshgrid(np.arange(w), np.arange(h))

    map_x = (x - dx).astype(np.float32)
    map_y = (y - dy).astype(np.float32)

    return cv2.remap(
        img,
        map_x,
        map_y,
        cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REFLECT
    )


def ease(t):
    """Smooth cinematic easing."""
    return 0.5 - 0.5 * math.cos(math.pi * t)

# ---------------------------
# Styles (REALISTIC ONLY)
# ---------------------------
def style_push_in(img, d, t):
    e = ease(t)
    return cinematic_depth_pan(img, d, 0, -4 * e)

def style_pull_out(img, d, t):
    e = ease(t)
    return cinematic_depth_pan(img, d, 0, 4 * e)

def style_pan_left(img, d, t):
    e = ease(t)
    return cinematic_depth_pan(img, d, 8 * e, 0)

def style_pan_right(img, d, t):
    e = ease(t)
    return cinematic_depth_pan(img, d, -8 * e, 0)

def style_tilt_up(img, d, t):
    e = ease(t)
    return cinematic_depth_pan(img, d, 0, -6 * e)

def style_tilt_down(img, d, t):
    e = ease(t)
    return cinematic_depth_pan(img, d, 0, 6 * e)

def style_float(img, d, t):
    x = math.sin(t * 2 * math.pi) * 4
    y = math.cos(t * 2 * math.pi) * 3
    return cinematic_depth_pan(img, d, x, y)

STYLES = [
    style_push_in,
    style_pull_out,
    style_pan_left,
    style_pan_right,
    style_tilt_up,
    style_tilt_down,
    style_float,
]

# ---------------------------
# Timeline parsing
# ---------------------------
def parse_timeline(map_file: Path):
    lines = map_file.read_text(encoding="utf-8").splitlines()
    result = []

    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            idx, time, _ = line.split("|", maxsplit=2)
            start_s, end_s = time.split("-->")
            result.append(
                (int(idx.strip()), float(start_s), float(end_s))
            )
        except Exception:
            continue

    return result

# ---------------------------
# Frame creation
# ---------------------------
def create_clip(image_path, depth_path, duration, base, index, style_fn):
    img = cv2.imread(str(image_path))
    depth = cv2.imread(str(depth_path), cv2.IMREAD_GRAYSCALE)

    if img is None or depth is None:
        print(f"❌ Missing image/depth for {index}")
        return

    d = normalize_depth(depth)
    total_frames = max(1, int(duration * FPS))

    for f in range(total_frames):
        t = f / max(1, total_frames - 1)
        frame = style_fn(img, d, t)

        out = TEMP_DIR / f"{base}_{index}_{f:05}.jpg"
        cv2.imwrite(str(out), frame, [int(cv2.IMWRITE_JPEG_QUALITY), 92])

# ---------------------------
# FFmpeg combine
# ---------------------------
def combine_video(base):
    out_file = OUT_DIR / f"{base}.mp4"
    pattern = f"{TEMP_DIR}/{base}_*_[0-9][0-9][0-9][0-9][0-9].jpg"

    cmd = [
        "ffmpeg",
        "-y",
        "-framerate", str(FPS),
        "-pattern_type", "glob",
        "-i", pattern,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        str(out_file)
    ]

    print("🎬 Encoding video...")
    subprocess.run(cmd, check=True)
    print(f"✅ Saved → {out_file}")

# ---------------------------
# Folder processing
# ---------------------------
def process_folder(folder: Path):
    base = folder.name
    map_file = MAP_DIR / f"{base}_timeline.txt"

    if not map_file.exists():
        print(f"⚠ No mapping for {base}")
        return

    timeline = parse_timeline(map_file)
    if not timeline:
        print(f"⚠ Empty timeline for {base}")
        return

    print(f"\n🎞 Processing {base}")

    # clear old frames
    for f in TEMP_DIR.glob(f"{base}_*"):
        f.unlink()

    last_style = None

    for idx, start, end in timeline:
        img_path = folder / f"{idx}_image.jpg"
        depth_path = folder / f"{idx}_depth.png"

        if not img_path.exists() or not depth_path.exists():
            print(f"⚠ Missing files for {idx}")
            continue

        duration = max(0.5, end - start)
        style = random.choice([s for s in STYLES if s != last_style])
        last_style = style

        print(f" → Clip {idx} | {duration:.2f}s | {style.__name__}")
        create_clip(img_path, depth_path, duration, base, idx, style)

    combine_video(base)

# ---------------------------
# Main
# ---------------------------
def main():
    print("\n🚀 CINEMATIC DEPTH VIDEO MAKER STARTED\n")

    for folder in sorted(IMG_DIR.iterdir()):
        if folder.is_dir():
            process_folder(folder)

    print("\n🎉 DONE — check", OUT_DIR)

if __name__ == "__main__":
    main()
