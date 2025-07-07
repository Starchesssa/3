
import whisper
from datetime import timedelta

def format_timestamp(seconds):
    # Format seconds to HH:MM:SS
    return str(timedelta(seconds=int(seconds))).split('.')[0].zfill(8)[:8]

model = whisper.load_model('base')
result = model.transcribe('umbriel whisper.wav', word_timestamps=True)

with open('transcription.txt', 'w') as f:
    for segment in result['segments']:
        for word in segment.get('words', []):
            start = format_timestamp(word['start'])
            end = format_timestamp(word['end'])
            text = word['word'].strip()
            f.write(f'{start}-{end}: {text}\n')
