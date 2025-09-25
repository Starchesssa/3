
import os
import re
import time
from google import genai

# === Configuration ===
STT_PATH = "BOOKS/Temp/STT"
IMAGES_DIR = "assets/images"
TXT_OUTPUT_PATH = "BOOKS/Temp/TXT"  # Output folder for plain TXT
MODEL = "gemini-2.5-flash"

# === Load Gemini API keys from environment variables ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5"),
]
API_KEYS = [key for key in API_KEYS if key]
if not API_KEYS:
    raise ValueError("❌ No valid GEMINI_API keys found in environment variables.")

# === Helpers ===
def list_files(directory, ext):
    if not os.path.exists(directory):
        return []
    return [f for f in os.listdir(directory) if f.lower().endswith(ext.lower())]

def sanitize_name(name):
    return re.sub(r"[^\w\d\-_.]+", "_", name)

def parse_timeline(txt_path):
    """Convert timeline fragments into sentence-wise entries with start & end times."""
    sentences = []
    current_sentence = []
    start_time = None

    with open(txt_path, "r", encoding="utf-8") as f:
        for line in f:
            match = re.match(r"([\d.]+)\s*-->\s*([\d.]+)\s*:\s*(.*)", line)
            if match:
                t_start, t_end, word = float(match[1]), float(match[2]), match[3].strip()
                if start_time is None:
                    start_time = t_start
                current_sentence.append((word, t_start, t_end))

                if word.endswith("."):
                    sentence_text = " ".join(w for w, _, _ in current_sentence)
                    sentences.append({
                        "text": sentence_text.strip(),
                        "time": [start_time, t_end]
                    })
                    current_sentence = []
                    start_time = None
    if current_sentence:
        sentence_text = " ".join(w for w, _, _ in current_sentence)
        sentences.append({
            "text": sentence_text.strip(),
            "time": [current_sentence[0][1], current_sentence[-1][2]]
        })
    return sentences

def build_file_prompt(sentences, image_files):
    """Builds one big prompt for all sentences in a file."""
    image_list_str = "\n".join(f"- {img}" for img in image_files) if image_files else "(no images found)"

    numbered_sentences = "\n".join([f"{i+1}. {s['text']}" for i, s in enumerate(sentences)])

    prompt = f"""
You are an AI assistant generating a scene plan for a video.

Here are all the sentences with indexes:
{numbered_sentences}

Tasks:
1) For EACH numbered sentence, generate elements in this format:
   word=image_name=position
   AnotherWord=another_image=position
   Overall_par_effect=<effect_name>

   Example:
   1. city=tall_blackbuikdings.png=bg/full
      Cowboy=cow_boycape.png=fg/r
      Coins=money.png=mg/l
      bags=military_bags.png/fg/c
      Overall_par_effect=basic
      
   2. stage=black_backstage.png=bg/c
      gucci=gucci_green_logo.png=mg/c
      cushion=tall_cushion.png=fg/r
      cushion=tall_cushion.png=fg/l
      Overall_par_effect=dolly_zoom

make sure you skip one line after each scene description as i have in that example.

do not include an image of a person or aninal even if a person is mentioned ,,no inages of people or animals.

each sentence must create atleast 2-3 minimal images or more.

each sentence muat create an artistic envionment not just pngs  ie well make a class as background, person as midground  , and table as fore ground , you see the environment matches , but you can just throw inages without making a setting of a scene,creste a scene set .
make sure you use the componets i gave you which are;
bg= for background 
fg= for foreground 
md= for midground 
r=  for right 
l=  for left 
c= for centre 

use these effects only = dolly_zoom, basic, vertical, diagonal, scale, orbit, blur, mask_reveal, sliding_split, floating_objects, focus_pull].

do not mispell anything , take everything as i gave you , dobt add your effects or your postions , use my style only dont add anything.

2) Use ONLY this set of effects: [dolly_zoom, basic, vertical, diagonal, scale, orbit, blur, mask_reveal, sliding_split, floating_objects, focus_pull].
fy
3) Map important words to images from this list:
{image_list_str}

4) One sentence can map to multiple images (e.g., cushion → left + right).

5) Output ONLY plain text in numbered format. 
   No JSON, no extra explanation, no repetition of the input sentences.
"""
    return prompt

def generate_txt_from_ai(prompt, api_index):
    """One API call per file."""
    while True:
        for attempt in range(len(API_KEYS)):
            key = API_KEYS[(api_index + attempt) % len(API_KEYS)]
            try:
                client = genai.Client(api_key=key)
                response = client.models.generate_content(
                    model=MODEL,
                    contents=[{"role": "user", "parts": [{"text": prompt}]}]
                )
                text = getattr(response, "text", None)
                if text is None:
                    try:
                        text = response.output[0].content[0].text
                    except Exception:
                        text = str(response)
                print(f"✅ Success with API#{(api_index + attempt) % len(API_KEYS) + 1}")
                return text.strip(), (api_index + attempt + 1) % len(API_KEYS)
            except Exception as e:
                print(f"⚠️ API#{(api_index + attempt) % len(API_KEYS) + 1} failed: {e}")
                time.sleep(2)
        print("🔄 All keys failed, retrying...")

# === Main Execution ===
os.makedirs(TXT_OUTPUT_PATH, exist_ok=True)

txt_files = list_files(STT_PATH, ".txt")
if not txt_files:
    print("❌ No TXT files found in STT folder.")
    exit(1)

image_files = list_files(IMAGES_DIR, ".jpg") + list_files(IMAGES_DIR, ".png")
api_index = 0

for txt_file in txt_files:
    txt_path = os.path.join(STT_PATH, txt_file)
    sentences = parse_timeline(txt_path)
    if not sentences:
        print(f"⚠️ Skipping {txt_file}, no sentences found.")
        continue

    # Build one big prompt for this file
    prompt = build_file_prompt(sentences, image_files)

    try:
        file_txt, api_index = generate_txt_from_ai(prompt, api_index)
    except Exception as e:
        print(f"❌ Failed for file {txt_file}: {e}")
        continue

    # Save plain TXT file
    base_name = os.path.splitext(txt_file)[0]
    out_filename = f"{sanitize_name(base_name)}.txt"
    out_path = os.path.join(TXT_OUTPUT_PATH, out_filename)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(file_txt + "\n")
    print(f"✅ TXT scene file saved: {out_path}")
