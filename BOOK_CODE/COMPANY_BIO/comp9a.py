
import os
import cv2
import numpy as np
import shutil

# Directories
INPUT_DIR = "src/IMG"
OUTPUT_DIR = "assets/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def remove_white_bg(input_path, output_path, threshold=240):
    """Remove white background from a PNG image using OpenCV."""
    # Load image with alpha channel if present
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)

    if img is None:
        print(f"⚠️ Could not read {input_path}")
        return False

    # If image has no alpha, add one
    if img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

    # Create mask where pixels are "almost white"
    lower = np.array([threshold, threshold, threshold, 0], dtype=np.uint8)
    upper = np.array([255, 255, 255, 255], dtype=np.uint8)
    mask = cv2.inRange(img, lower, upper)

    # Invert mask to keep non-white areas
    mask_inv = cv2.bitwise_not(mask)

    # Apply mask to set transparent background
    img[:, :, 3] = mask_inv

    # Save result
    cv2.imwrite(output_path, img)
    return True

def process_images():
    for file in os.listdir(INPUT_DIR):
        input_path = os.path.join(INPUT_DIR, file)

        # Skip non-image files
        if not (file.lower().endswith(".png") or file.lower().endswith(".jpg")):
            continue

        output_path = os.path.join(OUTPUT_DIR, file)

        if file.lower().endswith(".png"):
            if remove_white_bg(input_path, output_path):
                print(f"✅ Background removed: {file}")
            else:
                print(f"❌ Failed to process: {file}")
        else:
            # Copy JPG as is
            shutil.copy2(input_path, output_path)
            print(f"📄 Copied JPG as is: {file}")

if __name__ == "__main__":
    process_images()
