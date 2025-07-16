
import os
import time
from multiprocessing import Pool, TimeoutError as MP_Timeout
from google import genai
from google.genai import types

RELEVANT_DIR = "Unuusual_memory/Relevant"
LINKS_DIR = "Unuusual_memory/Links"
RATING_DIR = "Unuusual_memory/RATING"
TIMEOUT_PER_REQUEST = 60  # seconds

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

MODEL = "gemini-2.0-flash"
os.makedirs(RATING_DIR, exist_ok=True)

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

def normalize_response(text: str) -> str:
    return text.strip()

def letter_to_index(letter: str) -> int:
    return ord(letter.lower()) - ord('a') + 1

def rate_video_wrapper(args):
    key_index, link, output_path = args
    api_key = API_KEYS[key_index]

    max_retries = 5
    retry_delay = 5  # seconds between retries

    for attempt in range(1, max_retries + 1):
        try:
            client = genai.Client(api_key=api_key)
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
            print(f"✅ [{link}] => {result} (API#{key_index + 1})", flush=True)
            with open(output_path, "w") as f:
                f.write(result + "\n")
            print(f"💾 Saved rating to {output_path}", flush=True)
            break  # success, exit retry loop
        except Exception as e:
            print(f"❌ Attempt {attempt}/5: API#{key_index + 1} failed on {link} => {e}", flush=True)
            if attempt == max_retries:
                print(f"❌❌ Giving up after {max_retries} failed attempts for {link}", flush=True)
            else:
                time.sleep(retry_delay)  # wait before retrying

    time.sleep(61)  # wait to avoid hitting API rate limits

def main():
    print("🚀 Starting parallel Gemini video rating...\n", flush=True)

    txt_files = sorted(
        [f for f in os.listdir(RELEVANT_DIR) if f.endswith(".txt") and f[0].isdigit()],
        key=lambda x: int(x.split("_")[0].split("(")[0])
    )

    tasks = []

    for file_name in txt_files:
        try:
            number_part = file_name.split("_")[0]
            product_part = "_".join(file_name.split("_")[1:]).replace(".txt", "")

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

            matching_links_files = [
                f for f in os.listdir(LINKS_DIR)
                if f.endswith(".txt") and product_part in f
            ]

            if not matching_links_files:
                print(f"⚠️ No links file found for {file_name}", flush=True)
                continue

            links_filename = matching_links_files[0]
            with open(os.path.join(LINKS_DIR, links_filename), "r") as f:
                all_links = [line.strip() for line in f if line.strip()]

            link_index = letter_to_index(letter) - 1
            if link_index >= len(all_links):
                print(f"⚠️ Link index {link_index + 1} out of range in {links_filename}", flush=True)
                continue

            link_to_rate = all_links[link_index]
            output_filename = f"{num_str}({letter})_{product_part}.txt"
            output_path = os.path.join(RATING_DIR, output_filename)

            tasks.append((len(tasks) % len(API_KEYS), link_to_rate, output_path))

        except Exception as e:
            print(f"⚠️ Error preparing task for {file_name}: {e}", flush=True)

    # Run with 5 parallel processes
    with Pool(processes=min(5, len(API_KEYS))) as pool:
        pool.map(rate_video_wrapper, tasks)

    print("\n🎉 All video ratings complete!", flush=True)

if __name__ == "__main__":
    main()
