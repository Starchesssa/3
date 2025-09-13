
import os
import whisper

# --- Directories ---
BASE_DIR = "BOOKS/Temp"
TTS_DIR = os.path.join(BASE_DIR, "TTS")     # Original WAV files
STT_DIR = os.path.join(BASE_DIR, "STT")     # Transcripts will go here
os.makedirs(STT_DIR, exist_ok=True)

# --- Load Whisper model ---
model = whisper.load_model("base")

# --- Process all WAV files in TTS_DIR ---
wav_files = [f for f in os.listdir(TTS_DIR) if f.lower().endswith(".wav")]
if not wav_files:
    print("❌ No TTS WAV files found.")
    exit()

for wav_file in wav_files:
    print(f"📄 Processing WAV file: {wav_file}")
    file_name_no_ext = os.path.splitext(wav_file)[0]
    wav_path = os.path.join(TTS_DIR, wav_file)

    # --- Transcribe with word timestamps ---
    result = model.transcribe(wav_path, word_timestamps=True)

    # --- Save timeline to TXT in STT directory ---
    txt_path = os.path.join(STT_DIR, f"{file_name_no_ext}_timeline.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        for segment in result['segments']:
            for word in segment.get('words', []):
                start = word['start']
                end = word['end']
                text = word['word']
                f.write(f"{start:.2f} --> {end:.2f} : {text}\n")

    print(f"✅ Timeline saved: {txt_path}")

print("🎉 All WAV files processed. Transcripts are in BOOKS/Temp/STT")
