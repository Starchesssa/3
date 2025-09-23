
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
    if not os.path.exists(directory):
        return []
    return [f for f in os.listdir(directory) if f.lower().endswith(ext.lower())]

def sanitize_name(name):
    return re.sub(r"[^\w\d\-_.]+", "_", name)

def build_json_prompt(wav_file, txt_file):
    """Build AI prompt to generate a JSON file describing scenes and images."""
    base_name = os.path.splitext(wav_file)[0]
    txt_path = os.path.join(STT_PATH, txt_file)
    
    with open(txt_path, "r", encoding="utf-8") as f:
        timeline_content = f.read().strip()
    
    image_files = list_files(IMAGES_DIR, ".jpg") + list_files(IMAGES_DIR, ".png")
    image_list_str = "\n".join(f"- {img}" for img in image_files) if image_files else "(no images found)"
    
    prompt = f"""
You are an AI assistant tasked to generate **one clean JSON** for a video editing project.
The JSON will define all **scenes, images, reveal effects, layers, and audio timing**. 
**Do not write Python or any other code**, output JSON only.

**Instructions for JSON structure:**

1. The JSON must start with a top-level key `"audio"` that points to the **full audio file**:
   Example:
   "audio": "FFMPEG/Audio/narration.wav"

2. Then `"scenes"` is an array of scenes. Each scene contains:
   - "scene": scene number
   - "images": array of image objects
   - "transition": the scene-to-scene transition effect (e.g., "fade")

3. Each image object must include:
   - "image": the image filename
   - "time": [start_seconds, end_seconds] relative to the full video
   - "reveal": the reveal effect (choose from: 3d_left, 3d_right, bottom_slide, top_reveal, fade_in, zoom_in, zoom_out, slide_in_left, slide_in_right, slide_in_diag, background_zoomout)
   - "layer": background/midground/foreground (background < midground < foreground)
   - Optional: x, y, scale

4. Distribute 2-5 scenes per sentence in the transcript. Assign images logically across layers with different reveal effects.  
5. Time ranges should correspond to the transcript content.
6. images must cobtain a name ie instead of background.png say leather_wall.png , instead of foreground.png say money.png
7. if an image requires cut out mostly foreground and background save as a .png if it requires full inage save as .jpg
8. each sentence must have its scene , look at the transcript with its timeline and select each sentence , in the sentence there is words that should be revealed ie "the gucci was one of the most known brand in wealth. fron that sentence there is words to reveal ,forinstance gucci will be revealed as background , wealth will be revealed with money , ,,you see each sentence there are words to be revealed.
9. follow strict the json fomat below 
Example JSON output for guidance (do not copy this verbatim, use your own images and timing based on the transcript):

{
  "audio": "FFMPEG/Audio/narration.wav",
  "scenes": [
    {
      "scene": 1,
      "images": [
        {"image": "jamaica_map.png", "time": [0.0, 2.0], "reveal": "background_zoomout", "layer": "background"},
        {"image": "person.png", "time": [1.0, 3.0], "reveal": "3d_left", "layer": "midground", "x": 600, "y": 300},
        {"image": "weed.png", "time": [2.0, 4.0], "reveal": "bottom_slide", "layer": "foreground", "scale": 1.2}
      ],
      "transition": "fade"
    },
    {
      "scene": 2,
      "images": [
        {"image": "amazon_logo.png", "time": [4.5, 6.0], "reveal": "top_reveal", "layer": "background"},
        {"image": "stock_chart.png", "time": [5.0, 7.0], "reveal": "slide_in_right", "layer": "midground"},
        {"image": "money_stack.png", "time": [6.0, 8.0], "reveal": "zoom_in", "layer": "foreground"}
      ],
      "transition": "fade"
    }
  ]
}

Timeline from transcript:
{timeline_content}

Available images:
{image_list_str}

**Output only JSON. Make sure it is valid JSON.**
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
            # Validate JSON before saving
            try:
                json_data = json.loads(json_text)
            except Exception as e:
                print(f"❌ AI output is not valid JSON for {wav_file}: {e}")
                continue

            out_filename = f"{sanitize_name(base_name)}.json"
            out_path = os.path.join(JSON_OUTPUT_PATH, out_filename)
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(json_data, f, indent=2)

            print(f"✅ JSON generated: {out_path}")
        except Exception as e:
            print(f"❌ Failed to generate JSON for {wav_file}: {e}")
    else:
        print(f"⚠️ No matching transcript for {wav_file}, skipping.")
