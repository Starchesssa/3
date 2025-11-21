import os
import requests
import time
import re

# === Directories ===
INPUT_DIR = "BOOKS/Temp/PROMPTS"
OUTPUT_DIR = "BOOKS/Temp/IMG"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# === Pollinations settings ===
IMAGE_WIDTH = 1280
IMAGE_HEIGHT = 720
SEED = 10000
PROMPT_SUFFIX = ", no logo, white background, everything colorful except background, no shadows, clean"

# === Helper: extract filename from line ===
def extract_filename(line):
    # Expected format example:
    # 1. (0.00-4.40) - A man standing in yellow fog
    match = re.match(r"(\d+)\.\s*\(([0-9.]+-[0-9.]+)\)", line)
    if not match:
        return None

    num = match.group(1)
    timeline = match.group(2)

    # Build filename: 1_(0.00-4.40).jpg
    return f"{num}_({timeline}).jpg"


# === Download image from Pollinations ===
def download_image(prompt, save_path, retries=3, delay=4):
    prompt += PROMPT_SUFFIX
    encoded = requests.utils.quote(prompt)

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

    with open(txt_file, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    tasks = []
    for line in lines:
        filename = extract_filename(line)
        if not filename:
            print(f"⚠️ Could not extract filename, using fallback")
            filename = f"prompt_{abs(hash(line))}.jpg"

        save_path = os.path.join(OUTPUT_DIR, filename)
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
    for file in os.listdir(INPUT_DIR):
        if file.endswith(".txt"):
            process_text_file(os.path.join(INPUT_DIR, file))


if __name__ == "__main__":
    main()
