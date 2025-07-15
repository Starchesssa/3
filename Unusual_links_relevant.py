
import os
import time
import string
import random
import re
from multiprocessing import Process, Queue, current_process
from google import genai
from google.genai import types

# === Configuration ===
DESCR_DIR = "Unuusual_memory/DESCR"
RELEVANT_DIR = "Unuusual_memory/Relevant"
MAX_GROUP = 33
WAIT_BETWEEN_CALLS = 61  # seconds
PARALLEL_WORKERS = 4

# Load API keys
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5"),
]
API_KEYS = [k for k in API_KEYS if k]
if not API_KEYS:
    raise ValueError("No GEMINI_API keys found!")

MODEL = "gemini-2.5-flash"
os.makedirs(RELEVANT_DIR, exist_ok=True)

def normalize_response(text: str) -> str:
    return text.strip().lower().translate(str.maketrans('', '', string.punctuation))

def parse_txt_file(file_path):
    with open(file_path, "r") as f:
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

def extract_group_key(filename):
    match = re.match(r"(\d+)(?:(\w))?_", filename)
    if match:
        num = int(match.group(1))
        letter = match.group(2) or ''
        return (num, letter.lower())
    return (float('inf'), '')

def check_description(api_key, title, description, product):
    try:
        client = genai.Client(api_key=api_key)
        prompt = (
            f"Here is a YouTube video title and description:\n\n"
            f"Title: {title}\n\n"
            f"Description:\n{description}\n\n"
            f"Is this video solely about the product '{product}'?\n"
            f"Also the video should not be like a compilation video containing many products. "
            f"It should be just about the product. Respond only with Yes or No."
        )
        contents = [types.Content(role="user", parts=[types.Part(text=prompt)])]
        config = types.GenerateContentConfig(response_mime_type="text/plain")
        response = client.models.generate_content(model=MODEL, contents=contents, config=config)
        result = normalize_response(response.text)
        print(f"✅ [{title[:40]}...] => {response.text.strip()} (PID:{current_process().pid})", flush=True)
        return "yes" if result == "yes" else "no"
    except Exception as e:
        print(f"❌ Error on '{title[:30]}' => {e} (PID:{current_process().pid})", flush=True)
        return "no"

def worker(api_key, task_queue):
    while not task_queue.empty():
        try:
            file_name = task_queue.get_nowait()
        except:
            break

        product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")
        full_path = os.path.join(DESCR_DIR, file_name)

        try:
            title, description = parse_txt_file(full_path)
        except Exception as e:
            print(f"❌ Failed to parse file {file_name}: {e}", flush=True)
            continue

        verdict = check_description(api_key, title, description, product)

        if verdict == "yes":
            output_path = os.path.join(RELEVANT_DIR, file_name)
            try:
                with open(output_path, "w") as f:
                    f.write(f"Title: {title}\n\nDescription:\n{description}")
                print(f"✅ Saved qualified: {output_path}", flush=True)
            except Exception as e:
                print(f"⚠️ Could not save file {file_name}: {e}", flush=True)
        else:
            print(f"🚫 Not qualified: {file_name}", flush=True)

        print(f"⏳ Waiting {WAIT_BETWEEN_CALLS} seconds before next call... (PID:{current_process().pid})", flush=True)
        time.sleep(WAIT_BETWEEN_CALLS)

def main():
    print("🚀 Starting Gemini relevance filter (title/desc based)...\n", flush=True)

    txt_files = [
        f for f in os.listdir(DESCR_DIR)
        if f.endswith(".txt") and re.match(r"\d+(\w)?_", f)
    ]

    sorted_files = sorted(txt_files, key=extract_group_key)

    # Filter files: Only process groups 1 to MAX_GROUP
    filtered_files = [
        f for f in sorted_files
        if extract_group_key(f)[0] <= MAX_GROUP
    ]

    print(f"🔎 Processing files in order (group 1 to {MAX_GROUP}) — Total: {len(filtered_files)}\n", flush=True)

    task_queue = Queue()
    for f in filtered_files:
        task_queue.put(f)

    processes = []
    for i in range(min(PARALLEL_WORKERS, len(API_KEYS))):
        p = Process(target=worker, args=(API_KEYS[i], task_queue))
        p.start()
        processes.append(p)

    for p in processes:
        p.join()

    qualified_total = len(os.listdir(RELEVANT_DIR))
    print(f"\n🎉 Done! Total qualified saved files: {qualified_total}", flush=True)

if __name__ == "__main__":
    main()
