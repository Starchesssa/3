
import cv2 as cv
import numpy as np
import os

# === File Paths ===
input_image_file = 'BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg'
output_video_file = 'BOOK_CODE/PARALLAX/output_cv2_parallax.mp4'

# === Parameters ===
num_layers = 20           # Number of concentric slices
num_frames = 60           # Total frames in the animation
zoom_factor = 1.05        # Zoom per frame
frame_size = (1080, 1080) # Output resolution (square crop)

# === Load and Preprocess Image ===
img = cv.imread(input_image_file)
if img is None:
    raise FileNotFoundError(f"Image not found: {input_image_file}")

# Crop to center square
h, w = img.shape[:2]
min_dim = min(h, w)
start_x = (w - min_dim) // 2
start_y = (h - min_dim) // 2
img = img[start_y:start_y+min_dim, start_x:start_x+min_dim]
img = cv.resize(img, frame_size)

# === Generate Circular Masks ===
def create_circular_masks(size, layers):
    masks = []
    center = (size[0] // 2, size[1] // 2)
    max_radius = size[0] // 2
    for i in range(layers):
        mask = np.zeros((size[1], size[0]), dtype=np.uint8)
        radius = int(max_radius * (i + 1) / layers)
        cv.circle(mask, center, radius, 255, -1)
        if i > 0:
            cv.circle(mask, center, int(max_radius * i / layers), 0, -1)
        masks.append(mask)
    return masks

masks = create_circular_masks(frame_size, num_layers)

# === Generate Frames ===
frames = []
for frame_idx in range(num_frames):
    zoom = zoom_factor ** frame_idx
    frame = np.zeros_like(img)
    for i, mask in enumerate(masks):
        layer = cv.bitwise_and(img, img, mask=mask)
        scaled_size = int(frame_size[0] * zoom * (1 + i / num_layers))
        scaled = cv.resize(layer, (scaled_size, scaled_size), interpolation=cv.INTER_LINEAR)

        # Center crop to frame size
        sx, sy = scaled.shape[1], scaled.shape[0]
        cx, cy = sx // 2, sy // 2
        cropped = scaled[cy - frame_size[1]//2:cy + frame_size[1]//2,
                         cx - frame_size[0]//2:cx + frame_size[0]//2]

        # Blend into frame
        if cropped.shape[:2] == frame_size:
            alpha = 1.0 / (i + 1)
            frame = cv.addWeighted(frame, 1.0, cropped, alpha, 0)

    frames.append(frame)

# === Write Video ===
fourcc = cv.VideoWriter_fourcc(*'mp4v')
video_writer = cv.VideoWriter(output_video_file, fourcc, 30, frame_size)

for f in frames:
    video_writer.write(f)

video_writer.release()
print(f"✅ Parallax video saved to: {output_video_file}")
