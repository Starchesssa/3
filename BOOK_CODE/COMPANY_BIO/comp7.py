
import os
import re
import time
from google import genai

# === Configuration ===
TTS_PATH = "BOOKS/Temp/TTS"
STT_PATH = "BOOKS/Temp/STT"
VIDEO_OUTPUT_PATH = "BOOKS/Temp/VIDEO_FFMPEG"
IMAGES_DIR = "assets/images"
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
    return [f for f in os.listdir(directory) if f.endswith(ext)]

def sanitize_name(name):
    """Convert name to safe format for filenames."""
    return re.sub(r"[^\w\d\-_.]+", "_", name)

def build_ffmpeg_prompt(wav_file, txt_file):
    """Build AI prompt to generate FFmpeg video code for a given audio + transcript."""
    base_name = os.path.splitext(wav_file)[0]
    txt_path = os.path.join(STT_PATH, txt_file)
    
    # Load timeline content
    with open(txt_path, "r", encoding="utf-8") as f:
        timeline_content = f.read().strip()
    
    # Gather all .jpg and .png images
    image_files = list_files(IMAGES_DIR, ".jpg") + list_files(IMAGES_DIR, ".png")
    image_list_str = "\n".join(f"- {img}" for img in image_files)
    
    prompt = f"""
You are generating FFmpeg shell code for a parallax video.
just output the code only , dont say here is the code , never just outout code only.

all the vode should not cobatian any error or syntax errors , we need accuracy .
Requirements:
- All images (.jpg/png) are in assets/images: if an image requires transparent background save as .png, if image requires full square/rectangle image save as jpg (especially background) 
- The name of the image should be clear, don’t just say foreground — say building.jpg, etc.
- Use multiple layers (3-5 layers per scene).
- Use all images in {IMAGES_DIR} (.jpg/.png) as layers.
- each inage should match what is been said in the timeline/trasnript , match everything from the timeline , this is so important match timeline with visuals.
- Match the duration of the audio file: '{os.path.join(TTS_PATH, wav_file)}'.
- Include all types of parallax effects that ffmpeg can, do not stick to one parallax in all scenes ,use many types of parallax throught.
- Optionally scale layers for depth effect (pseudo 3D).
- FPS: {FPS}, Resolution: {RESOLUTION[0]}x{RESOLUTION[1]}, 16:9 aspect ratio, match the audio duration/timeline if the audio has X duration then video should be X duration, all scenes must match same frame per scenod rate throught entire video.
- Keep code simple, fully working.
- Output a ready-to-run FFmpeg command/script.

Timeline (start --> end : text):
{timeline_content}

Visual assets:
{image_list_str}
"""
    return prompt

def generate_ffmpeg_code(prompt, api_index):
    """Retry across all API keys until success."""
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

wav_files = list_files(TTS_PATH, ".wav")
txt_files = list_files(STT_PATH, ".txt")

if not wav_files:
    print("❌ No WAV files found in TTS folder.")
    exit()

if not txt_files:
    print("❌ No TXT files found in STT folder.")
    exit()

api_index = 0

for wav_file in wav_files:
    base_name = os.path.splitext(wav_file)[0]
    matching_txt = f"{base_name}_timeline.txt"
    if matching_txt in txt_files:
        prompt = build_ffmpeg_prompt(wav_file, matching_txt)
        try:
            ffmpeg_code, api_index = generate_ffmpeg_code(prompt, api_index)
            out_path = os.path.join(VIDEO_OUTPUT_PATH, f"{sanitize_name(base_name)}_ffmpeg.sh")
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(ffmpeg_code)
            print(f"✅ FFmpeg script generated: {out_path}")
        except Exception as e:
            print(f"❌ Failed to generate FFmpeg script for {wav_file}: {e}")
    else:
        print(f"⚠️ No matching transcript for {wav_file}, skipping.")
