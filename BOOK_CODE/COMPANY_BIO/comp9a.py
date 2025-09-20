
import os
import cv2
import numpy as np

# Directories
IMAGES_DIR = "assets/images"


def remove_white_bg(image_path, save_path, tolerance=30):
    """Remove near-white background using OpenCV and save as PNG with transparency."""
    img = cv2.imread(image_path)
    if img is None:
        print(f"⚠️ Could not open {image_path}")
        return

    # Convert to RGB
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Define white color range
    lower = np.array([255 - tolerance, 255 - tolerance, 255 - tolerance])
    upper = np.array([255, 255, 255])

    # Create mask for white regions
    mask = cv2.inRange(img_rgb, lower, upper)

    # Invert mask to get alpha
    alpha = cv2.bitwise_not(mask)

    # Merge channels with alpha
    b, g, r = cv2.split(img)
    rgba = [b, g, r, alpha]
    dst = cv2.merge(rgba)

    cv2.imwrite(save_path, dst)


def process_png_images():
    """Process all PNGs in the directory to remove white backgrounds."""
    for file in os.listdir(IMAGES_DIR):
        if file.lower().endswith(".png"):
            raw_path = os.path.join(IMAGES_DIR, file)
            final_path = os.path.join(IMAGES_DIR, file)  # overwrite
            remove_white_bg(raw_path, final_path)
            print(f"✨ Made transparent: {final_path}")


if __name__ == "__main__":
    process_png_images()
