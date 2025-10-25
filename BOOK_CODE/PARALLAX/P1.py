import cv2 as cv
import numpy as np
import os

# === File Paths ===
input_image_file = 'BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg'
output_video_file = 'BOOK_CODE/PARALLAX/output_cv2_parallax.mp4'

# === Parameters ===
num_layers = 5             # Number of image slices
num_frames = 90            # Total frames
zoom_factor = 1.01         # Slow zoom
frame_size = (1080, 1080)  # Output resolution

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

# === Create Circular Slices ===
def create_slices(image, layers):
    slices = []
    center = (image.shape[1] // 2, image.shape[0] // 2)
    max_radius = image.shape[0] // 2
    for i in range(layers):
        mask = np.zeros(image.shape[:2], dtype=np.uint8)
        outer_r = int(max_radius * (i + 1) / layers)
        inner_r = int(max_radius * i / layers)
        cv.circle(mask, center, outer_r, 255, -1)
        if inner_r > 0:
            cv.circle(mask, center, inner_r, 0, -1)
        slice_img = cv.bitwise_and(image, image, mask=mask)
        slices.append(slice_img)
    return slices

sliced_layers = create_slices(img, num_layers)

# === Generate Frames ===
frames = []
for frame_idx in range(num_frames):
    frame = np.zeros_like(img)
    for i, layer in enumerate(reversed(sliced_layers)):
        scale = zoom_factor ** (frame_idx + i * 5)  # staggered zoom
        scaled_size = int(frame_size[0] * scale)
        scaled = cv.resize(layer, (scaled_size, scaled_size), interpolation=cv.INTER_LINEAR)

        # Center crop to frame size
        sx, sy = scaled.shape[1], scaled.shape[0]
        cx, cy = sx // 2, sy // 2
        cropped = scaled[cy - frame_size[1]//2:cy + frame_size[1]//2,
                         cx - frame_size[0]//2:cx + frame_size[0]//2]

        # Composite layer
        if cropped.shape[:2] == frame_size:
            frame = cv.addWeighted(frame, 1.0, cropped, 1.0, 0)

    frames.append(frame)

# === Write Video ===
fourcc = cv.VideoWriter_fourcc(*'mp4v')
video_writer = cv.VideoWriter(output_video_file, fourcc, 30, frame_size)

for f in frames:
    video_writer.write(f)

video_writer.release()
print(f"✅ Shattered mirror parallax saved to: {output_video_file}")
