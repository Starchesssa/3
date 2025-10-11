import os
import json
import urllib.parse
import requests

# === File Paths ===
HALAL_PATH = "REDDIT/THEMES/Company bio/BOOKS/HALAL/Halal.json"
LINKS_DIR = "REDDIT/THEMES/Company bio/BOOKS/LINKS"
AMAZON_PATH = os.path.join(LINKS_DIR, "amazon.json")
AUDIBLE_PATH = os.path.join(LINKS_DIR, "audible.json")

# === Affiliate Tag ===
ASSOCIATE_ID = "bookslibrar08-20"

# === Google Custom Search Credentials (from GitHub Secrets) ===
GOOGLE_API = os.environ.get("GOOGLE_API")
GOOGLE_CX = os.environ.get("GOOGLE_CX")

# === Helper Functions ===

def google_search(query, num=10):
    """Perform a Google Custom Search and return JSON items."""
    url = (
        f"https://www.googleapis.com/customsearch/v1?"
        f"q={urllib.parse.quote(query)}&key={GOOGLE_API}&cx={GOOGLE_CX}&num={num}"
    )
    print(f"🔎 Google API request URL: {url}")

    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        items = data.get("items", [])
        print(f"📄 Google API returned {len(items)} items.")
        return items
    except Exception as e:
        print(f"⚠️ Google API request failed: {e}")
        return []

def is_valid_amazon(url):
    return "amazon.com" in url and ("/dp/" in url or "/gp/product/" in url)

def is_valid_audible(url):
    return "audible.com" in url and ("/pd/" in url or "/product/" in url)

def generate_affiliate_link(url):
    separator = "&" if "?" in url else "?"
    return f"{url}{separator}tag={ASSOCIATE_ID}"

def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def fallback_link(book, platform):
    title = book.get("title", "")
    author = book.get("author", "")
    if platform == "amazon":
        base = "https://www.amazon.com/s"
        params = {"k": f"{title} {author}", "tag": ASSOCIATE_ID}
    else:
        base = "https://www.audible.com/search"
        params = {"keywords": f"{title} {author}", "tag": ASSOCIATE_ID}
    return f"{base}?{urllib.parse.urlencode(params)}"

# === Core Logic ===

def find_best_link(items, platform):
    """Return the first valid Amazon or Audible link from results."""
    for item in items:
        link = item.get("link", "")
        if platform == "amazon" and is_valid_amazon(link):
            return link
        if platform == "audible" and is_valid_audible(link):
            return link
    return None

def main():
    # Load Halal.json
    if not os.path.exists(HALAL_PATH):
        print(f"❌ Missing {HALAL_PATH}")
        return

    with open(HALAL_PATH, "r", encoding="utf-8") as f:
        books = json.load(f)

    if not books:
        print("❌ No books found in Halal.json")
        return

    # Pick the first book (you can loop later)
    book = books[0]
    title = book.get("title", "")
    author = book.get("author", "")
    print(f"📖 Processing book: {title} by {author}")

    # === Amazon Search ===
    amazon_query = f'"{title}" by "{author}" Amazon'
    amazon_items = google_search(amazon_query)
    amazon_url = find_best_link(amazon_items, "amazon")

    if amazon_url:
        amazon_link = generate_affiliate_link(amazon_url)
        print(f"✅ Amazon link found: {amazon_link}")
    else:
        amazon_link = fallback_link(book, "amazon")
        print(f"⚠️ Fallback Amazon link: {amazon_link}")

    # === Audible Search ===
    audible_query = f'"{title}" by "{author}" Audible'
    audible_items = google_search(audible_query)
    audible_url = find_best_link(audible_items, "audible")

    if audible_url:
        audible_link = generate_affiliate_link(audible_url)
        print(f"✅ Audible link found: {audible_link}")
    else:
        audible_link = fallback_link(book, "audible")
        print(f"⚠️ Fallback Audible link: {audible_link}")

    # === Save Results ===
    save_json(AMAZON_PATH, [{"title": title, "link": amazon_link}])
    save_json(AUDIBLE_PATH, [{"title": title, "link": audible_link}])

    print("💾 Links saved successfully!")

# === Run ===
if __name__ == "__main__":
    main()
