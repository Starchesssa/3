
import os
import requests
import time
import re

# === Base Directories ===
PROMPTS_ROOT = "BOOKS/Temp/PROMPTS"
IMG_ROOT = "BOOKS/Temp/IMG"

# Pollinations settings
WIDTH = 1280
HEIGHT = 720
SEED = 10000
SUFFIX = ", no logo, white background, colorful objects only"

# --- Normalize filenames safely ---
def clean_filename(text):
    text = text.strip().replace(" ", "_")
    text = re.sub(r"[^0-9A-Za-z._()\-]+", "", text)
    return text[:80]

# --- Download image from pollinations ---
def download(prompt, save_path, delay=4):
    prompt_full = prompt + SUFFIX
    url = (
        f"https://image.pollinations.ai/prompt/"
        f"{requests.utils.quote(prompt_full)}"
        f"?width={WIDTH}&height={HEIGHT}&seed={SEED}"
    )

    try:
        response = requests.get(url, timeout=50)
        if response.status_code == 200:
            with open(save_path, "wb") as f:
                f.write(response.content)
            print(f"✅ Saved: {save_path}")
            return True
        else:
            print(f"❌ Failed {response.status_code}: {prompt}")
    except Exception as e:
        print(f"⚠️ Error: {e}")

    time.sleep(delay)
    return False

# --- Process one text file ---
def process_file(txt_path, output_folder):
    print(f"\n📄 Processing file: {txt_path}")

    with open(txt_path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    for line in lines:
        # extract timeline in parentheses (if exists)
        match = re.search(r"\(([^)]+)\)", line)
        timeline = match.group(1) if match else "0.00-0.00"

        # use entire line as prompt
        prompt = line

        filename = clean_filename(f"{timeline}.jpg")

        save_path = os.path.join(output_folder, filename)

        if os.path.exists(save_path):
            print(f"⏩ Already exists: {filename}")
            continue

        download(prompt, save_path)
        time.sleep(2)     # Slow down requests a bit more

# --- Process all folders and files ---
def main():
    for folder in os.listdir(PROMPTS_ROOT):
        folder_path = os.path.join(PROMPTS_ROOT, folder)

        if not os.path.isdir(folder_path):
            continue

        # create corresponding IMG folder
        output_dir = os.path.join(IMG_ROOT, folder)
        os.makedirs(output_dir, exist_ok=True)

        # process all .txt inside this folder
        for file in os.listdir(folder_path):
            if file.endswith(".txt"):
                txt_file = os.path.join(folder_path, file)
                process_file(txt_file, output_dir)

if __name__ == "__main__":
    main()
