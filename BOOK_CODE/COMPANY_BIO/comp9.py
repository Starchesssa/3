
import os
import requests
import time

# Directories
INPUT_DIR = "BOOKS/Temp/PROMPTS"
OUTPUT_DIR = "src/IMG"
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

def process_text_file(txt_file):
    """Process a text file and generate images from it."""
    with open(txt_file, "r", encoding="utf-8") as f:
        # Filter out empty lines
        lines = [line.strip() for line in f if line.strip()]

    i = 0
    while i < len(lines) - 1:
        filename = lines[i]
        prompt = lines[i + 1]
        save_path = os.path.join(OUTPUT_DIR, filename)

        # Skip if image already exists
        if os.path.exists(save_path):
            print(f"⏩ Skipping (already exists): {save_path}")
        else:
            if download_image(prompt, save_path):
                print(f"✅ Downloaded and saved: {save_path}")
            else:
                print(f"❌ Failed to generate image for: {filename}")

        i += 2  # move to next pair

def main():
    for file in os.listdir(INPUT_DIR):
        if file.endswith(".txt"):
            txt_file = os.path.join(INPUT_DIR, file)
            process_text_file(txt_file)

if __name__ == "__main__":
    main()
