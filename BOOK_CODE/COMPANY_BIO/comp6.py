import os
from pathlib import Path
from pydub import AudioSegment
import whisper
from datetime import timedelta

# --- Helper function to format timestamp ---
def format_timestamp(seconds):
    return float(seconds)  # we’ll keep seconds as float for pydub slicing

# --- Directories ---
base_dir = "BOOKS/Temp"
tts_dir = os.path.join(base_dir, "TTS")
sentences_dir = os.path.join(base_dir, "Sentences")
os.makedirs(sentences_dir, exist_ok=True)

# --- Load Whisper model ---
model = whisper.load_model("base")

# --- Process each WAV file ---
for file in os.listdir(tts_dir):
    if file.endswith(".wav"):
        name = os.path.splitext(file)[0]
        wav_path = os.path.join(tts_dir, file)
        print(f"Processing: {file}")

        # Transcribe with word timestamps
        result = model.transcribe(wav_path, word_timestamps=True)

        # Load full audio
        audio = AudioSegment.from_wav(wav_path)

        # Create output directory for this file
        out_dir = os.path.join(sentences_dir, name)
        os.makedirs(out_dir, exist_ok=True)

        # --- Group words into sentences ---
        sentences = []
        current_sentence = []
        for segment in result['segments']:
            for word in segment.get('words', []):
                current_sentence.append(word)
                if '.' in word['word'] or '?' in word['word'] or '!' in word['word']:
                    sentences.append(current_sentence)
                    current_sentence = []
        if current_sentence:  # append any remaining words
            sentences.append(current_sentence)

        # --- Cut audio per sentence ---
        for i, sentence in enumerate(sentences, start=1):
            start = format_timestamp(sentence[0]['start']) * 1000
            end = format_timestamp(sentence[-1]['end']) * 1000
            clip = audio[start:end]
            clip.export(os.path.join(out_dir, f"s{i}.wav"), format="wav")

        print(f"✅ Finished {file}, saved {len(sentences)} sentences in {out_dir}")
