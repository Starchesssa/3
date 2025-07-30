
import os
import time
import re
from google import genai

# === Configuration ===
CHAPTERS_PATH = "BOOKS/Temp/CHAPTERS"
SCRIPT_OUTPUT_PATH = "BOOKS/Temp/SCRIPT/COMPANY_BIO"
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

# === Helpers ===

def list_txt_files(directory):
    return [f for f in os.listdir(directory) if f.endswith(".txt")]

def read_chapters(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]

def sanitize_filename(name):
    return re.sub(r"[^\w\d\-_. ]+", "", name).replace(" ", "_")

def generate_script(chapter_number, chapter_title, book_title, api_index):
    prompt = (
        f"From the book '{book_title}', at chapter {chapter_number}: {chapter_title}\n\n"
        "Explain it in a simple way to understand.\n"
        "Break complex scenes into easy parts.\n"
        "Use examples to help the viewer grasp the ideas.\n"
        "Avoid using words that may confuse people (no jargon).\n"
        "dont ouput anything other than the script, dont say here is the .... no just the script only"
        "make the script more ready for narration  directly jist like you are talking to someone or narrating a youtube script"
        "Output the script for a YouTube script — just the flat script. No intros like 'Welcome to my channel', no outros. Just the main script only."
    )

    attempts = len(API_KEYS)
    for attempt in range(attempts):
        key = API_KEYS[(api_index + attempt) % attempts]
        try:
            client = genai.Client(api_key=key)
            response = client.models.generate_content(
                model=MODEL,
                contents=[{"role": "user", "parts": [{"text": prompt}]}]
            )
            print(f"✅ Script generated with API#{(api_index + attempt) % attempts + 1} for chapter {chapter_number}", flush=True)
            return response.text.strip(), (api_index + attempt + 1) % attempts
        except Exception as e:
            print(f"⚠️ API#{(api_index + attempt) % attempts + 1} failed: {e}", flush=True)
            time.sleep(1)
    raise RuntimeError("❌ All API keys failed.")

def save_script(chapter_number, chapter_title, script_text, source_file):
    os.makedirs(SCRIPT_OUTPUT_PATH, exist_ok=True)
    base_title = source_file.replace("_chapters.txt", "")
    filename = f"{chapter_number}.{chapter_title}.txt"
    safe_filename = sanitize_filename(filename)
    path = os.path.join(SCRIPT_OUTPUT_PATH, safe_filename)

    with open(path, "w", encoding="utf-8") as f:
        f.write(script_text)
    print(f"💾 Saved: {path}", flush=True)

# === Main ===

def main():
    txt_files = list_txt_files(CHAPTERS_PATH)
    if not txt_files:
        print("❌ No chapter .txt files found.")
        return

    if len(txt_files) == 1:
        selected_file = txt_files[0]
    else:
        print("\n📁 Available chapter files:")
        for i, f in enumerate(txt_files, 1):
            print(f"{i}. {f}")
        choice = input("\nSelect file number: ").strip()
        try:
            selected_file = txt_files[int(choice) - 1]
        except:
            print("❌ Invalid selection.")
            return

    book_title = selected_file.replace("_chapters.txt", "")
    chapter_file_path = os.path.join(CHAPTERS_PATH, selected_file)
    chapters = read_chapters(chapter_file_path)

    if not chapters:
        print("❌ No chapters found in the selected file.")
        return

    print(f"\n📚 Starting automation for {len(chapters)} chapters...\n", flush=True)

    api_index = 0
    for i, chapter_title in enumerate(chapters, 1):
        print(f"⏳ Processing Chapter {i}: {chapter_title}...\n", flush=True)
        try:
            script, api_index = generate_script(i, chapter_title, book_title, api_index)
            save_script(i, chapter_title, script, selected_file)
        except Exception as e:
            print(f"❌ Failed to generate Chapter {i}: {e}", flush=True)
            continue

    print("\n🎉 All chapters processed.\n")

if __name__ == "__main__":
    main()
