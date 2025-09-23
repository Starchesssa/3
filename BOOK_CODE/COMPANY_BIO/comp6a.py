
import os
import re
import time
from google import genai

# === Configuration ===
STT_PATH = "BOOKS/Temp/STT"
IMAGES_DIR = "assets/images"
TXT_OUTPUT_PATH = "BOOKS/Temp/TXT"  # Output folder for plain TXT
MODEL = "gemini-2.5-pro"

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

                # End of sentence check
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

def build_txt_prompt(sentence_text, sentence_time, image_files):
    """AI prompt for single sentence for plain TXT output."""
    image_list_str = "\n".join(f"- {img}" for img in image_files) if image_files else "(no images found)"
    
    prompt = f"""
You are an AI assistant generating a scene plan for a video.
Sentence: "{sentence_text}"

Tasks:
1) Pick ONE parallax effect from: [dolly_zoom, basic, vertical, diagonal, scale, orbit, blur, mask_reveal, sliding_split, floating_objects, focus_pull].
2) Identify important words to visualize.in a sentemce you pick a word that to being to life ie its image ie the country is good but people are bad , so well take inage of country, people and red cross to cross people.
3) Match each word with an image from the list below.you can animate its text too by writing TXT instead of inage .
4) For each element, return in this exact format 

1. stone=huge_stone.png=bg/full
   Cowboy=cow_boycape.png=fg/r
   Coins=money.png=mg/l
   Overall_par_effect=basic

2. blue=bkue_bg.jpeg=bg/full 
   sky=blue_sky.png=bg/md
   cushion=tall_cashion.png=/r
   cushion=tall_cushion.png/l
   Overall_par_effect=dolly_zoom


3..........


  and so on , see one word can reveal more than 2 inages , see cushion has revealed 2 inages right and left 

each sentence must be revealed , 
teminologies,
bg=background
fg=foreground
mg=midground
r=right 
l=left
full= full ground(full bavkground) or wallpaper 

all above are just long forms but in my outout shoukd be used as shortcuts 
each effe t and teminology should be used as the way it is 
5) Include one line for overall parallax effect:
   Overall_par_effect=<effect_name>
6) Output ONLY the plain text, no JSON, no extra words, no sentence repeated.

Available images:
{image_list_str}
"""
    return prompt

def generate_txt_from_ai(prompt, api_index):
    """Retry across all API keys until success; return text and next api_index."""
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

    all_sentence_texts = []
    for idx, s in enumerate(sentences, 1):
        prompt = build_txt_prompt(s["text"], s["time"], image_files)
        try:
            sentence_txt, api_index = generate_txt_from_ai(prompt, api_index)
            all_sentence_texts.append(f"{idx}. {sentence_txt}\n")
        except Exception as e:
            print(f"❌ Failed for sentence {idx}: {e}")

    # Save plain TXT file
    base_name = os.path.splitext(txt_file)[0]
    out_filename = f"{sanitize_name(base_name)}.txt"
    out_path = os.path.join(TXT_OUTPUT_PATH, out_filename)
    with open(out_path, "w", encoding="utf-8") as f:
        f.writelines(all_sentence_texts)
    print(f"✅ TXT scene file saved: {out_path}")
