import os
import json
from google import genai

# ✅ Configure Gemini API
genai.configure(api_key=os.environ["GEMINI_API"])

# ✅ Load the first book entry
source_file = "BOOKS/WEALTH/BIO/COMPANY_BIO/data.json"
with open(source_file, "r", encoding="utf-8") as f:
    data = json.load(f)

if not data:
    print("No books found in data.json.")
    exit(1)

book = data[0]  # Take the first book
title = book["title"]
author = book["author"]
company = book["company"]

# ✅ Prepare Gemini prompt
prompt = f"""
From the book titled "{title}" by {author}, which is about {company}:
Write a plain text script explaining the book’s concepts (not rewriting the book).
Each chapter should be short enough to be read aloud in about 1 minute (~150 words max).
Include tension by describing the context and conflict of each idea.
Do not include scene instructions or emotions — just clean script narration.
Only generate the script, nothing else.
"""

# ✅ Generate script
model = genai.GenerativeModel("gemini-pro")
response = model.generate_content(prompt)
script_text = response.text.strip()

# ✅ Save the script
output_dir = "BOOKS/Temp/SCRIPT/COMPANY_BIO"
os.makedirs(output_dir, exist_ok=True)

output_path = os.path.join(output_dir, f"{company}.txt")
with open(output_path, "w", encoding="utf-8") as f:
    f.write(script_text)

print(f"✅ Script saved for {company}: {output_path}")
