
import os
import time
import string
import random
from multiprocessing import Pool, TimeoutError as MP_Timeout
from google import genai
from google.genai import types

# === Configuration ===
LINKS_DIR = "Unuusual_memory/Links"
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
MAX_QUALIFIED_TXT = 33
MAX_LINKS_PER_FILE = 12
WAIT_BETWEEN_FILES = 70  # seconds
TIMEOUT_PER_REQUEST = 45  # per link

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
os.makedirs(RELEVANT_DIR, exist_ok=True)

# === Helpers ===
def normalize_response(text: str) -> str:
    return text.strip().lower().translate(str.maketrans('', '', string.punctuation))

def check_video_wrapper(args):
    key_index, link, product = args
    try:
        client = genai.Client(api_key=API_KEYS[key_index])
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part(file_data=types.FileData(file_uri=link, mime_type="video/*")),
                    types.Part(text=f"Is this video solely about the '{product}'?\nRespond only with Yes or No."),
                ],
            )
        ]
        config = types.GenerateContentConfig(response_mime_type="text/plain")
        response = client.models.generate_content(model=MODEL, contents=contents, config=config)
        result = normalize_response(response.text)
        print(f"✅ [{link}] => {response.text.strip()}", flush=True)
        return (link, "yes" if result == "yes" else "no")
    except Exception as e:
        print(f"❌ [{link}] => Error: {e}", flush=True)
        return (link, "no")

def wait_between_files(seconds):
    print(f"\n⏱️ Waiting {seconds} seconds before next file...", flush=True)
    for i in range(seconds, 0, -1):
        if i <= 5 or i % 10 == 0:
            print(f"  ...{i}s", flush=True)
        time.sleep(1)
    print("✅ Wait complete.\n", flush=True)

# === Process Each File ===
def process_file(file_name):
    full_path = os.path.join(LINKS_DIR, file_name)
    with open(full_path, "r") as f:
        links = [line.strip() for line in f if line.strip()]

    product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")
    links = links[:MAX_LINKS_PER_FILE]
    args_list = [(i % len(API_KEYS), link, product) for i, link in enumerate(links)]
    results = {}

    print(f"🧪 Checking {len(links)} links with multiprocessing...", flush=True)
    with Pool(processes=len(args_list)) as pool:
        multiple_results = [pool.apply_async(check_video_wrapper, (args,)) for args in args_list]
        for i, res in enumerate(multiple_results):
            link = args_list[i][1]
            try:
                link, result = res.get(timeout=TIMEOUT_PER_REQUEST)
                results[link] = result
            except MP_Timeout:
                print(f"⏱️ Timeout on: {link}", flush=True)
                results[link] = "no"
            except Exception as e:
                print(f"⚠️ Error processing {link}: {e}", flush=True)
                results[link] = "no"

    qualified_links = [l for l, r in results.items() if r == "yes"]
    if qualified_links:
        output_path = os.path.join(RELEVANT_DIR, file_name)
        with open(output_path, "w") as f:
            f.write("\n".join(qualified_links))
        print(f"✅ Saved {len(qualified_links)} qualified links to: {output_path}", flush=True)
        return True
    else:
        print("🚫 No qualified links found.", flush=True)
        return False

# === Main Script ===
def main():
    print("🚀 Starting Gemini video relevance filtering...\n", flush=True)
    txt_files = sorted(
        [f for f in os.listdir(LINKS_DIR) if f.endswith(".txt")],
        key=lambda x: int(x.split("_")[0])
    )

    qualified_count = 0
    for index, file_name in enumerate(txt_files):
        if qualified_count >= MAX_QUALIFIED_TXT:
            break

        print(f"\n📂 File [{index + 1}/{len(txt_files)}]: {file_name}", flush=True)
        start_time = time.time()

        try:
            successful = process_file(file_name)
            if successful:
                qualified_count += 1
        except Exception as e:
            print(f"❌ Unexpected error: {e}", flush=True)

        elapsed = time.time() - start_time
        if elapsed < WAIT_BETWEEN_FILES:
            wait_time = WAIT_BETWEEN_FILES - elapsed
            wait_between_files(int(wait_time))
        else:
            print("⚠️ Skipping wait — file took longer than delay period.\n", flush=True)

    print(f"\n🎉 Finished! Total qualified files saved: {qualified_count}", flush=True)

if __name__ == "__main__":
    main()
