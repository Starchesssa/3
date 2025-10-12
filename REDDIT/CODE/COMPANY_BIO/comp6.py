
import os
import json
from google import genai
from google.genai import types

# === Paths ===
BOOK_PATH = "REDDIT/THEMES/Company bio/BOOKS/USED/Unused.json"
AMAZON_PATH = "REDDIT/THEMES/Company bio/BOOKS/AFF/amazon.txt"
AUDIBLE_PATH = "REDDIT/THEMES/Company bio/BOOKS/AFF/audible.txt"
OUTPUT_PATH = "REDDIT/THEMES/Company bio/BOOKS/POST/post.txt"

# === Load Gemini API key ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5"),
]
API_KEYS = [k for k in API_KEYS if k]
if not API_KEYS:
    raise ValueError("❌ No Gemini API keys found.")

# === Helper functions ===
def load_json(path):
    if not os.path.exists(path):
        print(f"❌ Missing file: {path}")
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"⚠️ Invalid JSON format in {path}")
        return None

def load_link(path):
    if not os.path.exists(path):
        return "(LINK NOT FOUND)"
    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()

def save_post(text):
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"💾 Post saved to {OUTPUT_PATH}")

# === Main ===
def main():
    book = load_json(BOOK_PATH)
    if not book:
        print("❌ Book info not found.")
        return

    title = book.get("title", "")
    author = book.get("author", "")
    company = book.get("company", "")
    amazon_link = load_link(AMAZON_PATH)
    audible_link = load_link(AUDIBLE_PATH)

    print(f"📚 Generating post for: {title} by {author}")

    prompt = f"""
Give me a cool reddit post on {title} by {author}, use you and your instead of i and me.

Make the post so cool people wanna purchase the book.

Make a cool headline all in capital letters — the headline must be about the book and mention the book or person or company of the biography (choose whichever is more famous: the book, the author, or the company).

Include the link of the book in amazon and audible.

Audible is normally free trial, make the audible part sound natural for audible.com.

Avoid any complex words used in the book that can confuse people. Avoid robotic or AI language, sound like a mentor or entrepreneur who is obsessed with success, and use emojis.

Convince the reader to take the book for free on Audible if they’re new, or check it on Amazon. Audible is for audiobooks (free for new users), Amazon is for Kindle, paperback, and hardcover.

In amazon link write:
(AMAZON LINK)

In audible link write:
(AUDIBLE LINK)

Prioritize Audible with a short CTA.

Output only the final  post only. Nothing else.
"""

    api_key = API_KEYS[0]
    client = genai.Client(api_key=api_key)

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[types.Content(role="user", parts=[types.Part.from_text(prompt)])],
        )
        post_text = response.candidates[0].content.parts[0].text
        save_post(post_text)
        print("✅ Reddit post generated successfully.")
    except Exception as e:
        print(f"❌ Error generating post: {e}")

if __name__ == "__main__":
    main()
