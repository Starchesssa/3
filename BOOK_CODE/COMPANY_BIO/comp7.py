
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
    return [f for f in os.listdir(directory) if f.lower().endswith(ext.lower())]

def sanitize_name(name):
    """Convert name to safe format for filenames."""
    return re.sub(r"[^\w\d\-_.]+", "_", name)

def build_ffmpeg_prompt(wav_file, txt_file):
    """Build AI prompt to generate a Python script that runs FFmpeg for a parallax video."""
    base_name = os.path.splitext(wav_file)[0]
    txt_path = os.path.join(STT_PATH, txt_file)
    
    # Load timeline content
    with open(txt_path, "r", encoding="utf-8") as f:
        timeline_content = f.read().strip()
    
    # Gather all .jpg and .png images
    image_files = list_files(IMAGES_DIR, ".jpg") + list_files(IMAGES_DIR, ".png")
    image_list_str = "\n".join(f"- {img}" for img in image_files) if image_files else "(no images found)"
    
    # Strong, explicit instructions: output only Python script content (no explanation).
    prompt = f"""
You are an assistant that MUST output only a single Python script (no prose, no code fences, no commentary).
The Python script must be fully runnable (python3) and must construct and execute a single ffmpeg command
(using subprocess.run) that produces a parallax video matching the audio duration and the timeline.

REQUIREMENTS (very strict):
1) OUTPUT ONLY Python code (a complete .py file). Do NOT output bash, tsx, or any explanatory text.
2) The Python script must use subprocess (or shutil) to run ffmpeg. Example: subprocess.run([...], check=True).
3) The script must read the audio path exactly: '{os.path.join(TTS_PATH, wav_file)}' and create a video with same duration.
4) Use the images found in {IMAGES_DIR} (listed below) as layers. If an image needs transparency, it should be a png.
5) Use 3-5 layers per scene; use different parallax techniques across scenes (horizontal parallax, vertical float, scaling zoom, perspective/pseudo-3D via scale+offset).
6) Use FPS={FPS}, resolution {RESOLUTION[0]}x{RESOLUTION[1]} (16:9). Ensure ffmpeg filter expressions do not rely on undeclared shell variables.
7) Compute numeric variables in Python (durations, per-scene durations, speeds, scales), then insert those numeric values into the ffmpeg command string.
   Do NOT leave bash-style inside ffmpeg filters. All ffmpeg expressions must be valid when the Python script runs.
8) Ensure every filter chain ends with a video stream of the requested resolution/fps and the scenes are concatenated correctly.
9) Output should be high quality: use libx264 -preset slow -crf 18 and include audio (aac -b:a 192k).
10) Keep the produced Python script under ~300 lines if possible, and make it clear/structured (functions ok).
11) Include basic error handling: check ffmpeg/ffprobe existence and readable inputs before running.
12) The script must write its output to: BOOKS/Temp/VIDEO_FFMPEG/{sanitize_name(base_name)}_ffmpeg_output.mp4

Timeline (start --> end : text):
{timeline_content}

Available visual assets in {IMAGES_DIR}:
{image_list_str}

Important: Do not ask for more information. Generate a single Python script that will (when run) produce the final parallax video.
"""
    return prompt

def generate_ffmpeg_code(prompt, api_index):
    """Retry across all API keys until success; return text and next api_index."""
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
    exit(1)

if not txt_files:
    print("❌ No TXT files found in STT folder.")
    exit(1)

api_index = 0

for wav_file in wav_files:
    base_name = os.path.splitext(wav_file)[0]
    matching_txt = f"{base_name}_timeline.txt"
    if matching_txt in txt_files:
        prompt = build_ffmpeg_prompt(wav_file, matching_txt)
        try:
            ffmpeg_py_code, api_index = generate_ffmpeg_code(prompt, api_index)
            # Force save as .py
            out_filename = f"{sanitize_name(base_name)}_ffmpeg.py"
            out_path = os.path.join(VIDEO_OUTPUT_PATH, out_filename)

            # Ensure the AI returned something that starts with a Python shebang or "import"
            # (We won't strictly enforce but it's a basic sanity check)
            if not (ffmpeg_py_code.lstrip().startswith("#!") or ffmpeg_py_code.lstrip().startswith("import")):
                # Prepend a safe header that imports subprocess (if missing) and then append returned code.
                header = (
                    "#!/usr/bin/env python3\n"
                    "import shutil, subprocess, sys, os\n\n"
                )
                ffmpeg_py_code = header + ffmpeg_py_code

            with open(out_path, "w", encoding="utf-8") as f:
                f.write(ffmpeg_py_code)

            # Make script executable (best-effort; may require permissions)
            try:
                os.chmod(out_path, 0o755)
            except Exception:
                pass

            print(f"✅ FFmpeg python script generated: {out_path}")
        except Exception as e:
            print(f"❌ Failed to generate FFmpeg script for {wav_file}: {e}")
    else:
        print(f"⚠️ No matching transcript for {wav_file}, skipping.")
