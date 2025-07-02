
import os
import time
import re
import string
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed, wait, FIRST_COMPLETED
from google import genai
from google.genai import types

# ========== Constants ==========
LINKS_DIR = "Unuusual_memory/Links"
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
MAX_QUALIFIED_TXT = 33
MAX_LINKS_TO_CHECK = 12
WAIT_TIME_BETWEEN_CALLS = 70  # seconds
MAX_TOTAL_TIME_PER_FILE = 240  # seconds (strict!)

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

os.makedirs(RELEVANT_DIR, exist_ok=True)

print("🔐 Initializing Gemini clients...")
CLIENTS = []
for idx, key in enumerate(API_KEYS):
    if key:
        print(f"  ✅ API Key {idx + 1} loaded.")
        CLIENTS.append(genai.Client(api_key=key))
    else:
        raise ValueError(f"❌ API Key {idx + 1} not set (GEMINI_API{'' if idx == 0 else idx + 1}).")

generate_content_config = types.GenerateContentConfig(response_mime_type="text/plain")

# ========== Utility Functions ==========

def normalize_response(text: str) -> str:
    text = text.strip().lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    return text

def retry_delay():
    print("\n🕒 Waiting 70 seconds before retrying...")
    for i in range(WAIT_TIME_BETWEEN_CALLS, 0, -1):
        if i % 10 == 0 or i <= 5:
            print(f"  - Retry wait: {i} seconds remaining...")
        time.sleep(1)
    print("🔁 Retry wait complete.\n")

def process_link(link, product, model, client, client_index, retries=0):
    print(f"\n🚀 [Thread-{threading.get_ident()}] Starting link check")
    print(f"  - Link: {link}\n  - Product: {product}\n  - Model: {model}\n  - Client: {client_index}\n  - Retry: {retries}")

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part(file_data=types.FileData(file_uri=link, mime_type="video/*")),
                types.Part(text=(
                    f"Is this video solely about the '{product}'?\n"
                    f"The video should be focused on '{product}'.\n"
                    "Respond with one word only: Yes or No."
                )),
            ],
        )
    ]

    try:
        response_obj = client.models.generate_content(
            model=model, contents=contents, config=generate_content_config
        )
        response_text = normalize_response(response_obj.text)
        print(f"✅ Gemini Response: '{response_obj.text.strip()}' for link {link}")
        if response_text == "yes":
            return link, "yes"
        else:
            print(f"⚠️ Unexpected or NO response: '{response_obj.text.strip()}'")
            return link, "no"

    except Exception as e:
        print(f"❌ Gemini Error for link {link}: {e}")
        if retries < 1:
            retry_delay()
            return process_link(link, product, model, client, client_index, retries + 1)
        else:
            print("⏭️ Max retries reached. Skipping.")
            return link, "no"

def countdown_timer(seconds):
    print(f"\n⏳ Waiting {seconds} seconds before next batch...")
    for remaining in range(seconds, 0, -1):
        if remaining % 10 == 0 or remaining <= 5:
            print(f"  - {remaining} seconds remaining...")
        time.sleep(1)
    print("✅ Wait complete. Continuing...\n")


# ========== Main Processing ==========
def process_links():
    qualified_files = 0

    txt_files = sorted(
        [f for f in os.listdir(LINKS_DIR) if re.match(r"^\d+_.+\.txt$", f)],
        key=lambda x: int(x.split("_")[0])
    )

    print(f"\n📁 Found {len(txt_files)} link files in '{LINKS_DIR}'.")

    for file_index, file_name in enumerate(txt_files):
        if qualified_files >= MAX_QUALIFIED_TXT:
            print(f"\n✅ Limit reached: {qualified_files} qualified files.")
            break

        print(f"\n📄 [{file_index + 1}/{len(txt_files)}] Checking file: {file_name}")
        start_time = time.time()
        full_path = os.path.join(LINKS_DIR, file_name)

        with open(full_path, "r") as f:
            links = [line.strip() for line in f if line.strip()]

        product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")
        print(f"🔎 Target Product: '{product}' with {len(links)} links")
        checked_links = links[:MAX_LINKS_TO_CHECK]
        results = {}
        link_futures = []
        print("🚀 Submitting links to Gemini...")

        with ThreadPoolExecutor(max_workers=len(checked_links)) as executor:
            for idx, link in enumerate(checked_links):
                model = GEMINI_MODELS[idx % len(GEMINI_MODELS)]
                client = CLIENTS[idx % len(CLIENTS)]
                future = executor.submit(process_link, link, product, model, client, idx)
                link_futures.append(future)

            done, not_done = wait(link_futures, timeout=MAX_TOTAL_TIME_PER_FILE, return_when=FIRST_COMPLETED)

            elapsed = time.time() - start_time
            if elapsed >= MAX_TOTAL_TIME_PER_FILE:
                print(f"🛑 Timeout: Exceeded 4-minute limit for {file_name}")
                for f in not_done:
                    f.cancel()

            for future in link_futures:
                if future.done() and not future.cancelled():
                    try:
                        link, result = future.result()
                        results[link] = result
                        print(f"✅ Final: {link} => {result.upper()}")
                    except Exception as e:
                        print(f"❌ Future Error: {e}")
                elif future.cancelled():
                    print("❌ Future cancelled due to timeout")

        qualified_links = [link for link, ans in results.items() if ans == "yes"]
        if qualified_links:
            save_path = os.path.join(RELEVANT_DIR, file_name)
            with open(save_path, "w") as out_f:
                out_f.write("\n".join(qualified_links))
            print(f"📥 Saved {len(qualified_links)} qualified links to '{save_path}'")
            qualified_files += 1
        else:
            print(f"❌ No qualified links for '{file_name}'")

        total_elapsed = time.time() - start_time
        if total_elapsed < MAX_TOTAL_TIME_PER_FILE - 5:
            wait_time = min(WAIT_TIME_BETWEEN_CALLS, int(MAX_TOTAL_TIME_PER_FILE - total_elapsed))
            countdown_timer(wait_time)
        else:
            print(f"⏭️ Skipping wait — used {int(total_elapsed)}s already")

    print(f"\n🏁 DONE! Total qualified files saved: {qualified_files}")


# ========== Entry ==========
if __name__ == "__main__":
    print("🏁 Starting processing script...")
    process_links()
