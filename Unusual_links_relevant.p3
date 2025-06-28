
import os
import time
import subprocess
from google import genai
from google.genai.types import GenerateContentConfig

# 🔧 Constants
BASE_DIR = "Unuusual_memory"
LINKS_DIR = os.path.join(BASE_DIR, "Links")
RELEVANT_DIR = os.path.join(BASE_DIR, "Relevant_links")
PRODUCTS_FILE = os.path.join("CATEGORY", "Products_temp.txt")

MAX_PROMPT_ATTEMPTS = 5
MIN_VALID_LINKS = 3
WAIT_TIME_SECONDS = 78  # 1.3 minutes

# 🤖 Gemini 2.5 Flash setup
api_key = os.environ.get("GEMINI_API")
if not api_key:
    raise EnvironmentError("❌ GOOGLE_API_KEY environment variable not set")

client = genai.Client(api_key=api_key)
model_name = "gemini-2.5-flash"

def commit_changes():
    print("📦 Starting Git commit process...")
    try:
        subprocess.run(['git', 'config', '--global', 'user.name', 'yt-bot'], check=True)
        subprocess.run(['git', 'config', '--global', 'user.email', 'yt-bot@example.com'], check=True)
        print("✅ Git user config set.")
        subprocess.run(['git', 'add', RELEVANT_DIR], check=True)
        print("📁 Files added to Git.")
        subprocess.run(['git', 'commit', '-m', '✅ Relevant links committed'], check=True)
        print("📝 Commit successful.")
        subprocess.run(['git', 'push'], check=True)
        print("🚀 Push successful.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Git commit failed: {e}")

def load_products():
    print(f"📂 Loading products from: {PRODUCTS_FILE}")
    if not os.path.exists(PRODUCTS_FILE):
        print("❌ Products file not found.")
        return {}

    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        print(f"🔢 Found {len(lines)} product lines.")
        products = {
            str(i + 1): line.split(". ", 1)[1].strip()
            for i, line in enumerate(lines)
            if ". " in line
        }
        print(f"✅ Loaded {len(products)} valid products.")
        return products

def ask_gemini_about_link(link, product):
    print(f"\n🧠 Asking Gemini about link:\n🔗 {link}\n📦 Product: {product}")
    prompt = (
        f"Watch this video: {link}\n"
        f"Is this video solely about the product: '{product}'?\n"
        "The video should be entirely focused on this one product, not a compilation or list.\n"
        "Respond with one word only: Yes or No."
    )

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=[{"role": "user", "parts": [{"text": prompt}]}],
            config=GenerateContentConfig(
                temperature=0.3,
                top_p=1.0,
                top_k=1,
                max_output_tokens=40
            )
        )
        answer = response.text.strip().lower()
        print(f"✅ Gemini Response: {answer.upper()}")
        if answer in ["yes", "no"]:
            return answer
        else:
            print("⚠️ Unexpected response format.")
    except Exception as e:
        print(f"❌ Gemini error for link {link}: {e}")
    return "no"

def process_links():
    print("🚦 Starting link processing...")
    os.makedirs(RELEVANT_DIR, exist_ok=True)
    products = load_products()
    if not products:
        print("⚠️ No products loaded. Exiting.")
        return

    valid_files = 0

    for i in range(1, 31):
        file_name = f"{i}_link.txt"
        file_path = os.path.join(LINKS_DIR, file_name)

        print(f"\n📄 Checking file: {file_name}")

        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            continue

        product = products.get(str(i))
        if not product:
            print(f"⚠️ Product name not found for index {i}. Skipping.")
            continue

        with open(file_path, 'r', encoding='utf-8') as f:
            links = [line.strip() for line in f if line.strip()]
        print(f"🔗 Loaded {len(links)} links from {file_name}")

        approved_links = []

        for idx, link in enumerate(links[:MAX_PROMPT_ATTEMPTS]):
            print(f"📤 Processing link #{idx+1}: {link}")
            decision = ask_gemini_about_link(link, product)
            print(f"📥 Gemini decision: {decision.upper()}")
            if decision == "yes":
                approved_links.append(link)
            print(f"⏳ Waiting {WAIT_TIME_SECONDS} seconds before next call...")
            time.sleep(WAIT_TIME_SECONDS)

        if len(approved_links) >= MIN_VALID_LINKS:
            output_path = os.path.join(RELEVANT_DIR, file_name)
            with open(output_path, 'w', encoding='utf-8') as out:
                out.write("\n".join(approved_links) + "\n")
            print(f"✅ Saved {len(approved_links)} approved links to {output_path}")
            valid_files += 1
        else:
            print(f"❌ Only {len(approved_links)} links passed. Not saving {file_name}.")

        if valid_files >= 11:
            print("🎉 Reached 11 qualified files. Stopping early.")
            break

    print(f"\n🎯 Finished processing. Total qualified files: {valid_files}")
    commit_changes()

# ✅ Entry point
if __name__ == "__main__":
    process_links()
