
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
    for attempt in range(retries):
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
        if attempt < retries - 1:
            print(f"🔄 Retrying in {delay} seconds...")
            time.sleep(delay)
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

# Process all .txt files
for txt_file in sorted(os.listdir(PROMPTS_DIR)):
    if not txt_file.endswith(".txt"):
        continue

    txt_path = os.path.join(PROMPTS_DIR, txt_file)
    print(f"\n📄 Processing {txt_file} ...")

    with open(txt_path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    i = 0
    while i < len(lines):
        line = lines[i]

        # detect filenames by extension
        if line.lower().endswith(".jpg") or line.lower().endswith(".png"):
            filename = os.path.basename(line)  # safe filename
            if i + 1 < len(lines):
                description = lines[i + 1]
            else:
                print(f"⚠️ No description found for {filename}, skipping.")
                break

            save_path = os.path.join(OUTPUT_DIR, filename)

            if filename.lower().endswith(".jpg"):
                generate_image(description, save_path)

            elif filename.lower().endswith(".png"):
                temp_jpg = save_path.replace(".png", "_temp.jpg")
                if generate_image(description, temp_jpg):
                    if remove_bg(temp_jpg, save_path):
                        os.remove(temp_jpg)

            i += 2  # skip filename + description
        else:
            i += 1  # skip lines that aren’t filenames

print("\n🎉 All prompts processed!")
