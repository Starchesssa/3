
import os
import time
from google import genai
from google.genai import types

# === Configuration ===
SCRIPT_DIR = "Unuusual_memory/SCRIPT"
TRANSCRIPT_DIR = "Unuusual_memory/TRANSCRIPT"
OUTPUT_DIR = "Unuusual_memory/TIMELINE"
WAIT_BETWEEN_FILES = 40  # seconds
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

# === Helper: Find Transcript Matching Group ===
def find_transcript_file(group_number, transcript_files):
    for file_name in transcript_files:
        parts = file_name.replace(".txt", "").split("_to_")
        if len(parts) == 2:
            try:
                start = int(parts[0].split("group_")[-1])
                end = int(parts[1])
                if start <= group_number <= end:
                    return file_name
            except:
                continue
    return None

# === Gemini Request ===
def analyze_script_with_transcript(product_name, script, transcript, api_key_index):
    for attempt in range(len(API_KEYS)):
        real_index = (api_key_index + attempt) % len(API_KEYS)
        try:
            client = genai.Client(api_key=API_KEYS[real_index])
            prompt = f"""
You are given:
1. Product Name: {product_name}
2. Script of the video.
3. Full Transcript (timeline).

Your task:
- Analyze the transcript and find the **exact timestamp chapter** where the given script starts and ends.
- Return only the chapter timestamps (start and end) covering the entire script.

⚠️ Rules:
- Only output the chapter timestamps where the **entire script** (given above) appears within the transcript.
- Output format (strict):
mm:ss-mm:ss (no extra text, no explanations)
- Do NOT include "00:" hour prefix, only mm:ss format.
- Be precise, cover the whole script section.

Here is the script:
{script}

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
    print("❌ Failed to process Gemini request.", flush=True)
    return ""

# === Main Processing ===
def main():
    script_files = sorted(
        [f for f in os.listdir(SCRIPT_DIR) if f.endswith(".txt")],
    )
    transcript_files = sorted(
        [f for f in os.listdir(TRANSCRIPT_DIR) if f.endswith(".txt")],
    )

    for idx, script_file in enumerate(script_files):
        group_number = int(script_file.replace("group_", "").replace(".txt", ""))
        transcript_file = find_transcript_file(group_number, transcript_files)

        if not transcript_file:
            print(f"🚫 No transcript found for {script_file}", flush=True)
            continue

        # Load script file (product + script)
        with open(os.path.join(SCRIPT_DIR, script_file), "r") as f:
            content = f.read()
        product_line, script_line = content.strip().split("\n\n", 1)
        product_name = product_line.replace("Product name:", "").strip()
        script_text = script_line.replace("Script:", "").strip()

        # Load transcript
        with open(os.path.join(TRANSCRIPT_DIR, transcript_file), "r") as f:
            transcript = f.read()

        print(f"\n📄 Processing: {script_file} with {transcript_file}", flush=True)

        # Gemini Analysis
        result = analyze_script_with_transcript(product_name, script_text, transcript, idx % len(API_KEYS))
        if result:
            output_path = os.path.join(OUTPUT_DIR, script_file)
            with open(output_path, "w") as f_out:
                f_out.write(result)
            print(f"✅ Saved chapter timeline to: {output_path}", flush=True)
        else:
            print(f"🚫 No result for {script_file}", flush=True)

        print(f"⏳ Waiting {WAIT_BETWEEN_FILES}s before next file...\n", flush=True)
        time.sleep(WAIT_BETWEEN_FILES)

    print("\n🎉 All files processed!", flush=True)


if __name__ == "__main__":
    main()
