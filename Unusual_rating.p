
import os
import time
from multiprocessing import Pool, TimeoutError as MP_Timeout
from google import genai
from google.genai import types

# === Configuration ===
RELEVANT_DIR = "Unuusual_memory/Relevant"
LINKS_DIR = "Unuusual_memory/Links"
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

Reward more a video with quality and profesional product video, if video is more filmed profesionally reward it more.
Penalize heavily for shaky footage, poor audio, unedited clips, or distracting backgrounds.
Penalize heavily for videos that spend most of their time on technical tutorials, setup instructions, or coding.
Penalise heavily if video is showing much faces in video ie even if there is a product shown ,reward showcase of product without faces,just the product,penalise faces even if they show the product but if they keep focusing on face and product penalise them ,if they showcase just the product most of time reward them.

Output Format (Strict):
Overall Score: [Score]/10

No additional explanation, product name, or text. Only output in this exact structured format."""

# === Helpers ===
def normalize_response(text: str) -> str:
    return text.strip()

def letter_to_index(letter: str) -> int:
    """Convert letter a,b,c,... to 1,2,3,..."""
    return ord(letter.lower()) - ord('a') + 1

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
        key=lambda x: int(x.split("_")[0].split("(")[0])  # safer split to get number before '('
    )

    for file_name in txt_files:
        try:
            number_part = file_name.split("_")[0]  # e.g. "2(b)"
            product_part = "_".join(file_name.split("_")[1:]).replace(".txt", "")  # e.g. "smart_indoor_garden"

            # Extract number and letter from number_part
            num_str = ""
            letter = ""
            for c in number_part:
                if c.isdigit():
                    num_str += c
                elif c.isalpha():
                    letter = c
            number = int(num_str)
            if not letter:
                letter = 'a'

            # Find links file by matching product_part only
            matching_links_files = [
                f for f in os.listdir(LINKS_DIR)
                if f.endswith(".txt") and product_part in f
            ]

            if not matching_links_files:
                print(f"⚠️ No links file found containing product '{product_part}' for {file_name}", flush=True)
                continue
            elif len(matching_links_files) > 1:
                print(f"⚠️ Multiple links files found containing product '{product_part}' for {file_name}: {matching_links_files}", flush=True)
                exact_match = [f for f in matching_links_files if f == f"{product_part}.txt"]
                links_filename = exact_match[0] if exact_match else matching_links_files[0]
            else:
                links_filename = matching_links_files[0]

            links_path = os.path.join(LINKS_DIR, links_filename)
            with open(links_path, "r") as f:
                all_links = [line.strip() for line in f if line.strip()]

            link_index = letter_to_index(letter) - 1
            if link_index >= len(all_links):
                print(f"⚠️ Link index {link_index + 1} out of range for {links_path}", flush=True)
                continue

            link_to_rate = all_links[link_index]

            # Prepare args for rate_video_wrapper
            args_list = [(0, link_to_rate)]  # only one link per file, assign API key 0 initially

            with Pool(processes=1) as pool:
                multiple_results = [pool.apply_async(rate_video_wrapper, (args,)) for args in args_list]
                for idx, res in enumerate(multiple_results):
                    try:
                        result = res.get(timeout=TIMEOUT_PER_REQUEST)
                        output_file = f"{num_str}({letter})_{product_part}.txt"
                        output_path = os.path.join(RATING_DIR, output_file)
                        with open(output_path, "w") as out_f:
                            out_f.write(result + "\n")
                        print(f"💾 Saved rating to {output_path}", flush=True)
                    except MP_Timeout:
                        print(f"⏱️ Timeout on: {link_to_rate}", flush=True)
                    except Exception as e:
                        print(f"⚠️ Error processing {link_to_rate}: {e}", flush=True)

        except Exception as e:
            print(f"⚠️ Error processing file {file_name}: {e}", flush=True)

    print("\n🎉 Finished rating all videos!", flush=True)

if __name__ == "__main__":
    main()
