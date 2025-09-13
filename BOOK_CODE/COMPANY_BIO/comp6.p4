
import os
from pathlib import Path
import whisper

# --- Directories ---
BASE_DIR = "BOOKS/Temp"
TTS_DIR = os.path.join(BASE_DIR, "TTS")
os.makedirs(TTS_DIR, exist_ok=True)

# --- Load Whisper model ---
model = whisper.load_model("base")

# --- Process all WAV files in TTS_DIR ---
tts_files = [f for f in os.listdir(TTS_DIR) if f.endswith(".wav")]
if not tts_files:
    print("❌ No TTS WAV files found.")
    exit()

for tts_file in tts_files:
    print(f"📄 Processing TTS file: {tts_file}")
    file_name_no_ext = os.path.splitext(tts_file)[0]
    wav_path = os.path.join(TTS_DIR, tts_file)

    # --- Transcribe with word timestamps ---
    result = model.transcribe(wav_path, word_timestamps=True)

    # --- Save timeline to TXT ---
    txt_path = os.path.join(TTS_DIR, f"{file_name_no_ext}_timeline.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        for segment in result['segments']:
            for word in segment.get('words', []):
                start = word['start']
                end = word['end']
                text = word['word']
                f.write(f"{start:.2f} --> {end:.2f} : {text}\n")

    print(f"✅ Timeline saved: {txt_path}")

print("🎉 All files processed.")
