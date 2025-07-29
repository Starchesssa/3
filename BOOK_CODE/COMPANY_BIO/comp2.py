
import os
import json
import time
import datetime
from google import genai

# === Configuration ===
BOOK_PATH = "BOOKS/WEALTH/BIO/COMPANY_BIO"
SCRIPT_PATH = "BOOKS/Temp/SCRIPT/COMPANY_BIO"
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

def save_remaining_books(remaining):
    with open(BOOK_PATH, "w", encoding="utf-8") as f:
        json.dump(remaining, f, indent=2, ensure_ascii=False)
    print(f"✂️ Updated source list with {len(remaining)} remaining books.\n", flush=True)

def generate_script(book):
    title = book.get("title", "Unknown Title")
    author = book.get("author", "Unknown Author")
    company = book.get("company", "Unknown Company")

    prompt = (
        f'From the book titled "{title}" by {author}, which is about {company}:\n'
        "Write a plain text script explaining the book’s concepts (not rewriting the book).\n"
        "Each chapter should be short enough to be read aloud in about 1 minute (~150 words max).\n"
        "Include tension by describing the context and conflict of each idea.\n"
        "Do not include scene instructions or emotions — just clean script narration.\n"
        "Only generate the script, nothing else."
    )

    for i, key in enumerate(API_KEYS):
        try:
            client = genai.Client(api_key=key)
            response = client.models.generate_content(
                model=MODEL,
                contents=[{"role": "user", "parts": [{"text": prompt}]}]
            )
            print(f"✅ Script generated using API#{i + 1} for: {title}", flush=True)
            return response.text.strip()
        except Exception as e:
            print(f"⚠️ API#{i + 1} failed. Error: {e}", flush=True)
            time.sleep(1)
    raise RuntimeError("❌ All API keys failed.")

def save_script(book, script):
    company = book.get("company", "UnknownCompany").replace(" ", "_")
    os.makedirs(SCRIPT_PATH, exist_ok=True)
    output_file = os.path.join(SCRIPT_PATH, f"{company}.txt")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(script)
    print(f"📜 Script saved to: {output_file}\n", flush=True)

# === Main ===
def main():
    print("📚 Generating script from first book...\n", flush=True)
    all_books = load_books()
    book = all_books[0]

    try:
        script = generate_script(book)
        save_script(book, script)
        save_remaining_books(all_books[1:])  # remove used
    except Exception as e:
        print(f"❌ Error: {e}", flush=True)

if __name__ == "__main__":
    main()
