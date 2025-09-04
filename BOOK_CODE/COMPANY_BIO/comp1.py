
import os
import time
import json
import datetime
from google import genai

# === Configuration ===
BOOK_PATH = "BOOKS/WEALTH/BIO/COMPANY_BIO"
HALAL_PATH = "BOOKS/Temp/COMPANY_BIO"
HARAM_PATH = "BOOKS/USED/COMPANY_BIO"
MODEL = "gemini-2.5-pro"

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

def save_remaining_books(remaining):
    with open(BOOK_PATH, "w", encoding="utf-8") as f:
        json.dump(remaining, f, indent=2, ensure_ascii=False)
    print(f"✂️ Updated source list with {len(remaining)} remaining books.\n", flush=True)

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
            answer = response.text.strip()
            print(f"✅ Checked with API#{i + 1} for: {title}", flush=True)
            print(f"🧠 Gemini Response: \"{answer}\"\n", flush=True)
            return answer
        except Exception as e:
            print(f"⚠️ API#{i + 1} failed. Error: {e}", flush=True)
            time.sleep(1)
    raise RuntimeError("❌ All API keys failed.")

def save_book(path, book):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump([book], f, indent=2, ensure_ascii=False)
    print(f"📁 Saved book to: {path}\n", flush=True)

def append_haram(book):
    os.makedirs(os.path.dirname(HARAM_PATH), exist_ok=True)
    try:
        book["_checked_at"] = datetime.datetime.now().isoformat()
        if os.path.exists(HARAM_PATH):
            with open(HARAM_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = []
        data.append(book)
        with open(HARAM_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"⛔ Added haram book: {book['title']}", flush=True)
        print(f"📦 Total haram books stored: {len(data)}\n", flush=True)
    except Exception as e:
        print(f"❌ Failed to append haram book: {e}", flush=True)

# === Main ===
def main():
    print("📚 Scanning for the first halal book...\n", flush=True)
    all_books = load_books()
    remaining_books = []

    for i, book in enumerate(all_books, start=1):
        print(f"🔍 [{i}/{len(all_books)}] Checking: {book.get('title')}", flush=True)
        try:
            verdict = ask_is_book_haram(book)
            clean_answer = verdict.lower().strip(".! ")
            if clean_answer == "no":
                print(f"✅ {book['title']} → Halal! Stopping search.\n", flush=True)
                save_book(HALAL_PATH, book)
                remaining_books = all_books[i:]  # remove current and earlier
                break
            elif clean_answer == "yes":
                append_haram(book)
            else:
                print(f"⚠️ Unexpected Gemini response: {verdict}\n", flush=True)
        except Exception as e:
            print(f"❌ Error checking {book.get('title')}: {e}", flush=True)

    else:
        # Only triggered if loop completes without break
        print("🚫 No halal book found in the list.\n")
        remaining_books = []

    save_remaining_books(remaining_books)

if __name__ == "__main__":
    main()
