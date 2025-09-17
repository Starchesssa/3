import os
import json
import requests
import cv2
import numpy as np

# Directories
JSON_DIR = "BOOKS/Temp/PROMPTS/Json"
OUTPUT_DIR = "assets/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def download_image(prompt, save_path):
    """Download an image from Pollinations AI."""
    url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}"
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(save_path, "wb") as f:
            f.write(response.content)
        return True
    else:
        print(f"⚠️ Failed to fetch: {prompt}")
        return False


def remove_white_bg(image_path, save_path):
    """Remove white background from image using OpenCV and save as PNG with transparency."""
    img = cv2.imread(image_path)
    if img is None:
        print(f"⚠️ Could not open {image_path}")
        return

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Threshold: detect non-white
    _, alpha = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

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

        raw_path = os.path.join(OUTPUT_DIR, f"raw_{name}")
        final_path = os.path.join(OUTPUT_DIR, name)

        # Download from Pollinations
        if download_image(prompt, raw_path):
            print(f"✅ Generated: {raw_path}")

            if name.lower().endswith(".png"):
                remove_white_bg(raw_path, final_path)
                os.remove(raw_path)  # remove raw file
                print(f"✨ Saved with transparency: {final_path}")
            else:
                os.rename(raw_path, final_path)
                print(f"💾 Saved: {final_path}")


def main():
    for file in os.listdir(JSON_DIR):
        if file.endswith(".json"):
            process_json(os.path.join(JSON_DIR, file))


if __name__ == "__main__":
    main()
