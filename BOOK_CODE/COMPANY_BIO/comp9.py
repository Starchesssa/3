import os
import requests
import time
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
    "the image must have foreground, mid ground and background, make sure the head has no eyes, no hair, no nose, no ears, no mouth, "
    "the head should have just blank dark shadow, only male silhouettes, no female silhouettes, polished gradients between colours, smooth viewing."
)

# === Helper: sanitize folder/filename ===
def sanitize(text, max_len=50):
    valid_chars = f"-_.() {string.ascii_letters}{string.digits}"
    sanitized = ''.join(c if c in valid_chars else '_' for c in text)
    return sanitized[:max_len]

# === Download image via Pollinations ===
def download_image(prompt, save_path, image_url, retries=3, delay=4):
    prompt_full = prompt + " " + PROMPT_SUFFIX
    print(f"\n🖼️ FULL PROMPT:\n{prompt_full}")

    encoded_prompt = requests.utils.quote(prompt_full)
    encoded_image = requests.utils.quote(image_url)

    # Try Kontext first
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?model=kontext&image={encoded_image}&seed={SEED}"

    for attempt in range(1, retries + 1):
        print(f"\n⏳ Attempt {attempt}/{retries} - Kontext...")
        try:
            response = requests.get(url, stream=True, timeout=45)
            if response.status_code == 200:
                with open(save_path, "wb") as f:
                    f.write(response.content)
                print(f"✅ Saved: {save_path}")
                return True
            else:
                print(f"⚠️ Kontext returned {response.status_code}")
        except Exception as e:
            print(f"⚠️ Exception: {e}")

        print(f"⏲️ Waiting {delay}s before retry...")
        time.sleep(delay)

    # Fallback to Flux
    print("⚠️ Kontext failed, trying Flux as fallback...")
    url_flux = f"https://image.pollinations.ai/prompt/{encoded_prompt}?model=flux-schnell&width={IMAGE_WIDTH}&height={IMAGE_HEIGHT}&seed={SEED}"
    try:
        response = requests.get(url_flux, stream=True, timeout=45)
        if response.status_code == 200:
            with open(save_path, "wb") as f:
                f.write(response.content)
            print(f"✅ Saved via Flux fallback: {save_path}")
            return True
        else:
            print(f"⚠️ Flux returned {response.status_code}")
    except Exception as e:
        print(f"⚠️ Flux Exception: {e}")

    print(f"❌ Failed to generate image: {save_path}")
    return False

# === Process a single text file ===
def process_text_file(txt_file, image_url):
    print(f"\n📄 Processing file: {txt_file}")

    rel_path = os.path.relpath(txt_file, INPUT_DIR)
    rel_dir = os.path.dirname(rel_path)
    base_name = os.path.splitext(os.path.basename(txt_file))[0]

    with open(txt_file, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]

    print(f"🧾 Total prompts: {len(lines)}")
    tasks = []
    for idx, line in enumerate(lines, start=1):
        folder_path = os.path.join(OUTPUT_DIR, rel_dir, sanitize(base_name))
        os.makedirs(folder_path, exist_ok=True)
        save_path = os.path.join(folder_path, f"{idx}_image.jpg")
        tasks.append((line, save_path))

    remaining = tasks.copy()
    round_num = 1
    while remaining:
        print(f"\n🔁 ROUND {round_num} - Generating {len(remaining)} images")
        next_round = []
        for prompt, save_path in remaining:
            if os.path.exists(save_path):
                print(f"⏩ Already exists: {save_path}")
                continue
            print(f"\n🎨 Generating image for prompt:\n{prompt}")
            if not download_image(prompt, save_path, image_url):
                print(f"❌ Failed this round: {save_path}")
                next_round.append((prompt, save_path))
            time.sleep(1.5)
        if next_round:
            print("\n⏸️ Waiting 60s before retrying failed images...\n")
            time.sleep(60)
        remaining = next_round
        round_num += 1
    print("\n🎉 All images generated for this file!\n")

# === Main ===
def main():
    print("\n🚀 Starting IMAGE GENERATOR\n")
    # Direct image URL for Kontext
    IMAGE_SOURCE = "https://static.vecteezy.com/system/resources/thumbnails/006/457/085/small/businessman-in-suit-standing-vector.jpg"
    for root, dirs, files in os.walk(INPUT_DIR):
        print(f"📂 Checking directory: {root}")
        for file in files:
            if file.endswith(".txt"):
                txt_file = os.path.join(root, file)
                process_text_file(txt_file, IMAGE_SOURCE)
    print("\n🏁 Finished all tasks!\n")

if __name__ == "__main__":
    main()
