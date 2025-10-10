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

# === Helper Functions ===

def load_json(path):
    """Load JSON data safely, return empty list if invalid or empty."""
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ JSON decode error in {path}: {e}, treating as empty list.")
            return []
    return []

def save_json(path, data):
    """Save JSON data to file."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def google_search(query, platform, top_n=7):
    """
    Search Google for a query, return the first valid link for the platform.
    platform: 'amazon' or 'audible'
    """
    search_url = f"https://www.google.com/search?q={urllib.parse.quote(query)}"
    print(f"🔎 Google search URL: {search_url}")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36"
    }

    try:
        r = requests.get(search_url, headers=headers, timeout=10)
        html = r.text
        print(f"📄 Google HTML length: {len(html)}")
    except Exception as e:
        print(f"⚠️ Google search request failed: {e}")
        return None

    # Parse candidate links
    links = []
    parts = html.split('<a href="/url?q=')
    for part in parts[1:]:
        url = part.split("&")[0]
        if url.startswith("http"):
            links.append(url)

    print(f"🔗 Candidate links found ({len(links)}): {links[:top_n]}{'...' if len(links) > top_n else ''}")

    # Return first valid link for platform from top N
    for url in links[:top_n]:
        if platform == "amazon" and "amazon.com" in url and ("/dp/" in url or "/gp/product/" in url):
            print(f"✅ Selected Amazon link: {url}")
            return url
        if platform == "audible" and "audible.com" in url and ("/pd/" in url or "/product/" in url):
            print(f"✅ Selected Audible link: {url}")
            return url

    return None

def generate_affiliate_link(url):
    """Append affiliate tag to URL."""
    if "amazon.com" in url or "audible.com" in url:
        separator = "&" if "?" in url else "?"
        return f"{url}{separator}tag={ASSOCIATE_ID}"
    return url

def fallback_link(book, platform):
    """Return generic search link if Google search fails."""
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
    print(f"\n📖 Processing book: {title} by {author}\n")

    # === Amazon ===
    amazon_url = google_search(f'"{title}" by "{author}"', "amazon")
    if amazon_url:
        amazon_link = generate_affiliate_link(amazon_url)
    else:
        amazon_link = fallback_link(book, "amazon")
        print(f"⚠️ Using fallback Amazon link: {amazon_link}")

    # === Audible ===
    audible_url = google_search(f'"{title}" by "{author}"', "audible")
    if audible_url:
        audible_link = generate_affiliate_link(audible_url)
    else:
        audible_link = fallback_link(book, "audible")
        print(f"⚠️ Using fallback Audible link: {audible_link}")

    # === Save links ===
    try:
        amazon_links = load_json(AMAZON_PATH)
        audible_links = load_json(AUDIBLE_PATH)

        amazon_links.append({"title": title, "link": amazon_link})
        audible_links.append({"title": title, "link": audible_link})

        save_json(AMAZON_PATH, amazon_links)
        save_json(AUDIBLE_PATH, audible_links)

        print("💾 Links saved successfully!")
    except Exception as e:
        print(f"❌ Error saving links: {e}")

if __name__ == "__main__":
    main()
