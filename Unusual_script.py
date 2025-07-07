
import os
from google import genai
from google.genai import types

DESCRIPTION_DIR = "Unuusual_memory/DESCREPTION"
OUTPUT_DIR = "Unuusual_memory/SCRIPT"

def get_description_files():
    files = []
    for file in os.listdir(DESCRIPTION_DIR):
        if file.startswith("group_") and file.endswith(".txt"):
            files.append(file)
    return sorted(files)  # Optional: for ordered processing

def call_gemini_api(prompt):
    try:
        client = genai.Client(api_key=os.environ.get("GEMINI_API"))
        model = "gemini-2.5-flash"
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
        config = types.GenerateContentConfig(response_mime_type="text/plain")
        full_response = ""
        for chunk in client.models.generate_content_stream(model=model, contents=contents, config=config):
            full_response += chunk.text
        return full_response.strip()
    except Exception as e:
        print(f"❌ Gemini API failed: {e}")
        return None

def process_file(filename):
    filepath = os.path.join(DESCRIPTION_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        video_content = f.read().strip()

    prompt = (
        "From the following title and description of a YouTube video, give me the product name and its script of less than 97 words.\n"
        "Give me the result in this structured format exactly:\n\n"
        "Product name: (product name here)\n\n"
        "Script: (script here, less than 97 words)\n\n"
        "Here is the YouTube video content:\n\n"
        f"{video_content}"
    )

    result = call_gemini_api(prompt)
    return result

def save_output(content, filename):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, filename)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content + '\n')

def main():
    files = get_description_files()
    print(f"📂 Found {len(files)} description files.")

    for file in files:
        print(f"\n📄 Processing {file}...")
        result = process_file(file)
        if result:
            save_output(result, file)
            print(f"✅ Output saved to SCRIPT/{file}")
        else:
            print(f"⚠️ Failed to get result for {file}")

if __name__ == "__main__":
    main()
