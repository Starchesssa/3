
import os
from pathlib import Path
from pydub import AudioSegment
import whisper

# --- Directories ---
BASE_DIR = "BOOKS/Temp"
TTS_DIR = os.path.join(BASE_DIR, "TTS")
SENTENCES_DIR = os.path.join(BASE_DIR, "Sentences")
os.makedirs(SENTENCES_DIR, exist_ok=True)

# --- Load Whisper model ---
model = whisper.load_model("base")

# --- Pick a single file (matches TTS script logic) ---
tts_files = [f for f in os.listdir(TTS_DIR) if f.endswith(".wav")]
if not tts_files:
    print("❌ No TTS WAV files found.")
    exit()

selected_file = tts_files[0]  # same logic as TTS script
print(f"📄 Processing TTS file: {selected_file}")

file_name_no_ext = os.path.splitext(selected_file)[0]
wav_path = os.path.join(TTS_DIR, selected_file)

# --- Transcribe with word timestamps ---
result = model.transcribe(wav_path, word_timestamps=True)

# --- Load full audio ---
audio = AudioSegment.from_wav(wav_path)

# --- Create output directory for this section ---
out_dir = os.path.join(SENTENCES_DIR, file_name_no_ext)
os.makedirs(out_dir, exist_ok=True)

# --- Group words into sentences ---
sentences = []
current_sentence = []

for segment in result['segments']:
    for word in segment.get('words', []):
        current_sentence.append(word)
        # End sentence at punctuation
        if any(p in word['word'] for p in ['.', '?', '!']):
            sentences.append(current_sentence)
            current_sentence = []

# Append any remaining words
if current_sentence:
    sentences.append(current_sentence)

# --- Cut audio per sentence ---
for i, sentence in enumerate(sentences, start=1):
    start_ms = sentence[0]['start'] * 1000
    end_ms = sentence[-1]['end'] * 1000
    clip = audio[start_ms:end_ms]
    clip.export(os.path.join(out_dir, f"s{i}.wav"), format="wav")

print(f"✅ Finished {selected_file}, saved {len(sentences)} sentences in {out_dir}")
