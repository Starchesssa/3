
import os
import re
import time
from google import genai

# === Paths ===
SCRIPT_PATH = "BOOKS/Temp/STT"        # Transcript input folder
PROMPTS_PATH = "BOOKS/Temp/PROMPTS"   # Output folder
MODEL = "gemini-2.5-pro"

# === Load API Keys ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5"),
]
API_KEYS = [k for k in API_KEYS if k]

if not API_KEYS:
    raise ValueError("❌ No GEMINI_API keys found.")

# === Helper Functions ===
def list_txt_files(directory):
    return [f for f in os.listdir(directory) if f.endswith(".txt")]

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def sanitize_filename(n):
    return re.sub(r"[^\w\d\-_. ]+", "", n).replace(" ", "_")

# === Generate prompt ===
def generate_prompts(text, api_index, filename):
    prompt = f"""
This is a full transcript from the file "{filename}".

Content:
{text}

The timeline is in seconds, e.g. 0.00 --> 0.36 means 0.00 to 0.35 seconds.

Your task:,here is my transcipt, give me image  description for the timeline using 
all character you make will have head with no eyes,no nose, no mouth , no ears, just an black blank shadow shape ,here is the formular (2.5D parallax silhoutte + pose of the charcter/s+environment) all in 2.5D Depth parallax),this is the formular ,

use vector illustation silhouttes  in clothes(describe what the silhouts wear ) and environment in parallax , but more important pose estimation ie hand touching chin or fore finger touching head for thinking. in the image based on the emotion  this is very important .

some logos or words are nore important , so include them in a scene background so one undetands our concern , so not exceed two words in background ie the word 'money' in background bold and big in xyz font , or netflix logo in background of the scene

any word you emtion shoukd be in the scene ,instead of word XYZ in scene say word XYZ in the wall , see seeing the word in the wall   the image makes a belonging of the visual where words are inside scene 

each image should feel the script emotion ie by adding ie a company logo if a company it talked about ,cool emotional pose ,adding money vfx if money is talked about ,important key owrds in background if they are talked about etc make each impage pormpt feel the emotions of the sceipt its representing 

make poses based on emotion , each image must cobtain a character  with a certain pose ,dont make the character stand still.
Timeline format:
1.(0.00-9.79)- image  description
2.(9.79-15.00)- image description
3.(15.00-19.19)- image  description
...
in making prompts , each prompt should begin with, a vector illustration style of a ........

all characters must be describe by no face in prompt ie  the 2.5D character must have blank head with no hair, no eyes,no nose , no mouth ,just black blank shadow shape.

remember , pose count to 90% of the image/visual story telling, make sure you use pose estimation more.

The 2 5D silhoutte must described wearing clothes ie suit,jeans,watch ,shirt etc each silhoutte must be wearibg clothes,also each silhoutte must be described by age . clothes and age must match script 
    
also dont give too long pronpts just brief and sinple yet more powerful.

please include time line as the formatt i gave you, ie the number , time line in brackets and the inage peompt , this is very important , do not forget.

do not include any female silhoutte just male figures silhouttes.
                                                                        
Start immediately with prompts. No intro.
Begin:
"""

    attempts = len(API_KEYS)
    for attempt in range(attempts):
        key = API_KEYS[(api_index + attempt) % attempts]
        try:
            client = genai.Client(api_key=key)
            res = client.models.generate_content(
                model=MODEL,
                contents=[{"role": "user", "parts": [{"text": prompt}]}]
            )
            print(f"✅ Transcript '{filename}' processed with API#{(api_index + attempt) % attempts + 1}")
            return res.text.strip(), (api_index + attempt + 1) % attempts
        except Exception as e:
            print(f"⚠️ API failed for '{filename}': {e}")
            time.sleep(1)

    raise RuntimeError(f"❌ All API keys failed for: {filename}")

# === Save output ===
def save_output(filename, text):
    os.makedirs(PROMPTS_PATH, exist_ok=True)
    base_name = filename.replace(".txt", "")
    out_path = os.path.join(PROMPTS_PATH, sanitize_filename(base_name) + ".txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"💾 Saved → {out_path}")

# === Main ===
def main():
    files = list_txt_files(SCRIPT_PATH)

    if not files:
        print("❌ No transcript .txt files found in STT folder.")
        return

    api_index = 0

    for file in files:
        print(f"\n📄 Processing transcript: {file}")
        text = read_file(os.path.join(SCRIPT_PATH, file))
        try:
            out, api_index = generate_prompts(text, api_index, file)
            save_output(file, out)
        except Exception as e:
            print(f"❌ Failed processing '{file}': {e}")

    print("\n🎉 Finished processing all transcripts!")

if __name__ == "__main__":
    main()
