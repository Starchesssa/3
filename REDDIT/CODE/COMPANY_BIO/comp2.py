
import os
import json
import time
from google import genai  # pip install google-genai

# === Paths ===
UNUSED_PATH = "REDDIT/THEMES/Company bio/BOOKS/USED/Unused.json"
HALAL_PATH = "REDDIT/THEMES/Company bio/BOOKS/HALAL/Halal.json"
MODEL = "gemini-2.5-pro"

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

def load_unused_book():
    """Load the first unused book from JSON file (handles dict or list)"""
    if not os.path.exists(UNUSED_PATH):
        raise FileNotFoundError(f"❌ File not found: {UNUSED_PATH}")
    with open(UNUSED_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # If single book stored as dict
    if isinstance(data, dict):
        return data

    # If multiple books stored in list
    if isinstance(data, list) and len(data) > 0:
        return data[0]

    raise ValueError("❌ Unused.json is empty or in an unknown format.")

def load_halal_data():
    """Load existing halal records or create new list"""
    if os.path.exists(HALAL_PATH):
        with open(HALAL_PATH, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

def save_halal_data(data):
    """Save halal/haram results to Halal.json"""
    os.makedirs(os.path.dirname(HALAL_PATH), exist_ok=True)
    with open(HALAL_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved results to {HALAL_PATH}")

def ask_halal_status(book):
    """Ask Gemini AI if book is halal or haram"""
    title = book.get("title", "Unknown Title")
    author = book.get("author", "Unknown Author")
    company = book.get("company", "Unknown Company")

    prompt = (
        f'Is the book "{title}" by {author} about {company} considered halal or haram in Islam? '
        "Answer strictly with one word only: 'halal' or 'haram'."
    )

    for i, key in enumerate(API_KEYS):
        try:
            client = genai.Client(api_key=key)
            response = client.models.generate_content(
                model=MODEL,
                contents=[{"role": "user", "parts": [{"text": prompt}]}]
            )
            answer = response.text.strip().lower()
            if "halal" in answer:
                return "halal"
            elif "haram" in answer:
                return "haram"
        except Exception as e:
            print(f"⚠️ API#{i + 1} failed: {e}")
            time.sleep(1)
    return "unknown"

# === Main ===
def main():
    book = load_unused_book()
    print(f"📖 Checking: {book.get('title', 'Unknown')} by {book.get('author', 'Unknown')}")

    halal_data = load_halal_data()
    status = ask_halal_status(book)

    result = {
        "title": book.get("title"),
        "author": book.get("author"),
        "company": book.get("company"),
        "status": status
    }

    halal_data.append(result)
    save_halal_data(halal_data)

    print(f"🕌 Result for '{book.get('title')}': {status.upper()}")

if __name__ == "__main__":
    main()
