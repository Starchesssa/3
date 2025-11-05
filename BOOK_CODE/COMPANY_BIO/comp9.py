
import os
import requests
import time
import re

# Directories
INPUT_DIR = "BOOKS/Temp/PROMPTS"
OUTPUT_DIR = "src/IMG"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Size settings for Pollinations
IMAGE_WIDTH = 1024
IMAGE_HEIGHT = 1024

PROMPT_SUFFIX = ", make the image have white background and everything should be colourful except the white background"

def normalize_filename(num, label):
    return f"{num}{label}".replace(".", "").upper()

def download_image(prompt, save_path, retries=3, delay=2):
    prompt += PROMPT_SUFFIX
    url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}?width={IMAGE_WIDTH}&height={IMAGE_HEIGHT}"

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

def process_text_file(txt_file):
    with open(txt_file, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    i = 0
    current_group = None

    while i < len(lines):
        line = lines[i]

        match = re.match(r"(\d+)[\s\.]*([A-Za-z])[\s\.]*", line)
        if match:
            group_num = match.group(1)
            group_letter = match.group(2)
            current_group = group_num
            filename = normalize_filename(group_num, group_letter)
            prompt = lines[i + 1] if i + 1 < len(lines) else ""
            i += 2
        else:
            if current_group:
                match_prev = re.match(r"([A-Za-z])[\s\.]*", line)
                if match_prev:
                    filename = normalize_filename(current_group, match_prev.group(1))
                    prompt = lines[i + 1] if i + 1 < len(lines) else ""
                    i += 2
                else:
                    print(f"⚠️ Skipping line: {line}")
                    i += 1
                    continue
            else:
                print(f"⚠️ No group found yet, skipping: {line}")
                i += 1
                continue

        save_path = os.path.join(OUTPUT_DIR, filename + ".png")

        if os.path.exists(save_path):
            print(f"⏩ Skipping (already exists): {save_path}")
        else:
            if download_image(prompt, save_path):
                print(f"✅ Downloaded and saved: {save_path}")
            else:
                print(f"❌ Failed to generate: {filename}")

def main():
    for file in os.listdir(INPUT_DIR):
        if file.endswith(".txt"):
            process_text_file(os.path.join(INPUT_DIR, file))

if __name__ == "__main__":
    main()
