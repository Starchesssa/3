import moviepy.editor as mpy
from moviepy.video.fx.all import crop
import numpy as np
import os

# --- 1. CONFIGURATION ---
SOURCE_IMAGE = "BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg"
OUTPUT_FILENAME = "BOOK_CODE/PARALLAX/parallax_output.mp4"

VIDEO_SIZE = (1280, 720)  # output resolution
VIDEO_DURATION = 5        # seconds
VIDEO_FPS = 30            # frames per second

GRID_SIZE = (8, 6)        # how many tiles across (cols, rows)
BLEED_FACTOR = 0.5        # extra crop area to prevent black gaps

MAX_ZOOM = 0.4            # how much the center zooms
MAX_OFFSET = 0.2          # how much outer tiles move outward

# --- 2. LOAD IMAGE ---
print("🔹 Loading source image...")
base_image = mpy.ImageClip(SOURCE_IMAGE)\
    .set_duration(VIDEO_DURATION)\
    .resize(height=VIDEO_SIZE[1])\
    .set_position("center")

final_composition = mpy.CompositeVideoClip([base_image], size=VIDEO_SIZE).set_opacity(0)

# --- 3. CREATE ANIMATED TILES ---
print("🔹 Creating parallax tiles...")
tiles = []
tile_w = VIDEO_SIZE[0] / GRID_SIZE[0]
tile_h = VIDEO_SIZE[1] / GRID_SIZE[1]
video_center = np.array(VIDEO_SIZE) / 2
max_dist = np.linalg.norm(video_center)

for i in range(GRID_SIZE[0]):
    for j in range(GRID_SIZE[1]):
        grid_x = i * tile_w
        grid_y = j * tile_h

        # Bleed to avoid gaps
        bleed_w = tile_w * BLEED_FACTOR
        bleed_h = tile_h * BLEED_FACTOR

        x1 = grid_x - bleed_w / 2
        y1 = grid_y - bleed_h / 2
        x2 = grid_x + tile_w + bleed_w / 2
        y2 = grid_y + tile_h + bleed_h / 2

        tile = crop(base_image, x1=x1, y1=y1, x2=x2, y2=y2)

        mask = mpy.ColorClip(size=(int(tile_w), int(tile_h)), color=(1, 1, 1), ismask=True, duration=VIDEO_DURATION)
        masked_tile = tile.set_mask(mask)

        center_pos = np.array([grid_x + tile_w / 2, grid_y + tile_h / 2])
        dist = np.linalg.norm(center_pos - video_center)
        normalized_dist = dist / max_dist

        direction = (center_pos - video_center)
        if np.linalg.norm(direction) > 0:
            direction /= np.linalg.norm(direction)

        def calc_position(t, start=np.array([grid_x, grid_y]), d=direction, nd=normalized_dist):
            move = d * nd * MAX_OFFSET * VIDEO_SIZE[0] * (t / VIDEO_DURATION)
            return start - np.array([bleed_w / 2, bleed_h / 2]) + move

        def calc_zoom(t, nd=normalized_dist):
            return 1 + (1 - nd) * MAX_ZOOM * (t / VIDEO_DURATION)

        animated_tile = masked_tile.set_position(lambda t: calc_position(t)).resize(lambda t: calc_zoom(t))
        tiles.append(animated_tile)

# --- 4. COMPOSE FINAL VIDEO ---
print("🔹 Rendering parallax animation...")
final_video = mpy.CompositeVideoClip([base_image] + tiles, size=VIDEO_SIZE)

# --- 5. EXPORT ---
os.makedirs(os.path.dirname(OUTPUT_FILENAME), exist_ok=True)
print(f"🎬 Writing output to {OUTPUT_FILENAME} ...")
final_video.write_videofile(OUTPUT_FILENAME, fps=VIDEO_FPS, codec="libx264")

print("✅ Done! Parallax animation created successfully.")
