import os
import json
import requests

# === Paths ===
USED_PATH = "REDDIT/THEMES/Company bio/BOOKS/USED/Unused.json"
IMG_DIR = "REDDIT/THEMES/Company bio/BOOKS/IMG"

# === Helper Functions ===
def load_json(path):
    if not os.path.exists(path):
        print(f"❌ File not found: {path}")
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON format in {path}")
        return None

def fetch_book_cover(title, author):
    query_url = f"https://openlibrary.org/search.json?title={title}&author={author}"
    print(f"🔎 Searching Open Library API:\n{query_url}")

    try:
        response = requests.get(query_url, timeout=10)
        response.raise_for_status()
        data = response.json()

        docs = data.get("docs", [])
        if not docs:
            print("⚠️ No results found.")
            return None

        # Try to get ISBN or OLID
        book = docs[0]
        if "isbn" in book and book["isbn"]:
            key, value = "isbn", book["isbn"][0]
        elif "cover_edition_key" in book:
            key, value = "olid", book["cover_edition_key"]
        else:
            print("⚠️ No valid identifier found.")
            return None

        cover_url = f"https://covers.openlibrary.org/b/{key}/{value}-L.jpg"
        print(f"✅ Found cover image: {cover_url}")
        return cover_url

    except Exception as e:
        print(f"⚠️ API request failed: {e}")
        return None

def download_image(url, save_path):
    try:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        r = requests.get(url, stream=True, timeout=10)
        r.raise_for_status()
        with open(save_path, "wb") as f:
            for chunk in r.iter_content(1024):
                f.write(chunk)
        print(f"💾 Image saved: {save_path}")
    except Exception as e:
        print(f"⚠️ Failed to download image: {e}")

# === Main ===
def main():
    book = load_json(USED_PATH)
    if not book:
        print("❌ No book data found.")
        return

    title = book.get("title", "")
    author = book.get("author", "")
    print(f"📖 Processing: {title} by {author}")

    cover_url = fetch_book_cover(title, author)
    if not cover_url:
        print("⚠️ No cover found for this book.")
        return

    # Save image file
    safe_title = title.replace(" ", "_").replace("&", "and")
    save_path = os.path.join(IMG_DIR, f"{safe_title}.jpg")
    download_image(cover_url, save_path)

if __name__ == "__main__":
    main()
