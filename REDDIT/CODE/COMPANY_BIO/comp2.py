
import os
import json
import time
from google import genai  # pip install google-genai

# === PATH CONFIG ===
BOOKS_DIR = "REDDIT/THEMES/Company bio/BOOKS"
BOOKS_FILES = [
    os.path.join(BOOKS_DIR, "Books1.json"),
    os.path.join(BOOKS_DIR, "Books2.json"),
    os.path.join(BOOKS_DIR, "Books3.json"),
]
OUTPUT_FILE = os.path.join(BOOKS_DIR, "HALAL", "Halal.json")
MODEL = "gemini-2.5-pro"

# === LOAD API KEYS ===
API_KEYS = [os.environ.get(f"GEMINI_API{i or ''}") for i in ['', '2', '3', '4', '5']]
API_KEYS = [k for k in API_KEYS if k]

if not API_KEYS:
    raise ValueError("❌ No Gemini API keys found in environment variables.")

# === HELPERS ===

def load_books():
    """Load all books from the listed JSON files"""
    all_books = []
    for file in BOOKS_FILES:
        if os.path.exists(file):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        all_books.extend(data)
            except Exception as e:
                print(f"⚠️ Failed to load {file}: {e}")
    return all_books

def save_results(results):
    """Save halal results to output file"""
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved {len(results)} results to {OUTPUT_FILE}")

def ask_ai_if_halal(book):
    """Ask AI if book is halal or haram"""
    title = book.get("title", "")
    author = book.get("author", "")
    company = book.get("company", "")
    question = (
        f'Is the book "{title}" by {author}, which is about {company}, Halal or Haram? '
        "Only answer with one word: Halal or Haram. No explanations."
    )

    for i, key in enumerate(API_KEYS):
        try:
            client = genai.Client(api_key=key)
            response = client.models.generate_content(
                model=MODEL,
                contents=[{"role": "user", "parts": [{"text": question}]}]
            )
            text = response.text.strip().lower()
            if "halal" in text:
                return "Halal"
            elif "haram" in text:
                return "Haram"
        except Exception as e:
            print(f"⚠️ API#{i+1} failed: {e}")
            time.sleep(1)
    return "Unknown"

# === MAIN ===
def main():
    all_books = load_books()
    print(f"📚 Found {len(all_books)} total books to verify.")
    results = []

    for i, book in enumerate(all_books, start=1):
        title = book.get("title", "Unknown")
        print(f"\n🔍 Checking {i}/{len(all_books)}: {title}")
        status = ask_ai_if_halal(book)
        result = {
            "title": title,
            "author": book.get("author", ""),
            "company": book.get("company", ""),
            "status": status
        }
        results.append(result)
        print(f"➡️ Result: {status}")
        save_results(results)

    print("\n✅ All checks complete!")

if __name__ == "__main__":
    main()
