
#!/usr/bin/env python3
import os
import re
import sys
import requests

# --- CONFIG ---
BASE_DIR = "Unuusual_memory"
RELEVANT_DIR = os.path.join(BASE_DIR, "Relevant")
LINKS_DIR = os.path.join(BASE_DIR, "Links")
DURATION_DIR = os.path.join(BASE_DIR, "DURATION")

API_KEY = os.environ.get("YOUTUBE_API")
if not API_KEY:
    print("❌ ERROR: YOUTUBE_API environment variable not set.", file=sys.stderr)
    sys.exit(1)

# Create output dir
os.makedirs(DURATION_DIR, exist_ok=True)

# --- HELPERS ---

def debug(msg):
    print(msg, flush=True)

def extract_num_and_slot(filename: str):
    """
    Parse things like:
      26(a)_ _smart_projection_clock. txt
      4(C)_Smart_toilet_bidet.txt
      28(d)_smart_beverage_warmer.txt
      4(1)_smart__toilet_bidet.txt   <-- sloppy, we'll treat (1) as slot 0

    Returns (number:int, slot_index:int) or (None, None) if no match.
    """
    # Strip extension spaces
    name = filename.strip()

    # Quick reject non-txt
    if not name.lower().endswith(".txt"):
        return (None, None)

    # Extract leading digits and the (...) token
    # Allow spaces:  26 ( a ) _stuff
    m = re.search(r'^\s*(\d+)\s*\s*([^)]+)\s*', name)
    if not m:
        return (None, None)

    num_str = m.group(1)
    slot_raw = m.group(2).strip()

    # Normalize slot: take first alnum char
    slot_char = None
    for ch in slot_raw:
        if ch.isalnum():
            slot_char = ch
            break

    if slot_char is None:
        return (None, None)

    # Convert to index
    if slot_char.isdigit():
        # interpret 1-based digit
        slot_index = int(slot_char) - 1
    else:
        # letter
        slot_index = ord(slot_char.lower()) - ord('a')

    if slot_index < 0:
        slot_index = 0  # fail-safe

    return (int(num_str), slot_index)


def find_links_file(number: int, link_files):
    """
    Look for a Links file starting with '<number>_' (ignores case/spacing).
    Returns filename or None.
    """
    prefix = f"{number}_"
    prefix_alt = f"{number} "  # in case of space instead of underscore
    numstr = str(number)

    candidates = []
    for lf in link_files:
        lf_clean = lf.strip().lower()
        if lf_clean.startswith(prefix.lower()) or lf_clean.startswith(prefix_alt.lower()):
            candidates.append(lf)
        else:
            # as fallback: check that it STARTS with number even if no underscore
            if lf_clean.startswith(numstr):
                candidates.append(lf)

    if not candidates:
        return None

    # If multiple matches, pick the shortest name (most likely correct)
    return sorted(candidates, key=len)[0]


def load_links_from_file(path):
    links = []
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if line.startswith("#"):
                continue
            links.append(line)
    return links


def get_video_id_from_url(url):
    """
    Support standard watch URLs and share links.
    """
    # watch?v=VIDEOID
    m = re.search(r'(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})', url)
    return m.group(1) if m else None


def get_duration_iso(video_id):
    """
    Call YouTube API for 1 video; returns ISO8601 duration or None.
    """
    api_url = (
        "https://www.googleapis.com/youtube/v3/videos"
        f"?part=contentDetails&id={video_id}&key={API_KEY}"
    )
    try:
        r = requests.get(api_url, timeout=20)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        debug(f"❌ API error for {video_id}: {e}")
        return None

    items = data.get("items", [])
    if not items:
        debug(f"❌ No items returned for {video_id}.")
        return None

    return items[0]["contentDetails"].get("duration")


def iso_to_seconds(duration_iso):
    """
    Convert ISO8601 to seconds without extra deps.
    Example inputs: PT3M45S, PT1H2M10S, PT45S
    """
    # Regex parse
    # PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?
    m = re.match(r'^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$', duration_iso)
    if not m:
        return None
    h = int(m.group(1) or 0)
    m_ = int(m.group(2) or 0)
    s = int(m.group(3) or 0)
    return h * 3600 + m_ * 60 + s


def process_file(relevant_filename, link_files):
    number, slot_index = extract_num_and_slot(relevant_filename)
    if number is None:
        debug(f"Skipping unmatched file: {relevant_filename}")
        return

    link_file = find_links_file(number, link_files)
    if not link_file:
        debug(f"❌ No link file found for number {number} ({relevant_filename})")
        return

    links_path = os.path.join(LINKS_DIR, link_file)
    links = load_links_from_file(links_path)

    if slot_index >= len(links):
        debug(f"❌ Slot {slot_index} out of range for {link_file} (has {len(links)} links) [{relevant_filename}]")
        return

    url = links[slot_index]
    vid = get_video_id_from_url(url)
    if not vid:
        debug(f"❌ Could not parse video ID from URL: {url} [{relevant_filename}]")
        return

    dur_iso = get_duration_iso(vid)
    if not dur_iso:
        debug(f"❌ Could not retrieve duration for {vid} [{relevant_filename}]")
        return

    dur_sec = iso_to_seconds(dur_iso)

    # Write result
    out_path = os.path.join(DURATION_DIR, relevant_filename)
    with open(out_path, "w", encoding="utf-8") as out_f:
        out_f.write(f"{url}\n")
        out_f.write(f"Duration_ISO: {dur_iso}\n")
        if dur_sec is not None:
            out_f.write(f"Duration_seconds: {dur_sec}\n")

    debug(f"✅ {relevant_filename} → {dur_sec if dur_sec is not None else dur_iso}")


def main():
    if not os.path.isdir(RELEVANT_DIR):
        print(f"❌ Relevant dir not found: {RELEVANT_DIR}", file=sys.stderr)
        sys.exit(1)
    if not os.path.isdir(LINKS_DIR):
        print(f"❌ Links dir not found: {LINKS_DIR}", file=sys.stderr)
        sys.exit(1)

    link_files = [f for f in os.listdir(LINKS_DIR) if f.lower().endswith(".txt")]
    relevant_files = [f for f in os.listdir(RELEVANT_DIR) if f.lower().endswith(".txt")]

    if not relevant_files:
        debug("⚠️ No relevant TXT files found.")
    if not link_files:
        debug("⚠️ No link TXT files found.")

    # Sort numeric by extracted number so logs are stable
    relevant_files.sort()

    for rf in relevant_files:
        process_file(rf, link_files)


if __name__ == "__main__":
    main()
