
import os
import time
from google import genai
from google.genai import types

# Constants
LINKS_DIR = "Unuusual_memory/Links"
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
MAX_QUALIFIED_TXT = 11
MAX_LINKS_TO_CHECK = 10
WAIT_TIME_BETWEEN_MODEL_CALLS = 70  # seconds

GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite-preview-06-17",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]

# Initialize Gemini
print("🔐 Initializing Gemini client...")
client = genai.Client(api_key=os.environ.get("GEMINI_API"))
generate_content_config = types.GenerateContentConfig(response_mime_type="text/plain")

# Ensure output directory exists
print(f"📁 Ensuring output directory '{RELEVANT_DIR}' exists...")
os.makedirs(RELEVANT_DIR, exist_ok=True)


def ask_gemini(model: str, link: str, product: str) -> str:
    """Asks a single Gemini model if a video is solely about the product."""
    print(f"🤖 [{model}] Asking Gemini about '{product}'...")
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part(
                    file_data=types.FileData(file_uri=link, mime_type="video/*")
                ),
                types.Part(
                    text=f"Is this video solely about the '{product}'?\n"
                         "The video should be entirely focused on this one product, not a compilation or list.\n"
                         "Respond with one word only: Yes or No. Make sure you output yes or no only."
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
                    print(f"🧠 [{model}] Answered: {response.upper()}")
                    return response
    except Exception as e:
        print(f"❌ [{model}] Error for link '{link}': {e}")

    print(f"⚠️ [{model}] Defaulting to 'no' due to error or invalid response.")
    return None  # Important: return None so we can try next model


def check_link_with_models(link: str, product: str) -> str:
    """Checks the link with all models until one returns a valid answer."""
    for model in GEMINI_MODELS:
        response = ask_gemini(model, link, product)
        time.sleep(WAIT_TIME_BETWEEN_MODEL_CALLS)

        if response in {"yes", "no"}:
            return response

    print(f"❌ All models failed for link: {link}")
    return "no"  # Fail-safe


def process_links():
    qualified_files = 0

    print(f"📑 Reading .txt files from '{LINKS_DIR}'...")
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
        print(f"🔍 Product identified: '{product}' with {len(links)} total links")

        checked_links = links[:MAX_LINKS_TO_CHECK]
        qualified_links = []

        for link in checked_links:
            decision = check_link_with_models(link, product)
            if decision == "yes":
                qualified_links.append(link)

        if len(qualified_links) >= 3:
            save_path = os.path.join(RELEVANT_DIR, file_name)
            with open(save_path, "w") as out_f:
                out_f.write("\n".join(qualified_links))
            print(f"✅ File '{file_name}' qualified with {len(qualified_links)} links. Saved!")
            qualified_files += 1
        else:
            print(f"❌ File '{file_name}' disqualified (only {len(qualified_links)} links passed).")

    print(f"\n🏁 Finished! Total qualified files saved: {qualified_files}")


if __name__ == "__main__":
    process_links()
