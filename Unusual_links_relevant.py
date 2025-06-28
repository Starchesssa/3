
import os
import time
import subprocess
from google import genai
from google.genai.types import GenerateContentConfig, Content, Part

# 🔧 Constants
BASE_DIR = "Unuusual_memory"
LINKS_DIR = os.path.join(BASE_DIR, "Links")
RELEVANT_DIR = os.path.join(BASE_DIR, "Relevant_links")
PRODUCTS_FILE = os.path.join("CATEGORY", "Products_temp.txt")

MAX_PROMPT_ATTEMPTS = 5
MIN_VALID_LINKS = 3
WAIT_TIME_SECONDS = 78  # 1.3 minutes

VERBOSE = True

def vprint(*args, **kwargs):
    if VERBOSE:
        print(*args, **kwargs)

# 🤖 Gemini 2.5 Flash setup
api_key = os.environ.get("GEMINI_API")
if not api_key:
    raise EnvironmentError("❌ GEMINI_API environment variable not set")

client = genai.Client(api_key=api_key)
model_name = "gemini-2.5-flash"

def commit_changes():
    vprint("📦 Committing relevant links...")
    try:
        subprocess.run(['git', 'config', '--global', 'user.name', 'yt-bot'], check=True)
        subprocess.run(['git', 'config', '--global', 'user.email', 'yt-bot@example.com'], check=True)
        subprocess.run(['git', 'add', RELEVANT_DIR], check=True)
        subprocess.run(['git', 'commit', '-m', '✅ Relevant links committed'], check=True)
        subprocess.run(['git', 'push'], check=True)
        vprint("🚀 Pushed to Git.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Git error: {e}")

def load_products():
    vprint(f"📂 Loading products from {PRODUCTS_FILE}")
    if not os.path.exists(PRODUCTS_FILE):
        print("❌ Products file not found.")
        return {}

    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        products = {
            str(i + 1): line.split(". ", 1)[1].strip()
            for i, line in enumerate(lines)
            if ". " in line
        }
        return products

def ask_gemini_about_link(link, product):
    vprint(f"\n🔍 Asking Gemini:\n🔗 {link}\n📦 {product}")
    contents = [
        Content(
            role="user",
            parts=[
                Part(text=f"Is this YouTube video solely about the product: '{product}'?\n"
                          "Only respond with 'Yes' or 'No'. The video should NOT be a list or compilation."),
                Part(file_uri=link, mime_type="video/*")
            ]
        )
    ]

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=GenerateContentConfig(
                temperature=0.3, top_p=1, top_k=1, max_output_tokens=40
            )
        )
        answer = response.text.strip().lower()
        vprint(f"🧠 Gemini says: {answer}")
        return answer if answer in ["yes", "no"] else "no"
    except Exception as e:
        print(f"❌ Gemini error for {link}: {e}")
        return "no"

def process_links():
    vprint("🚦 Processing links...")
    os.makedirs(RELEVANT_DIR, exist_ok=True)
    products = load_products()
    if not products:
        print("⚠️ No products found.")
        return

    valid_files = 0

    for i in range(1, 31):
        file_name = f"{i}_link.txt"
        file_path = os.path.join(LINKS_DIR, file_name)

        if not os.path.exists(file_path):
            vprint(f"❌ Missing: {file_path}")
            continue

        product = products.get(str(i))
        if not product:
            vprint(f"⚠️ No product for index {i}.")
            continue

        with open(file_path, 'r', encoding='utf-8') as f:
            links = [line.strip() for line in f if line.strip()]

        approved_links = []

        for idx, link in enumerate(links[:MAX_PROMPT_ATTEMPTS]):
            vprint(f"🧪 Checking link #{idx + 1}: {link}")
            result = ask_gemini_about_link(link, product)
            if result == "yes":
                approved_links.append(link)
            vprint(f"⏳ Waiting {WAIT_TIME_SECONDS}s...")
            time.sleep(WAIT_TIME_SECONDS)

        if len(approved_links) >= MIN_VALID_LINKS:
            output_path = os.path.join(RELEVANT_DIR, file_name)
            with open(output_path, 'w', encoding='utf-8') as out:
                out.write("\n".join(approved_links) + "\n")
            vprint(f"✅ Saved {len(approved_links)} links to {output_path}")
            valid_files += 1
        else:
            vprint(f"❌ Only {len(approved_links)} passed. Skipping save.")

        if valid_files >= 11:
            vprint("🎉 11 valid files reached. Done.")
            break

    vprint(f"🏁 Done. Total valid files: {valid_files}")
    commit_changes()

if __name__ == "__main__":
    process_links()
