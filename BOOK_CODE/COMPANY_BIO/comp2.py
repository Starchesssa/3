
import os
import json
import time
import re
from google import genai  # Make sure google-genai is installed

# === Configuration ===
BOOK_PATH = "BOOKS/WEALTH/BIO/COMPANY_BIO"
CHAPTERS_PATH = "BOOKS/Temp/CHAPTERS"
MODEL = "gemini-2.5-flash"

# === Load Gemini API keys from environment variables ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5"),
]
API_KEYS = [key for key in API_KEYS if key]
if not API_KEYS:
    raise ValueError("❌ No valid GEMINI_API keys found in environment variables.")

# === Helper functions ===

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

def generate_chapters(book):
    title = book.get("title", "Unknown Title")
    author = book.get("author", "Unknown Author")
    company = book.get("company", "Unknown Company")

    prompt = (
        f'From the book titled "{title}" by {author}, which is about {company}:\n'
        "list all key lessons  of the book.\n"
        "Number each lesson starting from 1.make sure you list all key lessons  \n"
        "if the book has no chapters ,make themed chapters for it for my audience to understand the book"
        "lessons must be 7 and above so that my audience may clearly understand , if the lessons contain less then no problem"
        "Example format:\n"
        "1. The problem\n"
        "2. Solution Comes\n"
        "3. Succes \n"
        "always arrange each lesson  in its own line , dont make two lessons  in same line,arrange the lessons  in a list,each lesson on its own line"
        "Only provide the numbered lessons  text without extra commentary,just lessons  only nothing more."
    )

    for i, key in enumerate(API_KEYS):
        try:
            client = genai.Client(api_key=key)
            response = client.models.generate_content(
                model=MODEL,
                contents=[{"role": "user", "parts": [{"text": prompt}]}]
            )
            print(f"✅ Chapters generated using API#{i + 1} for: {title}", flush=True)
            return response.text.strip()
        except Exception as e:
            print(f"⚠️ API#{i + 1} failed. Error: {e}", flush=True)
            time.sleep(1)
    raise RuntimeError("❌ All API keys failed.")

def save_chapters(book, chapters_text):
    company = book.get("company", "UnknownCompany").replace(" ", "_")
    os.makedirs(CHAPTERS_PATH, exist_ok=True)
    output_file = os.path.join(CHAPTERS_PATH, f"{company}_chapters.txt")

    # Fix numbering format if needed: e.g., "1)" or "1 " → "1. "
    def fix_numbering(text):
        return re.sub(r"(\d+)[\.\)]?\s*", r"\1. ", text)

    formatted_text = fix_numbering(chapters_text)

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(formatted_text)

    print(f"📜 Chapters saved to: {output_file}\n", flush=True)

# === Main ===
def main():
    print("📚 Generating chapters from first book...\n", flush=True)
    all_books = load_books()
    book = all_books[0]

    try:
        chapters = generate_chapters(book)
        save_chapters(book, chapters)
        save_remaining_books(all_books[1:])  # remove used
    except Exception as e:
        print(f"❌ Error: {e}", flush=True)

if __name__ == "__main__":
    main()
