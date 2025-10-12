
import os
import json
import requests
import urllib.parse

# === Paths ===
BOOK_PATH = "REDDIT/THEMES/Company bio/BOOKS/USED/Unused.json"
IMG_TXT = "REDDIT/THEMES/Company bio/BOOKS/IMG/Img.txt"

# === Google Custom Search API credentials ===
API_KEY = "AIzaSyB4NaA2lMW6uZ6YjzbDCSo-he6zh_XBVkM"
CX_ID = "a73cae6bad04a492d"

# === Load book info ===
def load_book(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    print(f"❌ File not found: {path}")
    return None

# === Search images on Amazon ===
def search_amazon_image(title, author, company):
    query = f"{title} {author} {company}"
    url = (
        f"https://www.googleapis.com/customsearch/v1?"
        f"q={urllib.parse.quote(query)}&searchType=image&key={API_KEY}&cx={CX_ID}&num=5"
    )
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        items = data.get("items", [])
        for item in items:
            link = item.get("link")
            if link and "amazon.com" in link:
                print(f"✅ Found Amazon image: {link}")
                return link
        print("⚠️ No valid Amazon image found.")
        return None
    except Exception as e:
        print(f"⚠️ Error searching Amazon image: {e}")
        return None

# === Save image link ===
def save_image_link(path, link):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        if link:
            f.write(link)
        else:
            f.write("No valid image found.")

# === Main ===
def main():
    book = load_book(BOOK_PATH)
    if not book:
        return

    title = book.get("title", "")
    author = book.get("author", "")
    company = book.get("company", "")
    print(f"\n📚 Processing book: {title} by {author} ({company})\n")

    img_link = search_amazon_image(title, author, company)
    save_image_link(IMG_TXT, img_link)
    print(f"💾 Image link saved to: {IMG_TXT}")

if __name__ == "__main__":
    main()
