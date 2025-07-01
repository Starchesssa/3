
import os
import time
import queue
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from google import genai
from google.genai import types

# Constants
LINKS_DIR = "Unuusual_memory/Links"
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
MAX_QUALIFIED_TXT = 33
MAX_LINKS_TO_CHECK = 12
WAIT_TIME_BETWEEN_CALLS = 70  # seconds per model

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

# Ensure output directory exists
os.makedirs(RELEVANT_DIR, exist_ok=True)

print("🔐 Initializing Gemini clients...")
CLIENTS = []
for key in API_KEYS:
    if key:
        CLIENTS.append(genai.Client(api_key=key))
    else:
        raise ValueError("❌ One or more API keys (GEMINI_API, GEMINI_API2, GEMINI_API3) are not set.")

generate_content_config = types.GenerateContentConfig(response_mime_type="text/plain")


def process_link(link, product, model, client, retries=0):
    print(f"🤖 [{model}] Checking: {link}")
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
        for chunk in client.models.generate_content_stream(
            model=model, contents=contents, config=generate_content_config
        ):
            if chunk and chunk.text:
                response = chunk.text.strip().lower()
                if response in {"yes", "no"}:
                    print(f"✅ [{model}] {link} => {response.upper()}")
                    return link, response
    except Exception as e:
        print(f"❌ [{model}] Error for {link}: {e}")
        if retries < 1:
            print(f"🔁 Retrying {link}")
            time.sleep(5)
            return process_link(link, product, model, client, retries + 1)
        else:
            print(f"⏭️ Skipping {link} after 2 attempts")
    return link, "no"


def process_links():
    qualified_files = 0

    txt_files = sorted(
        [f for f in os.listdir(LINKS_DIR) if re.match(r"^\d+_.+\.txt$", f)],
        key=lambda x: int(x.split("_")[0])
    )

    for file_name in txt_files:
        if qualified_files >= MAX_QUALIFIED_TXT:
            print(f"✅ Stopping: Collected {qualified_files} qualified files.")
            break

        print(f"\n📄 Processing file: {file_name}")
        full_path = os.path.join(LINKS_DIR, file_name)
        with open(full_path, "r") as f:
            links = [line.strip() for line in f if line.strip()]

        product = file_name.split("_", 1)[1].replace(".txt", "").replace("_", " ")
        print(f"🔍 Product: '{product}' with {len(links)} total links")
        checked_links = links[:MAX_LINKS_TO_CHECK]

        futures = []
        results = {}

        with ThreadPoolExecutor(max_workers=len(GEMINI_MODELS)) as executor:
            for idx, link in enumerate(checked_links):
                model = GEMINI_MODELS[idx % len(GEMINI_MODELS)]
                client = CLIENTS[idx % len(CLIENTS)]
                futures.append(executor.submit(process_link, link, product, model, client))

            for future in as_completed(futures):
                link, result = future.result()
                results[link] = result
                time.sleep(WAIT_TIME_BETWEEN_CALLS)

        qualified_links = [link for link, answer in results.items() if answer == "yes"]
        if len(qualified_links) >= 1:
            save_path = os.path.join(RELEVANT_DIR, file_name)
            with open(save_path, "w") as out_f:
                out_f.write("\n".join(qualified_links))
            print(f"🧿 File '{file_name}' qualified with {len(qualified_links)} links. Saved!")
            qualified_files += 1
        else:
            print(f"❌ File '{file_name}' disqualified (only {len(qualified_links)} passed).")

    print(f"\n🏁 Finished! Total qualified files saved: {qualified_files}")


if __name__ == "__main__":
    process_links()
