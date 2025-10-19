import cv2
import numpy as np
import os

# Input and output paths
input_path = "OPEN_CV/Generated Image October 18, 2025 - 2_45PM.png"
output_path = "OPEN_CV/Generated_Image_BG_Removed.png"

# Load the image with alpha channel
img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)

# If the image has no alpha channel, add one
if img.shape[2] == 3:
    b, g, r = cv2.split(img)
    alpha = np.ones(b.shape, dtype=b.dtype) * 255
    img = cv2.merge([b, g, r, alpha])

# Convert to RGB (ignore alpha for mask)
rgb_img = img[:, :, :3]

# Convert to grayscale
gray = cv2.cvtColor(rgb_img, cv2.COLOR_BGR2GRAY)

# Thresholding to separate background (assuming light background)
_, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)

# Invert mask to get foreground
mask_inv = cv2.bitwise_not(mask)

# Apply mask to original image
b, g, r, a = cv2.split(img)
new_alpha = cv2.bitwise_and(a, mask_inv)
result = cv2.merge([b, g, r, new_alpha])

# Save output as PNG with transparency
cv2.imwrite(output_path, result)

print(f"Background removed! Saved at: {output_path}")
