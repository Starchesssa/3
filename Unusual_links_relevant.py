
import os
import time
import string
import random
import re
from multiprocessing import Pool, Manager
import concurrent.futures
from google import genai
from google.genai import types

# === Configuration ===
DESCR_DIR = "Unuusual_memory/DESCR"
RELEVANT_DIR = "Unuusual_memory/Relevant"
TIMEOUT_PER_REQUEST = 45
PARALLEL_JOBS = 4
API_COOLDOWN = 61  # seconds

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

def wait_if_needed(api_index, last_used_dict):
    now = time.time()
    last_used = last_used_dict.get(api_index, 0)
    wait_time = API_COOLDOWN - (now - last_used)
    if wait_time > 0:
        print(f"⏳ Waiting {int(wait_time)}s for API#{api_index + 1} cooldown...", flush=True)
        time.sleep(wait_time)

def check_description_wrapper(api_key_index, title, description, product, last_used_dict):
    for attempt in range(len(API_KEYS)):
        real_index = (api_key_index + attempt) % len(API_KEYS)
        try:
            wait_if_needed(real_index, last_used_dict)
            client = genai.Client(api_key=API_KEYS[real_index])

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

            last_used_dict[real_index] = time.time()  # Update cooldown timer
            result = normalize_response(response.text)
            print(f"✅ [{title[:40]}...] => {response.text.strip()} (API#{real_index + 1})", flush=True)
            return ("yes" if result == "yes" else "no", title, description)
        except Exception as e:
            print(f"🔁 Retry {attempt + 1}/{len(API_KEYS)} on '{title[:30]}' (API#{real_index + 1}) => Error: {e}", flush=True)
            time.sleep(1)
    print(f"❌ [{title[:30]}...] => All retries failed.", flush=True)
    return ("no", title, description)

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

def process_file(args):
    file_name, last_used_dict = args
    full_path = os.path.join(DESCR_DIR, file_name)
    product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")

    try:
        title, description = parse_txt_file(full_path)
    except Exception as e:
        print(f"❌ Failed to parse file {file_name}: {e}", flush=True)
        return False

    key_index = random.randint(0, len(API_KEYS) - 1)

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(check_description_wrapper, key_index, title, description, product, last_used_dict)
        try:
            verdict, title, description = future.result(timeout=TIMEOUT_PER_REQUEST)
            if verdict == "yes":
                output_path = os.path.join(RELEVANT_DIR, file_name)
                with open(output_path, "w") as f:
                    f.write(f"Title: {title}\n\nDescription:\n{description}")
                print(f"✅ Saved qualified: {output_path}", flush=True)
                return True
            else:
                print("🚫 Not qualified", flush=True)
                return False
        except concurrent.futures.TimeoutError:
            print(f"⏱️ Timeout on file: {file_name}", flush=True)
            return False
        except Exception as e:
            print(f"⚠️ Error processing {file_name}: {e}", flush=True)
            return False

def main():
    print("🚀 Starting Gemini relevance filter (title/desc based)...\n", flush=True)

    txt_files = [
        f for f in os.listdir(DESCR_DIR)
        if f.endswith(".txt") and re.match(r"\d+(\w)?_", f)
    ]

    sorted_files = sorted(txt_files, key=extract_group_key)

    filtered_files = [
        f for f in sorted_files
        if extract_group_key(f)[0] <= 33
    ]

    print(f"🔎 Processing in exact order from group 1 to 33 (total files: {len(filtered_files)})\n", flush=True)

    with Manager() as manager:
        last_used_dict = manager.dict()

        with Pool(processes=PARALLEL_JOBS) as pool:
            args_list = [(file, last_used_dict) for file in filtered_files]
            results = pool.map(process_file, args_list)

        qualified_count = sum(1 for r in results if r)
        print(f"\n🎉 Done! Total qualified: {qualified_count}", flush=True)

if __name__ == "__main__":
    main()
