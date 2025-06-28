
import os
import re
import requests
import subprocess

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API")  # Loaded from GitHub Secrets

INPUT_FILE = "CATEGORY/Products_temp.txt"
OUTPUT_DIR = "Unuusual_memory/Links"
MAX_RESULTS = 11

os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_numbered_lines(filepath):
    with open(filepath, "r", encoding="utf-8") as file:
        lines = file.readlines()

    numbered_items = []
    pattern = re.compile(r'^(\d+)\.\s+(.*)')

    for line in lines:
        match = pattern.match(line.strip())
        if match:
            number = int(match.group(1))
            title = match.group(2)
            numbered_items.append((number, title))

    return numbered_items

def search_youtube(query, max_results=MAX_RESULTS):
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "maxResults": max_results,
        "type": "video",
        "videoLicense": "creativeCommon",
        "key": YOUTUBE_API_KEY
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    results = response.json()

    video_links = [
        f"https://www.youtube.com/watch?v={item['id']['videoId']}"
        for item in results.get("items", [])
    ]
    return video_links

def save_links_to_file(index, links):
    filename = os.path.join(OUTPUT_DIR, f"{index}_link.txt")
    with open(filename, "w", encoding="utf-8") as f:
        f.write("\n".join(links))

def commit_saved_links():
    try:
        subprocess.run(["git", "config", "--global", "user.name", "bot"], check=True)
        subprocess.run(["git", "config", "--global", "user.email", "bot@example.com"], check=True)
        subprocess.run(["git", "add", OUTPUT_DIR], check=True)
        subprocess.run(["git", "commit", "-m", "🔗 Auto-saved YouTube links"], check=True)
        subprocess.run(["git", "push"], check=True)
        print("✅ Changes committed and pushed to GitHub.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Git commit failed: {e}")

def main():
    if not YOUTUBE_API_KEY:
        print("❌ YOUTUBE_API key is not set in environment.")
        return

    items = extract_numbered_lines(INPUT_FILE)
    print(f"🔍 Found {len(items)} products to process...")

    for index, product in items:
        print(f"📦 [{index}] Searching: {product}")
        try:
            links = search_youtube(product)
            save_links_to_file(index, links)
            print(f"✅ Saved {len(links)} links to {index}_link.txt\n")
        except Exception as e:
            print(f"❌ Failed on [{index}] {product}: {e}")

    commit_saved_links()

if __name__ == "__main__":
    main()
