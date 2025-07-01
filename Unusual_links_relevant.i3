
import os
import time
import re
import string
from concurrent.futures import ThreadPoolExecutor, as_completed
from google import genai
from google.genai import types

# Constants
LINKS_DIR = "Unuusual_memory/Links"
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
MAX_QUALIFIED_TXT = 33
MAX_LINKS_TO_CHECK = 12
WAIT_TIME_BETWEEN_CALLS = 70  # seconds per batch

GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite-preview-06-17",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]

API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
]

# Ensure output directory exists
os.makedirs(RELEVANT_DIR, exist_ok=True)

print("🔐 Initializing Gemini clients...")
CLIENTS = []
for idx, key in enumerate(API_KEYS):
    if key:
        print(f"  ✅ API Key {idx+1} loaded.")
        CLIENTS.append(genai.Client(api_key=key))
    else:
        raise ValueError("❌ One or more API keys (GEMINI_API, GEMINI_API2, GEMINI_API3) are not set.")

generate_content_config = types.GenerateContentConfig(response_mime_type="text/plain")

def normalize_response(text: str) -> str:
    text = text.strip().lower()
    text = text.strip(string.punctuation)
    return text

def process_link(link, product, model, client, retries=0):
    print(f"🤖 [{model}] Checking: {link}")
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part(file_data=types.FileData(file_uri=link, mime_type="video/*")),
                types.Part(text=(
                    f"Is this video solely about the '{product}'?\n"
                    f"The video should be focused on '{product}'.\n"
                    "Respond with one word only: Yes or No. Make sure you output yes or no only."
                )),
            ],
        )
    ]

    try:
        response_obj = client.models.generate_content(
            model=model, contents=contents, config=generate_content_config
        )
        response_text = normalize_response(response_obj.text)
        if response_text == "yes":
            print(f"✅ [{model}] {link} => YES")
            return link, "yes"
        elif response_text == "no":
            print(f"✅ [{model}] {link} => NO")
            return link, "no"
        else:
            print(f"⚠️ [{model}] Unexpected response for {link}: '{response_obj.text.strip()}' — Treating as NO")
            return link, "no"
    except Exception as e:
        print(f"❌ [{model}] Error for {link}: {e}")
        if retries < 1:
            print(f"🔁 Retrying {link} (attempt {retries + 2})...")
            time.sleep(5)
            return process_link(link, product, model, client, retries + 1)
        else:
            print(f"⏭️ Skipping {link} after 2 attempts.")
    return link, "no"

def countdown_timer(seconds):
    print(f"\n⏳ Waiting {seconds} seconds before next batch...")
    try:
        for remaining in range(seconds, 0, -1):
            print(f"  - {remaining} seconds remaining...", end="\r", flush=True)
            time.sleep(1)
        print("\n✅ Wait complete. Starting next batch.\n")
    except Exception as e:
        print(f"❌ Error during countdown: {e}")

def process_links():
    qualified_files = 0

    txt_files = sorted(
        [f for f in os.listdir(LINKS_DIR) if re.match(r"^\d+_.+\.txt$", f)],
        key=lambda x: int(x.split("_")[0])
    )

    print(f"📂 Found {len(txt_files)} link files.")

    for file_index, file_name in enumerate(txt_files):
        if qualified_files >= MAX_QUALIFIED_TXT:
            print(f"✅ Stopping: Collected {qualified_files} qualified files.")
            break

        print(f"\n📄 [{file_index+1}/{len(txt_files)}] Processing file: {file_name}")
        full_path = os.path.join(LINKS_DIR, file_name)
        with open(full_path, "r") as f:
            links = [line.strip() for line in f if line.strip()]

        product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")
        print(f"🔍 Product: '{product}' with {len(links)} total links")
        checked_links = links[:MAX_LINKS_TO_CHECK]

        results = {}

        with ThreadPoolExecutor(max_workers=len(checked_links)) as executor:
            futures = []
            for idx, link in enumerate(checked_links):
                model = GEMINI_MODELS[idx % len(GEMINI_MODELS)]
                client = CLIENTS[idx % len(CLIENTS)]
                futures.append(executor.submit(process_link, link, product, model, client))

            for future in as_completed(futures):
                try:
                    link, result = future.result(timeout=90)
                    results[link] = result
                    print(f"🟢 Completed check for {link}: {result.upper()}")
                except Exception as e:
                    print(f"❌ Future failed: {e}")

        qualified_links = [link for link, answer in results.items() if answer == "yes"]
        if len(qualified_links) >= 1:
            save_path = os.path.join(RELEVANT_DIR, file_name)
            with open(save_path, "w") as out_f:
                out_f.write("\n".join(qualified_links))
            print(f"🧿 File '{file_name}' qualified with {len(qualified_links)} links. Saved!")
            qualified_files += 1
        else:
            print(f"❌ File '{file_name}' disqualified (only {len(qualified_links)} passed).")

        countdown_timer(WAIT_TIME_BETWEEN_CALLS)

    print(f"\n🏁 Finished! Total qualified files saved: {qualified_files}")

if __name__ == "__main__":
    process_links()
