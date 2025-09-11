
import os
import time
import re
import json
from google import genai

# === Configuration ===
CHAPTERS_PATH = "BOOKS/Temp/CHAPTERS"
SCRIPT_OUTPUT_PATH = "BOOKS/Temp/SCRIPT/COMPANY_BIO"
COMPANY_BIO_PATH = "BOOKS/Temp/COMPANY_BIO"
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

# === Helpers ===

def list_txt_files(directory):
    return [f for f in os.listdir(directory) if f.endswith(".txt")]

def read_chapters(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]

def sanitize_filename(name):
    return re.sub(r"[^\w\d\-_. ]+", "", name).replace(" ", "_")

def load_company_info(book_title):
    """Load company info (title, author, company) from JSON files in COMPANY_BIO directory."""
    for f in os.listdir(COMPANY_BIO_PATH):
        if f.endswith(".json"):
            path = os.path.join(COMPANY_BIO_PATH, f)
            with open(path, "r", encoding="utf-8") as jf:
                try:
                    data = json.load(jf)
                    for entry in data:
                        if entry.get("title", "").strip().lower() == book_title.strip().lower():
                            return entry
                except Exception as e:
                    print(f"⚠️ Could not parse {f}: {e}", flush=True)
    # Default if no match found
    return {"title": book_title, "author": "Unknown", "company": "Unknown"}

def generate_script(chapter_number, chapter_title, book_info, all_chapters, api_index):
    chapter_list_text = "\n".join([f"{idx+1}. {title}" for idx, title in enumerate(all_chapters)])
    prompt = (
        f"From the book titled '{book_info['title']}' by {book_info['author']} "
        f"about the company {book_info['company']}.\n\n"
        f"Here is the full chapter list:\n{chapter_list_text}\n\n"
        f"You are now generating a script for the lesson : {chapter_title}.\n\n"
        "make sure you generate examples, the examples should be real life events that affected the company via the lesson , ie in 1985 the xyz company invented xyz which was biggest failure , this made impact on......."
        "in the script use more statistics and math instead of saying the company lost much that year say the company stock went down 70 percent yearly and on tuesday may it went down 40% , that is about 50 percent of overall loss cause of just this one thing , use more statistics and math throughout the script and examples. "
        "use really simple language, always use more simple words , avoid jargons , speak like you are explaining one who has no idea in the profession and each sentence must end with a dot [.] so that we know each sentence ending.\n"
        "always start by making people clearly understand the concept or lesson either by statistics or not then follow other after clearly conveying what the lesson means , please make people understand the concept as conveyed in the book. "
        "Do NOT include any intros, outros, headings, or summaries — just the script content.\n"
        "Do NOT say 'Here's the script' — just return the flat narration script only.\n"
        "Do not include more than 250 words , just say what is more important to know lesson wise or anything in the book that is more important is either lesson wise, shocking, inspiring, sad, success, etc. "
        "Make it ready to be used directly as a voiceover for a video."
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
    book_info = load_company_info(book_title)  # ⬅️ Load title, author, company
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
            script, api_index = generate_script(i, chapter_title, book_info, chapters, api_index)
            save_script(i, chapter_title, script, selected_file)
        except Exception as e:
            print(f"❌ Failed to generate Chapter {i}: {e}", flush=True)
            continue

    print("\n🎉 All chapters processed.\n")

if __name__ == "__main__":
    main()
