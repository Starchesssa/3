
import os
import json
import requests
import cv2
import numpy as np
import time

# Directories
JSON_DIR = "BOOKS/Temp/PROMPTS/Json"
OUTPUT_DIR = "assets/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def download_image(prompt, save_path, retries=3, delay=2):
    """Download an image from Pollinations AI with retry logic."""
    url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}"
    for attempt in range(1, retries + 1):
        try:
            response = requests.get(url, stream=True, timeout=30)
            if response.status_code == 200:
                with open(save_path, "wb") as f:
                    f.write(response.content)
                return True
            else:
                print(f"⚠️ Attempt {attempt} failed with status {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Attempt {attempt} error: {e}")

        time.sleep(delay)
    return False


def remove_white_bg(image_path, save_path, tolerance=30):
    """
    Remove near-white background using OpenCV and save as PNG with transparency.
    Tolerance: how close to white a pixel must be to be removed.
    """
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


def process_json(json_file):
    """Process one JSON file and generate images."""
    with open(json_file, "r", encoding="utf-8") as f:
        items = json.load(f)

    for item in items:
        name = item["name"]
        prompt = item["description"]

        # Force white background for PNG prompts
        if name.lower().endswith(".png") and "white background" not in prompt.lower():
            prompt += " with a completely white background"

        raw_path = os.path.join(OUTPUT_DIR, f"raw_{name}")
        final_path = os.path.join(OUTPUT_DIR, name)

        # Skip if final already exists
        if os.path.exists(final_path):
            print(f"⏩ Skipping (already exists): {final_path}")
            continue

        # Download with retries
        if download_image(prompt, raw_path):
            print(f"✅ Generated: {raw_path}")

            if name.lower().endswith(".png"):
                remove_white_bg(raw_path, final_path)
                os.remove(raw_path)  # remove raw file
                print(f"✨ Saved with transparency: {final_path}")
            else:
                os.rename(raw_path, final_path)
                print(f"💾 Saved: {final_path}")
        else:
            print(f"❌ Failed to generate image for: {name}")


def main():
    for file in os.listdir(JSON_DIR):
        if file.endswith(".json"):
            process_json(os.path.join(JSON_DIR, file))


if __name__ == "__main__":
    main()
