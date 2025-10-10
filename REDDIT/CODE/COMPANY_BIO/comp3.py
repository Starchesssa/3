
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
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ JSON decode error in {path}: {e}")
            return []
    return []

def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def google_search(query, site):
    """Search Google and return first URL from results."""
    search_url = f"https://www.google.com/search?q={urllib.parse.quote(query + ' site:' + site)}"
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

    # Parse all links
    links = []
    parts = html.split('<a href="/url?q=')
    for part in parts[1:]:
        url = part.split("&")[0]
        if url.startswith("http"):
            links.append(url)

    print(f"🔗 Candidate links found ({len(links)}): {links[:5]}{'...' if len(links)>5 else ''}")
    return links[0] if links else None

def is_valid_amazon(url):
    return "amazon.com" in url and ("/dp/" in url or "/gp/product/" in url)

def is_valid_audible(url):
    return "audible.com" in url and ("/pd/" in url or "/product/" in url)

def generate_affiliate_link(url):
    if "amazon.com" in url:
        separator = "&" if "?" in url else "?"
        return f"{url}{separator}tag={ASSOCIATE_ID}"
    elif "audible.com" in url:
        separator = "&" if "?" in url else "?"
        return f"{url}{separator}tag={ASSOCIATE_ID}"
    return url

def fallback_link(book, platform):
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
    print(f"📖 Processing book: {title} by {author}\n")

    # === Amazon ===
    try:
        first_amazon_url = google_search(f'"{title}" by "{author}"', "amazon.com")
        if first_amazon_url and is_valid_amazon(first_amazon_url):
            amazon_link = generate_affiliate_link(first_amazon_url)
            print(f"✅ Amazon link found: {amazon_link}\n")
        else:
            amazon_link = fallback_link(book, "amazon")
            print(f"⚠️ Using fallback Amazon link: {amazon_link}\n")
    except Exception as e:
        print(f"❌ Error during Amazon search: {e}")
        amazon_link = fallback_link(book, "amazon")

    # === Audible ===
    try:
        first_audible_url = google_search(f'"{title}" by "{author}"', "audible.com")
        if first_audible_url and is_valid_audible(first_audible_url):
            audible_link = generate_affiliate_link(first_audible_url)
            print(f"✅ Audible link found: {audible_link}\n")
        else:
            audible_link = fallback_link(book, "audible")
            print(f"⚠️ Using fallback Audible link: {audible_link}\n")
    except Exception as e:
        print(f"❌ Error during Audible search: {e}")
        audible_link = fallback_link(book, "audible")

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
