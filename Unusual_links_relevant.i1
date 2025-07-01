
import os
import time
import re
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError
from google import genai
from google.genai import types

# Constants
LINKS_DIR = "Unuusual_memory/Links"
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
MAX_QUALIFIED_TXT = 33
MAX_LINKS_TO_CHECK = 12
WAIT_TIME_BETWEEN_CALLS = 70  # seconds per batch
API_CALL_TIMEOUT = 20  # seconds timeout for each API call

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
for idx, key in enumerate(API_KEYS, 1):
    if key:
        CLIENTS.append(genai.Client(api_key=key))
        print(f"✅ Client {idx} initialized")
    else:
        raise ValueError("❌ One or more API keys (GEMINI_API, GEMINI_API2, GEMINI_API3) are not set.")

generate_content_config = types.GenerateContentConfig(response_mime_type="text/plain")

def process_link(link, product, model, client, retries=0):
    print(f"🤖 [{model}] Checking link (attempt {retries+1}): {link}")
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
        # NON-streaming call with timeout simulated by a wrapper
        # No built-in timeout, so we'll do it with ThreadPoolExecutor trick
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(
                client.models.generate_content,
                model=model,
                contents=contents,
                config=generate_content_config
            )
            response_obj = future.result(timeout=API_CALL_TIMEOUT)

        response_text = response_obj.text.strip().lower()
        if response_text in {"yes", "no"}:
            print(f"✅ [{model}] {link} => {response_text.upper()}")
            return link, response_text
        else:
            print(f"⚠️ [{model}] Unexpected response for {link}: '{response_text}' — Treating as NO")
            return link, "no"
    except TimeoutError:
        print(f"⏰ [{model}] Timeout after {API_CALL_TIMEOUT} seconds for {link}")
    except Exception as e:
        print(f"❌ [{model}] Error for {link}: {e}")

    # Retry logic
    if retries < 1:
        print(f"🔁 Retrying link {link} (retry {retries+1}) after 5 seconds...")
        time.sleep(5)
        return process_link(link, product, model, client, retries + 1)
    else:
        print(f"⏭️ Skipping {link} after 2 failed attempts.")
        return link, "no"

def countdown_timer(seconds):
    print(f"\n⏳ Waiting {seconds} seconds before next batch...")
    try:
        for remaining in range(seconds, 0, -1):
            print(f"  - {remaining} seconds remaining", end="\r", flush=True)
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n⏩ Wait interrupted by user. Moving on...")
    print("✅ Wait complete. Starting next batch.\n")

def process_links():
    qualified_files = 0

    txt_files = sorted(
        [f for f in os.listdir(LINKS_DIR) if re.match(r"^\d+_.+\.txt$", f)],
        key=lambda x: int(x.split("_")[0])
    )

    if not txt_files:
        print("⚠️ No txt files found in Links directory. Exiting.")
        return

    for file_name in txt_files:
        if qualified_files >= MAX_QUALIFIED_TXT:
            print(f"✅ Stopping: Collected {qualified_files} qualified files.")
            break

        print(f"\n📄 Processing file: {file_name}")
        full_path = os.path.join(LINKS_DIR, file_name)
        with open(full_path, "r") as f:
            links = [line.strip() for line in f if line.strip()]

        if not links:
            print(f"⚠️ File {file_name} is empty. Skipping.")
            continue

        product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")
        print(f"🔍 Product: '{product}' with {len(links)} total links")
        checked_links = links[:MAX_LINKS_TO_CHECK]

        results = {}

        print(f"⚡ Starting concurrent checks for up to {len(checked_links)} links...")
        with ThreadPoolExecutor(max_workers=len(checked_links)) as executor:
            futures = []
            for idx, link in enumerate(checked_links):
                model = GEMINI_MODELS[idx % len(GEMINI_MODELS)]
                client = CLIENTS[idx % len(CLIENTS)]
                futures.append(executor.submit(process_link, link, product, model, client))

            for future in as_completed(futures):
                try:
                    link, result = future.result()
                    results[link] = result
                    print(f"🟢 Completed check for {link}: {result.upper()}")
                except Exception as e:
                    print(f"❌ Unexpected error in thread: {e}")

        qualified_links = [link for link, answer in results.items() if answer == "yes"]
        if qualified_links:
            save_path = os.path.join(RELEVANT_DIR, file_name)
            with open(save_path, "w") as out_f:
                out_f.write("\n".join(qualified_links))
            print(f"🧿 File '{file_name}' qualified with {len(qualified_links)} links. Saved!")
            qualified_files += 1
        else:
            print(f"❌ File '{file_name}' disqualified (0 links passed).")

        countdown_timer(WAIT_TIME_BETWEEN_CALLS)

    print(f"\n🏁 Finished! Total qualified files saved: {qualified_files}")

if __name__ == "__main__":
    print("🚀 Starting the link qualification process...")
    try:
        process_links()
    except KeyboardInterrupt:
        print("\n⏹️ Process interrupted by user. Exiting gracefully.")
