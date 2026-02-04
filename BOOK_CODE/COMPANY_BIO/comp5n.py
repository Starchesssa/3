import os
import wave
import contextlib
import time
from google import genai

# ================= CONFIG =================

TTS_AUDIO_PATH = "BOOKS/Temp/TTS"
OUTPUT_PATH = "BOOKS/Temp/Timeline"
MODEL = "gemini-flash-latest"
API_KEY = os.environ.get("GEMINI_API")

# ================= HELPERS =================

def get_audio_duration(wav_path):
    """Get the duration of a WAV file in seconds"""
    with contextlib.closing(wave.open(wav_path, 'r')) as f:
        return f.getnframes() / float(f.getframerate())


def list_wav_files(directory):
    """List all WAV files in a directory, sorted"""
    if not os.path.isdir(directory):
        raise FileNotFoundError(f"TTS directory not found: {directory}")
    return sorted(f for f in os.listdir(directory) if f.lower().endswith(".wav"))


def ask_gemini_for_timeline(duration, index):
    """
    Ask Gemini to generate visuals for an audio segment.
    We do NOT tell it what the timeline is — Gemini should decide
    which visuals/icons/text to show for each sentence.
    """
    prompt = f"""
You are a motion designer for a video system.

Here is an audio segment:
- Duration: {duration:.2f} seconds
- Segment index: {index}

Please generate a visual description for each sentence in the audio.
Each sentence should have its own suggested visuals (icons, text, position, animation, emotion).
Do NOT create JSON, just describe them in plain text so we can see it clearly.

Output each sentence on a new line.
"""
    client = genai.Client(api_key=API_KEY)
    response = client.models.generate_content(
        model=MODEL,
        contents=[{"role": "user", "parts": [{"text": prompt}]}]
    )
    return response.text.strip()


# ================= MAIN =================

def build_gemini_timeline():
    os.makedirs(OUTPUT_PATH, exist_ok=True)

    wavs = list_wav_files(TTS_AUDIO_PATH)
    if not wavs:
        print("No WAV files found.")
        return

    for idx, wav in enumerate(wavs):
        wav_path = os.path.join(TTS_AUDIO_PATH, wav)
        duration = get_audio_duration(wav_path)

        try:
            text_output = ask_gemini_for_timeline(duration, idx + 1)
        except Exception as e:
            print(f"⚠️ Gemini failed on segment {idx + 1}: {e}")
            text_output = f"⚠️ Error: {e}"

        # Save each segment output to its own .txt file
        out_file = os.path.join(OUTPUT_PATH, f"segment_{idx+1}.txt")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(text_output)

        print(f"✅ Saved Gemini output for segment {idx + 1} to {out_file}")
        print(f"---- Segment {idx + 1} output start ----")
        print(text_output)
        print(f"---- Segment {idx + 1} output end ----\n")

        time.sleep(0.5)  # small delay to avoid rate limits


if __name__ == "__main__":
    build_gemini_timeline()
