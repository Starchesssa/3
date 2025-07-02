
import os
import time
import string
import random
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError, wait, FIRST_COMPLETED
from google import genai
from google.genai import types

# === Configuration ===
LINKS_DIR = "Unuusual_memory/Links"
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
MAX_QUALIFIED_TXT = 33
MAX_LINKS_PER_FILE = 12
WAIT_BETWEEN_FILES = 70  # seconds
FILE_TIMEOUT = 240        # seconds max per .txt file
TIMEOUT_PER_REQUEST = 45  # timeout per API request

# === Load Gemini API keys ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5")
]

CLIENTS = [genai.Client(api_key=key) for key in API_KEYS if key]
if not CLIENTS:
    raise ValueError("No valid GEMINI_API keys found.")

MODEL = "gemini-2.5-flash"
os.makedirs(RELEVANT_DIR, exist_ok=True)

# === Helpers ===
def normalize_response(text: str) -> str:
    return text.strip().lower().translate(str.maketrans('', '', string.punctuation))

def check_video(client, link, product):
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
    try:
        response = client.models.generate_content(model=MODEL, contents=contents, config=config)
        result = normalize_response(response.text)
        print(f"✅ Response: {response.text.strip()}")
        return "yes" if result == "yes" else "no"
    except Exception as e:
        print(f"❌ Error with link {link}: {e}")
        return "no"

def wait_between_files(seconds):
    print(f"\n⏱️ Waiting {seconds} seconds before next file...")
    for i in range(seconds, 0, -1):
        if i <= 5 or i % 10 == 0:
            print(f"  ...{i}s")
        time.sleep(1)
    print("✅ Wait complete.\n")

# === Main Processing Per File ===
def process_file(file_name):
    full_path = os.path.join(LINKS_DIR, file_name)
    with open(full_path, "r") as f:
        links = [line.strip() for line in f if line.strip()]

    product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")
    links = links[:MAX_LINKS_PER_FILE]
    results = {}

    with ThreadPoolExecutor(max_workers=len(links)) as executor:
        futures = {
            executor.submit(check_video, random.choice(CLIENTS), link, product): link
            for link in links
        }

        done, not_done = wait(futures.keys(), timeout=FILE_TIMEOUT, return_when=FIRST_COMPLETED)
        start_time = time.time()

        for future in as_completed(futures, timeout=FILE_TIMEOUT):
            link = futures[future]
            try:
                result = future.result(timeout=TIMEOUT_PER_REQUEST)
                results[link] = result
            except TimeoutError:
                print(f"⏱️ Timeout on: {link}")
                results[link] = "no"
            except Exception as e:
                print(f"⚠️ Failed to process link {link}: {e}")
                results[link] = "no"

            if time.time() - start_time > FILE_TIMEOUT:
                print(f"⏱️ File processing exceeded {FILE_TIMEOUT} seconds. Moving to next file.")
                break

    qualified_links = [l for l, r in results.items() if r == "yes"]
    if qualified_links:
        output_path = os.path.join(RELEVANT_DIR, file_name)
        with open(output_path, "w") as f:
            f.write("\n".join(qualified_links))
        print(f"✅ Saved {len(qualified_links)} qualified links.")
        return True
    else:
        print("🚫 No qualified links found.")
        return False

# === Main ===
def main():
    print("🚀 Starting processing...")
    txt_files = sorted(
        [f for f in os.listdir(LINKS_DIR) if f.endswith(".txt")],
        key=lambda x: int(x.split("_")[0])
    )

    qualified_count = 0
    for index, file_name in enumerate(txt_files):
        if qualified_count >= MAX_QUALIFIED_TXT:
            break

        print(f"\n📂 Processing file [{index + 1}]: {file_name}")
        start_time = time.time()

        try:
            successful = process_file(file_name)
            if successful:
                qualified_count += 1
        except Exception as e:
            print(f"❌ Unexpected error in file {file_name}: {e}")

        elapsed = time.time() - start_time
        if elapsed < WAIT_BETWEEN_FILES:
            wait_time = WAIT_BETWEEN_FILES - elapsed
            wait_between_files(int(wait_time))
        else:
            print("⚠️ File took longer than wait period, skipping delay.\n")

    print(f"\n🎉 Done! Total qualified files: {qualified_count}")

if __name__ == "__main__":
    main()
