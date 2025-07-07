
import whisper
from datetime import timedelta
from pathlib import Path

def format_timestamp(seconds):
    return str(timedelta(seconds=int(seconds))).split('.')[0].zfill(8)[:8]

# Load Whisper model
model = whisper.load_model('base')

audio_dir = Path("Unuusual_memory/AUDIO")
transcript_dir = Path("Unuusual_memory/TRANSCRIPT")
transcript_dir.mkdir(parents=True, exist_ok=True)

for audio_file in audio_dir.glob("*.wav"):
    print(f"Transcribing: {audio_file.name}")
    result = model.transcribe(str(audio_file), word_timestamps=True)
    
    transcript_path = transcript_dir / f"{audio_file.stem}.txt"
    with open(transcript_path, 'w') as f:
        for segment in result['segments']:
            for word in segment.get('words', []):
                start = format_timestamp(word['start'])
                end = format_timestamp(word['end'])
                text = word['word'].strip()
                f.write(f'{start}-{end}: {text}\n')
    print(f"Saved transcript: {transcript_path.name}")
