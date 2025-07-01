
import os
import time
import threading
import queue
from google import genai
from google.genai import types

# Constants
LINKS_DIR = "Unuusual_memory/Links"
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
MAX_QUALIFIED_TXT = 33
MAX_LINKS_TO_CHECK = 12
WAIT_TIME_BETWEEN_CALLS = 70  # per model

GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite-preview-06-17",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]

# Initialize Gemini client
print("🔐 Initializing Gemini client...")
client = genai.Client(api_key=os.environ.get("GEMINI_API"))
generate_content_config = types.GenerateContentConfig(response_mime_type="text/plain")

# Ensure output directory exists
print(f"📁 Ensuring output directory '{RELEVANT_DIR}' exists...")
os.makedirs(RELEVANT_DIR, exist_ok=True)


class LinkJob:
    def __init__(self, link, product, result_dict, lock):
        self.link = link
        self.product = product
        self.result_dict = result_dict
        self.lock = lock


def worker(model, task_queue: queue.Queue):
    print(f"🚀 Worker started for model: {model}")
    while True:
        try:
            job = task_queue.get(timeout=30)
        except queue.Empty:
            print(f"⏹️ Worker for {model} exiting: no more tasks.")
            break

        print(f"🤖 [{model}] Checking: {job.link}")
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part(
                        file_data=types.FileData(file_uri=job.link, mime_type="video/*")
                    ),
                    types.Part(
    text=(
        f"Is this video solely about the '{job.product}'?\n"
        f"The video should be focused on '{job.product}'.\n"
        "Respond with one word only: Yes or No. Make sure you output yes or no only."
    )
),
                    ),
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
                        with job.lock:
                            job.result_dict[job.link] = response
                        print(f"✅ [{model}] {job.link} => {response.upper()}")
                        break
        except Exception as e:
            print(f"❌ [{model}] Error for {job.link}: {e}")
            task_queue.put(job)

        time.sleep(WAIT_TIME_BETWEEN_CALLS)
        task_queue.task_done()


def process_links():
    qualified_files = 0

    txt_files = sorted(
        [f for f in os.listdir(LINKS_DIR) if f.endswith(".txt")],
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

        # Setup thread-safe queue and result collector
        task_queue = queue.Queue()
        results = {}
        lock = threading.Lock()

        for link in checked_links:
            task_queue.put(LinkJob(link, product, results, lock))

        # Start one thread per model
        threads = []
        for model in GEMINI_MODELS:
            t = threading.Thread(target=worker, args=(model, task_queue))
            t.start()
            threads.append(t)

        # Wait for queue to be fully processed
        task_queue.join()

        for t in threads:
            t.join()

        qualified_links = [link for link, answer in results.items() if answer == "yes"]
        if len(qualified_links) >= 3:
            save_path = os.path.join(RELEVANT_DIR, file_name)
            with open(save_path, "w") as out_f:
                out_f.write("\n".join(qualified_links))
            print(f"✅ File '{file_name}' qualified with {len(qualified_links)} links. Saved!")
            qualified_files += 1
        else:
            print(f"❌ File '{file_name}' disqualified (only {len(qualified_links)} passed).")

    print(f"\n🏁 Finished! Total qualified files saved: {qualified_files}")


if __name__ == "__main__":
    process_links()
