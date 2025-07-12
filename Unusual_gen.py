
import os
import time
import subprocess
from datetime import datetime
from google import genai

INPUT_DIR = "Unuusual_memory/SCRIPT"
OUTPUT_FILE = "Unuusual_memory/GROUP_GDG/group_gdg.txt"

# Load Gemini API keys from environment variables
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5"),
]
API_KEYS = [key for key in API_KEYS if key]
if not API_KEYS:
    raise RuntimeError("❌ No GEMINI_API keys found in environment.")

MODEL = "gemini-2.5-flash"
MAX_RETRIES = len(API_KEYS)
RETRY_DELAY = 2  # seconds

def find_txt_files(directory):
    return sorted(
        os.path.join(directory, fn)
        for fn in os.listdir(directory)
        if fn.lower().endswith(".txt")
    )

def extract_product_name(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.lower().startswith("product name:"):
                return line.split(":", 1)[1].strip()
    return None

def call_genai_with_retries(product_name):
    prompt = (
        f"Extract a generic gadget type name (2–4 words) for:\n"
        f"\"{product_name}\"\n"
        "– No brand or model. Just the type, e.g., “self-cleaning robot.”"
    )
    for attempt in range(MAX_RETRIES):
        key = API_KEYS[attempt % len(API_KEYS)]
        client = genai.Client(api_key=key)
        try:
            resp = client.models.generate_content(
                model=MODEL,
                contents=prompt
            )
            name = resp.text.strip()
            if name:
                return name, attempt // len(API_KEYS) + 1
        except Exception as e:
            print(f"🔁 Retry {attempt + 1}/{MAX_RETRIES} with key#{(attempt % len(API_KEYS)) + 1} failed: {e}")
            time.sleep(RETRY_DELAY)
    print("❌ All retries failed for:", product_name)
    return None, None

def save_output_block(src, prod, gen_name):
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
        f.write(f"\n--- {os.path.basename(src)} ---\n")
        f.write(f"Original Product Name: {prod}\n")
        f.write(f"Generic Name: {gen_name}\n")

def commit_output():
    subprocess.run(["git", "config", "--global", "user.name", "gen-bot"], check=True)
    subprocess.run(["git", "config", "--global", "user.email", "bot@example.com"], check=True)
    subprocess.run(["git", "add", OUTPUT_FILE], check=True)
    if subprocess.call(["git", "diff", "--cached", "--quiet"]) != 0:
        subprocess.run(["git", "commit", "-m", f"🤖 Update generic names {datetime.utcnow().isoformat()}"], check=True)
        subprocess.run(["git", "push"], check=True)
        print("✅ Changes committed & pushed")
    else:
        print("ℹ️ No changes to commit")

def main():
    # Initialize output
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("📦 Generic Product Names Output\n")

    for path in find_txt_files(INPUT_DIR):
        product = extract_product_name(path)
        if not product:
            print(f"⚠️ No product name found in {path}, skipping.")
            continue

        print("🧠 Processing:", product)
        gen_name, rounds_used = call_genai_with_retries(product)
        if gen_name:
            print(f"✅ Generic: {gen_name} (via {rounds_used} round(s) of retries)")
            save_output_block(path, product, gen_name)
        else:
            print(f"❌ Failed to generate name for: {product}")

    commit_output()
    print("🎉 Done.")

if __name__ == "__main__":
    main()
