
import os
import re
import time
from google import genai

# === Configuration ===
SCRIPT_PATH = "BOOKS/Temp/SCRIPT/COMPANY_BIO"
PROMPTS_PATH = "BOOKS/Temp/PROMPTS"
MODEL = "gemini-2.5-pro"

# === Load Gemini API keys ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5"),
]
API_KEYS = [k for k in API_KEYS if k]
if not API_KEYS:
    raise ValueError("❌ No valid GEMINI_API keys found in environment variables.")

# === Helpers ===

def list_txt_files(directory):
    return [f for f in os.listdir(directory) if f.endswith(".txt")]

def read_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read().strip()

def sanitize_filename(name):
    return re.sub(r"[^\w\d\-_. ]+", "", name).replace(" ", "_")

# === Generate animation prompts for whole file ===

def generate_animation_prompts_for_file(file_text, api_index):
    prompt = (
        "This is a text script for a video:\n\n"
        f"{file_text}\n\n"
        "Please analyze the entire script and describe a simple kurzgasagt animation for each sentence. "
        "in the key lessons capitalise ,they are also part of the sentence , so describe their anomation and give me a sentence number ."
        "Do NOT include humans or animals. "
        " "
        "Each animation should illustrate the key idea of the sentence. "
        "Number the animations according to the sentence number "
        "Do NOT add any preamble, start directly with the numbered animations."
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
            print(f"✅ Animation prompts generated with API#{(api_index + attempt) % attempts + 1}", flush=True)
            return response.text.strip(), (api_index + attempt + 1) % attempts
        except Exception as e:
            print(f"⚠️ API#{(api_index + attempt) % attempts + 1} failed: {e}", flush=True)
            time.sleep(1)
    raise RuntimeError("❌ All API keys failed for file prompts")

def save_prompts(filename, prompts):
    os.makedirs(PROMPTS_PATH, exist_ok=True)
    safe_name = sanitize_filename(filename)
    path = os.path.join(PROMPTS_PATH, safe_name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(prompts)
    print(f"💾 Saved prompts: {path}", flush=True)

# === Main ===

def main():
    txt_files = list_txt_files(SCRIPT_PATH)
    if not txt_files:
        print("❌ No .txt files found in COMPANY_BIO directory.")
        return

    api_index = 0
    for file in txt_files:
        print(f"\n⏳ Processing {file}...", flush=True)
        try:
            text = read_file(os.path.join(SCRIPT_PATH, file))
            if not text:
                print(f"⚠️ Empty file: {file}, skipping.")
                continue

            animation_prompts, api_index = generate_animation_prompts_for_file(text, api_index)
            save_prompts(file, animation_prompts)

        except Exception as e:
            print(f"❌ Failed for {file}: {e}", flush=True)
            continue

    print("\n🎉 All scripts converted into full-file animation prompts.\n")

if __name__ == "__main__":
    main()
