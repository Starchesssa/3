
import os
import subprocess
import re

QUALIFY_PATH = "Unuusual_memory/QUALIFY/qualified.txt"
LINKS_DIR = "Unuusual_memory/Relevant_links"
OUTPUT_DIR = "Vid"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def download_video(link, out_path):
    try:
        subprocess.run([
            "yt-dlp",
            "--proxy", "socks5://127.0.0.1:9050",
            "--merge-output-format", "mp4",
            "-o", out_path,
            link
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"[!] Download failed: {e}")

def letter_to_index(letter):
    return ord(letter.lower()) - ord('a')

with open(QUALIFY_PATH, encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue

        # Split by ": " safely
        if ": " not in line:
            print(f"[!] Unexpected line format: {line}")
            continue

        parts = line.split(": ", 1)
        group_info = parts[1].strip()  # e.g. "3(a)_levitating_smart_lamp.txt"
        group_num = parts[0].split()[-1]  # e.g. "3" from "Group 3"

        # Correct regex to parse filenames like 3(a)_levitating_smart_lamp.txt
        match = re.match(r"(\d+)([a-z])_(.+)\.txt$", group_info)
        if not match:
            print(f"[!] Failed to parse file name: {group_info}")
            continue

        group_number, letter, file_title = match.groups()

        # Convert letter to index (a=0, b=1, c=2 ...)
        qualified_index = letter_to_index(letter)

        # Compose links filename: e.g. "3_levitating_smart_lamp.txt"
        links_file = os.path.join(LINKS_DIR, f"{group_number}_{file_title}.txt")

        if not os.path.exists(links_file):
            print(f"[!] Links file not found: {links_file}")
            continue

        # Read links lines
        with open(links_file, encoding='utf-8') as lf:
            links = [l.strip() for l in lf if l.strip()]

        # Check if we have enough links
        if qualified_index >= len(links):
            print(f"[!] Not enough links in {links_file}")
            continue

        link = links[qualified_index]
        print(f"[*] Group {group_num}: Downloading from {link}")

        out_path = os.path.join(OUTPUT_DIR, f"group_{group_num}.%(ext)s")
        download_video(link, out_path)

print("[✓] All downloads complete.")
