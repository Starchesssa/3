
import os
import re
import sys
import requests

# === CONFIGURATION ===
QUALIFY_PATH = "Unuusual_memory/QUALIFY/qualified.txt"
LINKS_DIR = "Unuusual_memory/Relevant_links"
OUTPUT_DIR = "Unuusual_memory/DESCREPTION"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# === YOUTUBE API ===
API_KEY = os.getenv("YOUTUBE_API")
if not API_KEY:
    print("[✘] YOUTUBE_API environment variable not set.")
    sys.exit(1)

def extract_video_id(url):
    """Extract YouTube video ID from URL."""
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else None

def fetch_video_info(video_id):
    """Fetch title and description via YouTube Data API."""
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

def letter_to_index(letter):
    return ord(letter.lower()) - ord('a')

# === MAIN ===
def main():
    with open(QUALIFY_PATH) as f:
        for line in f:
            if not line.strip():
                continue

            parts = line.strip().split(": ")
            if len(parts) < 2:
                print(f"[!] Unexpected line format: {line.strip()}")
                continue

            group_num = parts[0].split()[-1]
            file_name = parts[1].strip()

            match = re.match(r'(\d+)([a-z])_(.+)\.txt$', file_name)
            if not match:
                print(f"[!] Failed to parse file name: {file_name}")
                continue

            group_number, letter, file_title = match.groups()
            qualified_index = letter_to_index(letter)

            links_file = os.path.join(LINKS_DIR, f"{group_number}_{file_title}.txt")
            if not os.path.exists(links_file):
                print(f"[!] Links file not found: {links_file}")
                continue

            with open(links_file) as lf:
                links = [l.strip() for l in lf if l.strip()]

            if qualified_index >= len(links):
                print(f"[!] Not enough links in {links_file}")
                continue

            link = links[qualified_index]
            video_id = extract_video_id(link)
            if not video_id:
                print(f"[!] Invalid YouTube URL: {link}")
                continue

            title, description = fetch_video_info(video_id)
            if title is None:
                print(f"[!] Failed to fetch video info for {link}")
                continue

            output_file = os.path.join(OUTPUT_DIR, f"group_{group_num}.txt")
            with open(output_file, "w", encoding="utf-8") as out_f:
                out_f.write(f"Title: {title}\n\nDescription:\n{description}")

            print(f"[✓] Saved info for group {group_num}")

    print("[✓] All video info collected.")

# === LAUNCH ===
if __name__ == "__main__":
    main()
