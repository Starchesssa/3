
import os
import time
import requests
from rembg import remove

PROMPTS_DIR = "BOOKS/Temp/PROMPTS"
OUTPUT_DIR = "assets/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_image(prompt, save_path, retries=3, delay=5, timeout=30):
    """Download image from pollinations.ai"""
    url = f"https://image.pollinations.ai/prompt/{prompt.replace(' ', '%20')}"
    for attempt in range(1, retries + 1):
        try:
            resp = requests.get(url, stream=True, timeout=timeout)
            if resp.status_code == 200:
                os.makedirs(os.path.dirname(save_path) or ".", exist_ok=True)
                with open(save_path, "wb") as f:
                    for chunk in resp.iter_content(1024):
                        f.write(chunk)
                print(f"✅ Saved: {save_path}")
                return True
            else:
                print(f"❌ HTTP {resp.status_code} for prompt: {prompt[:80]}...")
        except Exception as e:
            print(f"⚠️ Error: {e} (attempt {attempt})")
        if attempt < retries:
            time.sleep(delay)
            print(f"🔄 Retrying in {delay}s...")
    print(f"❌ Giving up on prompt: {prompt[:80]}...")
    return False

def remove_bg(jpg_path, png_path):
    """Remove background from JPG and save as PNG"""
    try:
        with open(jpg_path, "rb") as f:
            input_data = f.read()
        output_data = remove(input_data)
        os.makedirs(os.path.dirname(png_path) or ".", exist_ok=True)
        with open(png_path, "wb") as f:
            f.write(output_data)
        print(f"🧹 Removed background → {png_path}")
        return True
    except Exception as e:
        print(f"⚠️ Background removal failed for {jpg_path}: {e}")
        return False

def process_txt_file(txt_path):
    with open(txt_path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    created = 0
    i = 0
    while i < len(lines) - 1:
        line = lines[i]
        # Check if line is a valid image filename
        if any(line.lower().endswith(ext) for ext in (".jpg", ".jpeg", ".png")):
            filename = line
            prompt = lines[i + 1]
            i += 2  # move past filename + prompt

            save_path = os.path.join(OUTPUT_DIR, filename)
            ext = os.path.splitext(filename)[1].lower()

            # Print debug info
            print(f"\n🔹 Detected filename: {filename}")
            print(f"🔸 Associated prompt: {prompt[:80]}")

            try:
                if ext in (".jpg", ".jpeg"):
                    if generate_image(prompt, save_path):
                        created += 1
                elif ext == ".png":
                    temp_jpg = save_path.replace(".png", "_temp.jpg")
                    if generate_image(prompt, temp_jpg):
                        if remove_bg(temp_jpg, save_path):
                            try:
                                os.remove(temp_jpg)
                            except Exception:
                                pass
                            created += 1
            except Exception as e:
                print(f"❌ Error generating {filename}: {e}")
        else:
            # Line is not a filename, skip it
            print(f"⚠️ Skipping non-filename line: {line}")
            i += 1

    return created

# --- main ---
txt_files = sorted([f for f in os.listdir(PROMPTS_DIR) if f.lower().endswith(".txt")])
total_created = 0

for idx, txt_file in enumerate(txt_files, start=1):
    print(f"\n📄 ({idx}/{len(txt_files)}) Processing: {txt_file}")
    created = process_txt_file(os.path.join(PROMPTS_DIR, txt_file))
    print(f"➡️ Created {created} images from {txt_file}")
    total_created += created

print(f"\n🎉 Done — total images created: {total_created}")
