
import cv2
import numpy as np

# Input and output paths
input_path = "OPEN_CV/Generated Image October 19, 2025 - 8_06AM.png"
output_path = "OPEN_CV/Generated_Image_BG_Removed.png"

# Load image
img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)

# Convert to RGB if image has alpha channel
if img.shape[2] == 4:
    img_rgb = img[:, :, :3]
else:
    img_rgb = img

# Define white background threshold
# You can adjust the threshold if background is not pure white
lower = np.array([200, 200, 200], dtype=np.uint8)
upper = np.array([255, 255, 255], dtype=np.uint8)

# Create mask for white areas
mask = cv2.inRange(img_rgb, lower, upper)

# Invert mask to get foreground
mask_inv = cv2.bitwise_not(mask)

# Convert mask to 0-255 alpha
alpha = mask_inv

# Merge RGB channels with alpha
b, g, r = cv2.split(img_rgb)
result = cv2.merge([b, g, r, alpha])

# Save output as PNG with transparency
cv2.imwrite(output_path, result)

print(f"White background removed! Saved at: {output_path}")
