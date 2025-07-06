
import os
import re
import subprocess

BASE_DIR = "Unuusual_memory"
QUALIFY_FILE = os.path.join(BASE_DIR, "QUALIFY", "qualified.txt")
RELEVANT_DIR = os.path.join(BASE_DIR, "Relevant_links")
DOWNLOAD_DIR = os.path.join(BASE_DIR, "best_video")

os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def download_video(url, output_path):
    print(f"Downloading: {url} -> {output_path}")
    result = subprocess.run(
        ["yt-dlp", "-o", output_path, url],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        raise Exception(f"yt-dlp failed: {result.stderr}")

def main():
    with open(QUALIFY_FILE, "r", encoding="utf-8") as f:
        qualified_lines = f.readlines()

    for line in qualified_lines:
        line = line.strip()
        if not line or ":" not in line:
            continue

        file_name = line.split(":", 1)[1].strip()
        m = re.match(r"(\d+)([a-z])_(.+)\.txt", file_name)
        if not m:
            print(f"[!] Failed to parse file name: {file_name}")
            continue

        group_num = int(m.group(1))
        letter = m.group(2)
        title = m.group(3)

        relevant_file_name = f"{group_num}_{title}.txt"
        relevant_file_path = os.path.join(RELEVANT_DIR, relevant_file_name)

        if not os.path.isfile(relevant_file_path):
            print(f"[!] Relevant links file not found: {relevant_file_path}")
            continue

        with open(relevant_file_path, "r", encoding="utf-8") as rf:
            links = [line.strip() for line in rf if line.strip()]

        index = ord(letter) - ord('a')
        if index >= len(links):
            print(f"[!] Link index {index} out of range for file {relevant_file_path}")
            continue

        url_to_download = links[index]
        output_filename = f"{group_num}{letter}.vid"
        output_path = os.path.join(DOWNLOAD_DIR, output_filename)

        try:
            download_video(url_to_download, output_path)
        except Exception as e:
            print(f"[!] Failed to download {url_to_download}: {e}")

if __name__ == "__main__":
    main()
