import os
import time
import re
from google import genai

# ================= CONFIG =================

STT_PATH = "BOOKS/Temp/STT"
OUTPUT_PATH = "BOOKS/Temp/Timeline"
ICON_LIST_FILE = "react-icons-list.txt"

MODEL = "gemini-flash-latest"
API_KEY = os.environ.get("GEMINI_API")

# ================= HELPERS =================

def list_txt_files(directory):
    if not os.path.isdir(directory):
        raise FileNotFoundError(f"STT directory not found: {directory}")
    return sorted(f for f in os.listdir(directory) if f.lower().endswith(".txt"))


def load_icon_list(path):
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Icon list not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]


def extract_clean_text(file_path):
    """
    Removes timestamps and reconstructs sentences
    """
    words = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if ":" in line:
                _, text = line.split(":", 1)
                words.append(text.strip())

    raw_text = " ".join(words)
    raw_text = re.sub(r"\s+", " ", raw_text)
    return raw_text.strip()


def ask_gemini_for_timeline(text, index, icon_list):
    icon_block = "\n".join(icon_list)

    prompt = f"""
You are a 2.5D motion deigner for a video automation system.

RULES (VERY IMPORTANT):
- You MUST ONLY use images ie House.png  
- each image should be straight ie House.png instead of house with .....
- each sentence has its own layers and each layer is a image png 
- output like ie 
1.house.png -6s 
 money.png-8s 
 table.png -10s 
 

- Use EXACTLY 


AVAILABLE PARAMETERS (choose ONLY from these):

animation:
- fade-in
- slide-left
- slide-right
- scale-up
- pop
- none

position:
- center
- top-left
- top-right
- bottom-left
- bottom-right

TIMING RULE:
- start_time must be cumulative and approximate
- First sentence starts at 0.0
- Increase naturally per sentence

================ EXAMPLE OUTPUT ================

1. Sentence: At the heart of Microsoft's transformation
   icon: FaLightbulb
   start_time: 0.0
   animation: fade-in
   position: center

2. Sentence: under Satya Nadella is a profound re-evaluation
   icon: FaBrain
   start_time: 1.8
   animation: slide-left
   position: center

================================================

NOW PROCESS THIS TRANSCRIPT:

Segment index: {index}

{text}

Generate ONE numbered block per sentence.
Follow the structure EXACTLY.
"""

    client = genai.Client(api_key=API_KEY)
    response = client.models.generate_content(
        model=MODEL,
        contents=[{"role": "user", "parts": [{"text": prompt}]}]
    )

    return response.text.strip()


# ================= MAIN =================

def build_gemini_timeline_from_stt():
    os.makedirs(OUTPUT_PATH, exist_ok=True)

    txt_files = list_txt_files(STT_PATH)
    icons = load_icon_list(ICON_LIST_FILE)

    if not txt_files:
        print("No STT TXT files found.")
        return

    for idx, txt in enumerate(txt_files):
        txt_path = os.path.join(STT_PATH, txt)
        transcript_text = extract_clean_text(txt_path)

        try:
            output = ask_gemini_for_timeline(
                transcript_text,
                idx + 1,
                icons
            )
        except Exception as e:
            print(f"⚠️ Gemini failed on segment {idx + 1}: {e}")
            output = f"ERROR: {e}"

        out_file = os.path.join(OUTPUT_PATH, f"segment_{idx+1}.txt")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(output)

        print(f"✅ Segment {idx+1} saved → {out_file}")
        print("----- OUTPUT START -----")
        print(output)
        print("----- OUTPUT END -----\n")

        time.sleep(0.6)  # rate-limit safety


if __name__ == "__main__":
    build_gemini_timeline_from_stt()
