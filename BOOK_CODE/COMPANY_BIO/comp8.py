
import os
import time
import re
from google import genai

# === Configuration ===
VIDEO_TSX_PATH = "BOOKS/Temp/VIDEO_TSX"
PROMPTS_PATH = "BOOKS/Temp/PROMPTS"
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

def list_tsx_files(directory):
    if not os.path.exists(directory):
        return []
    return [f for f in os.listdir(directory) if f.endswith(".tsx")]

def sanitize_filename(name):
    return re.sub(r"[^\w\d\-_. ]+", "", name).replace(" ", "_")

def build_prompt(code):
    """
    Build the image-analysis prompt for Gemini.
    """
    prompt = f"""
Analyse the following React/TSX code and list all the images required with names and prompts.

Follow this style exactly:

1. bicycle.jpg
A bicycle in a white background

2. building.jpg
Tall building in a white background

3. darkblue_background.jpg
Image of dark blue background plain

Rules:
- If the image needs cutout, specify a white background,ie image of byscle with white background 
- sone images are required as full ie background images or any inage that is required as full make its prompt as full
- The names of the inages shoukd be the  actual names use in code.
- Keep output as numbered list with 'name.jpg' followed by prompt below.
- Do not explain. Return only the list.dont sy here is the names and prompts no, jist be straight and give the actual output only.

Code:
{code}
"""
    return prompt

def generate_prompts(tsx_name, code, api_index):
    """
    Generate prompt list for one TSX file.
    Returns: (prompt_text, new_api_index)
    """
    prompt = build_prompt(code)
    attempts = len(API_KEYS)
    for attempt in range(attempts):
        key = API_KEYS[(api_index + attempt) % attempts]
        try:
            client = genai.Client(api_key=key)
            response = client.models.generate_content(
                model=MODEL,
                contents=[{"role": "user", "parts": [{"text": prompt}]}]
            )
            text = getattr(response, "text", None)
            if text is None:
                try:
                    text = response.output[0].content[0].text
                except Exception:
                    text = str(response)
            print(f"✅ Prompts generated with API#{(api_index + attempt) % attempts + 1} for file '{tsx_name}'.", flush=True)
            return text.strip(), (api_index + attempt + 1) % attempts
        except Exception as e:
            print(f"⚠️ API#{(api_index + attempt) % attempts + 1} failed: {e}", flush=True)
            time.sleep(1)
    raise RuntimeError("❌ All API keys failed.")

def save_prompts(tsx_file, prompt_text):
    os.makedirs(PROMPTS_PATH, exist_ok=True)
    base_name = tsx_file.replace(".tsx", ".txt")
    safe_filename = sanitize_filename(base_name)
    path = os.path.join(PROMPTS_PATH, safe_filename)

    with open(path, "w", encoding="utf-8") as f:
        f.write(prompt_text)
    print(f"💾 Saved: {path}", flush=True)

# === Main ===

def main():
    tsx_files = list_tsx_files(VIDEO_TSX_PATH)
    if not tsx_files:
        print("❌ No .tsx files found.")
        return

    api_index = 0
    for tsx_file in tsx_files:
        tsx_path = os.path.join(VIDEO_TSX_PATH, tsx_file)
        try:
            with open(tsx_path, "r", encoding="utf-8") as f:
                code = f.read()
        except Exception as e:
            print(f"⚠️ Could not read {tsx_file}: {e}", flush=True)
            continue

        try:
            prompt_text, api_index = generate_prompts(tsx_file, code, api_index)
            save_prompts(tsx_file, prompt_text)
        except Exception as e:
            print(f"❌ Failed on {tsx_file}: {e}", flush=True)

    print("\n🎉 Prompt generation complete.\n")

if __name__ == "__main__":
    main()
