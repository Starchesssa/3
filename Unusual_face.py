
import os
import time
import string
from multiprocessing import Pool, TimeoutError as MP_Timeout
from google import genai
from google.genai import types

# === Configuration ===
LINKS_DIR = "Unuusual_memory/Relevant_links"
OUTPUT_DIR = "Unuusual_memory/FACE DETECTION"
MAX_QUALIFIED_TXT = 33
WAIT_BETWEEN_FILES = 70  # seconds
TIMEOUT_PER_REQUEST = 600  # 10 minutes per link

# === Load Gemini API keys ===
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
os.makedirs(OUTPUT_DIR, exist_ok=True)

# === Helpers ===
def check_video_wrapper(args):
    key_index, link, product = args
    for attempt in range(len(API_KEYS)):
        real_index = (key_index + attempt) % len(API_KEYS)
        try:
            client = genai.Client(api_key=API_KEYS[real_index])
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part(file_data=types.FileData(file_uri=link, mime_type="video/*")),
                        types.Part(text=f"""Watch the video carefully and create a detailed timestamp list showing exactly when a face appears and when it doesn’t.

Follow this exact format:

mm:ss-mm:ss: Face ({product})  
mm:ss-mm:ss: No face ({product})  
mm:ss-mm:ss: Face ({product})

Instructions:
1. Use mm:ss time format only (minutes and seconds, no hours).  
2. Be very precise with start and end time.  
3. Clearly write Face or No face.  
4. Whenever a face or no face appears, write the product name in parentheses after "Face" (example: (Samsung Galaxy S25)).
""")
                    ],
                )
            ]
            config = types.GenerateContentConfig(response_mime_type="text/plain")
            response = client.models.generate_content(model=MODEL, contents=contents, config=config)
            result = response.text.strip()
            print(f"✅ [{link}] => Success (API#{real_index + 1})", flush=True)
            return (link, result)
        except Exception as e:
            print(f"🔁 Retry {attempt + 1}/{len(API_KEYS)} on {link} (API#{real_index + 1}) => Error: {e}", flush=True)
            time.sleep(1)

    print(f"❌ [{link}] => All retries failed.", flush=True)
    return (link, "")

def wait_between_files(seconds):
    print(f"\n⏱️ Waiting {seconds} seconds before next file...", flush=True)
    for i in range(seconds, 0, -1):
        if i <= 5 or i % 10 == 0:
            print(f"  ...{i}s", flush=True)
        time.sleep(1)
    print("✅ Wait complete.\n", flush=True)

# === Process Each File ===
def process_file(file_name):
    full_path = os.path.join(LINKS_DIR, file_name)
    with open(full_path, "r") as f:
        links = [line.strip() for line in f if line.strip()]

    product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")
    args_list = [(i % len(API_KEYS), link, product) for i, link in enumerate(links)]

    print(f"🧪 Checking {len(links)} links with multiprocessing...", flush=True)
    with Pool(processes=len(args_list)) as pool:
        multiple_results = [pool.apply_async(check_video_wrapper, (args,)) for args in args_list]
        for i, res in enumerate(multiple_results):
            link = args_list[i][1]
            try:
                link, result = res.get(timeout=TIMEOUT_PER_REQUEST)
                if result:
                    output_filename = f"{file_name.split('_')[0]}({chr(97 + i)})_{file_name.split('_',1)[1]}"
                    output_path = os.path.join(OUTPUT_DIR, output_filename)
                    with open(output_path, "w") as f_out:
                        f_out.write(result)
                    print(f"✅ Saved result to: {output_path}", flush=True)
                else:
                    print(f"🚫 No result for {link}", flush=True)
            except MP_Timeout:
                print(f"⏱️ Timeout on: {link}", flush=True)
            except Exception as e:
                print(f"⚠️ Error processing {link}: {e}", flush=True)

# === Main Script ===
def main():
    print("🚀 Starting Gemini Face Detection Timestamping...\n", flush=True)
    txt_files = sorted(
        [
            f for f in os.listdir(LINKS_DIR)
            if f.endswith(".txt") and f[0].isdigit()
        ],
        key=lambda x: int(x.split("_")[0])
    )

    processed_count = 0
    for index, file_name in enumerate(txt_files):
        if processed_count >= MAX_QUALIFIED_TXT:
            break

        print(f"\n📂 File [{index + 1}/{len(txt_files)}]: {file_name}", flush=True)
        try:
            process_file(file_name)
            processed_count += 1
        except Exception as e:
            print(f"❌ Unexpected error: {e}", flush=True)

        wait_between_files(WAIT_BETWEEN_FILES)

    print(f"\n🎉 Finished! Total files processed: {processed_count}", flush=True)

if __name__ == "__main__":
    main()
