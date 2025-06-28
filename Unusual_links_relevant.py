
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
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    raise EnvironmentError("❌ GOOGLE_API_KEY environment variable not set")

client = genai.Client(api_key=api_key)
model_name = "gemini-2.5-flash"

def commit_changes():
    try:
        subprocess.run(['git', 'config', '--global', 'user.name', 'yt-bot'], check=True)
        subprocess.run(['git', 'config', '--global', 'user.email', 'yt-bot@example.com'], check=True)
        subprocess.run(['git', 'add', RELEVANT_DIR], check=True)
        subprocess.run(['git', 'commit', '-m', '✅ Relevant links committed'], check=True)
        subprocess.run(['git', 'push'], check=True)
        print("✅ Changes committed and pushed.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Git commit failed: {e}")

def load_products():
    if not os.path.exists(PRODUCTS_FILE):
        print("❌ Products file not found.")
        return {}

    with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
        return {
            str(i + 1): line.split(". ", 1)[1].strip()
            for i, line in enumerate(f)
            if ". " in line
        }

def ask_gemini_about_link(link, product):
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
        if answer in ["yes", "no"]:
            print(f"🔍 Gemini said: {answer.upper()} for {link}")
            return answer
    except Exception as e:
        print(f"❌ Gemini error for link {link}: {e}")
    return "no"

def process_links():
    os.makedirs(RELEVANT_DIR, exist_ok=True)
    products = load_products()
    if not products:
        print("⚠️ No products loaded. Exiting.")
        return

    valid_files = 0

    for i in range(1, 31):
        file_name = f"{i}_link.txt"
        file_path = os.path.join(LINKS_DIR, file_name)

        if not os.path.exists(file_path):
            continue

        product = products.get(str(i))
        if not product:
            print(f"⚠️ Product name not found for index {i}.")
            continue

        with open(file_path, 'r', encoding='utf-8') as f:
            links = [line.strip() for line in f if line.strip()]

        approved_links = []

        for link in links[:MAX_PROMPT_ATTEMPTS]:
            decision = ask_gemini_about_link(link, product)
            if decision == "yes":
                approved_links.append(link)
            time.sleep(WAIT_TIME_SECONDS)

        if len(approved_links) >= MIN_VALID_LINKS:
            output_path = os.path.join(RELEVANT_DIR, file_name)
            with open(output_path, 'w', encoding='utf-8') as out:
                out.write("\n".join(approved_links) + "\n")
            print(f"✅ Saved {len(approved_links)} links to {file_name}")
            valid_files += 1

        if valid_files >= 11:
            break

    print(f"🎯 Completed processing. {valid_files} files qualified.")
    commit_changes()

# ✅ Entry point
if __name__ == "__main__":
    process_links()
