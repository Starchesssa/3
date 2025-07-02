
import os
import time
import string
import threading
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED
from google import genai
from google.genai import types

# === Configuration ===
LINKS_DIR = "Unuusual_memory/Links"
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
MAX_QUALIFIED_TXT = 33
MAX_LINKS_PER_FILE = 12
WAIT_BETWEEN_FILES = 70  # seconds
TIMEOUT_PER_FILE = 240  # seconds

# === Load Gemini API keys ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5")
]

CLIENTS = []
MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite-preview-06-17",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash"
]

for idx, key in enumerate(API_KEYS):
    if key:
        CLIENTS.append(genai.Client(api_key=key))
    else:
        raise ValueError(f"Missing GEMINI_API{idx+1} environment variable.")

os.makedirs(RELEVANT_DIR, exist_ok=True)

# === Helpers ===
def normalize_response(text: str) -> str:
    return text.strip().lower().translate(str.maketrans('', '', string.punctuation))

def process_link(link, product, model, client, client_index, retry=False):
    print(f"\n🔎 Client {client_index + 1} checking: {link}")
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part(file_data=types.FileData(file_uri=link, mime_type="video/*")),
                types.Part(text=(
                    f"Is this video solely about the '{product}'?\n"
                    f"Respond only with Yes or No."
                )),
            ],
        )
    ]
    try:
        config = types.GenerateContentConfig(response_mime_type="text/plain")
        response = client.models.generate_content(model=model, contents=contents, config=config)
        result = normalize_response(response.text)
        print(f"✅ Response: {response.text.strip()}")
        return (link, "yes") if result == "yes" else (link, "no")
    except Exception as e:
        print(f"❌ Error with client {client_index + 1}: {e}")
        if not retry and client_index < 3:
            # Try retrying with client 4 or 5
            fallback_index = 3 if client_index == 0 else 4
            fallback_model = MODELS[fallback_index % len(MODELS)]
            return process_link(link, product, fallback_model, CLIENTS[fallback_index], fallback_index, retry=True)
        return (link, "no")

def wait_between_files(seconds):
    print(f"\n⏱️ Waiting {seconds} seconds before next file...")
    for i in range(seconds, 0, -1):
        if i <= 5 or i % 10 == 0:
            print(f"  ...{i}s")
        time.sleep(1)
    print("✅ Wait complete.\n")

# === Main Logic ===
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
        full_path = os.path.join(LINKS_DIR, file_name)

        with open(full_path, "r") as f:
            links = [line.strip() for line in f if line.strip()]
        product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")

        links = links[:MAX_LINKS_PER_FILE]
        results = {}

        with ThreadPoolExecutor(max_workers=len(links)) as executor:
            futures = []
            for i, link in enumerate(links):
                client_index = i % 3  # Use API1–3 initially
                model = MODELS[i % len(MODELS)]
                futures.append(executor.submit(
                    process_link, link, product, model, CLIENTS[client_index], client_index
                ))

            done, not_done = wait(futures, timeout=TIMEOUT_PER_FILE, return_when=FIRST_COMPLETED)

            for future in futures:
                if future.done():
                    try:
                        link, result = future.result()
                        results[link] = result
                    except Exception as e:
                        print(f"⚠️ Thread error: {e}")

        qualified_links = [l for l, r in results.items() if r == "yes"]
        if qualified_links:
            output_path = os.path.join(RELEVANT_DIR, file_name)
            with open(output_path, "w") as f:
                f.write("\n".join(qualified_links))
            print(f"✅ Saved {len(qualified_links)} qualified links.")
            qualified_count += 1
        else:
            print("🚫 No qualified links found.")

        # Wait 70s between files (except last)
        if index < len(txt_files) - 1:
            elapsed = time.time() - start_time
            wait_between_files(WAIT_BETWEEN_FILES)

    print(f"\n🎉 Done! Total qualified files: {qualified_count}")

if __name__ == "__main__":
    main()
