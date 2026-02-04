import os
import time
from google import genai

# ================= CONFIG =================
STT_PATH = "BOOKS/Temp/STT"
OUTPUT_PATH = "BOOKS/Temp/Timeline"
MODEL = "gemini-flash-latest"
API_KEY = os.environ.get("GEMINI_API")

# ================= HELPERS =================

def list_txt_files(directory):
    """List all TXT files in a directory, sorted"""
    if not os.path.isdir(directory):
        raise FileNotFoundError(f"STT directory not found: {directory}")
    return sorted(f for f in os.listdir(directory) if f.lower().endswith(".txt"))

def extract_text_from_stt(file_path):
    """Extract plain text from timestamped STT file"""
    text_lines = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if ":" in line:
                parts = line.strip().split(":", 1)
                if len(parts) == 2:
                    text_lines.append(parts[1].strip())
    return " ".join(text_lines)  # single string

def ask_gemini_for_timeline(text, index):
    """
    Ask Gemini to generate visuals for the text segment.
    Each sentence should get its own suggested visuals/icons.
    """
    prompt = f"""
You are a motion designer for a video system.

Here is a transcript of a segment:
- Segment index: {index}
- Transcript: {text}

Please generate relevant visuals/icons for each sentence in the transcript.
Each sentence must have its own visuals (icons, text, position, animation, emotion).
Arrange icons in numbers:
1. First sentence icons
2. Second sentence icons
...
Output each sentence on a new line.
"""
    client = genai.Client(api_key=API_KEY)
    response = client.models.generate_content(
        model=MODEL,
        contents=[{"role": "user", "parts": [{"text": prompt}]}]
    )
    return response.text.strip()

# ================= MAIN =================

def build_gemini_timeline_from_txt():
    os.makedirs(OUTPUT_PATH, exist_ok=True)

    txt_files = list_txt_files(STT_PATH)
    if not txt_files:
        print("No TXT files found in STT directory.")
        return

    for idx, txt_file in enumerate(txt_files):
        txt_path = os.path.join(STT_PATH, txt_file)
        segment_text = extract_text_from_stt(txt_path)

        try:
            gemini_output = ask_gemini_for_timeline(segment_text, idx + 1)
        except Exception as e:
            print(f"⚠️ Gemini failed on segment {idx + 1}: {e}")
            gemini_output = f"⚠️ Error: {e}"

        out_file = os.path.join(OUTPUT_PATH, f"segment_{idx+1}.txt")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(gemini_output)

        print(f"✅ Saved Gemini output for segment {idx + 1} to {out_file}")
        print(f"---- Segment {idx + 1} output start ----")
        print(gemini_output)
        print(f"---- Segment {idx + 1} output end ----\n")

        time.sleep(0.5)  # small delay to avoid rate limits

if __name__ == "__main__":
    build_gemini_timeline_from_txt()
