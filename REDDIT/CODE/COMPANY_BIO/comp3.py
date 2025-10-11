
import requests
import re

# --- Google API credentials ---
API_KEY = "AIzaSyB4NaA2lMW6uZ6YjzbDCSo-he6zh_XBVkM"
CX_ID = "a73cae6bad04a492d"

# --- Search term ---
QUERY = "Invent and Wander book"

# --- Make search request ---
url = f"https://www.googleapis.com/customsearch/v1?q={QUERY}&key={API_KEY}&cx={CX_ID}"
response = requests.get(url)
data = response.json()

# --- Extract the first valid Amazon or Audible link ---
valid_link = None
if "items" in data:
    for item in data["items"]:
        link = item.get("link", "")
        if re.search(r"(amazon\.com|audible\.com)", link):
            valid_link = link
            break

# --- Show result ---
if valid_link:
    print(f"✅ Found valid link: {valid_link}")
else:
    print("❌ No valid Amazon or Audible link found.")
