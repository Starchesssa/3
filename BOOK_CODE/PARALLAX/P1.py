
import cv2
import numpy as np
import os

# Input image
input_image = "BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg"
output_video = "BOOK_CODE/PARALLAX/parallax_output.mp4"

# Load the image
img = cv2.imread(input_image)
if img is None:
    raise FileNotFoundError(f"Image not found: {input_image}")

# Get dimensions
height, width, _ = img.shape

# Split into 3 virtual layers (background, mid, front)
layer1 = cv2.GaussianBlur(img, (35, 35), 0)     # background blur
layer2 = cv2.GaussianBlur(img, (15, 15), 0)     # mid layer
layer3 = img.copy()                             # front layer (sharp)

# Video writer setup
fps = 30
frames = 90
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
video = cv2.VideoWriter(output_video, fourcc, fps, (width, height))

# Generate parallax motion
for i in range(frames):
    offset = int(10 * np.sin(i * np.pi / frames * 2))  # smooth motion

    # Move each layer at different speed
    bg_shift = np.roll(layer1, offset, axis=1)
    mid_shift = np.roll(layer2, offset * 2, axis=1)
    fg_shift = np.roll(layer3, offset * 3, axis=1)

    # Weighted combination for depth feel
    frame = cv2.addWeighted(bg_shift, 0.3, mid_shift, 0.3, 0)
    frame = cv2.addWeighted(frame, 1.0, fg_shift, 0.5, 0)

    video.write(frame)

video.release()
print(f"✅ Parallax animation saved to: {output_video}")
