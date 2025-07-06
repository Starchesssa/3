
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

with open(QUALIFY_PATH) as f:
    for line in f:
        if not line.strip():
            continue
        parts = line.strip().split(": ")
        if len(parts) < 2:
            print(f"[!] Unexpected line format: {line.strip()}")
            continue
        
        group_num = parts[0].split()[-1]
        file_name = parts[1].strip()

        # Correct regex to match filenames like 3(a)_levitating_smart_lamp.txt
        match = re.match(r'(\d+)([a-z])_(.+)\.txt$', file_name)
        if not match:
            print(f"[!] Failed to parse file name: {file_name}")
            continue

        group_number, letter, file_title = match.groups()
        qualified_index = letter_to_index(letter)

        links_file = os.path.join(LINKS_DIR, f"{group_number}_{file_title}.txt")
        if not os.path.exists(links_file):
            print(f"[!] Links file not found: {links_file}")
            continue

        with open(links_file) as lf:
            links = [l.strip() for l in lf if l.strip()]

        if qualified_index >= len(links):
            print(f"[!] Not enough links in {links_file}")
            continue

        link = links[qualified_index]
        print(f"[*] Group {group_num}: Downloading from {link}")

        out_path = os.path.join(OUTPUT_DIR, f"group_{group_num}.%(ext)s")
        download_video(link, out_path)

print("[✓] All downloads complete.")
