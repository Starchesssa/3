
import os
import time
import string
import random
import subprocess
from multiprocessing import Process, Manager
from threading import Lock
from google import genai
from google.genai import types

# === Configuration ===
DESCR_DIR = "Unuusual_memory/DESCR"
RELEVANT_DIR = "Unuusual_memory/Relevant"
DELAY_BETWEEN_LAUNCHES = 61  # seconds between starting each process

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

key_last_call = {key: 0 for key in API_KEYS}
key_locks = {key: Lock() for key in API_KEYS}

MODEL = "gemini-2.5-flash"
os.makedirs(RELEVANT_DIR, exist_ok=True)

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

def check_description_wrapper(key_index, title, description, product):
    for attempt in range(len(API_KEYS)):
        real_index = (key_index + attempt) % len(API_KEYS)
        api_key = API_KEYS[real_index]

        with key_locks[api_key]:
            now = time.time()
            wait_time = 60 - (now - key_last_call[api_key])
            if wait_time > 0:
                time.sleep(wait_time)
            key_last_call[api_key] = time.time()

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
            print(f"✅ [{title[:40]}...] => {response.text.strip()} (API#{real_index + 1})", flush=True)
            return "yes" if result == "yes" else "no"
        except Exception as e:
            print(f"🔁 Retry {attempt + 1}/{len(API_KEYS)} on '{title[:30]}' (API#{real_index + 1}) => Error: {e}", flush=True)
            time.sleep(1)

    print(f"❌ [{title[:30]}...] => All retries failed.", flush=True)
    return "no"

def process_file(file_name):
    full_path = os.path.join(DESCR_DIR, file_name)
    product = file_name.rsplit(".", 1)[0].replace("_", " ")

    try:
        title, description = parse_txt_file(full_path)
    except Exception as e:
        print(f"❌ Failed to parse file {file_name}: {e}", flush=True)
        return False

    key_index = random.randint(0, len(API_KEYS) - 1)
    verdict = check_description_wrapper(key_index, title, description, product)

    if verdict == "yes":
        output_path = os.path.join(RELEVANT_DIR, file_name)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(f"Title: {title}\n\nDescription:\n{description}")
        print(f"✅ Saved qualified: {output_path}", flush=True)
        return True
    else:
        print("🚫 Not qualified", flush=True)
        return False

def delayed_process(file_name, delay, result_list):
    time.sleep(delay)
    result = process_file(file_name)
    result_list.append(result)

def main():
    print("🚀 Starting Gemini relevance filter (ALL .txt files)...\n", flush=True)
    txt_files = [f for f in os.listdir(DESCR_DIR) if f.endswith(".txt")]

    print(f"🔎 Found {len(txt_files)} .txt files.\n", flush=True)
    manager = Manager()
    results = manager.list()
    processes = []

    for i, file_name in enumerate(txt_files):
        delay = i * DELAY_BETWEEN_LAUNCHES
        p = Process(target=delayed_process, args=(file_name, delay, results))
        p.start()
        processes.append(p)

    for p in processes:
        p.join()

    qualified_count = sum(1 for success in results if success)
    print(f"\n🎉 Done! Total qualified: {qualified_count}", flush=True)

if __name__ == "__main__":
    main()
