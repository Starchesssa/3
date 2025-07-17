
import os
import subprocess
import re
import sys
import time

# === CONFIGURATION ===
QUALIFY_PATH = "Unuusual_memory/QUALIFY/qualified.txt"
LINKS_DIR = "Unuusual_memory/Relevant_links"
OUTPUT_DIR = "Vid"
FILTER_RESULT_PATH = os.path.join(OUTPUT_DIR, "filter_result.txt")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# === UTILITIES ===
def run_command(command, error_msg, retries=2, delay=5):
    for attempt in range(retries):
        try:
            subprocess.run(command, check=True)
            return
        except subprocess.CalledProcessError as e:
            print(f"[ERROR] {error_msg} (Attempt {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                print(f"[*] Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print("[✘] Giving up.")
                sys.exit(1)

# === TOR SETUP ===
def start_tor():
    print("[*] Setting up Tor...")
    tor_installed = subprocess.run(["which", "tor"], capture_output=True).returncode == 0
    if not tor_installed:
        print("[*] Installing Tor...")
        run_command(["sudo", "apt-get", "update"], "Failed to update package list")
        run_command(["sudo", "apt-get", "install", "-y", "tor"], "Failed to install Tor")

    print("[*] Starting Tor service...")
    run_command(["sudo", "service", "tor", "start"], "Failed to start Tor")

    try:
        result = subprocess.run([
            "curl", "--socks5", "127.0.0.1:9050", "https://check.torproject.org/"
        ], capture_output=True, timeout=10)
        if b"Congratulations" in result.stdout:
            print("[✓] Tor is active.")
        else:
            print("[!] Tor check did not confirm activity.")
    except Exception as e:
        print(f"[!] Skipping Tor validation: {e}")

# === FILTER CHECK ===
def read_filter_result():
    try:
        with open(FILTER_RESULT_PATH, "r") as f:
            result = f.read().strip().lower()
            return result == "no"
    except Exception as e:
        print(f"[ERROR] Could not read filter result: {e}")
        return True  # Default to allowing download

# === DOWNLOAD FUNCTION ===
def download_video(link, out_path):
    print(f"[*] Downloading from {link}")
    run_command([
        "yt-dlp",
        "--proxy", "socks5://127.0.0.1:9050",
        "--merge-output-format", "mp4",
        "-o", out_path,
        link
    ], "Video download failed", retries=3, delay=7)

# === FILENAME PARSER ===
def letter_to_index(letter):
    return ord(letter.lower()) - ord('a')

# === MAIN EXECUTION ===
def main():
    if not read_filter_result():
        print("[✘] Video flagged by filter (haram/music/face/etc). Skipping.")
        sys.exit(0)

    start_tor()

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

            match = re.match(r'(\d+)\(([a-z])\)_(.+)\.txt$', file_name)
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
            out_path = os.path.join(OUTPUT_DIR, f"group_{group_num}.%(ext)s")
            download_video(link, out_path)

    print("[✓] All downloads complete.")

# === LAUNCH ===
if __name__ == "__main__":
    main()
