
import os
import json
import requests
import urllib.parse

# === Paths ===
BOOK_PATH = "REDDIT/THEMES/Company bio/BOOKS/USED/Unused.json"
AMAZON_TXT = "REDDIT/THEMES/Company bio/BOOKS/LINKS/amazon.txt"
AUDIBLE_TXT = "REDDIT/THEMES/Company bio/BOOKS/LINKS/audible.txt"

# === Google API credentials (hardcoded) ===
API_KEY = "AIzaSyB4NaA2lMW6uZ6YjzbDCSo-he6zh_XBVkM"
CX_ID = "a73cae6bad04a492d"

# === Helper functions ===
def load_book(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        print(f"❌ File not found: {path}")
        return None

def google_search(query, num=10):
    """Search Google and return JSON items"""
    url = f"https://www.googleapis.com/customsearch/v1?q={urllib.parse.quote(query)}&key={API_KEY}&cx={CX_ID}&num={num}"
    print(f"\n🔎 Searching: {query}")
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        items = data.get("items", [])
        print(f"📄 Google returned {len(items)} results.")
        return items
    except Exception as e:
        print(f"⚠️ Google API request failed: {e}")
        return []

def print_links(items):
    """Print every link with index"""
    for i, item in enumerate(items, start=1):
        link = item.get("link", "")
        print(f"  {i}. {link}")

def find_first_valid_link(items, platform):
    for item in items:
        link = item.get("link", "")
        if platform == "amazon" and "amazon.com" in link:
            print(f"✅ Found valid Amazon link: {link}")
            return link
        elif platform == "audible" and "audible.com" in link:
            print(f"✅ Found valid Audible link: {link}")
            return link
    print(f"❌ No valid {platform.capitalize()} link found.")
    return None

def save_link(path, link):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(link if link else "No valid link found.")

# === Main process ===
def main():
    book = load_book(BOOK_PATH)
    if not book:
        return

    title = book.get("title", "")
    author = book.get("author", "")
    print(f"\n📚 Processing book: {title} by {author}\n")

    # --- Amazon Search ---
    amazon_query = f"{title} by {author} on Amazon"
    amazon_items = google_search(amazon_query)
    print("\n🔗 All Amazon search links:")
    print_links(amazon_items)
    amazon_link = find_first_valid_link(amazon_items, "amazon")
    save_link(AMAZON_TXT, amazon_link or "")

    # --- Audible Search ---
    audible_query = f"{title} by {author} on Audible"
    audible_items = google_search(audible_query)
    print("\n🔗 All Audible search links:")
    print_links(audible_items)
    audible_link = find_first_valid_link(audible_items, "audible")
    save_link(AUDIBLE_TXT, audible_link or "")

    print("\n💾 Links saved successfully!")
    print(f"📁 Amazon: {AMAZON_TXT}")
    print(f"📁 Audible: {AUDIBLE_TXT}")

if __name__ == "__main__":
    main()
