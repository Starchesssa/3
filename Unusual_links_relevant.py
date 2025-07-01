
import os
import time
import re
import string
from concurrent.futures import ThreadPoolExecutor, as_completed
from google import genai
from google.genai import types

# Constants
LINKS_DIR = "Unuusual_memory/Links"
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
MAX_QUALIFIED_TXT = 33
MAX_LINKS_TO_CHECK = 12
WAIT_TIME_BETWEEN_CALLS = 70  # seconds

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
for idx, key in enumerate(API_KEYS):
    if key:
        print(f"  ✅ API Key {idx + 1} loaded.")
        CLIENTS.append(genai.Client(api_key=key))
    else:
        raise ValueError(f"❌ API Key {idx + 1} not set (GEMINI_API{'' if idx == 0 else idx + 1}).")

generate_content_config = types.GenerateContentConfig(response_mime_type="text/plain")

def normalize_response(text: str) -> str:
    text = text.strip().lower()
    text = text.strip(string.punctuation)
    return text

def retry_delay():
    print("\n🕒 Waiting 70 seconds before retrying...")
    for i in range(WAIT_TIME_BETWEEN_CALLS, 0, -1):
        if i % 10 == 0 or i <= 5:
            print(f"  - Retry wait: {i} seconds remaining...")
        time.sleep(1)
    print("🔁 Retry wait complete.\n")

def process_link(link, product, model, client, client_index, retries=0):
    print(f"\n🔍 Submitting link to Gemini:\n  - Link: {link}\n  - Product: {product}\n  - Model: {model}\n  - Client Index: {client_index}\n  - Retry Attempt: {retries}")

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
        response_obj = client.models.generate_content(
            model=model, contents=contents, config=generate_content_config
        )
        response_text = normalize_response(response_obj.text)
        print(f"🧾 Gemini Response: '{response_obj.text.strip()}'")

        if response_text == "yes":
            print(f"✅ Relevant: {link} is about '{product}'.")
            return link, "yes"
        elif response_text == "no":
            print(f"🚫 Not Relevant: {link} is not about '{product}'.")
            return link, "no"
        else:
            print(f"⚠️ Unexpected Response: '{response_obj.text.strip()}' — treating as NO")
            return link, "no"
    except Exception as e:
        print(f"❌ Error calling Gemini for {link}: {e}")
        if retries < 1:
            retry_delay()  # ✅ wait 70s before retrying
            return process_link(link, product, model, client, client_index, retries + 1)
        else:
            print(f"⏭️ Giving up on {link} after 2 attempts.")
            return link, "no"

def countdown_timer(seconds):
    print(f"\n⏳ Waiting {seconds} seconds before next batch...")
    for remaining in range(seconds, 0, -1):
        if remaining % 10 == 0 or remaining <= 5:
            print(f"  - {remaining} seconds remaining...")
        time.sleep(1)
    print("✅ Wait complete. Continuing...\n")

def process_links():
    qualified_files = 0

    txt_files = sorted(
        [f for f in os.listdir(LINKS_DIR) if re.match(r"^\d+_.+\.txt$", f)],
        key=lambda x: int(x.split("_")[0])
    )

    print(f"\n📁 Found {len(txt_files)} link files in '{LINKS_DIR}'.")

    for file_index, file_name in enumerate(txt_files):
        if qualified_files >= MAX_QUALIFIED_TXT:
            print(f"\n✅ Limit reached: {qualified_files} qualified files.")
            break

        print(f"\n📄 [{file_index+1}/{len(txt_files)}] Checking file: {file_name}")
        full_path = os.path.join(LINKS_DIR, file_name)
        with open(full_path, "r") as f:
            links = [line.strip() for line in f if line.strip()]

        product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")
        print(f"🔎 Target Product: '{product}' with {len(links)} links")
        checked_links = links[:MAX_LINKS_TO_CHECK]

        results = {}

        print("🚀 Submitting links to Gemini...")
        with ThreadPoolExecutor(max_workers=len(checked_links)) as executor:
            futures = []
            for idx, link in enumerate(checked_links):
                model = GEMINI_MODELS[idx % len(GEMINI_MODELS)]
                client = CLIENTS[idx % len(CLIENTS)]
                futures.append(executor.submit(process_link, link, product, model, client, idx % len(CLIENTS)))

            for future in as_completed(futures):
                try:
                    link, result = future.result(timeout=150)
                    results[link] = result
                    print(f"🔎 Final Result: {link} => {result.upper()}")
                except Exception as e:
                    print(f"❌ Future Error: {e}")

        qualified_links = [link for link, answer in results.items() if answer == "yes"]
        if qualified_links:
            save_path = os.path.join(RELEVANT_DIR, file_name)
            with open(save_path, "w") as out_f:
                out_f.write("\n".join(qualified_links))
            print(f"📥 Saved {len(qualified_links)} qualified links to '{save_path}'")
            qualified_files += 1
        else:
            print(f"❌ No qualified links for '{file_name}'")

        countdown_timer(WAIT_TIME_BETWEEN_CALLS)

    print(f"\n🏁 DONE! Total qualified files saved: {qualified_files}")

if __name__ == "__main__":
    print("🏁 Starting processing script...")
    process_links()
