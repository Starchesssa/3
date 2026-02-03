import os
import json
import wave
import contextlib
import time
from google import genai

# ================= CONFIG =================

TTS_AUDIO_PATH = "BOOKS/Temp/TTS"
ICONS_PATH = "src/react-icons"
OUTPUT_PATH = "BOOKS/Temp/Timelines"
MODEL = "gemini-2.5-pro"
API_KEY = os.environ.get("GEMINI_API")

# ================= HELPERS =================

def get_audio_duration(wav_path):
    with contextlib.closing(wave.open(wav_path, 'r')) as f:
        return f.getnframes() / float(f.getframerate())

def list_wav_files(directory):
    return sorted([f for f in os.listdir(directory) if f.endswith(".wav")])

def list_icons(directory):
    return [os.path.splitext(f)[0] for f in os.listdir(directory)]

def ask_gemini(duration, index, icons):
    prompt = f"""
You are a motion designer for a React video system.

Audio duration: {duration:.2f} seconds
Segment index: {index}
Available icons: {", ".join(icons)}
Screen positions: center, top-left, top-right, bottom-left, bottom-right

Return ONLY valid JSON:

{{
  "visual_type": "icon | text | both",
  "icon": "icon-name or null",
  "text": "string or null",
  "position": "center | top-left | top-right | bottom-left | bottom-right",
  "size": number,
  "animation": "fade-in | pop | slide-up | zoom",
  "emotion": "neutral | positive | urgent"
}}
"""
    client = genai.Client(api_key=API_KEY)
    response = client.models.generate_content(
        model=MODEL,
        contents=[{"role": "user", "parts": [{"text": prompt}]}]
    )
    return json.loads(response.text)

# ================= MAIN =================

def build_timeline():
    os.makedirs(OUTPUT_PATH, exist_ok=True)

    wavs = list_wav_files(TTS_AUDIO_PATH)
    icons = list_icons(ICONS_PATH)

    timeline = []
    current_time = 0.0

    for idx, wav in enumerate(wavs):
        duration = get_audio_duration(os.path.join(TTS_AUDIO_PATH, wav))

        visual = ask_gemini(duration, idx + 1, icons)

        entry = {
            "start": round(current_time, 2),
            "end": round(current_time + duration, 2),
            **visual
        }

        timeline.append(entry)
        current_time += duration
        time.sleep(0.5)

    with open(os.path.join(OUTPUT_PATH, "video_timeline.json"), "w") as f:
        json.dump(timeline, f, indent=2)

    print("🎬 Gemini-driven video timeline created.")

if __name__ == "__main__":
    build_timeline()
