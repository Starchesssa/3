
import os
import time
import string
import random
import subprocess
from multiprocessing import Pool, TimeoutError as MP_Timeout
from google import genai
from google.genai import types

# === Configuration ===
DESCR_DIR = "Unuusual_memory/DESCR"
RELEVANT_DIR = "Unuusual_memory/Relevant"
WAIT_BETWEEN_BATCHES = 5  # wait after each batch of parallel runs
TIMEOUT_PER_REQUEST = 45
MAX_FILE_NUMBER = 33
PARALLEL_WORKERS = 4  # adjust for number of parallel files to process

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
os.makedirs(RELEVANT_DIR, exist_ok=True)

def normalize_response(text: str) -> str:
    return text.strip().lower().translate(str.maketrans('', '', string.punctuation))

def check_description_wrapper(args):
    key_index, title, description, product = args
    for attempt in range(len(API_KEYS)):
        real_index = (key_index + attempt) % len(API_KEYS)
        try:
            client = genai.Client(api_key=API_KEYS[real_index])
            prompt = (
                f"Here is a YouTube video title and description:\n\n"
                f"Title: {title}\n\n"
                f"Description:\n{description}\n\n"
                f"Is this video solely about the product '{product}'?\n"
                f"The video should not be a compilation. Just respond Yes or No."
            )
            contents = [types.Content(role="user", parts=[types.Part(text=prompt)])]
            config = types.GenerateContentConfig(response_mime_type="text/plain")
            response = client.models.generate_content(model=MODEL, contents=contents, config=config)
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

def git_commit(file_path):
    try:
        subprocess.run(["git", "add", file_path], check=True)
        subprocess.run(["git", "commit", "-m", f"✅ Added relevant file: {os.path.basename(file_path)}"], check=True)
        print("📥 Git committed.", flush=True)
    except Exception as e:
        print(f"⚠️ Git commit failed: {e}", flush=True)

def process_file(file_name):
    full_path = os.path.join(DESCR_DIR, file_name)
    product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")
    try:
        title, description = parse_txt_file(full_path)
    except Exception as e:
        print(f"❌ Failed to parse file {file_name}: {e}", flush=True)
        return False

    args = (random.randint(0, len(API_KEYS) - 1), title, description, product)
    with Pool(processes=1) as pool:
        result = pool.apply_async(check_description_wrapper, (args,))
        try:
            verdict, title, description = result.get(timeout=TIMEOUT_PER_REQUEST)
            if verdict == "yes":
                output_path = os.path.join(RELEVANT_DIR, file_name)
                with open(output_path, "w") as f:
                    f.write(f"Title: {title}\n\nDescription:\n{description}")
                print(f"✅ Saved qualified: {output_path}", flush=True)
                git_commit(output_path)
                return True
            else:
                print("🚫 Not qualified", flush=True)
                return False
        except MP_Timeout:
            print(f"⏱️ Timeout on file: {file_name}", flush=True)
            return False
        except Exception as e:
            print(f"⚠️ Error processing {file_name}: {e}", flush=True)
            return False

def valid_file_number(name):
    try:
        part = name.split("_")[0]
        num_str = ''.join(filter(str.isdigit, part))
        return int(num_str)
    except:
        return -1

def main():
    print("🚀 Starting Gemini relevance filter (title/desc based)...\n", flush=True)

    txt_files = [
        f for f in os.listdir(DESCR_DIR)
        if f.endswith(".txt") and valid_file_number(f) > 0 and valid_file_number(f) <= MAX_FILE_NUMBER
    ]
    txt_files = sorted(txt_files, key=lambda x: valid_file_number(x))

    print(f"🔎 Processing files 1 to {MAX_FILE_NUMBER} (total: {len(txt_files)})\n", flush=True)

    qualified_count = 0
    with Pool(processes=PARALLEL_WORKERS) as pool:
        results = pool.map(process_file, txt_files)

    qualified_count = sum(1 for res in results if res)

    print(f"\n🎉 Done! Total qualified: {qualified_count}", flush=True)

if __name__ == "__main__":
    main()
