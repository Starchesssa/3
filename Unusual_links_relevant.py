
import os
import time
import string
import random
import threading
from queue import Queue
from google import genai
from google.genai import types

DESCR_DIR = "Unuusual_memory/DESCR"
RELEVANT_DIR = "Unuusual_memory/Relevant"
os.makedirs(RELEVANT_DIR, exist_ok=True)

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
REQUEST_INTERVAL = 12  # seconds between requests per key

def normalize_response(text: str) -> str:
    return text.strip().lower().translate(str.maketrans('', '', string.punctuation))

def parse_txt_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()
    title = ""
    description_lines = []
    in_description = False
    for line in lines:
        if line.startswith("Title:"):
            title = line.replace("Title:", "").strip()
        elif line.startswith("Description:"):
            in_description = True
        elif in_description:
            description_lines.append(line)
    description = "\n".join(description_lines).strip()
    return title, description

def process_file(api_key, file_name):
    full_path = os.path.join(DESCR_DIR, file_name)
    product = file_name.rsplit(".", 1)[0].replace("_", " ")

    try:
        title, description = parse_txt_file(full_path)
    except Exception as e:
        print(f"❌ Failed to parse {file_name}: {e}")
        return

    try:
        client = genai.Client(api_key=api_key)
        prompt = (
            f"Here is a YouTube video title and description:\n\n"
            f"Title: {title}\n\n"
            f"Description:\n{description}\n\n"
            f"Is this video solely about the product '{product}'?\n"
            f"The video should not be a compilation containing many products — respond only with Yes or No."
        )
        contents = [types.Content(role="user", parts=[types.Part(text=prompt)])]
        config = types.GenerateContentConfig(response_mime_type="text/plain")
        response = client.models.generate_content(model=MODEL, contents=contents, config=config)
        result = normalize_response(response.text)

        print(f"✅ [{title[:40]}...] => {response.text.strip()} (key ending: ...{api_key[-4:]})", flush=True)
        if result == "yes":
            output_path = os.path.join(RELEVANT_DIR, file_name)
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(f"Title: {title}\n\nDescription:\n{description}")
            print(f"✅ Saved qualified: {output_path}")
    except Exception as e:
        print(f"❌ Error processing {file_name} => {e}")

def worker(api_key, queue: Queue):
    while not queue.empty():
        file_name = queue.get()
        process_file(api_key, file_name)
        time.sleep(REQUEST_INTERVAL)  # Respect per-key limit
        queue.task_done()

def main():
    print("🚀 Starting Gemini parallel relevance filter...")

    txt_files = [f for f in os.listdir(DESCR_DIR) if f.endswith(".txt")]
    print(f"🔍 Found {len(txt_files)} files.")

    queues = [Queue() for _ in API_KEYS]
    for i, file in enumerate(txt_files):
        queues[i % len(API_KEYS)].put(file)

    threads = []
    for i, key in enumerate(API_KEYS):
        t = threading.Thread(target=worker, args=(key, queues[i]))
        t.start()
        threads.append(t)

    for t in threads:
        t.join()

    print("\n✅ All files processed.")

if __name__ == "__main__":
    main()
