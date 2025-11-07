
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
IMAGE_HEIGHT = 720

PROMPT_SUFFIX = ", make the image have white background and everything should be colourful except the white background also no shadows,just white background"

def normalize_filename(num, label, phrase):
    safe_phrase = re.sub(r'[^a-zA-Z0-9]+', '_', phrase.strip())[:40]
    return f"{num}{label}_{safe_phrase}".replace(".", "").upper()

def download_image(prompt, save_path, retries=3, delay=2):
    prompt += PROMPT_SUFFIX
    url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}?width={IMAGE_WIDTH}&height={IMAGE_HEIGHT}"

    for attempt in range(1, retries + 1):
        try:
            response = requests.get(url, stream=True, timeout=30)
            if response.status_code == 200:
                with open(save_path, "wb") as f:
                    f.write(response.content)
                print(f"✅ Downloaded: {save_path}")
                return True
            else:
                print(f"⚠️ Attempt {attempt} failed (status {response.status_code}) for {prompt}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Attempt {attempt} error: {e}")
        time.sleep(delay)
    return False

def process_text_file(txt_file):
    with open(txt_file, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    i = 0
    current_group = None
    image_tasks = []

    while i < len(lines):
        line = lines[i]
        match = re.match(r"(\d+)[\s\.]*([A-Za-z])[\s\.]*", line)
        if match:
            group_num = match.group(1)
            group_letter = match.group(2)
            current_group = group_num
            phrase = lines[i + 1] if i + 1 < len(lines) else ""
            filename = normalize_filename(group_num, group_letter, phrase)
            image_tasks.append((filename, phrase))
            i += 2
        else:
            if current_group:
                match_prev = re.match(r"([A-Za-z])[\s\.]*", line)
                if match_prev:
                    letter = match_prev.group(1)
                    phrase = lines[i + 1] if i + 1 < len(lines) else ""
                    filename = normalize_filename(current_group, letter, phrase)
                    image_tasks.append((filename, phrase))
                    i += 2
                else:
                    print(f"⚠️ Skipping line: {line}")
                    i += 1
            else:
                print(f"⚠️ No group found yet, skipping: {line}")
                i += 1

    failed = image_tasks.copy()
    round_count = 1

    # Retry loop until all succeed
    while failed:
        print(f"\n🔁 Starting round {round_count} — {len(failed)} images to process...\n")
        remaining = []
        for filename, prompt in failed:
            save_path = os.path.join(OUTPUT_DIR, filename + ".png")

            if os.path.exists(save_path):
                print(f"⏩ Already exists: {filename}")
                continue

            if not download_image(prompt, save_path):
                print(f"❌ Failed: {filename}")
                remaining.append((filename, prompt))

        if remaining:
            print(f"\n⏸️ {len(remaining)} images failed this round. Waiting 60 seconds before retry...\n")
            time.sleep(60)
        else:
            print("\n✅ All images downloaded successfully!\n")

        failed = remaining
        round_count += 1

def main():
    for file in os.listdir(INPUT_DIR):
        if file.endswith(".txt"):
            process_text_file(os.path.join(INPUT_DIR, file))

if __name__ == "__main__":
    main()
