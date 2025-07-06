
import os
import subprocess

QUALIFY_PATH = "Unuusual_memory/QUALIFY/qualified.txt"
LINKS_DIR = "Unuusual_memory/Relevant_links"
OUTPUT_DIR = "Vid"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def download_video(link, out_path):
    subprocess.run([
        "yt-dlp",
        "--proxy", "socks5://127.0.0.1:9050",
        "--merge-output-format", "mp4",
        "-o", out_path,
        link
    ], check=True)

def letter_to_index(letter):
    return ord(letter.lower()) - ord('a')

with open(QUALIFY_PATH) as f:
    for line in f:
        if not line.strip():
            continue
        parts = line.strip().split(": ")
        group_info = parts[1]
        file_name = group_info.strip()
        group_num = parts[0].split()[-1]
        
        # Extract qualified letter (inside parentheses)
        letter = file_name.split("(")[1][0]
        qualified_index = letter_to_index(letter)

        links_file = os.path.join(LINKS_DIR, "_".join(file_name.split("_")[:2]) + ".txt")
        with open(links_file) as lf:
            links = [l.strip() for l in lf if l.strip()]
        
        if qualified_index >= len(links):
            print(f"[!] Not enough links in {links_file}")
            continue

        link = links[qualified_index]
        print(f"[*] Group {group_num}: Downloading {link}")
        
        out_path = os.path.join(OUTPUT_DIR, f"group_{group_num}.%(ext)s")
        download_video(link, out_path)

print("[✓] All downloads complete.")
