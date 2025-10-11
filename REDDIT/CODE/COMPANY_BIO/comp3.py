
import os
import json
import requests

# === Google Custom Search credentials ===
API_KEY = "AIzaSyB4NaA2lMW6uZ6YjzbDCSo-he6zh_XBVkM"
CX_ID = "a73cae6bad04a492d"

# === Paths ===
BOOK_PATH = "REDDIT/THEMES/Company bio/BOOKS/USED/Unused.json"
AMAZON_TXT = "REDDIT/THEMES/Company bio/BOOKS/LINKS/amazon.txt"
AUDIBLE_TXT = "REDDIT/THEMES/Company bio/BOOKS/LINKS/audible.txt"

# === Helper functions ===
def load_book(path):
    if not os.path.exists(path):
        print(f"❌ File not found: {path}")
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def search_google(query):
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={API_KEY}&cx={CX_ID}"
    print(f"🔎 Searching: {query}")
    r = requests.get(url)
    data = r.json()
    if "items" not in data:
        print("⚠️ No items found or invalid API response")
        return []
    return data["items"]

def find_first_valid_link(items, domain):
    for item in items:
        link = item.get("link", "")
        if domain in link:
            return link
    return None

def save_link(path, link):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(link if link else "No valid link found.")

# === Main ===
def main():
    book = load_book(BOOK_PATH)
    if not book:
        return

    title = book.get("title", "")
    author = book.get("author", "")

    # === Amazon ===
    amazon_query = f'"{title}" by {author} on Amazon'
    amazon_items = search_google(amazon_query)
    amazon_link = find_first_valid_link(amazon_items, "amazon.com")
    save_link(AMAZON_TXT, amazon_link or "No Amazon link found.")
    print(f"✅ Amazon link: {amazon_link or 'No valid link found.'}")

    # === Audible ===
    audible_query = f'"{title}" by {author} on Audible'
    audible_items = search_google(audible_query)
    audible_link = find_first_valid_link(audible_items, "audible.com")
    save_link(AUDIBLE_TXT, audible_link or "No Audible link found.")
    print(f"✅ Audible link: {audible_link or 'No valid link found.'}")

if __name__ == "__main__":
    main()
