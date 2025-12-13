#!/usr/bin/env python3
"""
advanced_depth_video.py (CINEMATIC SAFE)

Depth-based animation:
- Per-image depth map
- Smooth motion
- Border-safe (no holes)
- Gentle zoom / easing
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
DEPTH_BLUR = (21, 21)
PADDING = 30  # pixels to pad image to avoid edge holes

# ---------------------------
# Utilities
# ---------------------------
def normalize_depth(depth):
    d = depth.astype(np.float32)
    if DEPTH_BLUR:
        d = cv2.GaussianBlur(d, DEPTH_BLUR, 0)
    d /= 255.0
    return np.clip(d, 0.0, 1.0)

def ease(t):
    return 0.5 - 0.5 * math.cos(math.pi * t)

def warp_depth_safe(img, d, shift_x, shift_y, zoom):
    """Warp image according to depth, safe for edges"""
    h, w = d.shape

    # Add padding to prevent holes at edges
    img_pad = cv2.copyMakeBorder(img, PADDING, PADDING, PADDING, PADDING, cv2.BORDER_REFLECT)
    d_pad = cv2.copyMakeBorder(d, PADDING, PADDING, PADDING, PADDING, cv2.BORDER_REFLECT)

    H, W = img_pad.shape[:2]
    map_x, map_y = np.meshgrid(np.arange(W), np.arange(H))

    # Depth-based motion
    dx = (d_pad - 0.5) * shift_x * w
    dy = (d_pad - 0.5) * shift_y * h
    map_x = (map_x + dx).astype(np.float32)
    map_y = (map_y + dy).astype(np.float32)

    # Remap
    warped = cv2.remap(img_pad, map_x, map_y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

    # Zoom crop
    cx, cy = W // 2, H // 2
    zw, zh = int(w / zoom), int(h / zoom)
    x1 = max(0, cx - zw // 2)
    y1 = max(0, cy - zh // 2)
    x2 = x1 + zw
    y2 = y1 + zh
    cropped = warped[y1:y2, x1:x2]

    return cv2.resize(cropped, (w, h))

# ---------------------------
# Styles
# ---------------------------
def style_push_in(img, d, t):
    e = ease(t)
    return warp_depth_safe(img, d, 0.0, -0.03*e, 1.0 + 0.06*e)

def style_pull_out(img, d, t):
    e = ease(t)
    return warp_depth_safe(img, d, 0.0, 0.03*e, 1.06 - 0.06*e)

def style_pan_left(img, d, t):
    e = ease(t)
    return warp_depth_safe(img, d, 0.05*e, 0.0, 1.05)

def style_pan_right(img, d, t):
    e = ease(t)
    return warp_depth_safe(img, d, -0.05*e, 0.0, 1.05)

def style_tilt_up(img, d, t):
    e = ease(t)
    return warp_depth_safe(img, d, 0.0, -0.04*e, 1.05)

def style_tilt_down(img, d, t):
    e = ease(t)
    return warp_depth_safe(img, d, 0.0, 0.04*e, 1.05)

def style_float(img, d, t):
    angle = t*2*math.pi
    sx = math.sin(angle)*0.05
    sy = math.cos(angle)*0.03
    zoom = 1.0 + 0.08*math.sin(angle*0.5)
    return warp_depth_safe(img, d, sx, sy, zoom)

STYLES = [style_push_in, style_pull_out, style_pan_left, style_pan_right,
          style_tilt_up, style_tilt_down, style_float]

# ---------------------------
# Timeline parsing
# ---------------------------
def parse_timeline(map_file: Path):
    lines = map_file.read_text(encoding="utf-8").splitlines()
    result = []
    for line in lines:
        if not line.strip(): continue
        try:
            idx, time, _ = line.split("|", maxsplit=2)
            start_s, end_s = time.split("-->")
            result.append((int(idx), float(start_s), float(end_s)))
        except: pass
    return result

# ---------------------------
# Frame creation
# ---------------------------
def create_clip(img_path, depth_path, duration, base, idx, style_fn):
    img = cv2.imread(str(img_path))
    depth = cv2.imread(str(depth_path), cv2.IMREAD_GRAYSCALE)
    if img is None or depth is None: return
    depth = cv2.resize(depth, (img.shape[1], img.shape[0]))
    d = normalize_depth(depth)

    total_frames = max(1, int(duration*FPS))
    for f in range(total_frames):
        t = f / (total_frames - 1 if total_frames > 1 else 1)
        frame = style_fn(img, d, t)
        out = TEMP_DIR / f"{base}_{idx}_{f:05}.jpg"
        cv2.imwrite(str(out), frame, [int(cv2.IMWRITE_JPEG_QUALITY), 92])

# ---------------------------
# FFmpeg combine
# ---------------------------
def combine_video(base):
    out_file = OUT_DIR / f"{base}.mp4"
    pattern = f"{TEMP_DIR}/{base}_*_[0-9][0-9][0-9][0-9][0-9].jpg"
    subprocess.run([
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-pattern_type", "glob",
        "-i", pattern,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        str(out_file)
    ], check=True)

# ---------------------------
# Folder processing
# ---------------------------
def process_folder(folder: Path):
    base = folder.name
    map_file = MAP_DIR / f"{base}_timeline.txt"
    if not map_file.exists(): return

    timeline = parse_timeline(map_file)
    if not timeline: return

    for f in TEMP_DIR.glob(f"{base}_*"): f.unlink()
    last_style = None

    for idx, start, end in timeline:
        img_path = folder / f"{idx}_image.jpg"
        depth_path = folder / f"{idx}_depth.png"
        if not img_path.exists() or not depth_path.exists(): continue

        duration = max(0.5, end-start)
        style = random.choice([s for s in STYLES if s != last_style])
        last_style = style
        create_clip(img_path, depth_path, duration, base, idx, style)

    combine_video(base)

# ---------------------------
# Main
# ---------------------------
def main():
    for folder in sorted(IMG_DIR.iterdir()):
        if folder.is_dir():
            process_folder(folder)

if __name__ == "__main__":
    main()
