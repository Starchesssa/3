
import os
import time
import requests
from rembg import remove

PROMPTS_DIR = "BOOKS/Temp/PROMPTS"
OUTPUT_DIR = "assets/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_image(prompt, save_path, retries=3, delay=5):
    """Download image from Pollinations AI with retry logic."""
    url = f"https://image.pollinations.ai/prompt/{prompt.replace(' ', '%20')}"
    attempt = 0
    while attempt < retries:
        try:
            response = requests.get(url, stream=True, timeout=30)
            if response.status_code == 200:
                with open(save_path, "wb") as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                print(f"✅ Saved: {save_path}")
                return True
            else:
                print(f"❌ Failed ({response.status_code}) for prompt: {prompt}")
        except Exception as e:
            print(f"⚠️ Error: {e} (attempt {attempt+1}/{retries})")

        attempt += 1
        if attempt < retries:
            print(f"🔄 Retrying in {delay} seconds...")
            time.sleep(delay)

    print(f"❌ Giving up on: {prompt}")
    return False

def remove_bg_and_save_as_png(jpg_path):
    """Remove background and save as PNG."""
    try:
        with open(jpg_path, "rb") as f:
            input_data = f.read()
        output_data = remove(input_data)

        png_path = os.path.splitext(jpg_path)[0] + ".png"
        with open(png_path, "wb") as f:
            f.write(output_data)

        print(f"🧹 Removed background and saved as PNG: {png_path}")
        return png_path
    except Exception as e:
        print(f"⚠️ Background removal failed for {jpg_path}: {e}")
        return None

# Process all prompt files
for txt_file in os.listdir(PROMPTS_DIR):
    if not txt_file.endswith(".txt"):
        continue

    txt_path = os.path.join(PROMPTS_DIR, txt_file)
    with open(txt_path, "r", encoding="utf-8") as f:
        lines = f.read().strip().splitlines()

    # Process pairs: filename line + description line
    i = 0
    while i < len(lines) - 1:
        filename_line = lines[i].strip()
        description_line = lines[i+1].strip()

        # Ensure valid format like "1. bullet.png"
        if "." not in filename_line:
            i += 1
            continue

        # Extract filename after number prefix
        try:
            _, filename = filename_line.split(".", 1)
            filename = filename.strip()
        except ValueError:
            i += 1
            continue

        if not filename:
            i += 1
            continue

        # Save as JPG first using original name
        jpg_path = os.path.join(OUTPUT_DIR, os.path.splitext(filename)[0] + ".jpg")

        if generate_image(description_line, jpg_path):
            remove_bg_and_save_as_png(jpg_path)

        i += 2  # Move to next pair
