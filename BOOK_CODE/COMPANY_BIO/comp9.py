import os
import time
import requests
import cv2
import numpy as np

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
                print(f"   ✅ Saved: {save_path}")
                return True
            else:
                print(f"   ❌ HTTP {resp.status_code} for prompt: {prompt[:80]}...")
        except Exception as e:
            print(f"   ⚠️ Error: {e} (attempt {attempt})")
        if attempt < retries:
            time.sleep(delay)
            print(f"   🔄 Retrying in {delay}s...")
    print(f"   ❌ Giving up on prompt: {prompt[:80]}...")
    return False

def remove_bg_white(jpg_path, png_path, threshold=240):
    """Remove white background using OpenCV"""
    try:
        img = cv2.imread(jpg_path, cv2.IMREAD_UNCHANGED)
        if img is None:
            raise ValueError("Image not found or unsupported format")

        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

        img_rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)

        img_rgba[:, :, 3] = 255 - mask

        os.makedirs(os.path.dirname(png_path) or ".", exist_ok=True)
        cv2.imwrite(png_path, img_rgba)
        print(f"   🧹 Removed white background → {png_path}")
        return True
    except Exception as e:
        print(f"   ⚠️ Background removal failed for {jpg_path}: {e}")
        return False

def process_txt_file(txt_path):
    print(f"\n📂 Opening file: {txt_path}")
    with open(txt_path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    created = 0
    i = 0
    while i < len(lines) - 1:
        line = lines[i]
        print(f"👉 Line {i}: {line}")

        if any(line.lower().endswith(ext) for ext in (".jpg", ".jpeg", ".png")):
            filename = line
            prompt = lines[i + 1]
            i += 2

            save_path = os.path.join(OUTPUT_DIR, filename)
            ext = os.path.splitext(filename)[1].lower()

            print(f"   🔹 Detected filename: {filename}")
            print(f"   🔸 Associated prompt (line {i-1}): {prompt[:80]}")
            print(f"   📦 Will save to: {save_path}")

            try:
                if ext in (".jpg", ".jpeg"):
                    if generate_image(prompt, save_path):
                        created += 1
                elif ext == ".png":
                    temp_jpg = save_path.replace(".png", "_temp.jpg")
                    if generate_image(prompt, temp_jpg):
                        if remove_bg_white(temp_jpg, save_path):
                            try:
                                os.remove(temp_jpg)
                                print(f"   🗑️ Deleted temp file: {temp_jpg}")
                            except Exception as e:
                                print(f"   ⚠️ Could not delete temp file: {e}")
                            created += 1
            except Exception as e:
                print(f"   ❌ Error generating {filename}: {e}")
        else:
            print(f"   ⚠️ Skipping non-filename line {i}: {line}")
            i += 1

    return created

# --- main ---
txt_files = [f for f in os.listdir(PROMPTS_DIR) if f.lower().endswith(".txt")]
print("\n📂 Files before sort:", txt_files)

txt_files = sorted(txt_files)
print("📑 Files after sort:", txt_files)

total_created = 0
for idx, txt_file in enumerate(txt_files, start=1):
    print(f"\n🚀 ({idx}/{len(txt_files)}) Processing: {txt_file}")
    created = process_txt_file(os.path.join(PROMPTS_DIR, txt_file))
    print(f"➡️ Created {created} images from {txt_file}")
    total_created += created

print(f"\n🎉 Done — total images created: {total_created}")
