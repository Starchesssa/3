
import os
from multiprocessing import Pool, TimeoutError as MP_Timeout
import google.generativeai as genai
from google.generativeai import types

DESCRIPTION_DIR = "Unuusual_memory/DESCREPTION"
OUTPUT_DIR = "Unuusual_memory/SCRIPT"
TIMEOUT_PER_REQUEST = 60  # seconds per file
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5"),
]
API_KEYS = [key for key in API_KEYS if key]
if not API_KEYS:
    raise ValueError("❌ No valid GEMINI_API keys found.")

MODEL = "gemini-2.5-flash"


def get_description_files():
    """Fetch description files starting with 'group_'."""
    return sorted([
        file for file in os.listdir(DESCRIPTION_DIR)
        if file.startswith("group_") and file.endswith(".txt")
    ])


def process_file(args):
    api_index, filename = args
    api_key = API_KEYS[api_index]
    filepath = os.path.join(DESCRIPTION_DIR, filename)

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            video_content = f.read().strip()

        prompt = (
            "From the following title and description of a YouTube video, give me the product name and its script of less than 97 words.\n"
            "Give me the result in this structured format exactly:\n\n"
            "Product name: (product name here)\n\n"
            "Script: (script here, less than 97 words)\n\n"
            "Here is the YouTube video content:\n\n"
            f"{video_content}"
        )

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name=MODEL)

        response = model.generate_content(
            [types.Content(role="user", parts=[types.Part.from_text(prompt)])]
        )

        result_text = response.text.strip()
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        output_path = os.path.join(OUTPUT_DIR, filename)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(result_text + "\n")

        print(f"✅ {filename} processed with API#{api_index + 1}")
        return filename

    except Exception as e:
        print(f"❌ Error processing {filename} (API#{api_index + 1}): {e}")
        return None


def main():
    files = get_description_files()
    print(f"📂 Found {len(files)} description files.\n")

    args_list = [(i % len(API_KEYS), file) for i, file in enumerate(files)]

    with Pool(processes=len(API_KEYS)) as pool:
        results = []
        for args in args_list:
            res = pool.apply_async(process_file, (args,))
            results.append((args[1], res))

        for filename, res in results:
            try:
                res.get(timeout=TIMEOUT_PER_REQUEST)
            except MP_Timeout:
                print(f"⏱️ Timeout on {filename}")
            except Exception as e:
                print(f"⚠️ Error processing {filename}: {e}")

    print("\n🎉 Finished processing all files.")


if __name__ == "__main__":
    main()
