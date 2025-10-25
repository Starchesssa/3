
import cv2
import numpy as np
import os

# --- CONFIGURATION ---
VIDEO_SIZE = (1280, 720)   # (width, height)
VIDEO_DURATION = 5         # seconds
VIDEO_FPS = 30
OUTPUT_FILENAME = "BOOK_CODE/PARALLAX/output_cv2_parallax.mp4"
SOURCE_IMAGE = "BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg"

GRID_SIZE = (8, 6)   # columns, rows
BLEED_FACTOR = 0.5   # how much extra area each tile gets to avoid gaps
MAX_ZOOM = 0.4       # how much central tiles zoom in
MAX_OFFSET = 0.2     # how much outer tiles move outward

# --- LOAD IMAGE ---
img = cv2.imread(SOURCE_IMAGE)
if img is None:
    raise FileNotFoundError(SOURCE_IMAGE)

# Resize to match video
img = cv2.resize(img, VIDEO_SIZE)
h, w, _ = img.shape
center = np.array([w/2, h/2])
max_dist = np.linalg.norm(center)

tile_w = w / GRID_SIZE[0]
tile_h = h / GRID_SIZE[1]

# --- CREATE TILES ---
tiles = []
for i in range(GRID_SIZE[0]):
    for j in range(GRID_SIZE[1]):
        x1 = int(i * tile_w - tile_w * BLEED_FACTOR / 2)
        y1 = int(j * tile_h - tile_h * BLEED_FACTOR / 2)
        x2 = int((i + 1) * tile_w + tile_w * BLEED_FACTOR / 2)
        y2 = int((j + 1) * tile_h + tile_h * BLEED_FACTOR / 2)
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        tile = img[y1:y2, x1:x2]
        
        # calculate position info
        tile_center = np.array([i * tile_w + tile_w/2, j * tile_h + tile_h/2])
        dist = np.linalg.norm(tile_center - center)
        norm_dist = dist / max_dist
        direction = tile_center - center
        if np.linalg.norm(direction) > 0:
            direction /= np.linalg.norm(direction)
        tiles.append({
            "image": tile,
            "pos": (i * tile_w, j * tile_h),
            "dir": direction,
            "dist": norm_dist,
            "size": tile.shape[1::-1]  # (w,h)
        })

# --- VIDEO WRITER ---
fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # ensures universal playback
out = cv2.VideoWriter(OUTPUT_FILENAME, fourcc, VIDEO_FPS, (w, h))

total_frames = int(VIDEO_DURATION * VIDEO_FPS)

print("Rendering parallax animation...")

# --- ANIMATION LOOP ---
for f in range(total_frames):
    t = f / total_frames
    frame = np.zeros_like(img)

    for tile in tiles:
        tw, th = tile["size"]
        d = tile["dist"]
        dir_vec = tile["dir"]

        # Calculate zoom and offset
        zoom = 1 + (1 - d) * MAX_ZOOM * t
        offset = dir_vec * d * MAX_OFFSET * w * t

        # Resize tile
        new_w = int(tw * zoom)
        new_h = int(th * zoom)
        resized = cv2.resize(tile["image"], (new_w, new_h))

        # Position
        x = int(tile["pos"][0] + offset[0] - (new_w - tw) / 2)
        y = int(tile["pos"][1] + offset[1] - (new_h - th) / 2)

        # Clip bounds
        x1, y1 = max(0, x), max(0, y)
        x2 = min(w, x + new_w)
        y2 = min(h, y + new_h)

        if x1 < x2 and y1 < y2:
            sub_img = resized[0:y2 - y1, 0:x2 - x1]
            frame[y1:y2, x1:x2] = sub_img

    out.write(frame)

out.release()
print(f"✅ Video saved: {OUTPUT_FILENAME}")
