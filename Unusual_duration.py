
#!/usr/bin/env python3
"""
Unusual_duration.py

Match each file in Unuusual_memory/Relevant/ like:
  1(a)_robot_window_cleaner.txt
  1(b)_robot_window_cleaner.txt
with its corresponding Links file:
  1_robot_window_cleaner.txt

Then:
- map letter (a=0, b=1, c=2, ...)
- read that link from the links file
- call YouTube Data API v3 to get duration (contentDetails.duration)
- write out Unuusual_memory/DURATION/<same relevant filename>.txt
"""

import os
import re
import sys
import requests

BASE_DIR = "Unuusual_memory"
RELEVANT_DIR = os.path.join(BASE_DIR, "Relevant")
LINKS_DIR = os.path.join(BASE_DIR, "Links")
OUT_DIR = os.path.join(BASE_DIR, "DURATION")

API_KEY = os.environ.get("YOUTUBE_API")
if not API_KEY:
    print("❌ ERROR: env var YOUTUBE_API not set.", file=sys.stderr)
    sys.exit(1)

os.makedirs(OUT_DIR, exist_ok=True)


# ---------- Helpers ----------

_slug_cleanup_re = re.compile(r'[^a-z0-9]+')

def normalize_slug(s: str) -> str:
    s = s.lower()
    s = _slug_cleanup_re.sub("_", s)
    s = re.sub(r'_+', '_', s).strip('_')
    return s


# Relevant filename pattern: NUMBER(PART)_SLUG.txt
RELEVANT_RE = re.compile(r'^(\d+)\s*\s*([A-Za-z0-9])\s*\s*_(.+?)\.txt$', re.IGNORECASE)

# Links filename pattern: NUMBER_SLUG.txt
LINKS_RE = re.compile(r'^(\d+)\s*[_\s]\s*(.+?)\.txt$', re.IGNORECASE)


def parse_relevant_name(name: str):
    """
    Return (number:int, slot_index:int, slug_norm:str) or None if no match.
    slot_index: a=0,b=1,...; digits treated 1-based -> index-1
    """
    m = RELEVANT_RE.match(name.strip())
    if not m:
        return None
    num = int(m.group(1))
    raw_slot = m.group(2)
    raw_slug = m.group(3)

    if raw_slot.isdigit():
        slot_index = int(raw_slot) - 1
    else:
        slot_index = ord(raw_slot.lower()) - ord('a')

    if slot_index < 0:
        slot_index = 0  # safety

    slug_norm = normalize_slug(raw_slug)
    return num, slot_index, slug_norm


def parse_links_name(name: str):
    """
    Return (number:int, slug_norm:str) or None if no match.
    Accepts 1_robot_window_cleaner.txt or sloppy 1 robot window cleaner.txt
    """
    m = LINKS_RE.match(name.strip())
    if not m:
        return None
    num = int(m.group(1))
    raw_slug = m.group(2)
    slug_norm = normalize_slug(raw_slug)
    return num, slug_norm


def load_links(path: str):
    """
    Load non-empty, non-comment lines from a links file.
    """
    links = []
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            links.append(line)
    return links


def get_video_id(url: str):
    # support watch?v=, share links, short links
    m = re.search(r'(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})', url)
    return m.group(1) if m else None


def fetch_duration_iso(video_id: str):
    api_url = (
        "https://www.googleapis.com/youtube/v3/videos"
        f"?part=contentDetails&id={video_id}&key={API_KEY}"
    )
    try:
        r = requests.get(api_url, timeout=20)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"❌ API error for {video_id}: {e}", file=sys.stderr)
        return None

    items = data.get("items", [])
    if not items:
        print(f"❌ No API items for {video_id}", file=sys.stderr)
        return None

    return items[0]["contentDetails"].get("duration")


def iso_to_seconds(duration_iso: str):
    """
    Parse a subset of ISO 8601 durations used by YouTube: PT#H#M#S
    """
    m = re.match(r'^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$', duration_iso)
    if not m:
        return None
    h = int(m.group(1) or 0)
    mi = int(m.group(2) or 0)
    s = int(m.group(3) or 0)
    return h * 3600 + mi * 60 + s


# ---------- Build lookup for Links ----------

def build_links_lookup():
    """
    Scan LINKS_DIR and map (num, slug_norm) -> fullpath
    """
    lookup = {}
    for fname in os.listdir(LINKS_DIR):
        if not fname.lower().endswith(".txt"):
            continue
        parsed = parse_links_name(fname)
        if not parsed:
            continue
        num, slug_norm = parsed
        path = os.path.join(LINKS_DIR, fname)
        lookup[(num, slug_norm)] = path
    return lookup


# ---------- Main processing ----------

def process_all():
    links_lookup = build_links_lookup()

    relevant_files = [f for f in os.listdir(RELEVANT_DIR) if f.lower().endswith(".txt")]
    relevant_files.sort()

    processed = 0
    skipped = 0

    for fname in relevant_files:
        parsed = parse_relevant_name(fname)
        if not parsed:
            print(f"⚠️ Skip unmatched Relevant file name pattern: {fname}")
            skipped += 1
            continue

        num, slot_index, slug_norm = parsed
        key = (num, slug_norm)

        links_path = links_lookup.get(key)
        if not links_path:
            print(f"❌ No Links file match for {fname} -> need {num}_{slug_norm}.txt")
            skipped += 1
            continue

        links = load_links(links_path)
        if slot_index >= len(links):
            print(f"❌ Slot {slot_index} out of range ({len(links)} links) for {fname}")
            skipped += 1
            continue

        link_url = links[slot_index]
        vid = get_video_id(link_url)
        if not vid:
            print(f"❌ Bad link in {links_path} slot {slot_index}: {link_url}")
            skipped += 1
            continue

        dur_iso = fetch_duration_iso(vid)
        if not dur_iso:
            print(f"❌ No duration for {vid} ({fname})")
            skipped += 1
            continue

        dur_sec = iso_to_seconds(dur_iso)

        out_path = os.path.join(OUT_DIR, fname)
        with open(out_path, "w", encoding="utf-8") as out_f:
            out_f.write(f"{link_url}\n")
            out_f.write(f"Duration_ISO: {dur_iso}\n")
            if dur_sec is not None:
                out_f.write(f"Duration_seconds: {dur_sec}\n")

        print(f"✅ {fname}: {dur_iso} ({dur_sec}s)")
        processed += 1

    print(f"\nDone. Processed: {processed}, Skipped: {skipped}")


if __name__ == "__main__":
    if not os.path.isdir(RELEVANT_DIR):
        print(f"❌ Missing directory: {RELEVANT_DIR}", file=sys.stderr)
        sys.exit(1)
    if not os.path.isdir(LINKS_DIR):
        print(f"❌ Missing directory: {LINKS_DIR}", file=sys.stderr)
        sys.exit(1)
    process_all()
