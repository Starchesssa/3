import os
import json
import wave
import contextlib
import time
from google import genai

# ================= CONFIG =================

TTS_AUDIO_PATH = "BOOKS/Temp/TTS"
ICONS_PATH = "react-icons-list.txt"   # <-- TEXT FILE (one icon per line)
OUTPUT_PATH = "BOOKS/Temp/Timeline"
MODEL = "gemini-2.5-pro"
API_KEY = os.environ.get("GEMINI_API")

# ================= HELPERS =================

def get_audio_duration(wav_path):
    with contextlib.closing(wave.open(wav_path, 'r')) as f:
        return f.getnframes() / float(f.getframerate())


def list_wav_files(directory):
    if not os.path.isdir(directory):
        raise FileNotFoundError(f"TTS directory not found: {directory}")

    return sorted(
        f for f in os.listdir(directory)
        if f.lower().endswith(".wav")
    )


def list_icons(file_path):
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"Icon list file not found: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        return [
            line.strip()
            for line in f
            if line.strip() and not line.strip().startswith("#")
        ]


def ask_gemini(duration, index, icons):
    prompt = f"""
You are a motion designer for a React video system.

Audio duration: {duration:.2f} seconds
Segment index: {index}

Available icons (MUST choose exactly one from this list or null):
{", ".join(icons)}

Screen positions:
center, top-left, top-right, bottom-left, bottom-right

Return ONLY valid JSON.
Do NOT add explanations or markdown.

JSON format:
{{
  "visual_type": "icon | text | both",
  "icon": "icon-name or null",
  "text": "string or null",
  "position": "center | top-left | top-right | bottom-left | bottom-right",
  "size": number,
  "animation": "fade-in | pop | slide-up | zoom",
  "emotion": "neutral | positive | urgent"
}}

Rules:
- If visual_type is "icon" or "both", icon MUST be from the list
- If visual_type is "text", icon MUST be null
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

    if not wavs:
        raise RuntimeError("No WAV files found.")
    if not icons:
        raise RuntimeError("Icon list is empty.")

    timeline = []
    current_time = 0.0

    for idx, wav in enumerate(wavs):
        wav_path = os.path.join(TTS_AUDIO_PATH, wav)
        duration = get_audio_duration(wav_path)

        try:
            visual = ask_gemini(duration, idx + 1, icons)
        except Exception as e:
            print(f"⚠️ Gemini failed on segment {idx + 1}, using fallback.")
            visual = {
                "visual_type": "text",
                "icon": None,
                "text": "",
                "position": "center",
                "size": 80,
                "animation": "fade-in",
                "emotion": "neutral"
            }

        entry = {
            "start": round(current_time, 2),
            "end": round(current_time + duration, 2),
            **visual
        }

        timeline.append(entry)
        current_time += duration
        time.sleep(0.5)  # rate limit safety

    output_file = os.path.join(OUTPUT_PATH, "video_timeline.json")

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2)

    print(f"🎬 Timeline created: {output_file}")


if __name__ == "__main__":
    build_timeline()
