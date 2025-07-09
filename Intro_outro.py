
import os
import time
from google import genai

# === Configuration ===
GADGET_FILE = "Unuusual_memory/TOP_GDG/Top_gadget.txt"
INTRO_PATH = "Unuusual_memory/INTR0,OUTRO/Intro.txt"
OUTRO_PATH = "Unuusual_memory/INTR0,OUTRO/Outro.txt"
MODEL = "gemini-2.5-flash"

# === Load Gemini API keys ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5")
]
API_KEYS = [key for key in API_KEYS if key]
if not API_KEYS:
    raise ValueError("❌ No valid GEMINI_API keys found.")

# === Helpers ===
def read_gadgets():
    with open(GADGET_FILE, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip()]
    return lines

def generate_script(prompt):
    for attempt in range(len(API_KEYS)):
        try:
            client = genai.Client(api_key=API_KEYS[attempt])
            response = client.models.generate_content(
                model=MODEL,
                contents=[
                    {
                        "role": "user",
                        "parts": [{"text": prompt}]
                    }
                ]
            )
            print(f"✅ Script generated using API#{attempt + 1}", flush=True)
            return response.text.strip()
        except Exception as e:
            print(f"⚠️ API#{attempt + 1} failed, retrying next key... Error: {e}", flush=True)
            time.sleep(1)
    raise RuntimeError("❌ All API keys failed for script generation.")

def save_script(text, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"📄 Saved script to {path}\n", flush=True)

# === Main Script ===
def main():
    print("🚀 Starting intro and outro script generation...\n", flush=True)
    
    gadgets = read_gadgets()
    if not gadgets:
        print("🚫 No gadgets found in the list.", flush=True)
        return
    
    gadget_list = "\n".join(gadgets)

    # --- Generate Intro ---
    intro_prompt = (
        "The following gadgets are going to be reviewed in a single video:\n\n"
        f"{gadget_list}\n\n"
        "Please make an intro script for the video. The intro must be no more than 47 words. "
        "It should ONLY output the intro script (no scene descriptions, no additional text). "
        "Mention that links to all products are in the video description."
    )
    intro_script = generate_script(intro_prompt)
    save_script(intro_script, INTRO_PATH)

    # --- Generate Outro ---
    outro_prompt = (
        "The following gadgets were reviewed in a single video:\n\n"
        f"{gadget_list}\n\n"
        "Please make an outro script for the video. "
        "It should ONLY output the outro script (no scene descriptions, no additional text). "
        "Mention that links to all products are in the video description."
    )
    outro_script = generate_script(outro_prompt)
    save_script(outro_script, OUTRO_PATH)

if __name__ == "__main__":
    main()
