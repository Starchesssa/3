
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

def split_sentences(text):
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]

def generate_prompts(sentences, api_index):
    count = len(sentences)
    passage_text = "\n".join([f"{i+1}. {s}" for i, s in enumerate(sentences)])
    
    prompt = (
        f"This passage has {count} sentences:\n\n"
        f"{passage_text}\n\n"
        "For each of these sentences, generate an **image prompt** in the style of Kurzgesagt. "
        "Do not include humans or animals in the prompts. "
        "Write the prompts numbered (1, 2, 3, ...).prompts should be numbered and arranged vertically  one after another"
        "Focus on abstract, futuristic, colorful infographic-like visuals. "
        "Each prompt should visualize the idea of the sentence in a simple, clear way."
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
            print(f"✅ Prompts generated with API#{(api_index + attempt) % attempts + 1}", flush=True)
            return response.text.strip(), (api_index + attempt + 1) % attempts
        except Exception as e:
            print(f"⚠️ API#{(api_index + attempt) % attempts + 1} failed: {e}", flush=True)
            time.sleep(1)
    raise RuntimeError("❌ All API keys failed.")

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
            sentences = split_sentences(text)
            if not sentences:
                print(f"⚠️ No sentences found in {file}, skipping.")
                continue

            prompts, api_index = generate_prompts(sentences, api_index)
            save_prompts(file, prompts)
        except Exception as e:
            print(f"❌ Failed for {file}: {e}", flush=True)
            continue

    print("\n🎉 All scripts converted into prompts.\n")

if __name__ == "__main__":
    main()
