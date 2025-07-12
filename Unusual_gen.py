
import os
import subprocess
from datetime import datetime
from google import genai
from google.genai import types

INPUT_DIR = "Unuusual_memory/SCRIPT"
OUTPUT_FILE = "Unuusual_memory/GROUP_GDG/group_gdg.txt"

def find_txt_files(directory):
    valid_files = []
    for filename in os.listdir(directory):
        if filename.endswith(".txt") and not filename.endswith((".py", ".json", ".js")):
            valid_files.append(os.path.join(directory, filename))
    return sorted(valid_files)

def extract_product_name(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.lower().startswith("product name:"):
                return line.split(":", 1)[1].strip()
    return None

def call_gemini_api(product_name):
    try:
        client = genai.Client(api_key=os.environ.get("GEMINI_API"))
        model = "gemini-2.5-flash"
        prompt = (
            f"Given the product name: \"{product_name}\", extract a generic gadget type name "
            "that describes what kind of gadget it is, without mentioning any brand, company, or model. "
            "Example:\n"
            "If the product is 'Roomba J9+', respond with 'self-cleaning robot'.\n"
            "If the product is 'Ecovacs Winbot X', respond with 'window cleaning robot'.\n"
            "Just give a 2–4 word generic name. No explanation. No brand. Just the type."
        )
        contents = [types.Content(role="user", parts=[types.Part.from_text(prompt)])]
        config = types.GenerateContentConfig(response_mime_type="text/plain")
        full_response = ""
        for chunk in client.models.generate_content_stream(model=model, contents=contents, config=config):
            full_response += chunk.text
        return full_response.strip()
    except Exception as e:
        print(f"❌ Gemini API failed for '{product_name}': {e}")
        return None

def save_output_block(file_name, product_name, generic_name, output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'a', encoding='utf-8') as f:
        f.write(f"\n--- {os.path.basename(file_name)} ---\n")
        f.write(f"Original Product Name: {product_name}\n")
        f.write(f"Generic Name: {generic_name}\n")

def commit_changes(file_to_commit):
    print(f"\n📦 Committing changes to GitHub: {file_to_commit}")
    try:
        subprocess.run(['git', 'config', '--global', 'user.name', 'product-namer-bot'], check=True)
        subprocess.run(['git', 'config', '--global', 'user.email', 'bot@example.com'], check=True)
        subprocess.run(['git', 'add', file_to_commit], check=True)
        result = subprocess.run(['git', 'diff', '--cached', '--quiet'])
        if result.returncode != 0:
            msg = f"✅ Update {file_to_commit} - {datetime.utcnow().isoformat()}"
            subprocess.run(['git', 'commit', '-m', msg], check=True)
            subprocess.run(['git', 'push'], check=True)
            print("✅ Changes committed and pushed.")
        else:
            print("ℹ️ No changes to commit.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Git commit failed: {e}")

def main():
    txt_files = find_txt_files(INPUT_DIR)
    if not txt_files:
        print("⚠️ No valid .txt files found.")
        return

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("📦 Generic Product Names Output\n")

    for file_path in txt_files:
        product_name = extract_product_name(file_path)
        if not product_name:
            print(f"⚠️ No product name found in {file_path}")
            continue

        print(f"\n🧠 Processing: {product_name}")
        generic_name = call_gemini_api(product_name)
        if generic_name:
            print(f"✅ Generic name: {generic_name}")
            save_output_block(file_path, product_name, generic_name, OUTPUT_FILE)
        else:
            print("⚠️ No result from Gemini")

    commit_changes(OUTPUT_FILE)
    print("\n🎉 Done.")

if __name__ == "__main__":
    main()
