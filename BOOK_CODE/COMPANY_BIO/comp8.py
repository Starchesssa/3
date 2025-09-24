
#!/usr/bin/env python3
import os
import time
import re
from google import genai

# === Configuration ===
TXT_PATH = "BOOKS/Temp/TXT"        # folder containing .txt input files
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
def list_txt_files(directory: str):
    """List all .txt files inside a directory."""
    if not os.path.exists(directory):
        return []
    return [f for f in os.listdir(directory) if f.lower().endswith(".txt")]

def sanitize_filename(name: str) -> str:
    """Make safe filenames."""
    return re.sub(r"[^\w\d\-_. ]+", "", name).replace(" ", "_")

def build_prompt(content: str) -> str:
    """Build prompt for Gemini to generate image list from .txt script content."""
    return f"""
Analyse the following lesson structure text and list all the images required with names and prompts.

Follow this style exactly:

bicycle.png
A black bicycle in a white background

building.png
Tall green building in a white background

darkblue_background.jpg
Image of dark blue background plain

(skip a line before starting another image)

Rules:
- Only extract images ending in .png or .jpg
- All PNGs = transparent cutouts → describe with colorful details (not white).
- All JPGs = full backgrounds → describe as full scenes.
- Use the exact filenames in the text (no directories).
- Keep prompts short and simple.
- Each object must contain a color (instead of just "building" say "tall green building").
- In PNGs, background is white → so object must be colored.
- Output only the list. Do not explain.

Text:
{content}
"""

def generate_prompts(txt_name: str, content: str, api_index: int):
    """Generate image prompts using Gemini; returns (text, new_api_index)."""
    prompt = build_prompt(content)
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

            print(f"✅ Prompts generated with API#{(api_index + attempt) % attempts + 1} for '{txt_name}'", flush=True)
            return text.strip(), (api_index + attempt + 1) % attempts

        except Exception as e:
            print(f"⚠️ API#{(api_index + attempt) % attempts + 1} failed: {e}", flush=True)
            time.sleep(1)

    raise RuntimeError("❌ All API keys failed after full rotation.")

def save_prompts(txt_file: str, prompt_text: str):
    """Save prompts into PROMPTS_PATH using a safe filename."""
    os.makedirs(PROMPTS_PATH, exist_ok=True)
    base_name = txt_file.replace(".txt", ".txt")
    safe_name = sanitize_filename(base_name)
    out_path = os.path.join(PROMPTS_PATH, safe_name)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(prompt_text)

    print(f"💾 Saved prompts: {out_path}", flush=True)

# === Main ===
def main():
    txt_files = list_txt_files(TXT_PATH)
    if not txt_files:
        print("❌ No .txt files found in BOOKS/Temp/TXT.")
        return

    api_index = 0
    for txt_file in txt_files:
        txt_path = os.path.join(TXT_PATH, txt_file)

        try:
            with open(txt_path, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"⚠️ Could not read {txt_file}: {e}", flush=True)
            continue

        try:
            prompt_text, api_index = generate_prompts(txt_file, content, api_index)
            save_prompts(txt_file, prompt_text)
        except Exception as e:
            print(f"❌ Failed on {txt_file}: {e}", flush=True)

    print("\n🎉 Prompt generation complete.\n")

if __name__ == "__main__":
    main()
