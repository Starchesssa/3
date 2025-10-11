import os
import json
import requests
import urllib.parse

# === Paths ===
HALAL_PATH = "REDDIT/THEMES/Company bio/BOOKS/HALAL/Halal.json"
LINKS_DIR = "REDDIT/THEMES/Company bio/BOOKS/LINKS"
AMAZON_PATH = os.path.join(LINKS_DIR, "amazon.json")
AUDIBLE_PATH = os.path.join(LINKS_DIR, "audible.json")

# === Amazon Affiliate ID ===
ASSOCIATE_ID = "bookslibrar08-20"

# === Google Custom Search Configuration from Environment Variables ===
GOOGLE_API_KEY = os.environ.get("GOOGLE_API")
GOOGLE_CX = os.environ.get("GOOGLE_CX")

if not GOOGLE_API_KEY or not GOOGLE_CX:
    raise ValueError("❌ Missing GOOGLE_API or GOOGLE_CX environment variables.")

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

def google_search_api(query, site):
    """Search using Google Custom Search API and return first valid link."""
    search_query = f"{query} site:{site}"
    url = f"https://www.googleapis.com/customsearch/v1?q={urllib.parse.quote(search_query)}&cx={GOOGLE_CX}&key={GOOGLE_API_KEY}"
    print(f"🔎 Google search URL: {url}")
    try:
        resp = requests.get(url, timeout=10)
        data = resp.json()
        if "items" not in data:
            print("⚠️ No search results found in Google API.")
            return None
        candidate_links = [item.get("link", "") for item in data["items"] if site in item.get("link", "")]
        print(f"🔗 Candidate links found ({len(candidate_links)}): {candidate_links}")
        return candidate_links[0] if candidate_links else None
    except Exception as e:
        print(f"⚠️ Google API search failed: {e}")
        return None

def generate_affiliate_link(url):
    if "amazon.com" in url:
        separator = "&" if "?" in url else "?"
        return f"{url}{separator}tag={ASSOCIATE_ID}"
    elif "audible.com" in url:
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

    # === Amazon ===
    amazon_url = google_search_api(f'"{title}" by "{author}" on Amazon', "amazon.com")
    if amazon_url:
        amazon_link = generate_affiliate_link(amazon_url)
        print(f"✅ Amazon link found: {amazon_link}")
    else:
        amazon_link = fallback_link(book, "amazon")
        print(f"⚠️ Using fallback Amazon link: {amazon_link}")

    # === Audible ===
    audible_url = google_search_api(f'"{title}" by "{author}" on Audible', "audible.com")
    if audible_url:
        audible_link = generate_affiliate_link(audible_url)
        print(f"✅ Audible link found: {audible_link}")
    else:
        audible_link = fallback_link(book, "audible")
        print(f"⚠️ Using fallback Audible link: {audible_link}")

    # === Save links ===
    amazon_links = load_json(AMAZON_PATH)
    audible_links = load_json(AUDIBLE_PATH)

    amazon_links.append({"title": title, "link": amazon_link})
    audible_links.append({"title": title, "link": audible_link})

    save_json(AMAZON_PATH, amazon_links)
    save_json(AUDIBLE_PATH, audible_links)

    print("💾 Links saved successfully!")

if __name__ == "__main__":
    main()
