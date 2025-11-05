
import os
import requests
import time
import re

# Directories
INPUT_DIR = "BOOKS/Temp/PROMPTS"
OUTPUT_DIR = "src/IMG"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Desired image size (YouTube thumbnail)
WIDTH = 1280
HEIGHT = 720

def download_image(prompt, save_path, retries=3, delay=2):
    """Download an image from Pollinations AI with retry logic and fixed size."""
    # Include size in the URL
    url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}?width={WIDTH}&height={HEIGHT}"
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
        lines = [line.strip() for line in f if line.strip()]

    current_prefix = ""
    i = 0
    while i < len(lines):
        line = lines[i]

        # Match a numbered prompt (e.g., 2.a., 3a, 5.b)
        match = re.match(r'^(\d+)([.\-]?)([a-z]?)\.?', line)
        if match:
            number = match.group(1)
            letter = match.group(3) if match.group(3) else ""
            current_prefix = f"{number}{letter}"
            # Next line should be the prompt text
            if i + 1 < len(lines):
                prompt_text = lines[i + 1]
                # Create filename with the bracket text
                bracket_text = re.findall(r'\((.*?)\)', prompt_text)
                if bracket_text:
                    filename_text = bracket_text[0].replace(" ", "_")
                else:
                    filename_text = "image"
                filename = f"{current_prefix}_{filename_text}.png"
                save_path = os.path.join(OUTPUT_DIR, filename)

                if os.path.exists(save_path):
                    print(f"⏩ Skipping (already exists): {save_path}")
                else:
                    if download_image(prompt_text, save_path):
                        print(f"✅ Downloaded and saved: {save_path}")
                    else:
                        print(f"❌ Failed to generate image for: {filename}")

                i += 2
                continue

        # Handle lines that continue the previous number (e.g., b., c.)
        sub_match = re.match(r'^([a-z])\.', line)
        if sub_match and current_prefix:
            letter = sub_match.group(1)
            sub_prefix = f"{current_prefix}{letter}"
            if i + 1 < len(lines):
                prompt_text = lines[i + 1]
                bracket_text = re.findall(r'\((.*?)\)', prompt_text)
                if bracket_text:
                    filename_text = bracket_text[0].replace(" ", "_")
                else:
                    filename_text = "image"
                filename = f"{sub_prefix}_{filename_text}.png"
                save_path = os.path.join(OUTPUT_DIR, filename)

                if os.path.exists(save_path):
                    print(f"⏩ Skipping (already exists): {save_path}")
                else:
                    if download_image(prompt_text, save_path):
                        print(f"✅ Downloaded and saved: {save_path}")
                    else:
                        print(f"❌ Failed to generate image for: {filename}")

                i += 2
                continue

        i += 1

def main():
    for file in os.listdir(INPUT_DIR):
        if file.endswith(".txt"):
            txt_file = os.path.join(INPUT_DIR, file)
            process_text_file(txt_file)

if __name__ == "__main__":
    main()
