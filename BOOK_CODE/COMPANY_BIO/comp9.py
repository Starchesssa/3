
import os
import requests
from rembg import remove
import cv2

PROMPTS_DIR = "BOOKS/Temp/PROMPTS"
OUTPUT_DIR = "assets/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_image(prompt, save_path):
    url = f"https://image.pollinations.ai/prompt/{prompt.replace(' ', '%20')}"
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(save_path, "wb") as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        print(f"✅ Saved: {save_path}")
    else:
        print(f"❌ Failed to generate image for prompt: {prompt}")

def remove_bg_and_save_as_png(jpg_path):
    with open(jpg_path, "rb") as f:
        input_data = f.read()
    output_data = remove(input_data)
    
    # Save as PNG
    png_path = os.path.splitext(jpg_path)[0] + ".png"
    with open(png_path, "wb") as f:
        f.write(output_data)
    
    print(f"🧹 Removed background and saved as PNG: {png_path}")
    return png_path

# Process all prompt files
for txt_file in os.listdir(PROMPTS_DIR):
    if not txt_file.endswith(".txt"):
        continue

    txt_path = os.path.join(PROMPTS_DIR, txt_file)
    with open(txt_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line or "." not in line:
            continue

        # Split into filename + description
        try:
            parts = line.split("\n", 1)
            filename, description = parts[0], parts[1]
        except Exception:
            parts = line.split(" ", 1)
            if len(parts) < 2:
                continue
            filename, description = parts

        # Save as JPG first
        jpg_path = os.path.join(OUTPUT_DIR, os.path.splitext(filename)[0] + ".jpg")
        generate_image(description, jpg_path)

        # Convert to PNG with transparent background
        remove_bg_and_save_as_png(jpg_path)
