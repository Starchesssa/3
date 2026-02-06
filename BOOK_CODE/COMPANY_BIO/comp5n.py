
import os
import re
import time
from google import genai

# === Paths ===
SCRIPT_PATH = "BOOKS/Temp/STT"        # Transcript input folder
PROMPTS_PATH = "BOOKS/Temp/PROMPTS"   # Output folder
MODEL = "gemini-2.5-pro-preview"

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

# === Helper Functions ===
def list_txt_files(directory):
    return [f for f in os.listdir(directory) if f.endswith(".txt")]

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def sanitize_filename(n):
    return re.sub(r"[^\w\d\-_. ]+", "", n).replace(" ", "_")

# === Generate prompt ===
def generate_prompts(text, api_index, filename):
    prompt = f"""
This is a full transcript from the file "{filename}".

Content:
{text}

The timeline is in seconds, e.g. 0.00 --> 0.36 means 0.00 to 0.35 seconds.

Your task:,here is my transcipt, give me image  relevant image  for the timeline. 


1.(0.00-1.79)- house.png
2.(1.79-2.62)- money.png
3.(2.62-3.57)- stock_chart.png
...


do not include images of living things ie animals and people,

use generic images ie instead of kilimanjaro_mountain.png say mountain.png 



                                                                        
Start immediately with prompts. No intro.
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
            print(f"✅ Transcript '{filename}' processed with API#{(api_index + attempt) % attempts + 1}")
            return res.text.strip(), (api_index + attempt + 1) % attempts
        except Exception as e:
            print(f"⚠️ API failed for '{filename}': {e}")
            time.sleep(1)

    raise RuntimeError(f"❌ All API keys failed for: {filename}")

# === Save output ===
def save_output(filename, text):
    os.makedirs(PROMPTS_PATH, exist_ok=True)
    base_name = filename.replace(".txt", "")
    out_path = os.path.join(PROMPTS_PATH, sanitize_filename(base_name) + ".txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"💾 Saved → {out_path}")

# === Main ===
def main():
    files = list_txt_files(SCRIPT_PATH)

    if not files:
        print("❌ No transcript .txt files found in STT folder.")
        return

    api_index = 0

    for file in files:
        print(f"\n📄 Processing transcript: {file}")
        text = read_file(os.path.join(SCRIPT_PATH, file))
        try:
            out, api_index = generate_prompts(text, api_index, file)
            save_output(file, out)
        except Exception as e:
            print(f"❌ Failed processing '{file}': {e}")

    print("\n🎉 Finished processing all transcripts!")

if __name__ == "__main__":
    main()
