
import os
import time
from google import genai
from google.genai import types

# === Configuration ===
TRANSCRIPT_DIR = "Unuusual_memory/TRANSCRIPT"
OUTPUT_DIR = "Unuusual_memory/TIMELINE"
WAIT_BETWEEN_FILES = 40  # seconds (adjustable)
MODEL = "gemini-2.5-flash"

API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5")
]
API_KEYS = [key for key in API_KEYS if key]
if not API_KEYS:
    raise ValueError("❌ No valid Gemini API keys found.")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# === Gemini Request ===
def analyze_transcript(file_path, api_key_index):
    with open(file_path, "r") as f:
        transcript = f.read()

    for attempt in range(len(API_KEYS)):
        real_index = (api_key_index + attempt) % len(API_KEYS)
        try:
            client = genai.Client(api_key=API_KEYS[real_index])
            prompt = f"""
You are given a transcript of a video with timestamps and words.

Your task:
- Identify and extract only the product name(s) mentioned in the transcript along with their respective chapters.
- Return the output strictly in this format:
mm:ss-mm:ss: Product Name  
mm:ss-mm:ss: Product Name  
mm:ss-mm:ss: Product Name

⚠️ Important:
- Only include chapters and product names. No extra text, no explanations.
- Do not include "00:" hour prefix. Only minutes and seconds (mm:ss).
- Be precise. Combine the timestamps if they are continuous for the same product.

Here is the transcript:
{transcript}
"""
            contents = [types.Content(role="user", parts=[types.Part(text=prompt)])]
            config = types.GenerateContentConfig(response_mime_type="text/plain")
            response = client.models.generate_content(
                model=MODEL, contents=contents, config=config
            )
            return response.text.strip()
        except Exception as e:
            print(f"🔁 Retry {attempt + 1} with API#{real_index + 1} => Error: {e}", flush=True)
            time.sleep(1)
    print(f"❌ Failed for file: {file_path}", flush=True)
    return ""

# === Process Files ===
def main():
    txt_files = sorted(
        [f for f in os.listdir(TRANSCRIPT_DIR) if f.endswith(".txt")],
    )

    for idx, file_name in enumerate(txt_files):
        file_path = os.path.join(TRANSCRIPT_DIR, file_name)
        print(f"\n📄 Processing: {file_name}", flush=True)

        result = analyze_transcript(file_path, idx % len(API_KEYS))
        if result:
            output_path = os.path.join(OUTPUT_DIR, file_name)
            with open(output_path, "w") as f_out:
                f_out.write(result)
            print(f"✅ Saved timeline to: {output_path}", flush=True)
        else:
            print(f"🚫 No result for {file_name}", flush=True)

        print(f"⏳ Waiting {WAIT_BETWEEN_FILES}s before next file...\n", flush=True)
        time.sleep(WAIT_BETWEEN_FILES)

    print("\n🎉 All files processed!", flush=True)


if __name__ == "__main__":
    main()
