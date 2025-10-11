
import os

# === Paths ===
LINKS_DIR = "REDDIT/THEMES/Company bio/BOOKS/LINKS"
AFF_DIR = "REDDIT/THEMES/Company bio/BOOKS/AFF"
ASSOCIATE_ID = "bookslibrar08-20"

# Ensure AFF directory exists
os.makedirs(AFF_DIR, exist_ok=True)

# List of platforms
platforms = ["amazon", "audible"]

for platform in platforms:
    links_path = os.path.join(LINKS_DIR, f"{platform}.txt")
    aff_path = os.path.join(AFF_DIR, f"{platform}.txt")

    # Read original links
    if os.path.exists(links_path):
        with open(links_path, "r", encoding="utf-8") as f:
            links = [line.strip() for line in f if line.strip()]
    else:
        print(f"❌ {links_path} does not exist.")
        continue

    # Convert to affiliate links
    aff_links = []
    for link in links:
        separator = "&" if "?" in link else "?"
        aff_link = f"{link}{separator}tag={ASSOCIATE_ID}"
        aff_links.append(aff_link)

    # Save affiliate links
    with open(aff_path, "w", encoding="utf-8") as f:
        for link in aff_links:
            f.write(link + "\n")

    print(f"✅ {platform.capitalize()} affiliate links saved to {aff_path}")
