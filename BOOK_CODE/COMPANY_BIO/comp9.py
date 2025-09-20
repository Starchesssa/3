
import os
import json
import requests
import time

# Directories
JSON_DIR = "BOOKS/Temp/PROMPTS/Json"
OUTPUT_DIR = "assets/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def download_image(prompt, save_path, retries=3, delay=2):
    """Download an image from Pollinations AI with retry logic."""
    url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}"
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


def process_json(json_file):
    """Process one JSON file and generate all images."""
    with open(json_file, "r", encoding="utf-8") as f:
        items = json.load(f)

    for item in items:
        name = item["name"]
        prompt = item["description"]

        raw_path = os.path.join(OUTPUT_DIR, f"raw_{name}")
        final_path = os.path.join(OUTPUT_DIR, name)

        # Skip if final already exists
        if os.path.exists(final_path):
            print(f"⏩ Skipping (already exists): {final_path}")
            continue

        # Download image
        if download_image(prompt, raw_path):
            print(f"✅ Downloaded: {raw_path}")
            os.rename(raw_path, final_path)
            print(f"💾 Saved: {final_path}")
        else:
            print(f"❌ Failed to generate image for: {name}")


def main():
    for file in os.listdir(JSON_DIR):
        if file.endswith(".json"):
            process_json(os.path.join(JSON_DIR, file))


if __name__ == "__main__":
    main()
