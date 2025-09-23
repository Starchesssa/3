
import os
import re
import time
import json
from google import genai

# === Configuration ===
TTS_PATH = "BOOKS/Temp/TTS"
STT_PATH = "BOOKS/Temp/STT"
VIDEO_OUTPUT_PATH = "BOOKS/Temp/VIDEO_FFMPEG"
IMAGES_DIR = "assets/images"
JSON_OUTPUT_PATH = "FFMPEG/Json"
MODEL = "gemini-2.5-pro"
FPS = 30  # frames per second
RESOLUTION = (3840, 2160)  # 4K

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
def list_files(directory, ext):
    """List all files in a directory with a specific extension."""
    if not os.path.exists(directory):
        return []
    return [f for f in os.listdir(directory) if f.lower().endswith(ext.lower())]

def sanitize_name(name):
    """Convert name to safe format for filenames."""
    return re.sub(r"[^\w\d\-_.]+", "_", name)

def build_json_prompt(wav_file, txt_file):
    """Build AI prompt to generate a JSON file describing scenes, images, and audio."""
    base_name = os.path.splitext(wav_file)[0]
    txt_path = os.path.join(STT_PATH, txt_file)
    
    with open(txt_path, "r", encoding="utf-8") as f:
        timeline_content = f.read().strip()
    
    image_files = list_files(IMAGES_DIR, ".jpg") + list_files(IMAGES_DIR, ".png")
    image_list_str = "\n".join(f"- {img}" for img in image_files) if image_files else "(no images found)"
    
    prompt = f"""
You are an AI assistant tasked to generate **one clean JSON** for a video editing project.
The JSON must define all **scenes, images, reveal effects, layers, and audio timing**. 
**Do not write Python or any other code**, output JSON only.

JSON must include:
1) Top-level key "audio" pointing to the full audio file: "FFMPEG/Audio/{wav_file}"
2) "scenes": an array of scenes:
   - "scene": scene number
   - "images": array of image objects
   - "transition": scene-to-scene transition effect
3) Each image object must include:
   - "image": filename
   - "time": [start_seconds, end_seconds] relative to full video
   - "reveal": effect name (3d_left, 3d_right, bottom_slide, top_reveal, fade_in, zoom_in, zoom_out, slide_in_left, slide_in_right, slide_in_diag, background_zoomout)
   - "layer": background/midground/foreground
   - Optional: x, y, scale

Timeline (from transcript):
{timeline_content}

Available images in {IMAGES_DIR}:
{image_list_str}

**Output only JSON.**
"""
    return prompt

def generate_json_from_ai(prompt, api_index):
    """Retry across all API keys until success; return JSON text and next api_index."""
    while True:
        for attempt in range(len(API_KEYS)):
            key = API_KEYS[(api_index + attempt) % len(API_KEYS)]
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
                print(f"✅ Success with API#{(api_index + attempt) % len(API_KEYS) + 1}")
                return text.strip(), (api_index + attempt + 1) % len(API_KEYS)
            except Exception as e:
                print(f"⚠️ API#{(api_index + attempt) % len(API_KEYS) + 1} failed: {e}")
                time.sleep(2)
        print("🔄 All keys failed this round, retrying...")

# === Main Execution ===
os.makedirs(VIDEO_OUTPUT_PATH, exist_ok=True)
os.makedirs(JSON_OUTPUT_PATH, exist_ok=True)

wav_files = list_files(TTS_PATH, ".wav")
txt_files = list_files(STT_PATH, ".txt")

if not wav_files:
    print("❌ No WAV files found in TTS folder.")
    exit(1)

if not txt_files:
    print("❌ No TXT files found in STT folder.")
    exit(1)

api_index = 0

for wav_file in wav_files:
    base_name = os.path.splitext(wav_file)[0]
    matching_txt = f"{base_name}_timeline.txt"
    if matching_txt in txt_files:
        prompt = build_json_prompt(wav_file, matching_txt)
        try:
            json_text, api_index = generate_json_from_ai(prompt, api_index)

            # Save AI output directly to JSON, without validation
            out_filename = f"{sanitize_name(base_name)}.json"
            out_path = os.path.join(JSON_OUTPUT_PATH, out_filename)
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(json_text)

            print(f"✅ JSON saved (raw AI output): {out_path}")
        except Exception as e:
            print(f"❌ Failed to generate JSON for {wav_file}: {e}")
    else:
        print(f"⚠️ No matching transcript for {wav_file}, skipping.")
