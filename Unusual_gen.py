
import os
import subprocess
from datetime import datetime
from google import genai

INPUT_DIR = "Unuusual_memory/SCRIPT"
OUTPUT_FILE = "Unuusual_memory/GROUP_GDG/group_gdg.txt"

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

def call_genai(product_name):
    client = genai.Client(api_key=os.environ["GEMINI_API"])
    prompt = (
        f"Extract a generic gadget type name (2–4 words) for:\n"
        f"\"{product_name}\"\n"
        f"– No brand or model. Just the type, e.g., “self-cleaning robot”."
    )
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return resp.text.strip()

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
        subprocess.run(["git", "commit", "-m", f"🛠️ Update names {datetime.utcnow().isoformat()}"], check=True)
        subprocess.run(["git", "push"], check=True)
        print("✅ Committed & pushed")
    else:
        print("ℹ️ No changes")

def main():
    open(OUTPUT_FILE, "w", encoding="utf-8").write("📦 Generic Product Names Output\n")
    for path in find_txt_files(INPUT_DIR):
        name = extract_product_name(path)
        if not name:
            continue
        print("🧠 Processing:", name)
        try:
            generic = call_genai(name)
            print("➡️", generic)
            save_output_block(path, name, generic)
        except Exception as e:
            print("❌ Error:", e)
    commit_output()

if __name__ == "__main__":
    main()
