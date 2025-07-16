
import os
import re
import sys
import requests

# === CONFIGURATION ===
LINKS_DIR = "Unuusual_memory/Links"
OUTPUT_DIR = "Unuusual_memory/DESCR"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# === YOUTUBE API ===
API_KEY = os.getenv("YOUTUBE_API")
if not API_KEY:
    print("[✘] YOUTUBE_API environment variable not set.")
    sys.exit(1)

def extract_video_id(url):
    """Extract YouTube video ID from a URL."""
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else None

def fetch_video_info(video_id):
    """Fetch video title and description from YouTube Data API."""
    api_url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "id": video_id,
        "key": API_KEY,
        "part": "snippet"
    }
    try:
        response = requests.get(api_url, params=params, timeout=10)
        response.raise_for_status()
        items = response.json().get("items", [])
        if not items:
            return None, None
        snippet = items[0]["snippet"]
        return snippet["title"], snippet["description"]
    except Exception as e:
        print(f"[ERROR] Failed to fetch video info: {e}")
        return None, None

def index_to_letter(index):
    """Convert index (0–25) to letter (a–z)."""
    return chr(ord('a') + index)

def extract_number_prefix(filename):
    """Extract leading number from filename."""
    match = re.match(r"^(\d+)_", filename)
    return int(match.group(1)) if match else None

# === MAIN SCRIPT ===
def main():
    all_files = os.listdir(LINKS_DIR)
    valid_txt_files = []

    for file in all_files:
        if not file.endswith(".txt"):
            continue
        number = extract_number_prefix(file)
        if number and 1 <= number <= 33:
            valid_txt_files.append((number, file))

    # Sort based on number prefix (1 to 33)
    valid_txt_files.sort(key=lambda x: x[0])

    if not valid_txt_files:
        print("[✘] No valid numbered .txt files found in range 1–33.")
        return

    for number, txt_file in valid_txt_files:
        file_path = os.path.join(LINKS_DIR, txt_file)
        print(f"[•] Processing: {txt_file}")

        try:
            with open(file_path, encoding="utf-8") as f:
                links = [line.strip() for line in f if line.strip()]
        except Exception as e:
            print(f"[!] Failed to read {txt_file}: {e}")
            continue

        file_title = re.sub(r"^\d+_", "", txt_file).replace(".txt", "")

        for i, link in enumerate(links[:12]):  # First 12 links only
            letter = index_to_letter(i)
            new_filename = f"{number}({letter})_{file_title}.txt"
            output_path = os.path.join(OUTPUT_DIR, new_filename)

            video_id = extract_video_id(link)
            if not video_id:
                print(f"[!] Invalid YouTube URL: {link}")
                continue

            title, description = fetch_video_info(video_id)
            if title is None:
                print(f"[!] Skipping link, failed to get info: {link}")
                continue

            try:
                with open(output_path, "w", encoding="utf-8") as out_f:
                    out_f.write(f"Title: {title}\n\nDescription:\n{description}")
                print(f"[✓] Saved: {new_filename}")
            except Exception as e:
                print(f"[✘] Failed to save {new_filename}: {e}")

    print("[✓] Done. All video info collected.")

# === ENTRY POINT ===
if __name__ == "__main__":
    main()
