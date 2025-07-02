
import os
import time
import string
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError
from google import genai
from google.genai import types

# === Configuration ===
LINKS_DIR = "Unuusual_memory/Links"
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
MAX_QUALIFIED_TXT = 33
MAX_LINKS_PER_FILE = 12
WAIT_BETWEEN_FILES = 70  # seconds
TIMEOUT_PER_FILE = 240   # seconds
TIMEOUT_PER_REQUEST = 45  # seconds

# === Load Gemini API keys ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5")
]

MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite-preview-06-17",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash"
]

CLIENTS = []
for idx, key in enumerate(API_KEYS):
    if key:
        CLIENTS.append(genai.Client(api_key=key))
    else:
        raise ValueError(f"Missing GEMINI_API{idx+1} environment variable.")

os.makedirs(RELEVANT_DIR, exist_ok=True)

# === Helpers ===
def normalize_response(text: str) -> str:
    return text.strip().lower().translate(str.maketrans('', '', string.punctuation))

def try_model_once(link, product, model, client, client_index):
    print(f"🔎 Client {client_index + 1} using model `{model}` for: {link}")
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
        response = client.models.generate_content(model=model, contents=contents, config=config)
        result = normalize_response(response.text)
        print(f"✅ Response: {response.text.strip()}")
        return "yes" if result == "yes" else "no"
    except Exception as e:
        print(f"❌ Error with model {model}, client {client_index + 1}: {e}")
        return None  # Treat as failure for retry

def process_link_with_timeout(link, product, used_indices):
    for i in range(len(CLIENTS)):
        if i in used_indices:
            continue
        client = CLIENTS[i]
        model = MODELS[i % len(MODELS)]
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(try_model_once, link, product, model, client, i)
            try:
                result = future.result(timeout=TIMEOUT_PER_REQUEST)
                if result in {"yes", "no"}:
                    return (link, result)
            except TimeoutError:
                print(f"⏱️ Timeout: {link} on model {model}")
            except Exception as e:
                print(f"⚠️ Unhandled error on {link}: {e}")
        used_indices.append(i)
    print(f"⚠️ All attempts failed for: {link}")
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
            futures = {
                executor.submit(process_link_with_timeout, link, product, []): link
                for link in links
            }
            completed = as_completed(futures, timeout=TIMEOUT_PER_FILE)
            try:
                for future in completed:
                    link, result = future.result()
                    results[link] = result
            except TimeoutError:
                print("🚨 Timeout while waiting for file's total completion.")

        qualified_links = [l for l, r in results.items() if r == "yes"]
        if qualified_links:
            output_path = os.path.join(RELEVANT_DIR, file_name)
            with open(output_path, "w") as f:
                f.write("\n".join(qualified_links))
            print(f"✅ Saved {len(qualified_links)} qualified links.")
            qualified_count += 1
        else:
            print("🚫 No qualified links found.")

        if index < len(txt_files) - 1:
            elapsed = time.time() - start_time
            wait_between_files(WAIT_BETWEEN_FILES)

    print(f"\n🎉 Done! Total qualified files: {qualified_count}")

if __name__ == "__main__":
    main()
