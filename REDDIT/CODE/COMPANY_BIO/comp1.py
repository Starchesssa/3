import os
import json

BASE_DIR = "REDDIT/THEMES/Company bio/BOOKS"
USED_DIR = os.path.join(BASE_DIR, "USED")
USED_FILE = os.path.join(USED_DIR, "Used.json")
UNUSED_FILE = os.path.join(USED_DIR, "Unused.json")

os.makedirs(USED_DIR, exist_ok=True)

# Load used books memory
if os.path.exists(USED_FILE):
    with open(USED_FILE, "r") as f:
        try:
            used_books = json.load(f)
        except json.JSONDecodeError:
            used_books = []
else:
    used_books = []

# Helper: check if a book is already used
def is_used(book):
    for b in used_books:
        if b.get("title") == book.get("title") and b.get("author") == book.get("author"):
            return True
    return False

# Find all json files in BOOKS folder (excluding USED folder)
book_files = [
    os.path.join(BASE_DIR, f)
    for f in sorted(os.listdir(BASE_DIR))
    if f.endswith(".json") and f != "Used.json" and f != "Unused.json"
]

next_book = None

# Go through each json file to find first unused book
for file_path in book_files:
    with open(file_path, "r") as f:
        try:
            books = json.load(f)
        except json.JSONDecodeError:
            continue

    for book in books:
        if not is_used(book):
            next_book = book
            break

    if next_book:
        break

# Save result
if next_book:
    with open(UNUSED_FILE, "w") as f:
        json.dump(next_book, f, indent=2)
    print("✅ Found next unused book:", next_book["title"])
else:
    with open(UNUSED_FILE, "w") as f:
        json.dump({"message": "No new books"}, f, indent=2)
    print("⚠️ All books are already used.")
