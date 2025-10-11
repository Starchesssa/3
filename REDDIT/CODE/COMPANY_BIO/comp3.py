
import os
import json
import urllib.parse
import requests

# === Paths ===
HALAL_PATH = "REDDIT/THEMES/Company bio/BOOKS/HALAL/Halal.json"
LINKS_DIR = "REDDIT/THEMES/Company bio/BOOKS/LINKS"
AMAZON_PATH = os.path.join(LINKS_DIR, "amazon.json")
AUDIBLE_PATH = os.path.join(LINKS_DIR, "audible.json")

# === Amazon Affiliate ID ===
ASSOCIATE_ID = "bookslibrar08-20"

# === Google Custom Search environment variables ===
GOOGLE_API = os.environ.get("GOOGLE_API")
GOOGLE_CX = os.environ.get("GOOGLE_CX")

# === Helper Functions ===

def save_json(path, data):
    """Save JSON data to file (always overwrite)."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def google_search_first_result(query, site):
    """Search Google Custom Search API and return first URL."""
    search_url = (
        f"https://www.googleapis.com/customsearch/v1?"
        f"q={urllib.parse.quote(query + ' on ' + site)}&cx={GOOGLE_CX}&key={GOOGLE_API}&num=10"
    )
    print(f"🔎 Google API request URL: {search_url}")

    try:
        r = requests.get(search_url, timeout=10)
        data = r.json()
        items = data.get("items", [])
        print(f"📄 Google API returned {len(items)} items.")
        if items:
            first_url = items[0].get("link")
            print(f"🔗 First URL found: {first_url}")
            return first_url
    except Exception as e:
        print(f"⚠️ Google API request failed: {e}")
    return None

def generate_affiliate_link(url):
    if url is None:
        return None
    if "amazon.com" in url or "audible.com" in url:
        separator = "&" if "?" in url else "?"
        return f"{url}{separator}tag={ASSOCIATE_ID}"
    return url

def fallback_link(book, platform):
    """Return generic search link if first result fails"""
    title = book.get("title", "")
    author = book.get("author", "")
    if platform == "amazon":
        base = "https://www.amazon.com/s"
        params = {"k": f"{title} {author}", "tag": ASSOCIATE_ID}
    else:
        base = "https://www.audible.com/search"
        params = {"keywords": f"{title} {author}", "tag": ASSOCIATE_ID}
    return f"{base}?{urllib.parse.urlencode(params)}"

# === Main ===
def main():
    # Load the single book
    if not os.path.exists(HALAL_PATH):
        print("❌ Halal.json not found.")
        return

    try:
        with open(HALAL_PATH, "r", encoding="utf-8") as f:
            books = json.load(f)
    except Exception as e:
        print(f"❌ Failed to read Halal.json: {e}")
        return

    if not books:
        print("❌ Halal.json is empty.")
        return

    book = books[0]
    title = book.get("title", "")
    author = book.get("author", "")
    print(f"📖 Processing book: {title} by {author}")

    # Amazon link
    amazon_url = google_search_first_result(f'"{title}" by "{author}"', "Amazon.com")
    if not amazon_url:
        amazon_url = fallback_link(book, "amazon")
        print(f"⚠️ Using fallback Amazon link: {amazon_url}")
    amazon_link = generate_affiliate_link(amazon_url)
    print(f"✅ Amazon link generated: {amazon_link}")

    # Audible link
    audible_url = google_search_first_result(f'"{title}" by "{author}"', "Audible.com")
    if not audible_url:
        audible_url = fallback_link(book, "audible")
        print(f"⚠️ Using fallback Audible link: {audible_url}")
    audible_link = generate_affiliate_link(audible_url)
    print(f"✅ Audible link generated: {audible_link}")

    # Save JSON files (always overwrite)
    save_json(AMAZON_PATH, [{"title": title, "link": amazon_link}])
    save_json(AUDIBLE_PATH, [{"title": title, "link": audible_link}])

    print("💾 Links saved successfully!")

if __name__ == "__main__":
    main()
