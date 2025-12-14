
#!/usr/bin/env python3
"""
advanced_depth_video.py

High-quality CPU-only 2.5D depth animation.
✔ Proper depth parallax
✔ Cinematic zoom & pan
✔ No holes / edge tearing
✔ Works with noisy depth maps
"""

import cv2
import numpy as np
from pathlib import Path
import subprocess
import random
import math

# ---------------------------
# Config
# ---------------------------
IMG_DIR = Path("BOOKS/Temp/IMG")
MAP_DIR = Path("BOOKS/Temp/MAPPINGS")
TEMP_DIR = Path("BOOKS/Temp/FRAMES")
OUT_DIR = Path("BOOKS/Temp/VIDEO")

TEMP_DIR.mkdir(parents=True, exist_ok=True)
OUT_DIR.mkdir(parents=True, exist_ok=True)

FPS = 30
DEPTH_BLUR = (31, 31)
PARALLAX_STRENGTH = 0.08
SAFETY_ZOOM = 1.05

# ---------------------------
# Utilities
# ---------------------------
def normalize_depth(depth, target_size):
    d = cv2.resize(depth, target_size, interpolation=cv2.INTER_LINEAR)
    d = d.astype(np.float32)

    if DEPTH_BLUR:
        d = cv2.GaussianBlur(d, DEPTH_BLUR, 0)

    cv2.normalize(d, d, 0.0, 1.0, cv2.NORM_MINMAX)
    return d

def ease_in_out(t):
    return 0.5 - 0.5 * math.cos(math.pi * t)

# ---------------------------
# CORE 2.5D WARP
# ---------------------------
def warp_depth_robust(img, depth_map, shift_x, shift_y, zoom):
    h, w = img.shape[:2]

    map_x, map_y = np.meshgrid(
        np.arange(w, dtype=np.float32),
        np.arange(h, dtype=np.float32)
    )

    cx, cy = w * 0.5, h * 0.5

    # --- Global Zoom ---
    total_zoom = zoom * SAFETY_ZOOM
    inv_zoom = 1.0 / total_zoom

    map_x = (map_x - cx) * inv_zoom + cx
    map_y = (map_y - cy) * inv_zoom + cy

    # --- Global Pan ---
    map_x -= shift_x * w
    map_y -= shift_y * h

    # --- Depth Parallax ---
    depth_centered = depth_map - 0.5
    parallax_px = PARALLAX_STRENGTH * w

    map_x += depth_centered * parallax_px * -shift_x * 2.0
    map_y += depth_centered * parallax_px * -shift_y * 2.0

    # --- Depth Zoom Parallax ---
    zoom_parallax = 1.0 + depth_centered * 0.15
    map_x = (map_x - cx) / zoom_parallax + cx
    map_y = (map_y - cy) / zoom_parallax + cy

    return cv2.remap(
        img,
        map_x,
        map_y,
        interpolation=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE
    )

# ---------------------------
# Styles
# ---------------------------
def style_push_in(img, d, t):
    e = ease_in_out(t)
    return warp_depth_robust(img, d, 0.0, 0.0, 1.0 + 0.12 * e)

def style_pull_out(img, d, t):
    e = ease_in_out(t)
    return warp_depth_robust(img, d, 0.0, 0.0, 1.12 - 0.12 * e)

def style_pan_left(img, d, t):
    e = ease_in_out(t)
    return warp_depth_robust(img, d, -0.06 * e, 0.0, 1.0)

def style_pan_right(img, d, t):
    e = ease_in_out(t)
    return warp_depth_robust(img, d, 0.06 * e, 0.0, 1.0)

def style_tilt_up(img, d, t):
    e = ease_in_out(t)
    return warp_depth_robust(img, d, 0.0, -0.06 * e, 1.0)

def style_tilt_down(img, d, t):
    e = ease_in_out(t)
    return warp_depth_robust(img, d, 0.0, 0.06 * e, 1.0)

def style_dolly_zoom(img, d, t):
    e = ease_in_out(t)
    return warp_depth_robust(img, d, 0.0, 0.0, 1.0 + 0.18 * e)

STYLES = [
    style_push_in,
    style_pull_out,
    style_pan_left,
    style_pan_right,
    style_tilt_up,
    style_tilt_down,
    style_dolly_zoom
]

# ---------------------------
# Timeline
# ---------------------------
def parse_timeline(map_file):
    result = []
    for line in map_file.read_text().splitlines():
        if not line.strip():
            continue
        try:
            idx, time, _ = line.split("|", 2)
            start, end = time.split("-->")
            result.append((int(idx), float(start), float(end)))
        except:
            pass
    return result

# ---------------------------
# Frame Creation
# ---------------------------
def create_clip(img_path, depth_path, duration, base, idx, style):
    img = cv2.imread(str(img_path))
    depth = cv2.imread(str(depth_path), cv2.IMREAD_GRAYSCALE)

    if img is None:
        return

    if depth is None:
        depth = np.full(img.shape[:2], 128, np.uint8)

    d = normalize_depth(depth, (img.shape[1], img.shape[0]))
    frames = max(1, int(duration * FPS))

    for f in range(frames):
        t = f / (frames - 1 if frames > 1 else 1)
        frame = style(img, d, t)

        out = TEMP_DIR / f"{base}_{idx}_{f:05d}.jpg"
        cv2.imwrite(str(out), frame, [int(cv2.IMWRITE_JPEG_QUALITY), 95])

# ---------------------------
# Video Combine
# ---------------------------
def combine_video(base):
    out = OUT_DIR / f"{base}.mp4"
    pattern = f"{TEMP_DIR}/{base}_*_[0-9][0-9][0-9][0-9][0-9].jpg"

    subprocess.run([
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-pattern_type", "glob",
        "-i", pattern,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-preset", "slow",
        str(out)
    ], stderr=subprocess.DEVNULL)

# ---------------------------
# Folder Processing
# ---------------------------
def process_folder(folder):
    base = folder.name
    map_file = MAP_DIR / f"{base}_timeline.txt"

    if not map_file.exists():
        return

    timeline = parse_timeline(map_file)
    if not timeline:
        return

    for f in TEMP_DIR.glob(f"{base}_*"):
        f.unlink()

    last_style = None

    for idx, start, end in timeline:
        duration = max(2.0, end - start)
        style = random.choice([s for s in STYLES if s != last_style])
        last_style = style

        create_clip(
            folder / f"{idx}_image.jpg",
            folder / f"{idx}_depth.png",
            duration,
            base,
            idx,
            style
        )

    combine_video(base)

# ---------------------------
# Main
# ---------------------------
def main():
    for folder in IMG_DIR.iterdir():
        if folder.is_dir():
            process_folder(folder)

if __name__ == "__main__":
    main()
