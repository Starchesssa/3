
import os
import json
from google import genai
from google.genai import types

# === Paths ===
BOOK_PATH = "REDDIT/THEMES/Company bio/BOOKS/USED/Unused.json"
OUTPUT_DIR = "REDDIT/THEMES/Company bio/BOOKS/POSTS"

# === Load Gemini API keys ===
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

# === Helper to load book data ===
def load_book_data(path):
    if not os.path.exists(path):
        raise FileNotFoundError(f"❌ Book JSON not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# === Main generator ===
def generate_reddit_post(api_key, title, author, company):
    prompt = f"""
Give me a cool reddit post on {title} by {author}, use 'you' and 'your' instead of 'I' and 'me'.

Make the post so cool people wanna purchase the book.

Make a cool headline all in CAPITAL LETTERS — the headline must be generic, not a single concept in the book. 
Concepts can be explained in the body.

The headline should be about the book and mention the book or person or company of the biography 
(look who is more famous, the book, or the author or the company, and put some or all).

Include the link of the book in Amazon and Audible.

Audible is normally free trial, make the Audible as it is supposed to be in audible.com

Headline must be based on the book.

Avoid any complex words used in the book that can confuse people.

Avoid robotic or AI language, sound like a mentor and entrepreneur obsessed with success, and use emojis plz.

Convince the reader to take the book for free in Audible if they’re new users, 
or check the Amazon page (Audible is for audiobook, free for new users, 
Amazon page is for Kindle, paperback, physical, ebook etc).

In Amazon link write:
(AMAZON LINK)

In Audible link write:
(AUDIBLE LINK)

Prioritize Audible cause some can get it for free. Just a simple CTA, no extra wording.

Output the post only, nothing else.
"""

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[types.Part(text=prompt)]
        )
        return response.text.strip()
    except Exception as e:
        print(f"❌ Error generating post: {e}")
        return None

# === Save the post ===
def save_post(title, post_text):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    safe_name = title.replace(" ", "_").replace("&", "and")
    file_path = os.path.join(OUTPUT_DIR, f"{safe_name}.txt")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(post_text)
    print(f"💾 Saved Reddit post to: {file_path}")

# === Main ===
def main():
    book = load_book_data(BOOK_PATH)
    title = book.get("title", "")
    author = book.get("author", "")
    company = book.get("company", "")

    print(f"📚 Generating post for: {title} by {author}")

    api_key = API_KEYS[0]
    post_text = generate_reddit_post(api_key, title, author, company)

    if post_text:
        save_post(title, post_text)
    else:
        print("⚠️ No post was generated.")

if __name__ == "__main__":
    main()
