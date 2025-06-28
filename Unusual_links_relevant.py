
import os
import time
from google import genai
from google.genai import types

# Constants
LINKS_DIR = "Unuusual_memory/Links"
RELEVANT_DIR = "Unuusual_memory/Relevant_links"
MAX_QUALIFIED_TXT = 11
MAX_LINKS_TO_CHECK = 5
WAIT_TIME_BETWEEN_LINKS = 70  # seconds

# Initialize Gemini client
print("🔐 Initializing Gemini client...")
client = genai.Client(api_key=os.environ.get("GEMINI_API"))

# Use Gemini 1.5 Flash (latest)
model = "gemini-2.5-flash"
generate_content_config = types.GenerateContentConfig(response_mime_type="text/plain")

# Ensure the output directory exists
print(f"📁 Ensuring output directory '{RELEVANT_DIR}' exists...")
os.makedirs(RELEVANT_DIR, exist_ok=True)

def check_video_relevance(link: str, product: str) -> str:
    """Uses Gemini to verify if a video is solely about a given product."""
    print(f"🤖 Asking Gemini if this video is only about '{product}'...")

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part(
                    file_data=types.FileData(
                        file_uri=link,
                        mime_type="video/*",
                    )
                ),
                types.Part(
                    text=f"Is this video solely about the '{product}'?\n"
                         "The video should be entirely focused on this one product, not a compilation or list.\n"
                         "Respond with one word only: Yes or No. Make sure you output yes or no only. "
                         "If the video is about the product say yes; if not, say no. Just answer yes or no only."
                ),
            ],
        )
    ]

    try:
        for chunk in client.models.generate_content_stream(
            model=model, contents=contents, config=generate_content_config
        ):
            response = chunk.text.strip().lower()
            if response in {"yes", "no"}:
                print(f"🧠 Gemini answered: {response.upper()}")
                return response
    except Exception as e:
        print(f"❌ Error processing link '{link}': {e}")
    
    print("⚠️ Defaulting to 'no' due to error or invalid response.")
    return "no"

def process_links():
    qualified_files = 0

    # Sort input files by their numeric prefix
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

        for i, link in enumerate(checked_links, 1):
            print(f"\n🔗 Checking link {i}/{MAX_LINKS_TO_CHECK}: {link}")
            verdict = check_video_relevance(link, product)
            if verdict == "yes":
                qualified_links.append(link)
            print(f"⏳ Waiting {WAIT_TIME_BETWEEN_LINKS} seconds to avoid rate limits...\n")
            time.sleep(WAIT_TIME_BETWEEN_LINKS)

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
