
import os
import requests
import time
import re

# === Directories ===
INPUT_DIR = "BOOKS/Temp/PROMPTS"
OUTPUT_DIR = "src/IMG"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# === Pollinations settings ===
IMAGE_WIDTH = 1280
IMAGE_HEIGHT = 720
PROMPT_SUFFIX = ", make the image have white background and everything should be colourful except the white background also no shadows, just white background"

# === Helper: clean and normalize filename ===
def normalize_filename(num, phrase):
    safe_phrase = re.sub(r"[^a-zA-Z0-9]+", "_", phrase.strip()).strip("_")
    safe_phrase = safe_phrase[:40]  # limit length
    return f"{num}_{safe_phrase}.png"

# === Download image from Pollinations ===
def download_image(prompt, save_path, retries=3, delay=3):
    prompt += PROMPT_SUFFIX
    url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}?width={IMAGE_WIDTH}&height={IMAGE_HEIGHT}"

    for attempt in range(1, retries + 1):
        try:
            response = requests.get(url, stream=True, timeout=40)
            if response.status_code == 200:
                with open(save_path, "wb") as f:
                    f.write(response.content)
                print(f"✅ Downloaded: {save_path}")
                return True
            else:
                print(f"⚠️ Attempt {attempt} failed (status {response.status_code}) for prompt: {prompt}")
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Attempt {attempt} error: {e}")
        time.sleep(delay)
    return False

# === Process text file ===
def process_text_file(txt_file):
    with open(txt_file, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    image_tasks = []
    for line in lines:
        match = re.match(r"(\d+)[\.\s]*(.+)", line)
        if match:
            num = match.group(1)
            phrase = match.group(2)
            filename = normalize_filename(num, phrase)
            image_tasks.append((filename, phrase))
        else:
            print(f"⚠️ Skipping line: {line}")

    failed = image_tasks.copy()
    round_count = 1

    # === Retry loop until all succeed ===
    while failed:
        print(f"\n🔁 Starting round {round_count} — {len(failed)} images remaining...\n")
        remaining = []
        for filename, prompt in failed:
            save_path = os.path.join(OUTPUT_DIR, filename)
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

# === Main ===
def main():
    for file in os.listdir(INPUT_DIR):
        if file.endswith(".txt"):
            process_text_file(os.path.join(INPUT_DIR, file))

if __name__ == "__main__":
    main()
