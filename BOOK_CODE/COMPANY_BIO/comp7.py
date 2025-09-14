
import os
import re
import time
from google import genai

# === Configuration ===
TTS_PATH = "BOOKS/Temp/TTS"
STT_PATH = "BOOKS/Temp/STT"
VIDEO_OUTPUT_PATH = "BOOKS/Temp/VIDEO_TSX"
IMAGES_DIR = "assets/images"
MODEL = "gemini-2.5-pro"
FPS = 30  # frames per second

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
    return [f for f in os.listdir(directory) if f.endswith(ext)]

def sanitize_name(name):
    """Convert name to safe format for filenames."""
    return re.sub(r"[^\w\d\-_.]+", "_", name)

def build_video_prompt(wav_file, txt_file):
    """
    Build AI prompt to generate Video.tsx for a given audio + transcript.
    """
    base_name = os.path.splitext(wav_file)[0]
    txt_path = os.path.join(STT_PATH, txt_file)
    
    # Load timeline content
    with open(txt_path, "r", encoding="utf-8") as f:
        timeline_content = f.read().strip()
    
    # Gather all .jpg images from assets/images
    image_files = list_files(IMAGES_DIR, ".jpg")
    image_list_str = "\n".join(f"- {img}" for img in image_files)
    
    prompt = f"""
You are generating a Remotion Video.tsx component for a storytelling video.

ONLY output the Video.tsx code, nothing else.

Component name: RemotionVideo

Audio file: '{os.path.join(TTS_PATH, wav_file)}'

Timeline from transcript (start --> end : text):
{timeline_content}

Visual requirements:
- All images (.jpg) are in assets/images:
{image_list_str}
- The name of the inage should be clear dont just say fore ground , say building.jpg, comment on how each image jpg should look like.
- each sentence must have new env ie new jpg, effects ,overlays etc , the video shoukd not be static , each sentence should reveal and convey message visually ,  with new layers of images animated in paralax.
- Parallax effect: background, midground, foreground layers with smooth camera movement.
- Cinematic camera: slow zoom and pan across duration.
- Text sequences: fade-in and fade-out, fully synchronized with timeline.
- Artistic environment: subtle glow, dust, light, smooth transitions , all vfx should be built in with your code if you cant then majust just ignore using vfx.
- Video duration must match audio length.
- Frame rate: {FPS} fps.
"""
    return prompt

def generate_video_tsx(prompt, api_index):
    """Use Gemini API to generate Video.tsx code from prompt."""
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
            return text.strip(), (api_index + attempt + 1) % attempts
        except Exception as e:
            print(f"⚠️ API#{(api_index + attempt) % attempts + 1} failed: {e}")
            time.sleep(1)
    raise RuntimeError("❌ All API keys failed.")

# === Main ===

os.makedirs(VIDEO_OUTPUT_PATH, exist_ok=True)

wav_files = list_files(TTS_PATH, ".wav")
txt_files = list_files(STT_PATH, ".txt")

if not wav_files:
    print("❌ No WAV files found in TTS folder.")
    exit()

if not txt_files:
    print("❌ No TXT files found in STT folder.")
    exit()

api_index = 0

# Process each WAV file and generate Video.tsx using its transcript
for wav_file in wav_files:
    base_name = os.path.splitext(wav_file)[0]
    matching_txt = f"{base_name}_timeline.txt"
    if matching_txt in txt_files:
        prompt = build_video_prompt(wav_file, matching_txt)
        try:
            tsx_code, api_index = generate_video_tsx(prompt, api_index)
            out_path = os.path.join(VIDEO_OUTPUT_PATH, f"{sanitize_name(base_name)}.Video.tsx")
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(tsx_code)
            print(f"✅ Video.tsx generated: {out_path}")
        except Exception as e:
            print(f"❌ Failed to generate Video.tsx for {wav_file}: {e}")
    else:
        print(f"⚠️ No matching transcript for {wav_file}, skipping.")
