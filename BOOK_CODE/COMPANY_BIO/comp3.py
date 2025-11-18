import os
import time
import json
from google import genai

# === Paths ===
COMPANY_BIO_PATH = "BOOKS/Temp/COMPANY_BIO"
SCRIPT_OUTPUT_PATH = "BOOKS/Temp/SCRIPT/COMPANY_BIO"
MODEL = "gemini-2.5-pro"

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
    raise ValueError("❌ No API keys found in environment variables.")

# === Load book info from COMPANY_BIO ===
def load_company_bio():
    if not os.path.exists(COMPANY_BIO_PATH):
        raise FileNotFoundError("❌ COMPANY_BIO not found.")

    with open(COMPANY_BIO_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list) or not data:
        raise ValueError("❌ COMPANY_BIO must contain a JSON LIST with at least 1 item.")

    book = data[0]  # always first entry
    return {
        "title": book.get("title", "Unknown Title"),
        "author": book.get("author", "Unknown Author"),
        "company": book.get("company", "Unknown Company")
    }

# === Build AI Prompt ===
def build_prompt(info):
    return f"""
You are writing a long friend to friend storytelling script based on the book titled '{info['title']}' by {info['author']}.
The story focuses on the company {info['company']}.

Here arw Rules of writing the script, please follow them to guide you during writing the script.
1. dont begin with words like here is the script, just output the script only, no scenes,sound effects,no any blackets,no anything just plain script.
2. use exreme language ie instad of 'fiji water suck , say 'fiji water is the worst water yo'll ever drink in your life , be more extreme in opinions throught the script. '.
3. all headings must be in capital letters including the intor heading , include intro explaining about the intro of the book and reason of the book,where you introduce the book ,the author ,purpose for the book and high light major concepts and events of the book.
4. Make the script to be divided into parts, intro should be less than 1.5 minutes , outro same should be less than 1.5 minutes  long, the body is didvided so each body part should not exceed 3.5 minutes -4 minutes ,it shoild be less than that, overall script should be atleast 4000 words.
5. do not use metaphors   just state what hapoened in a clearly  and use nomal day to day words instead of invommon words
6. use small letters in the script expect capital letters in the heading 
7. dont be profesional , just be like you are talking to a friend .
8. use 2nd and 3rd personal prodnoun dont use 1st personal pronoun 
9. use more statistics and state what actually happened at the comapny , real life events and statistics, tell what actually hapened instead of generic facts 
10. dont compare more and dont use more metaphor ie instead of ,the company was like this and that , say the company was xyz where abc happened and a person called x int.....
11. in the intro ,after exaplining the purpose of the book and author etc , make a mini trailer or cliffhanger of what you are going to discuss in the video, the mini trailer must be very key aread of tension ,conflict etc that will make the viewer intrigued, just be like you are making a movie trailer at the intro .and dobt include unnecessary words , just make it simple by explaining book purpose , author and its trailer what will happen 
12. also make a outro , the outro should be similar to a youtube outro , and tell them to subscribe , also , link of the audio book is avaialble for free for new users audible, and the book also is available in description, do this also after the into.
13. 

Begin the magnettes media youtube script now.
"""

# === Generate script ===
def generate_script(prompt, api_index):
    attempts = len(API_KEYS)

    for i in range(attempts):
        key = API_KEYS[(api_index + i) % attempts]
        try:
            client = genai.Client(api_key=key)

            response = client.models.generate_content(
                model=MODEL,
                contents=[{"role": "user", "parts": [{"text": prompt}]}]
            )

            text = getattr(response, "text", None)
            if not text:
                text = str(response)

            print(f"✅ Generated script using API key #{(api_index + i) % attempts + 1}")
            return text, (api_index + i + 1) % attempts

        except Exception as e:
            print(f"⚠️ API key #{(api_index + i) % attempts + 1} failed: {e}")
            time.sleep(1)

    raise RuntimeError("❌ All API keys failed.")

# === Save script ===
def save_script(book_info, text):
    os.makedirs(SCRIPT_OUTPUT_PATH, exist_ok=True)
    filename = f"FULL.{book_info['title'].replace(' ', '_')}.txt"
    path = os.path.join(SCRIPT_OUTPUT_PATH, filename)

    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"💾 Saved: {path}")

# === Main ===
def main():
    print("📘 Loading company bio...")
    book_info = load_company_bio()

    print(f"📚 Book: {book_info['title']}")
    print(f"✍️ Author: {book_info['author']}")
    print(f"🏢 Company: {book_info['company']}")

    prompt = build_prompt(book_info)

    api_index = 0
    script, api_index = generate_script(prompt, api_index)

    save_script(book_info, script)
    print("\n🎉 Script generation complete!\n")

if __name__ == "__main__":
    main()
