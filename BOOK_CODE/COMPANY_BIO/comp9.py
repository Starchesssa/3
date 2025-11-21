import os
import requests
import time
import re
import string

# === Directories ===
INPUT_DIR = "BOOKS/Temp/PROMPTS"
OUTPUT_DIR = "BOOKS/Temp/IMG"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# === Pollinations settings ===
IMAGE_WIDTH = 1280
IMAGE_HEIGHT = 720
SEED = 10000
PROMPT_SUFFIX = ", no logo, white background, everything colorful except background, no shadows, clean"

# === Helper: sanitize folder/filename ===
def sanitize(text, max_len=50):
    valid_chars = f"-_.() {string.ascii_letters}{string.digits}"
    sanitized = ''.join(c if c in valid_chars else '_' for c in text)
    return sanitized[:max_len]

# === Download image from Pollinations ===
def download_image(prompt, save_path, retries=3, delay=4):
    prompt_full = prompt + PROMPT_SUFFIX
    encoded = requests.utils.quote(prompt_full)

    url = (
        f"https://image.pollinations.ai/prompt/{encoded}"
        f"?width={IMAGE_WIDTH}&height={IMAGE_HEIGHT}&seed={SEED}"
    )

    for attempt in range(1, retries + 1):
        try:
            response = requests.get(url, stream=True, timeout=45)
            if response.status_code == 200:
                with open(save_path, "wb") as f:
                    f.write(response.content)
                print(f"✅ Saved: {save_path}")
                return True
            else:
                print(f"⚠️ Attempt {attempt} failed (status {response.status_code})")
        except Exception as e:
            print(f"⚠️ Attempt {attempt} error: {e}")

        time.sleep(delay)

    return False

# === Process a single text file ===
def process_text_file(txt_file):
    print(f"\n📄 Processing file: {txt_file}\n")

    # Compute relative path of the text file inside PROMPTS
    rel_path = os.path.relpath(txt_file, INPUT_DIR)  # e.g., DIR/XYZ prompt.txt
    rel_dir = os.path.dirname(rel_path)              # e.g., DIR
    base_name = os.path.splitext(os.path.basename(txt_file))[0]  # XYZ prompt

    # Read prompts from the text file
    with open(txt_file, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    tasks = []
    for idx, line in enumerate(lines, start=1):
        # Build folder inside IMG, maintaining relative directory
        folder_path = os.path.join(OUTPUT_DIR, rel_dir, sanitize(base_name))
        os.makedirs(folder_path, exist_ok=True)

        # Image filename
        image_filename = f"{idx}_image.jpg"  # numbered image in case multiple lines
        save_path = os.path.join(folder_path, image_filename)

        tasks.append((line, save_path))

    # Retry loop
    remaining = tasks.copy()
    round_num = 1

    while remaining:
        print(f"\n🔁 Round {round_num} — {len(remaining)} images remaining...\n")

        next_round = []
        for prompt, save_path in remaining:
            if os.path.exists(save_path):
                print(f"⏩ Exists: {save_path}")
                continue

            if not download_image(prompt, save_path):
                print(f"❌ Failed: {save_path}")
                next_round.append((prompt, save_path))

            time.sleep(1.5)  # slow down requests

        if next_round:
            print("\n⏸️ Waiting 60 seconds before retry...\n")
            time.sleep(60)

        remaining = next_round
        round_num += 1

    print("\n🎉 All images generated!\n")

# === Main ===
def main():
    for root, dirs, files in os.walk(INPUT_DIR):
        for file in files:
            if file.endswith(".txt"):
                txt_file = os.path.join(root, file)
                process_text_file(txt_file)


if __name__ == "__main__":
    main()
