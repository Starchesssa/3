import os
import time
import json
from google import genai

# === Configuration ===
BOOK_PATH = "BOOKS/WEALTH/BIO/COMPANY_BIO"
HALAL_PATH = "BOOKS/Temp/COMPANY_BIO"
HARAM_PATH = "BOOKS/USED/COMPANY_BIO"
MODEL = "gemini-2.5-flash"

# === Load Gemini API keys ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5")
]
API_KEYS = [key for key in API_KEYS if key]
if not API_KEYS:
    raise ValueError("❌ No valid GEMINI_API keys found.")

# === Helpers ===
def load_books():
    with open(BOOK_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not data or not isinstance(data, list):
        raise ValueError("❌ JSON is empty or not a list.")
    return data

def ask_is_book_haram(book):
    title = book.get("title", "Unknown Title")
    author = book.get("author", "Unknown Author")
    company = book.get("company", "Unknown Company")

    prompt = (
        f"The following is a business biography book:\n\n"
        f"Title: {title}\n"
        f"Author: {author}\n"
        f"Company: {company}\n\n"
        "Based on your knowledge, does this book contain any content that is considered haram in Islam, "
        "such as promotion of riba (interest), alcohol, gambling, unethical behavior, or misguidance?\n\n"
        "**Only answer** with 'Yes' or 'No'. No explanation. Just the word."
    )

    for i, key in enumerate(API_KEYS):
        try:
            client = genai.Client(api_key=key)
            response = client.models.generate_content(
                model=MODEL,
                contents=[{"role": "user", "parts": [{"text": prompt}]}]
            )
            print(f"✅ Checked with API#{i + 1} for: {title}", flush=True)
            return response.text.strip()
        except Exception as e:
            print(f"⚠️ API#{i + 1} failed. Error: {e}", flush=True)
            time.sleep(1)
    raise RuntimeError("❌ All API keys failed.")

def save_books(path, books):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(books, f, indent=2, ensure_ascii=False)
    print(f"📁 Saved {len(books)} books to: {path}\n", flush=True)

# === Main ===
def main():
    print("📚 Checking all books for haram content...\n", flush=True)
    all_books = load_books()
    halal_books = []
    haram_books = []

    for i, book in enumerate(all_books, start=1):
        print(f"🔍 [{i}/{len(all_books)}] Checking: {book.get('title')}", flush=True)
        try:
            verdict = ask_is_book_haram(book)
            if verdict.lower() == "yes":
                haram_books.append(book)
                print(f"⛔ {book['title']} → Haram\n", flush=True)
            elif verdict.lower() == "no":
                halal_books.append(book)
                print(f"✅ {book['title']} → Halal\n", flush=True)
            else:
                print(f"⚠️ Unexpected response for {book['title']}: {verdict}\n", flush=True)
        except Exception as e:
            print(f"❌ Error checking {book.get('title')}: {e}\n", flush=True)

    # Save results
    save_books(HALAL_PATH, halal_books)
    save_books(HARAM_PATH, haram_books)

if __name__ == "__main__":
    main()
