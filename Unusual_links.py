
import os
import re
import requests
import subprocess

# 🔐 Load your YouTube Data API key from environment variable
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API")  # GitHub Secret

# 📂 Input and Output Paths
INPUT_FILE = "CATEGORY/Products_temp.txt"
OUTPUT_DIR = "Unuusual_memory/Links"
MAX_RESULTS = 50

os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_numbered_lines(filepath):
    """Read and extract numbered product lines from a file."""
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

def sanitize_filename(name):
    """Clean up product names for safe filenames."""
    name = name.lower()
    name = re.sub(r"[^\w\s\-+]", "", name)  # Remove unwanted characters
    name = re.sub(r"\s+", "_", name)        # Replace spaces with underscores
    return name.strip("_")

def search_youtube(query, max_results=MAX_RESULTS):
    """Search YouTube videos for a given query using the API."""
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

def save_links_to_file(index, product, links):
    """Save YouTube links to a file named with index and sanitized product name."""
    safe_name = sanitize_filename(product)
    filename = os.path.join(OUTPUT_DIR, f"{index}_{safe_name}.txt")
    with open(filename, "w", encoding="utf-8") as f:
        f.write("\n".join(links))
    print(f"✅ Saved to {filename}")

def commit_saved_links():
    """Commit and push the saved links to GitHub."""
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
            save_links_to_file(index, product, links)
        except Exception as e:
            print(f"❌ Failed on [{index}] {product}: {e}")

    commit_saved_links()

if __name__ == "__main__":
    main()
