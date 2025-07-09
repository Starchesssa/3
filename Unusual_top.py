
import os
import time
import string
import random
from google import genai

# === Configuration ===
SCRIPT_DIR = "Unuusual_memory/SCRIPT"
OUTPUT_DIR = "Unuusual_memory/TOP_GDG"
OUTPUT_FILE = "Top_gadget.txt"
MODEL = "gemini-2.5-flash"

# === Load Gemini API keys ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5")
]
API_KEYS = [key for key in API_KEYS if key]
if not API_KEYS:
    raise ValueError("❌ No valid GEMINI_API keys found.")

# === Helpers ===
def extract_product_names():
    products = []
    for filename in os.listdir(SCRIPT_DIR):
        filepath = os.path.join(SCRIPT_DIR, filename)
        if filename.endswith('.txt') and os.path.isfile(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.startswith("Product name:"):
                        product = line.replace("Product name:", "").strip()
                        products.append(product)
                        break  # Only the first occurrence needed
    return products

def rank_products_with_gemini(products):
    prompt = (
        f"Here is a list of {len(products)} product names:\n\n" +
        "\n".join(products) +
        "\n\nPlease rank these products from best to worst, "
        "starting with the best at the top. "
        "Output only the numbered product names (no explanations, only the numbered list)."
    )

    for attempt in range(len(API_KEYS)):
        try:
            client = genai.Client(api_key=API_KEYS[attempt])
            response = client.models.generate_content(
                model=MODEL,
                contents=[
                    {
                        "role": "user",
                        "parts": [{"text": prompt}]
                    }
                ]
            )
            ranked = response.text.strip()
            print(f"✅ Ranking done using API#{attempt + 1}", flush=True)
            return ranked
        except Exception as e:
            print(f"⚠️ API#{attempt + 1} failed, retrying next key... Error: {e}", flush=True)
            time.sleep(1)

    raise RuntimeError("❌ All API keys failed.")

def save_ranking(result):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILE)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(result)
    print(f"📄 Saved ranking to {output_path}\n", flush=True)

# === Main Script ===
def main():
    print("🚀 Starting product ranking script...\n", flush=True)

    products = extract_product_names()
    if not products:
        print("🚫 No product names found in the directory.", flush=True)
        return

    print(f"📝 Extracted {len(products)} product names.\n", flush=True)

    try:
        ranking = rank_products_with_gemini(products)
        save_ranking(ranking)
    except Exception as e:
        print(f"❌ Error during ranking process: {e}", flush=True)

if __name__ == "__main__":
    main()
