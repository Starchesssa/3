#!/usr/bin/env python3
"""
advanced_depth_video.py (FIXED)

2.5D Parallax Animation:
- Solves "Holes" using Replicate Borders + Safety Crop
- Solves "No Motion" by fixing float math and coordinate grids
- Higher quality output
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
DEPTH_BLUR = (21, 21) # Smooths depth map to prevent tearing
PARALLAX_STRENGTH = 0.05 # How much the depth layer moves (5% of width)
SAFETY_ZOOM = 1.05       # Default zoom to hide edges

# ---------------------------
# Utilities
# ---------------------------
def normalize_depth(depth, target_size):
    """
    Resize depth to match image exactly and normalize to 0.0 - 1.0 float.
    """
    # Resize depth to match image (w, h)
    d = cv2.resize(depth, target_size, interpolation=cv2.INTER_LINEAR)
    d = d.astype(np.float32)
    
    # Blur to reduce sharp jagged edges in movement
    if DEPTH_BLUR:
        d = cv2.GaussianBlur(d, DEPTH_BLUR, 0)
        
    # Normalize 0-255 -> 0.0-1.0
    cv2.normalize(d, d, 0, 1, cv2.NORM_MINMAX)
    return d

def ease_in_out(t):
    """Smooth acceleration and deceleration."""
    return t * t * (3.0 - 2.0 * t)

def warp_depth_robust(img, depth_map, shift_x, shift_y, zoom):
    """
    Robust 2.5D displacement.
    1. Creates a meshgrid of coordinates.
    2. Applies Camera Pan/Zoom (Global movement).
    3. Applies Depth Parallax (Local movement based on depth).
    4. Remaps with BORDER_REPLICATE to prevent holes.
    """
    h, w = img.shape[:2]
    
    # 1. Base Grid (Destination Coordinates)
    # These are the pixels we want to fill in the final image
    map_x, map_y = np.meshgrid(np.arange(w), np.arange(h))
    map_x = map_x.astype(np.float32)
    map_y = map_y.astype(np.float32)

    # 2. Apply Zoom (centered)
    # To zoom IN, we need to pick pixels closer to the center.
    # Logic: (coord - center) / zoom + center
    cx, cy = w / 2, h / 2
    
    # Combined zoom: The Style Zoom * The Safety Zoom (to hide edges)
    total_zoom = zoom * SAFETY_ZOOM
    scale_factor = 1.0 / total_zoom
    
    map_x = (map_x - cx) * scale_factor + cx
    map_y = (map_y - cy) * scale_factor + cy

    # 3. Apply Camera Pan (Global Shift)
    # To pan RIGHT, we look at pixels to the LEFT.
    # shift values are -1.0 to 1.0 relative to image size
    pan_x_px = shift_x * w
    pan_y_px = shift_y * h
    
    map_x -= pan_x_px
    map_y -= pan_y_px

    # 4. Apply Depth Parallax
    # We want foreground (High Depth) to move differently than background.
    # Parallax Logic: Look up pixel + (Depth * Strength).
    # Note: We are sampling depth from the ORIGINAL coordinates roughly. 
    # Since depth map matches image size, we can just use the depth_map directly.
    # However, 'remap' needs coordinates. We add the offset to the map.
    
    # Strength in pixels
    offset_x = PARALLAX_STRENGTH * w
    offset_y = PARALLAX_STRENGTH * h
    
    # Invert mapping: To simulate camera moving Right, 
    # Foreground (1.0) shifts Left (looks at Right pixels) relative to Background (0.0).
    # map_x represents "Where do I get the pixel from?".
    # If we want the foreground to appear shifted left, we grab from the right (+).
    
    # Apply parallax based on the movement direction
    # If panning X, depth affects X. 
    depth_effect_x = (depth_map * offset_x * -shift_x * 5.0) 
    depth_effect_y = (depth_map * offset_y * -shift_y * 5.0)

    map_x += depth_effect_x
    map_y += depth_effect_y

    # 5. Remap
    # INTER_CUBIC is slower but looks much sharper and nicer for video
    # BORDER_REPLICATE fills "holes" by stretching the last valid pixel. 
    # Because we zoomed in (Step 2), these stretched pixels are usually cropped out.
    warped = cv2.remap(img, map_x, map_y, 
                       interpolation=cv2.INTER_CUBIC, 
                       borderMode=cv2.BORDER_REPLICATE)
    
    return warped

# ---------------------------
# Styles (Movement definitions)
# ---------------------------
# shift_x/y: -1.0 to 1.0 (Direction and speed)
# zoom: 1.0 is default. >1.0 is zoom in.

def style_push_in(img, d, t):
    e = ease_in_out(t)
    # Zoom in significantly, slight parallax shift
    return warp_depth_robust(img, d, 0.0, 0.0, 1.0 + (0.1 * e))

def style_pull_out(img, d, t):
    e = ease_in_out(t)
    return warp_depth_robust(img, d, 0.0, 0.0, 1.1 - (0.1 * e))

def style_pan_left(img, d, t):
    e = ease_in_out(t)
    # Camera moves left (image moves right), parallax active
    return warp_depth_robust(img, d, -0.05 * e, 0.0, 1.0)

def style_pan_right(img, d, t):
    e = ease_in_out(t)
    # Camera moves right
    return warp_depth_robust(img, d, 0.05 * e, 0.0, 1.0)

def style_tilt_up(img, d, t):
    e = ease_in_out(t)
    return warp_depth_robust(img, d, 0.0, -0.05 * e, 1.0)

def style_tilt_down(img, d, t):
    e = ease_in_out(t)
    return warp_depth_robust(img, d, 0.0, 0.05 * e, 1.0)

def style_dolly_zoom(img, d, t):
    # The "Vertigo" effect: Zoom in while pulling camera back (via depth)
    e = ease_in_out(t)
    z = 1.0 + (0.15 * e) # Zoom in
    # Use depth to distort center vs edges
    return warp_depth_robust(img, d, 0.0, 0.0, z)

STYLES = [style_push_in, style_pull_out, style_pan_left, style_pan_right,
          style_tilt_up, style_tilt_down, style_dolly_zoom]

# ---------------------------
# Timeline parsing
# ---------------------------
def parse_timeline(map_file: Path):
    lines = map_file.read_text(encoding="utf-8").splitlines()
    result = []
    for line in lines:
        if not line.strip(): continue
        try:
            # Format: ID|Start-->End|Text
            idx, time, _ = line.split("|", maxsplit=2)
            start_s, end_s = time.split("-->")
            result.append((int(idx), float(start_s), float(end_s)))
        except: 
            pass
    return result

# ---------------------------
# Frame creation
# ---------------------------
def create_clip(img_path, depth_path, duration, base, idx, style_fn):
    print(f"Processing: {img_path.name} -> Style: {style_fn.__name__}")
    
    img = cv2.imread(str(img_path))
    raw_depth = cv2.imread(str(depth_path), cv2.IMREAD_GRAYSCALE)
    
    if img is None:
        print(f"Error: Missing image {img_path}")
        return
    if raw_depth is None:
        # Create fake flat depth if missing to allow processing
        print(f"Warning: Missing depth {depth_path}, using flat map.")
        raw_depth = np.full((img.shape[0], img.shape[1]), 128, dtype=np.uint8)

    # Prepare Depth
    d = normalize_depth(raw_depth, (img.shape[1], img.shape[0]))

    total_frames = max(1, int(duration * FPS))
    
    for f in range(total_frames):
        # Normalized time 0.0 -> 1.0
        t = f / (total_frames - 1 if total_frames > 1 else 1)
        
        frame = style_fn(img, d, t)
        
        # Save
        out_name = f"{base}_{idx}_{f:05d}.jpg"
        out_path = TEMP_DIR / out_name
        cv2.imwrite(str(out_path), frame, [int(cv2.IMWRITE_JPEG_QUALITY), 95])

# ---------------------------
# FFmpeg combine
# ---------------------------
def combine_video(base):
    out_file = OUT_DIR / f"{base}.mp4"
    # Note: glob pattern must match the 5 digit padding in create_clip
    pattern = f"{TEMP_DIR}/{base}_*_[0-9][0-9][0-9][0-9][0-9].jpg"
    
    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-pattern_type", "glob",
        "-i", pattern,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "slow",     # Better compression
        "-crf", "18",          # High quality
        str(out_file)
    ]
    
    try:
        subprocess.run(cmd, check=True, stderr=subprocess.DEVNULL)
        print(f"Generated Video: {out_file}")
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg Error for {base}")

# ---------------------------
# Folder processing
# ---------------------------
def process_folder(folder: Path):
    base = folder.name
    map_file = MAP_DIR / f"{base}_timeline.txt"
    
    if not map_file.exists(): 
        # Fallback: if no timeline, look for all image pairs and make 3s clips
        print(f"No timeline for {base}, skipping...")
        return

    timeline = parse_timeline(map_file)
    if not timeline: return

    # Clean old frames for this book
    for f in TEMP_DIR.glob(f"{base}_*"): f.unlink()
    
    last_style = None

    for idx, start, end in timeline:
        img_path = folder / f"{idx}_image.jpg"
        depth_path = folder / f"{idx}_depth.png"
        
        # Duration logic
        duration = end - start
        if duration < 0.5: duration = 2.0 # Minimum clip length safety
        
        # Pick random style but don't repeat immediately
        possible_styles = [s for s in STYLES if s != last_style]
        style = random.choice(possible_styles)
        last_style = style
        
        create_clip(img_path, depth_path, duration, base, idx, style)

    combine_video(base)

# ---------------------------
# Main
# ---------------------------
def main():
    if not IMG_DIR.exists():
        print(f"Error: Directory {IMG_DIR} not found.")
        return

    for folder in sorted(IMG_DIR.iterdir()):
        if folder.is_dir():
            process_folder(folder)
            
    # Cleanup frames after running (optional)
    # for f in TEMP_DIR.glob("*.jpg"): f.unlink()

if __name__ == "__main__":
    main()
