
import os
import re
import subprocess
import time
import requests
import socks
import socket

# ==== SETTINGS ====
LINKS_DIR = "links"          # Directory for link files
OUTPUT_DIR = "downloads"     # Where MP4 clips will be stored
CLIP_SECONDS = 180           # Always clip to 180 seconds
TOR_ENABLED = True           # Use Tor for requests
SKIP_EXISTING = True
VERBOSE = True

# ==== TOR SETUP ====
def setup_tor():
    if TOR_ENABLED:
        print("[*] Setting up Tor...")
        try:
            # Configure SOCKS5 proxy
            socks.set_default_proxy(socks.SOCKS5, "127.0.0.1", 9050)
            socket.socket = socks.socksocket
            print("[+] Tor proxy set successfully.")
        except Exception as e:
            print(f"[!] Tor setup failed: {e}")

        # Check IP to confirm Tor
        try:
            r = requests.get("https://check.torproject.org/", timeout=10)
            if "Congratulations" in r.text:
                print("[✓] Tor is active.")
            else:
                print("[!] Tor check failed.")
        except:
            print("[!] Cannot confirm Tor, but continuing...")

# ==== PARSE FILENAME ====
def parse_filename(filename):
    # Match like: 3(e)_levitating_smart_lamp.txt
    match = re.match(r"(\d+)([a-z])_(.+)\.txt", filename.strip(), re.I)
    if match:
        number = int(match.group(1))
        letter = match.group(2)
        name = match.group(3).replace("_", " ")
        return number, letter, name
    else:
        if VERBOSE:
            print(f"[!] Cannot parse winner filename: {filename}")
        return None

# ==== DOWNLOAD FUNCTION ====
def download_clip(video_url, output_file):
    if SKIP_EXISTING and os.path.exists(output_file):
        if VERBOSE:
            print(f"[✓] Skipping existing: {output_file}")
        return

    # yt-dlp command
    cmd = [
        "yt-dlp",
        "--quiet",
        "--no-warnings",
        "-f", "mp4",
        "--output", output_file,
        "--download-sections", f"*0-{CLIP_SECONDS}",
        video_url
    ]

    if VERBOSE:
        print(f"[*] Downloading {video_url} → {output_file}")

    try:
        subprocess.run(cmd, check=True)
        if VERBOSE:
            print(f"[✓] Downloaded: {output_file}")
    except subprocess.CalledProcessError:
        print(f"[!] Failed to download: {video_url}")

# ==== MAIN SCRIPT ====
def main():
    print("=== Unusual download.py (Tor simple + 180s clip) ===")
    print(f"TOR ENABLED = {TOR_ENABLED}")
    print(f"MAX_SECONDS = {CLIP_SECONDS}")
    print(f"ALWAYS CLIP = True")
    print(f"SKIP EXISTING = {SKIP_EXISTING}")
    print(f"VERBOSE = {VERBOSE}")

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    if TOR_ENABLED:
        setup_tor()

    # Loop through link files
    for file_name in os.listdir(LINKS_DIR):
        file_path = os.path.join(LINKS_DIR, file_name)

        if not file_name.endswith(".txt"):
            continue

        parsed = parse_filename(file_name)
        if not parsed:
            continue

        group_number, letter, hotel_name = parsed
        if VERBOSE:
            print(f"\n[Group {group_number}] {hotel_name}")

        # Read links from the file
        with open(file_path, "r") as f:
            links = [line.strip() for line in f if line.strip()]

        # Download each link
        for idx, link in enumerate(links, start=1):
            prefix = chr(64 + idx)  # A, B, C...
            out_file = os.path.join(OUTPUT_DIR, f"{group_number}_{prefix}.mp4")
            download_clip(link, out_file)

        time.sleep(2)  # Small delay between files

    print("\n[✓] All downloads completed!")

if __name__ == "__main__":
    main()
