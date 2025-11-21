
import os
import re
import time
import json
from google import genai

# === Paths ===
SCRIPT_PATH = "BOOKS/Temp/STT"        # <— NOW USING TRANSCRIPTS
PROMPTS_PATH = "BOOKS/Temp/PROMPTS"
META_FILE = "BOOKS/Temp/COMPANY_BIO"   # optional metadata JSON
MODEL = "gemini-2.5-pro"

# === Load API Keys ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5"),
]
API_KEYS = [k for k in API_KEYS if k]

if not API_KEYS:
    raise ValueError("❌ No GEMINI_API keys found.")


# === Load metadata from COMPANY_BIO JSON file ===

def load_book_metadata():
    if not os.path.exists(META_FILE):
        print(f"⚠️ Metadata file not found: {META_FILE}")
        return "Unknown Title", "Unknown Author", "Unknown Company"

    try:
        with open(META_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        if isinstance(data, list) and len(data) > 0:
            entry = data[0]
        elif isinstance(data, dict):
            entry = data
        else:
            return "Unknown Title", "Unknown Author", "Unknown Company"

        title = entry.get("title", "Unknown Title")
        author = entry.get("author", "Unknown Author")
        company = entry.get("company", "Unknown Company")

        print(f"📘 Loaded metadata: {title} — {author} ({company})")
        return title, author, company

    except Exception as e:
        print(f"❌ Failed to read metadata JSON: {e}")
        return "Unknown Title", "Unknown Author", "Unknown Company"


BOOK_TITLE, BOOK_AUTHOR, BOOK_COMPANY = load_book_metadata()


# === Helper Functions ===

def list_txt_files(directory):
    return [f for f in os.listdir(directory) if f.endswith(".txt")]

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def sanitize_filename(n):
    return re.sub(r"[^\w\d\-_. ]+", "", n).replace(" ", "_")


# === Split text by CAPITAL headings ===

def split_into_chunks(text):
    chunks = {}
    current = None
    buf = []

    for line in text.splitlines():
        s = line.strip()

        if s and s == s.upper() and any(c.isalpha() for c in s):  # heading
            if current:
                chunks[current] = "\n".join(buf).strip()
            current = s
            buf = []
        else:
            if current:
                buf.append(line)

    if current and buf:
        chunks[current] = "\n".join(buf).strip()

    return chunks


# === Generate prompt ===

def generate_prompts(chunk_text, heading, api_index):
    prompt = f"""
This chunk is from the book "{BOOK_TITLE}" by {BOOK_AUTHOR}, about {BOOK_COMPANY}.

Section title: {heading}

Content:
{chunk_text}

Your task: from the transcript give relavant visuals of the transcripts based on timeline .

- Start immediately with prompts. No intro.

Begin:
"""

    attempts = len(API_KEYS)

    for attempt in range(attempts):
        key = API_KEYS[(api_index + attempt) % attempts]

        try:
            client = genai.Client(api_key=key)
            res = client.models.generate_content(
                model=MODEL,
                contents=[{"role": "user", "parts": [{"text": prompt}]}]
            )
            print(f"✅ Chunk '{heading}' processed with API#{(api_index + attempt) % attempts + 1}")
            return res.text.strip(), (api_index + attempt + 1) % attempts

        except Exception as e:
            print(f"⚠️ API failed for heading '{heading}': {e}")
            time.sleep(1)

    raise RuntimeError(f"❌ All API keys failed for: {heading}")


# === Save output (updated to preserve transcript filename) ===

def save_output(original, heading, text):
    os.makedirs(PROMPTS_PATH, exist_ok=True)

    base_name = original.replace(".txt", "")  # original transcript name

    # If transcript contains multiple headings, separate them
    if heading:
        filename = f"{sanitize_filename(base_name)}_{sanitize_filename(heading)}.txt"
    else:
        filename = f"{sanitize_filename(base_name)}.txt"

    path = os.path.join(PROMPTS_PATH, filename)

    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"💾 Saved → {path}")


# === Main ===

def main():
    files = list_txt_files(SCRIPT_PATH)

    if not files:
        print("❌ No .txt files found in STT transcripts.")
        return

    api_index = 0

    for file in files:
        print(f"\n📄 Processing transcript: {file}")
        text = read_file(os.path.join(SCRIPT_PATH, file))
        chunks = split_into_chunks(text)

        # If no headings, process entire transcript as one chunk
        if not chunks:
            print("⚠️ No uppercase headings found → treating entire transcript as one chunk.")
            chunks = {"FULL_TRANSCRIPT": text}

        for heading, chunk in chunks.items():
            print(f"\n➡️ {heading}")
            try:
                out, api_index = generate_prompts(chunk, heading, api_index)
                save_output(file, heading, out)
            except Exception as e:
                print(f"❌ Failed: {e}")

    print("\n🎉 Finished processing all transcripts!")


if __name__ == "__main__":
    main()
