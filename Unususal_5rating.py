
import os
import time
import string
import random
from multiprocessing import Pool, TimeoutError as MP_Timeout
from google import genai
from google.genai import types

# === Configuration ===
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
RATING_DIR = "Unuusual_memory/RATING"
TIMEOUT_PER_REQUEST = 60  # seconds

# === Load Gemini API keys ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5")
]
API_KEYS = [key for key in API_KEYS if key]
if not API_KEYS:
    raise ValueError("❌ No valid GEMINI_API keys found.")

MODEL = "gemini-2.5-flash"
os.makedirs(RATING_DIR, exist_ok=True)

# === Prompt ===
PROMPT = """On a scale from 1 to 10, rate this video based on:

1. How much of the video’s total time is spent visually showcasing the product’s design, features, and usage to general viewers.

2. How well the video presents the product in an attractive, engaging, and concise way that is easy for non-technical viewers to follow.

3. Professional Quality: Rate how professionally the video is produced based on factors like visual quality, camera work, audio clarity, lighting, editing, background setup, and overall polish.

Penalize heavily for shaky footage, poor audio, unedited clips, or distracting backgrounds.
Penalize heavily for videos that spend most of their time on technical tutorials, setup instructions, or coding.
Penalise heavily if video is showing much faces in video ie even if there is a product shown ,reward showcase of product without faces,just the product,penalise faces even if they show the product but if they keep focusing on face and product penalise them ,if they showcase just the product most of time reward them.


Output Format (Strict):
Overall Score: [Score]/10

No additional explanation, product name, or text. Only output in this exact structured format."""

# === Helpers ===
def normalize_response(text: str) -> str:
    return text.strip()

def rate_video_wrapper(args):
    key_index, link = args
    for attempt in range(len(API_KEYS)):
        real_index = (key_index + attempt) % len(API_KEYS)
        try:
            client = genai.Client(api_key=API_KEYS[real_index])
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part(file_data=types.FileData(file_uri=link, mime_type="video/*")),
                        types.Part(text=PROMPT),
                    ],
                )
            ]
            config = types.GenerateContentConfig(response_mime_type="text/plain")
            response = client.models.generate_content(model=MODEL, contents=contents, config=config)
            result = normalize_response(response.text)
            print(f"✅ [{link}] => {result} (API#{real_index + 1})", flush=True)
            return result
        except Exception as e:
            print(f"🔁 Retry {attempt + 1}/{len(API_KEYS)} on {link} (API#{real_index + 1}) => Error: {e}", flush=True)
            time.sleep(1)

    print(f"❌ [{link}] => All retries failed.", flush=True)
    return "ERROR"

# === Main Script ===
def main():
    print("🚀 Starting Gemini video rating...\n", flush=True)
    txt_files = sorted(
        [f for f in os.listdir(RELEVANT_DIR) if f.endswith(".txt") and f[0].isdigit()],
        key=lambda x: int(x.split("_")[0])
    )

    for file_name in txt_files:
        full_path = os.path.join(RELEVANT_DIR, file_name)
        with open(full_path, "r") as f:
            links = [line.strip() for line in f if line.strip()]

        number_part = file_name.split("_")[0]
        product_part = "_".join(file_name.split("_")[1:]).replace(".txt", "")

        args_list = [(i % len(API_KEYS), link) for i, link in enumerate(links)]

        with Pool(processes=len(args_list)) as pool:
            multiple_results = [pool.apply_async(rate_video_wrapper, (args,)) for args in args_list]
            for idx, res in enumerate(multiple_results):
                link = links[idx]
                try:
                    result = res.get(timeout=TIMEOUT_PER_REQUEST)
                    letter = chr(97 + idx)  # a, b, c, ...
                    output_file = f"{number_part}({letter})_{product_part}.txt"
                    output_path = os.path.join(RATING_DIR, output_file)
                    with open(output_path, "w") as out_f:
                        out_f.write(result + "\n")
                    print(f"💾 Saved rating to {output_path}", flush=True)
                except MP_Timeout:
                    print(f"⏱️ Timeout on: {link}", flush=True)
                except Exception as e:
                    print(f"⚠️ Error processing {link}: {e}", flush=True)

    print("\n🎉 Finished rating all videos!", flush=True)

if __name__ == "__main__":
    main()
