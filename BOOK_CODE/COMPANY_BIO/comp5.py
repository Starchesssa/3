
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

# === Animation prompt generation ===

def generate_animation_prompt_per_sentence(sentence, sentence_index, api_index):
    prompt = (
        f"Sentence {sentence_index + 1}: '{sentence}'\n\n"
        "Describe a simple, clear animation that represents this sentence for a video. "
        "Do NOT include humans or animals. "
        "Focus on elements, shapes, colors, movement, gradients, and visual metaphors. "
        "Each animation should be short and simple, enough to illustrate the sentence idea. "
        "Number multiple elements if necessary (a, b, c...). "
        "Example format: 1.a.(key phrase)-animation description, 1.b.(key phrase)-animation description, etc. "
        "Use smooth motion, visual storytelling, and highlight key ideas in the animation. "
        "Do not start with any preamble, just list the animations."
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
            print(f"✅ Sentence {sentence_index + 1} animation prompts generated with API#{(api_index + attempt) % attempts + 1}", flush=True)
            return response.text.strip(), (api_index + attempt + 1) % attempts
        except Exception as e:
            print(f"⚠️ API#{(api_index + attempt) % attempts + 1} failed: {e}", flush=True)
            time.sleep(1)
    raise RuntimeError(f"❌ All API keys failed for sentence {sentence_index + 1}")

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

            all_sentence_prompts = []
            for idx, sentence in enumerate(sentences):
                animation_prompt, api_index = generate_animation_prompt_per_sentence(sentence, idx, api_index)
                all_sentence_prompts.append(f"{idx+1}. {animation_prompt}\n")  # number + spacing

            save_prompts(file, "\n".join(all_sentence_prompts))

        except Exception as e:
            print(f"❌ Failed for {file}: {e}", flush=True)
            continue

    print("\n🎉 All scripts converted into per-sentence animation prompts.\n")

if __name__ == "__main__":
    main()
