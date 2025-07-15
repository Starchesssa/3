
import os
import time
import string
import random
from multiprocessing import Pool
import concurrent.futures
from google import genai
from google.genai import types

# === Configuration ===
DESCR_DIR = "Unuusual_memory/DESCR"
RELEVANT_DIR = "Unuusual_memory/Relevant"
TIMEOUT_PER_REQUEST = 45
PARALLEL_JOBS = 4

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

def check_description_wrapper(key_index, title, description, product):
    for attempt in range(len(API_KEYS)):
        real_index = (key_index + attempt) % len(API_KEYS)
        try:
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

def process_file(file_name):
    full_path = os.path.join(DESCR_DIR, file_name)
    product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")

    try:
        title, description = parse_txt_file(full_path)
    except Exception as e:
        print(f"❌ Failed to parse file {file_name}: {e}", flush=True)
        return False

    key_index = random.randint(0, len(API_KEYS) - 1)

    # Run check_description_wrapper with timeout using ThreadPoolExecutor
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(check_description_wrapper, key_index, title, description, product)
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
        if f.endswith(".txt") and f.split("_")[0].split("(")[0].strip().isdigit()
    ]

    filtered_files = []
    for f in sorted(txt_files, key=lambda x: int(f.split("_")[0].split("(")[0].strip())):
        num = int(f.split("_")[0].split("(")[0].strip())
        if num <= 33:
            filtered_files.append(f)

    print(f"🔎 Processing numbered groups 1 to 33 (total files: {len(filtered_files)})\n", flush=True)

    with Pool(processes=PARALLEL_JOBS) as pool:
        results = pool.map(process_file, filtered_files)

    qualified_count = sum(1 for r in results if r)
    print(f"\n🎉 Done! Total qualified: {qualified_count}", flush=True)

if __name__ == "__main__":
    main()
