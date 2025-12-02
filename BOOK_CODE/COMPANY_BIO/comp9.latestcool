
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

PROMPT_SUFFIX = (
    "the image must have foreground ,mid ground and background,make sure the head have no eyes, no hair, no nose, no ears, no mouth, "
    "the head should have just blank dark shadow ,no nose, no mouth , no hair ,no ears,etc just black shadow, only male silhouettes, "
    "no female silhouettes, polished gradients between colours, smooth viewing."
)

# === Helper: sanitize folder/filename ===
def sanitize(text, max_len=50):
    valid_chars = f"-_.() {string.ascii_letters}{string.digits}"
    sanitized = ''.join(c if c in valid_chars else '_' for c in text)
    return sanitized[:max_len]

# === Download image from Pollinations ===
def download_image(prompt, save_path, retries=3, delay=4):
    print(f"\n🖼️  Creating FULL prompt...")
    prompt_full = prompt + " " + PROMPT_SUFFIX
    print(f"   → PROMPT FULL: {prompt_full}")

    encoded = requests.utils.quote(prompt_full)
    url = (
        f"https://image.pollinations.ai/prompt/{encoded}"
        f"?model=flux-schnell&width={IMAGE_WIDTH}&height={IMAGE_HEIGHT}&seed={SEED}"
    )

    print(f"🌐 API URL:")
    print(url)

    print(f"📤 Starting download to: {save_path}")

    for attempt in range(1, retries + 1):
        print(f"\n⏳ Attempt {attempt}/{retries}...")
        try:
            print("→ Sending GET request...")
            response = requests.get(url, stream=True, timeout=45)
            print(f"→ Received status: {response.status_code}")

            if response.status_code == 200:
                print("→ Writing image file...")
                with open(save_path, "wb") as f:
                    f.write(response.content)
                print(f"✅ Saved successfully: {save_path}")
                return True
            else:
                print(f"⚠️ ERROR {response.status_code}: Pollinations returned failure")

        except Exception as e:
            print(f"⚠️ Exception during GET request: {e}")

        print(f"⏲️ Waiting {delay} seconds before retry...")
        time.sleep(delay)

    print(f"❌ Completely failed to create image: {save_path}")
    return False

# === Process a single text file ===
def process_text_file(txt_file):
    print(f"\n📄 Processing TEXT FILE: {txt_file}")

    # Compute relative path
    rel_path = os.path.relpath(txt_file, INPUT_DIR)
    rel_dir = os.path.dirname(rel_path)
    base_name = os.path.splitext(os.path.basename(txt_file))[0]

    print(f"   → REL DIR : {rel_dir}")
    print(f"   → BASE NAME: {base_name}")

    with open(txt_file, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    print(f"🧾 Total prompts found: {len(lines)}")

    tasks = []
    for idx, line in enumerate(lines, start=1):

        folder_path = os.path.join(OUTPUT_DIR, rel_dir, sanitize(base_name))
        os.makedirs(folder_path, exist_ok=True)
        print(f"\n📁 Image folder ensured: {folder_path}")

        image_filename = f"{idx}_image.jpg"
        save_path = os.path.join(folder_path, image_filename)

        print(f"🔧 Task created: Prompt #{idx}")
        print(f"   → Prompt: {line}")
        print(f"   → Save Path: {save_path}")

        tasks.append((line, save_path))

    # Retry loop
    remaining = tasks.copy()
    round_num = 1

    while remaining:
        print(f"\n🔁 ROUND {round_num}: Generating {len(remaining)} images...\n")

        next_round = []
        for prompt, save_path in remaining:

            if os.path.exists(save_path):
                print(f"⏩ Already exists — skipping: {save_path}")
                continue

            print(f"\n🎨 GENERATING IMAGE FOR PROMPT:\n{prompt}")

            if not download_image(prompt, save_path):
                print(f"❌ FAILED this round: {save_path}")
                next_round.append((prompt, save_path))

            print("⏳ Sleeping 1.5 seconds between requests...")
            time.sleep(1.5)

        if next_round:
            print("\n⏸️  Waiting 60 seconds before retrying failed images...\n")
            time.sleep(60)

        remaining = next_round
        round_num += 1

    print("\n🎉 ALL IMAGES GENERATED FOR THIS FILE!\n")


# === Main ===
def main():
    print("\n🚀 Starting IMAGE GENERATOR\n")
    for root, dirs, files in os.walk(INPUT_DIR):
        print(f"📂 Checking directory: {root}")
        for file in files:
            if file.endswith(".txt"):
                print(f"\n🔍 Found TXT file: {file}")
                txt_file = os.path.join(root, file)
                process_text_file(txt_file)
    print("\n🏁 FINISHED ALL TASKS!\n")


if __name__ == "__main__":
    main()
