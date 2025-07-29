
import os
import json
from google import genai

# ✅ Configure Gemini with API key
genai.configure(api_key=os.getenv("GEMINI_API"))

# 📥 Input JSON path
json_path = "BOOKS/WEALTH/BIO/COMPANY_BIO/data.json"

# 📤 Output script path directory
output_dir = "BOOKS/Temp/SCRIPT/COMPANY_BIO"

# ✅ Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

# 📖 Load books JSON
with open(json_path, "r", encoding="utf-8") as f:
    books = json.load(f)

# 🛑 Stop if no books
if not books:
    print("❌ No books found in the JSON.")
    exit()

# 📚 Pick the first book
book = books[0]
title = book.get("title", "Untitled")
author = book.get("author", "Unknown")
company = book.get("company", "Unknown")

# 🧠 Gemini prompt
prompt = f"""
From the book "{title}" by {author} (Company: {company}),

Write a plain text script explaining the key concepts and ideas in the book. Do not rewrite the book. Instead, explain it in an engaging and concise way as if you are summarizing for a TTS video.

Each chapter should:
- Not exceed 150 words (for 1 minute narration)
- Include context and conflict to maintain tension
- Be easy to listen to in audio
- Output only the final script — no extra explanation, scene cues, or formatting
"""

# 🎯 Generate content using Gemini
model = genai.GenerativeModel("gemini-pro")
response = model.generate_content(prompt)

# 📝 Save result
filename = f"{title.replace(' ', '_')}.txt"
output_path = os.path.join(output_dir, filename)

with open(output_path, "w", encoding="utf-8") as f:
    f.write(response.text.strip())

print(f"✅ Script saved to: {output_path}")
