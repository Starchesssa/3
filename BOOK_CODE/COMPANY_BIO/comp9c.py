#!/usr/bin/env python3
"""
advanced_depth_video.py

Generates depth-driven parallax videos for all folders in:
BOOKS/Temp/IMG/<base>/

Requires:
    pip install opencv-python numpy
    ffmpeg (system)

What it does:
 - Parses mapping files in BOOKS/Temp/MAPPINGS/<base>_timeline.txt
 - For each timeline entry (index, start, end) it loads:
       BOOKS/Temp/IMG/<base>/<index>_image.jpg
       BOOKS/Temp/IMG/<base>/<index>_depth.png
 - Produces frames using one of 7 depth-driven styles (never repeating style twice)
 - Combines frames into BOOKS/Temp/VIDEO/<base>.mp4 via ffmpeg
"""

import cv2
import numpy as np
from pathlib import Path
import subprocess
import random
import math
import os
import shutil

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

# Depth tuning:
# Medium (B) vs Soft (C) mapping presets used inside styles:
MEDIUM_STRENGTH = 40.0   # medium 3D pop
SOFT_STRENGTH = 14.0     # subtle movement

# Common blur to smooth depth (reduces tearing)
DEPTH_BLUR = (21, 21)

# ---------------------------
# Utilities
# ---------------------------
def safe_crop_and_resize(img, cx, cy, zw, zh, out_w, out_h):
    h, w = img.shape[:2]
    x1 = int(round(cx - zw / 2))
    y1 = int(round(cy - zh / 2))
    x2 = x1 + zw
    y2 = y1 + zh

    # clamp
    x1c = max(0, x1)
    y1c = max(0, y1)
    x2c = min(w, x2)
    y2c = min(h, y2)

    crop = img[y1c:y2c, x1c:x2c]
    if crop.size == 0:
        # fallback: resize original
        return cv2.resize(img, (out_w, out_h))
    return cv2.resize(crop, (out_w, out_h))


def normalize_depth(depth):
    """Return depth map normalized to 0..1, smoothed and gamma-adjusted to emphasize foreground."""
    # convert to float, blur and normalize
    d = depth.astype(np.float32)
    if DEPTH_BLUR is not None:
        d = cv2.GaussianBlur(d, DEPTH_BLUR, 0)
    # Normalize to 0..1
    mn, mx = d.min(), d.max()
    if mx - mn < 1e-6:
        d = np.clip(d / 255.0, 0.0, 1.0)
    else:
        d = (d - mn) / (mx - mn)
    # Emphasize foreground: square then re-normalize
    d = np.clip(d, 0.0, 1.0)
    d = d ** 1.6   # nonlinear to boost contrast foreground vs bg
    return d


def warp_with_perspective_and_shift(img, d, shift_x_px, shift_y_px, strength):
    """
    Core warp function:
      - d: normalized depth 0..1 (foreground ~1)
      - shift_x_px, shift_y_px: base camera movement in pixels
      - strength: scalar multiplier for depth effect
    Returns warped image (same size).
    """
    h, w = d.shape
    # Depth-based displacement map (squared weighting)
    disp = (d ** 2) * strength  # foreground heavier
    # base shift scaled per-pixel
    move_x = disp * shift_x_px
    move_y = disp * shift_y_px

    # Add soft perspective: pixels farther from center shift more/less
    cx = w / 2.0
    cy = h / 2.0
    x, y = np.meshgrid(np.arange(w), np.arange(h))

    # perspective scale factor (small)
    persp = 0.015  # tweakable
    px = (x - cx) * (disp * persp)
    py = (y - cy) * (disp * persp)

    map_x = (x - move_x - px).astype(np.float32)
    map_y = (y - move_y - py).astype(np.float32)

    warped = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return warped


# ---------------------------
# Styles (all use depth map d)
# ---------------------------
# All style functions receive (img, depth_normalized, t) where t in [0,1] progress
# each returns a single RGB frame (H,W,3)

def style_push_in(img, d, t):
    """Medium forward push: camera moves slightly forward — foreground expands."""
    # medium strength
    strength = MEDIUM_STRENGTH
    # movement grows with t
    base_shift = 1.0 * (t)  # normalized put into px below
    shift_x_px = 0.0
    shift_y_px = 0.0
    # small zoom that depends on depth: foreground expands
    zoom = 1.0 + 0.06 * t
    # warp then zoom
    warped = warp_with_perspective_and_shift(img, d, shift_x_px * base_shift, shift_y_px * base_shift, strength)
    h, w = d.shape
    zw, zh = int(w / zoom), int(h / zoom)
    return safe_crop_and_resize(warped, w/2, h/2, zw, zh, w, h)


def style_pull_out(img, d, t):
    """Medium pull-out: camera moves back, depth collapses."""
    strength = MEDIUM_STRENGTH
    base_shift = 1.0 * (1.0 - t)  # reverse progress
    shift_x_px = 0.0
    shift_y_px = 0.0
    zoom = 1.06 - 0.06 * t
    warped = warp_with_perspective_and_shift(img, d, shift_x_px * base_shift, shift_y_px * base_shift, strength)
    h, w = d.shape
    zw, zh = int(w / zoom), int(h / zoom)
    return safe_crop_and_resize(warped, w/2, h/2, zw, zh, w, h)


def style_pan_left(img, d, t):
    """Soft pan left: camera drifts left; foreground shifts more."""
    strength = SOFT_STRENGTH
    # map t to an ease-in/out
    ease = 0.5 - 0.5 * math.cos(math.pi * t)  # smooth
    shift_x_px = 24.0 * ease  # pan magnitude in px
    shift_y_px = 0.0
    warped = warp_with_perspective_and_shift(img, d, shift_x_px, shift_y_px, strength)
    return warped


def style_pan_right(img, d, t):
    """Soft pan right: camera drifts right."""
    strength = SOFT_STRENGTH
    ease = 0.5 - 0.5 * math.cos(math.pi * t)
    shift_x_px = -24.0 * ease
    shift_y_px = 0.0
    warped = warp_with_perspective_and_shift(img, d, shift_x_px, shift_y_px, strength)
    return warped


def style_tilt_up(img, d, t):
    """Medium tilt up: camera tilts up (vertical parallax)."""
    strength = MEDIUM_STRENGTH
    ease = 0.5 - 0.5 * math.cos(math.pi * t)
    shift_x_px = 0.0
    shift_y_px = -18.0 * ease
    warped = warp_with_perspective_and_shift(img, d, shift_x_px, shift_y_px, strength)
    # slight upward zoom for dynamism
    h, w = d.shape
    zoom = 1.0 + 0.025 * ease
    zw, zh = int(w / zoom), int(h / zoom)
    return safe_crop_and_resize(warped, w/2, h/2 - h*0.03*ease, zw, zh, w, h)


def style_tilt_down(img, d, t):
    """Medium tilt down: camera tilts down (vertical parallax)."""
    strength = MEDIUM_STRENGTH
    ease = 0.5 - 0.5 * math.cos(math.pi * t)
    shift_x_px = 0.0
    shift_y_px = 18.0 * ease
    warped = warp_with_perspective_and_shift(img, d, shift_x_px, shift_y_px, strength)
    h, w = d.shape
    zoom = 1.0 + 0.025 * ease
    zw, zh = int(w / zoom), int(h / zoom)
    return safe_crop_and_resize(warped, w/2, h/2 + h*0.03*ease, zw, zh, w, h)


def style_7_float_zoom(img, d, t):
    """
    Smooth float + breathing zoom based on sine wave.
    Soft and cinematic; uses depth-driven offsets for believable motion.
    """
    strength = SOFT_STRENGTH
    # floating frequency and amplitude
    angle = t * 2.0 * math.pi
    float_x = math.sin(angle * 1.0) * 10.0  # px
    float_y = math.cos(angle * 0.75) * 6.0
    # breathing zoom (subtle)
    zoom = 1.0 + 0.03 * math.sin(angle * 0.5)

    # warp with per-axis shifts scaled by depth
    warped = warp_with_perspective_and_shift(img, d, float_x, float_y, strength)
    h, w = d.shape
    zw, zh = int(w / zoom), int(h / zoom)
    return safe_crop_and_resize(warped, w/2, h/2, zw, zh, w, h)


# Register styles list (do not repeat same style twice in a row)
STYLES = [
    style_push_in,
    style_pull_out,
    style_pan_left,
    style_pan_right,
    style_tilt_up,
    style_tilt_down,
    style_7_float_zoom,
]


# ---------------------------
# Frame creation
# ---------------------------
def create_clip(image_path, depth_path, duration, base_name, index, style_fn):
    img_bgr = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
    depth_gray = cv2.imread(str(depth_path), cv2.IMREAD_GRAYSCALE)

    if img_bgr is None or depth_gray is None:
        print(f"❌ Missing image/depth for {index}, skipping.")
        return

    # normalize depth (0..1) and smooth
    d = normalize_depth(depth_gray)

    total_frames = max(1, int(round(duration * FPS)))
    h, w = d.shape
    # produce frames
    for f in range(total_frames):
        t = f / max(1, (total_frames - 1))
        frame = style_fn(img_bgr, d, t)
        # ensure BGR->RGB not necessary for cv2 saving (BGR ok)
        out_path = TEMP_DIR / f"{base_name}_{index}_{f:05}.jpg"
        cv2.imwrite(str(out_path), frame, [int(cv2.IMWRITE_JPEG_QUALITY), 92])


# ---------------------------
# Timeline parse
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
            result.append((int(idx.strip()), float(start_s.strip()), float(end_s.strip())))
        except Exception:
            # ignore malformed lines
            continue
    return result


# ---------------------------
# FFmpeg combine
# ---------------------------
def combine_video(base_name):
    out_file = OUT_DIR / f"{base_name}.mp4"
    # use glob pattern for files matching base_name_index_*.jpg
    pattern = f"{TEMP_DIR}/{base_name}_*_[0-9][0-9][0-9][0-9][0-9].jpg"
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
    print("🔁 Running ffmpeg to encode:", " ".join(cmd))
    try:
        subprocess.run(cmd, check=True)
        print(f"🎬 Saved video → {out_file}")
    except subprocess.CalledProcessError as e:
        print("❌ ffmpeg failed:", e)


# ---------------------------
# Folder processing
# ---------------------------
def process_folder(folder: Path):
    base = folder.name
    map_file = MAP_DIR / f"{base}_timeline.txt"
    if not map_file.exists():
        print(f"⚠ No mapping found for {base}, skipping.")
        return

    timeline = parse_timeline(map_file)
    if not timeline:
        print(f"⚠ Empty timeline for {base}, skipping.")
        return

    print(f"\n🎞 Processing {base} — {len(timeline)} clips")

    # clear frames for this base
    for f in TEMP_DIR.glob(f"{base}_*_*"):
        try:
            f.unlink()
        except Exception:
            pass

    last_style = None
    for idx, start, end in timeline:
        img_path = folder / f"{idx}_image.jpg"
        depth_path = folder / f"{idx}_depth.png"
        if not img_path.exists() or not depth_path.exists():
            print(f"⚠ Missing files for {idx}: {img_path.name} or {depth_path.name} — skipping")
            continue

        duration = max(0.5, end - start)
        # pick style not equal to last_style
        available = [s for s in STYLES if s != last_style]
        style_fn = random.choice(available)
        last_style = style_fn

        print(f"   → Clip {idx}: {duration:.2f}s | style: {style_fn.__name__}")
        create_clip(img_path, depth_path, duration, base, idx, style_fn)

    # combine into mp4
    combine_video(base)


# ---------------------------
# Main
# ---------------------------
def main():
    print("\n🚀 ADVANCED DEPTH VIDEO MAKER (7 styles) STARTED\n")
    if not IMG_DIR.exists():
        print("❌ IMG_DIR not found:", IMG_DIR)
        return
    # iterate base folders
    for folder in sorted(IMG_DIR.iterdir()):
        if folder.is_dir():
            process_folder(folder)

    print("\n🎉 ALL DONE — check", OUT_DIR.absolute())


if __name__ == "__main__":
    main()
