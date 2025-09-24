
#!/usr/bin/env python3
import os
import time
import re
from google import genai

# === Configuration ===
VIDEO_PY_PATH = "BOOKS/Temp/TXT"  # folder containing generated .py ffmpeg scripts
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
def list_py_files(directory: str):
    """List all .py files inside a directory."""
    if not os.path.exists(directory):
        return []
    return [f for f in os.listdir(directory) if f.lower().endswith(".py")]

def sanitize_filename(name: str) -> str:
    """Make safe filenames."""
    return re.sub(r"[^\w\d\-_. ]+", "", name).replace(" ", "_")

def build_prompt(code: str) -> str:
    """Build prompt for Gemini to generate image list from Python code."""
    return f"""
Analyse the following python code and list all the images required with names and prompts.

Follow this style exactly:

bicycle.png
A black bicycle in a white background

building.png
Tall green  building in a white background

darkblue_background.jpg
Image of dark blue background plain

(skip a line before starting another image)

Rules:
- All PNGs = transparent cutouts → describe with colorful details.
- All JPGs = full backgrounds → describe as full scene.
- Use the exact filenames used in the code (no directories).
- Keep prompts short and simple.
- Each object must cobtain a colour ie instead of tall building say tall green buikding , 
- in pngs background is white so nomal objects can have white colour ,give volour other tahn white ie black , green bkue , orange etc 
- Output only the list. Do not explain.

Code:
{code}
"""

def generate_prompts(py_name: str, code: str, api_index: int):
    """Generate image prompts using Gemini; returns (text, new_api_index)."""
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

            print(f"✅ Prompts generated with API#{(api_index + attempt) % attempts + 1} for '{py_name}'", flush=True)
            return text.strip(), (api_index + attempt + 1) % attempts

        except Exception as e:
            print(f"⚠️ API#{(api_index + attempt) % attempts + 1} failed: {e}", flush=True)
            time.sleep(1)

    raise RuntimeError("❌ All API keys failed after full rotation.")

def save_prompts(py_file: str, prompt_text: str):
    """Save prompts into PROMPTS_PATH using a safe filename."""
    os.makedirs(PROMPTS_PATH, exist_ok=True)
    base_name = py_file.replace(".py", ".txt")
    safe_name = sanitize_filename(base_name)
    out_path = os.path.join(PROMPTS_PATH, safe_name)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(prompt_text)

    print(f"💾 Saved prompts: {out_path}", flush=True)

# === Main ===
def main():
    py_files = list_py_files(VIDEO_PY_PATH)
    if not py_files:
        print("❌ No .py files found in VIDEO_FFMPEG.")
        return

    api_index = 0
    for py_file in py_files:
        py_path = os.path.join(VIDEO_PY_PATH, py_file)

        try:
            with open(py_path, "r", encoding="utf-8") as f:
                code = f.read()
        except Exception as e:
            print(f"⚠️ Could not read {py_file}: {e}", flush=True)
            continue

        try:
            prompt_text, api_index = generate_prompts(py_file, code, api_index)
            save_prompts(py_file, prompt_text)
        except Exception as e:
            print(f"❌ Failed on {py_file}: {e}", flush=True)

    print("\n🎉 Prompt generation complete.\n")

if __name__ == "__main__":
    main()
