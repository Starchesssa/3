
import os
import json
from aeneas.executetask import ExecuteTask
from aeneas.task import Task
from pydub import AudioSegment

base_dir = "BOOKS/Temp"
tts_dir = os.path.join(base_dir, "TTS")
sentences_dir = os.path.join(base_dir, "Sentences")
os.makedirs(sentences_dir, exist_ok=True)

for file in os.listdir(tts_dir):
    if file.endswith(".wav"):
        name = os.path.splitext(file)[0]
        wav_path = os.path.join(tts_dir, file)
        txt_path = os.path.join(tts_dir, f"{name}.txt")
        json_path = os.path.join(tts_dir, f"{name}.json")

        # --- Step 1: Run Aeneas alignment ---
        task = Task(config_string="task_language=eng|is_text_type=plain|os_task_file_format=json")
        task.audio_file_path_absolute = wav_path
        task.text_file_path_absolute = txt_path
        task.sync_map_file_path_absolute = json_path
        ExecuteTask(task).execute()
        task.output_sync_map_file()

        # --- Step 2: Load audio + timeline ---
        audio = AudioSegment.from_wav(wav_path)
        with open(json_path, "r") as f:
            data = json.load(f)

        # --- Step 3: Create sentence dir ---
        out_dir = os.path.join(sentences_dir, name)
        os.makedirs(out_dir, exist_ok=True)

        # --- Step 4: Cut into sentence audios ---
        for i, frag in enumerate(data["fragments"], start=1):
            start = float(frag["begin"]) * 1000
            end = float(frag["end"]) * 1000
            clip = audio[start:end]
            clip.export(os.path.join(out_dir, f"s{i}.wav"), format="wav")

print("✅ Done! Sentences saved in BOOKS/Temp/Sentences/")
