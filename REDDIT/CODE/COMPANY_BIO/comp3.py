
import requests
import json
import re
import os

# --- Google API credentials ---
API_KEY = "AIzaSyB4NaA2lMW6uZ6YjzbDCSo-he6zh_XBVkM"
CX_ID = "a73cae6bad04a492d"

# --- Paths ---
unused_path = "REDDIT/THEMES/Company bio/BOOKS/USED/Unused.json"
amazon_path = "REDDIT/THEMES/Company bio/BOOKS/LINKS/amazon.txt"
audible_path = "REDDIT/THEMES/Company bio/BOOKS/LINKS/audible.txt"

# --- Ensure link directories exist ---
os.makedirs(os.path.dirname(amazon_path), exist_ok=True)
os.makedirs(os.path.dirname(audible_path), exist_ok=True)

# --- Load book info ---
try:
    with open(unused_path, "r", encoding="utf-8") as f:
        book = json.load(f)
        title = book.get("title", "")
except Exception as e:
    print(f"❌ Failed to read JSON: {e}")
    exit()

# --- Search Query ---
QUERY = title
print(f"🔍 Searching for: {QUERY}")

# --- Make request ---
url = f"https://www.googleapis.com/customsearch/v1?q={QUERY}&key={API_KEY}&cx={CX_ID}"
response = requests.get(url)
data = response.json()

amazon_link = None
audible_link = None

# --- Extract valid links ---
if "items" in data:
    for item in data["items"]:
        link = item.get("link", "")
        if re.search(r"amazon\.com", link, re.IGNORECASE) and not amazon_link:
            amazon_link = link
        elif re.search(r"audible\.com", link, re.IGNORECASE) and not audible_link:
            audible_link = link
        if amazon_link and audible_link:
            break

# --- Save links ---
if amazon_link:
    with open(amazon_path, "a", encoding="utf-8") as f:
        f.write(f"{title}: {amazon_link}\n")
    print(f"✅ Amazon link saved: {amazon_link}")
else:
    print("❌ No Amazon link found.")

if audible_link:
    with open(audible_path, "a", encoding="utf-8") as f:
        f.write(f"{title}: {audible_link}\n")
    print(f"✅ Audible link saved: {audible_link}")
else:
    print("❌ No Audible link found.")
