import os
import time
import requests
from rembg import remove

PROMPTS_DIR = "BOOKS/Temp/PROMPTS"
OUTPUT_DIR = "assets/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_image(prompt, save_path, retries=3, delay=5):
    """Download image from pollinations.ai"""
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

def remove_bg(jpg_path, png_path):
    """Remove background and save as PNG"""
    try:
        with open(jpg_path, "rb") as f:
            input_data = f.read()
        output_data = remove(input_data)

        with open(png_path, "wb") as f:
            f.write(output_data)

        print(f"🧹 Removed background → {png_path}")
        return True
    except Exception as e:
        print(f"⚠️ Background removal failed for {jpg_path}: {e}")
        return False

# Process all .txt files in PROMPTS_DIR
for txt_file in os.listdir(PROMPTS_DIR):
    if not txt_file.endswith(".txt"):
        continue

    txt_path = os.path.join(PROMPTS_DIR, txt_file)
    with open(txt_path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]  # no empty lines

    # Process as pairs: filename + description
    i = 0
    while i < len(lines) - 1:
        filename = lines[i].strip()
        description = lines[i+1].strip()
        i += 2

        if not filename or not description:
            continue

        save_path = os.path.join(OUTPUT_DIR, filename)

        if filename.endswith(".jpg"):
            # Save directly as JPG
            generate_image(description, save_path)

        elif filename.endswith(".png"):
            # First generate JPG, then remove background → PNG
            temp_jpg = save_path.replace(".png", "_temp.jpg")
            if generate_image(description, temp_jpg):
                remove_bg(temp_jpg, save_path)
                os.remove(temp_jpg)  # cleanup

print("🎉 All prompts processed!")
