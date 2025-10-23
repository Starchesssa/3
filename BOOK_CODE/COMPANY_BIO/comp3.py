
import os
import time
import re
import json
import difflib
from google import genai

# === Configuration ===
CHAPTERS_PATH = "BOOKS/Temp/CHAPTERS"
SCRIPT_OUTPUT_PATH = "BOOKS/Temp/SCRIPT/COMPANY_BIO"
COMPANY_BIO_PATH = "BOOKS/Temp/COMPANY_BIO"  # single JSON file with company entries
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
    if not os.path.exists(directory):
        return []
    return [f for f in os.listdir(directory) if f.endswith(".txt")]

def read_chapters(file_path):
    # Keep this if you still want to read chapter titles for reference.
    with open(file_path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]

def sanitize_filename(name):
    return re.sub(r"[^\w\d\-_. ]+", "", name).replace(" ", "_")

def load_company_info(book_title):
    """Load company info (title, author, company) from COMPANY_BIO file with fuzzy match."""
    if not os.path.exists(COMPANY_BIO_PATH):
        print(f"❌ COMPANY_BIO file not found: {COMPANY_BIO_PATH}", flush=True)
        return {"title": book_title, "author": "Unknown", "company": "Unknown"}

    try:
        with open(COMPANY_BIO_PATH, "r", encoding="utf-8") as jf:
            data = json.load(jf)

        # Try exact match first
        for entry in data:
            if entry.get("title", "").strip().lower() == book_title.strip().lower():
                return entry

        # If no exact match → fuzzy match
        titles = [entry.get("title", "") for entry in data]
        best_match = difflib.get_close_matches(book_title, titles, n=1, cutoff=0.5)
        if best_match:
            for entry in data:
                if entry.get("title") == best_match[0]:
                    print(f"🔎 Fuzzy matched '{book_title}' → '{best_match[0]}'", flush=True)
                    return entry

    except Exception as e:
        print(f"⚠️ Could not parse COMPANY_BIO file: {e}", flush=True)

    # Default if no match found
    return {"title": book_title, "author": "Unknown", "company": "Unknown"}

def build_prompt(book_info, sample_years=None, chapters_reference=None):
    """
    Build the long-form storytelling prompt.
    sample_years: list of years to emphasize in the timeline/story (optional).
    chapters_reference: list of chapter titles if you want to optionally reference them (not required).
    """
    years_text = ""
    if sample_years:
        years_text = " Emphasize the timeline focusing on these years: " + ", ".join(str(y) for y in sample_years) + "."

    chapter_note = ""
    if chapters_reference:
        chapter_note = (
            "Do NOT include chapter headings. Do NOT list the chapters. "
            "You may use the chapter titles only as behind-the-scenes reference to make the narrative accurate, "
            "but do NOT print them or format the output as chapters."
        )

    prompt = (
        f"You are writing a long, detailed, lesson-based storytelling script based on the book titled "
        f"'{book_info['title']}' by {book_info['author']} about the company {book_info['company']}.{years_text}\n\n"
        "Requirements and style rules:\n"
        "1. each lesson must have an exposition,rising action/conflict ,climax,falling action,resolution, this is how each lesson story must be told, dont include the words(rising action ,conflict ,climax , exposition ,falling action) in the script , just wrote a plain script  ready for text to speech, the script is on the book so make it review the book with book summary ."
        "2. use ryan trahan narration style and your audience is people who love to become enterpreneurs,ceos, investors,side hustlers etc .\n"
        "3. Structure the script around lessons. Each important theme or lesson must appear as a CAPITALIZED HEADING line. Example heading format: 'KEY LESSON: INNOVATION IS A MUST IN COMPETITION.\n"
        "4. Use simple language, avoid jargon, and explain terms as if the listener has no prior knowledge.\n"
        "5. use more statistics. Instead of vague phrases like 'they lost a lot', use specific metrics such as 'the stock fell 45% that year' or 'quarterly revenue dropped from $10M to $3M,\n"
        "6. Each sentence must end with a period ('.').\n"
        "7. use pronouns you,your, yours etc dont use pronoun i or we, cuase you didnt read the book youre just an ai .\n"
        "7. intro should be a hook of the book , hook people attention by the book intro but also mention what the books is all about. Do NOT say 'Here's the script'. Return only the narration and KEY LESSON headings inline.\n"
        "9. key lesson must be a headline relevant to the book that will guide through the lesson story.\n"
        "10. each lesson must be more relevant and must have  exposition, rising action/conflict ,climax ,falling action , resolution , thats how you story tell to enterpresneurs , sidehustlers etc so that they undertand .\n"
        "11. the lessons should feel more like you are educating them rather than just narrating a story  or narrating history , everything mentioned should be more educative cause you have an audience of enterpreneurs and people dream to starting b, give more education .\n"
        f"{chapter_note}\n\n"
        "Begin the long-form script now."
    )

    return prompt

def generate_script(book_title, book_info, all_chapters, api_index, sample_years=None):
    """
    Generate one long script per book (>= 2500 words).
    Returns: (script_text, new_api_index)
    """
    prompt = build_prompt(book_info, sample_years=sample_years, chapters_reference=all_chapters)
    attempts = len(API_KEYS)
    for attempt in range(attempts):
        key = API_KEYS[(api_index + attempt) % attempts]
        try:
            client = genai.Client(api_key=key)
            # Use generate_content for large text. Contents formatted as required by genai client.
            response = client.models.generate_content(
                model=MODEL,
                contents=[{"role": "user", "parts": [{"text": prompt}]}]
            )
            # Some Gemini responses may include response.text or structured content.
            text = getattr(response, "text", None)
            if text is None:
                # try to extract from response contents if different shape
                try:
                    text = response.output[0].content[0].text
                except Exception:
                    text = str(response)
            print(f"✅ Script generated with API#{(api_index + attempt) % attempts + 1} for book '{book_title}'.", flush=True)
            return text.strip(), (api_index + attempt + 1) % attempts
        except Exception as e:
            print(f"⚠️ API#{(api_index + attempt) % attempts + 1} failed: {e}", flush=True)
            time.sleep(1)
    raise RuntimeError("❌ All API keys failed.")

def save_script(tag, book_title, script_text, source_file=None):
    os.makedirs(SCRIPT_OUTPUT_PATH, exist_ok=True)
    filename = f"{tag}.{book_title}.txt"
    safe_filename = sanitize_filename(filename)
    path = os.path.join(SCRIPT_OUTPUT_PATH, safe_filename)

    # If script is extremely long, ensure write works in streaming manner
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

    # Derive book title from filename (strip trailing suffix)
    book_title = selected_file.replace("_chapters.txt", "").replace(".txt", "")
    book_info = load_company_info(book_title)  # fuzzy lookup for metadata
    chapter_file_path = os.path.join(CHAPTERS_PATH, selected_file)
    chapters = []
    try:
        chapters = read_chapters(chapter_file_path)
    except Exception as e:
        print(f"⚠️ Could not read chapters file: {e}", flush=True)

    print(f"\n📚 Generating ONE full storytelling script for book: '{book_title}' ...\n", flush=True)

    api_index = 0
    # Provide typical sample years to encourage timeline, can be adjusted as needed.
    SAMPLE_YEARS = [1999, 2003, 2006, 2008, 2017, 2019, 2022]

    try:
        script, api_index = generate_script(book_title, book_info, chapters, api_index, sample_years=SAMPLE_YEARS)
        save_script("FULL", book_title, script, selected_file)
    except Exception as e:
        print(f"❌ Failed to generate script: {e}", flush=True)
        return

    print("\n🎉 Full script generation complete.\n")

if __name__ == "__main__":
    main()
