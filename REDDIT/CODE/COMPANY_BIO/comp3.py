
import os
import json
import urllib.parse
import requests

# === Paths ===
HALAL_PATH = "REDDIT/THEMES/Company bio/BOOKS/HALAL/Halal.json"
LINKS_DIR = "REDDIT/THEMES/Company bio/BOOKS/LINKS"
AMAZON_PATH = os.path.join(LINKS_DIR, "amazon.json")
AUDIBLE_PATH = os.path.join(LINKS_DIR, "audible.json")

# === Affiliate ID ===
ASSOCIATE_ID = "bookslibrar08-20"

# === Google Custom Search credentials ===
GOOGLE_API = os.environ.get("GOOGLE_API")
GOOGLE_CX = os.environ.get("GOOGLE_CX")

# === Helper Functions ===

def load_json(path):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            print(f"❌ JSON decode error in {path}, treating as empty list.")
            return []
    return []

def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def google_search(query, num=10):
    """Search Google Custom Search API and return JSON results"""
    url = f"https://www.googleapis.com/customsearch/v1?q={urllib.parse.quote(query)}&cx={GOOGLE_CX}&key={GOOGLE_API}&num={num}"
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

def find_first_valid_link(items, platform):
    for item in items:
        link = item.get("link", "")
        if platform == "amazon" and is_valid_amazon(link):
            return link
        elif platform == "audible" and is_valid_audible(link):
            return link
    return None

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

# === Main ===
def main():
    books = load_json(HALAL_PATH)
    if not books:
        print("❌ No books found in Halal.json")
        return

    book = books[0]
    title = book.get("title", "")
    author = book.get("author", "")
    print(f"📖 Processing book: {title} by {author}")

    # === Amazon ===
    amazon_query = f'"{title}" by "{author}" on Amazon'
    amazon_items = google_search(amazon_query)
    amazon_url = find_first_valid_link(amazon_items, "amazon")
    if amazon_url:
        amazon_link = generate_affiliate_link(amazon_url)
        print(f"✅ Amazon link generated: {amazon_link}")
    else:
        amazon_link = fallback_link(book, "amazon")
        print(f"⚠️ Using fallback Amazon link: {amazon_link}")

    # === Audible ===
    audible_query = f'"{title}" by "{author}" on Audible'
    audible_items = google_search(audible_query)
    audible_url = find_first_valid_link(audible_items, "audible")
    if audible_url:
        audible_link = generate_affiliate_link(audible_url)
        print(f"✅ Audible link generated: {audible_link}")
    else:
        audible_link = fallback_link(book, "audible")
        print(f"⚠️ Using fallback Audible link: {audible_link}")

    # === Save links (overwrite JSON each run) ===
    save_json(AMAZON_PATH, [{"title": title, "link": amazon_link}])
    save_json(AUDIBLE_PATH, [{"title": title, "link": audible_link}])
    print("💾 Links saved successfully!")

if __name__ == "__main__":
    main()
