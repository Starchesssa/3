
import os
import json
import requests
import urllib.parse

# === Paths ===
HALAL_PATH = "REDDIT/THEMES/Company bio/BOOKS/HALAL/Halal.json"
LINKS_DIR = "REDDIT/THEMES/Company bio/BOOKS/LINKS"
AMAZON_PATH = os.path.join(LINKS_DIR, "amazon.json")
AUDIBLE_PATH = os.path.join(LINKS_DIR, "audible.json")

# === Amazon/Audible Affiliate ID ===
ASSOCIATE_ID = "bookslibrar08-20"

# === Google API Keys (from GitHub secrets) ===
GOOGLE_API = os.environ.get("GOOGLE_API")
GOOGLE_CX = os.environ.get("GOOGLE_CX")

# === Helper functions ===

def load_json(path):
    """Load JSON or return empty list on failure."""
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

def sanitize_search(text):
    """Remove problematic characters for search query."""
    return text.replace("&", "and").replace('"', '')

def google_custom_search(query, site):
    """Search Google Custom Search API for first result URL."""
    search_term = sanitize_search(query)
    url = f"https://www.googleapis.com/customsearch/v1?q={urllib.parse.quote(search_term)}+site:{site}&cx={GOOGLE_CX}&key={GOOGLE_API}"
    print(f"🔎 Google API request URL: {url}")

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        items = data.get("items", [])
        print(f"📄 Google API returned {len(items)} items.")
        if items:
            first_url = items[0].get("link")
            print(f"🔗 First URL found: {first_url}")
            return first_url
    except Exception as e:
        print(f"⚠️ Google API error: {e}")
    return None

def is_valid_amazon(url):
    return "amazon.com" in url and ("/dp/" in url or "/gp/product/" in url)

def is_valid_audible(url):
    return "audible.com" in url and ("/pd/" in url or "/product/" in url)

def generate_affiliate_link(url):
    if url is None:
        return None
    separator = "&" if "?" in url else "?"
    if "amazon.com" in url or "audible.com" in url:
        return f"{url}{separator}tag={ASSOCIATE_ID}"
    return url

def fallback_link(book, platform):
    """Return generic search link if API fails"""
    title = book.get("title", "")
    author = book.get("author", "")
    if platform == "amazon":
        base = "https://www.amazon.com/s"
        params = {"k": f"{title} {author}", "tag": ASSOCIATE_ID}
    else:  # audible
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

    # --- Amazon ---
    amazon_url = google_custom_search(f"{title} by {author} on Amazon", "amazon.com")
    if amazon_url and is_valid_amazon(amazon_url):
        amazon_link = generate_affiliate_link(amazon_url)
        print(f"✅ Amazon link generated: {amazon_link}")
    else:
        amazon_link = fallback_link(book, "amazon")
        print(f"⚠️ Using fallback Amazon link: {amazon_link}")

    # --- Audible ---
    audible_url = google_custom_search(f"{title} by {author} on Audible", "audible.com")
    if audible_url and is_valid_audible(audible_url):
        audible_link = generate_affiliate_link(audible_url)
        print(f"✅ Audible link generated: {audible_link}")
    else:
        audible_link = fallback_link(book, "audible")
        print(f"⚠️ Using fallback Audible link: {audible_link}")

    # --- Save links ---
    amazon_links = load_json(AMAZON_PATH)
    audible_links = load_json(AUDIBLE_PATH)

    amazon_links.append({"title": title, "link": amazon_link})
    audible_links.append({"title": title, "link": audible_link})

    save_json(AMAZON_PATH, amazon_links)
    save_json(AUDIBLE_PATH, audible_links)

    print("💾 Links saved successfully!")

if __name__ == "__main__":
    main()
