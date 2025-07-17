
#!/usr/bin/env python3
"""
Unusual_duration.py (Clean Version)

Goal:
Match files in:
  Unuusual_memory/Relevant/<num>_<letter>_<slug>.txt
to
  Unuusual_memory/Links/<num>_<slug>.txt

Letter index: a=0, b=1, c=2, d=3, ...

Then fetch YouTube duration for the matching link and write:
  Unuusual_memory/DURATION/<same relevant filename>.txt

Use env var DRY_RUN=1 to skip API calls (no quota usage).
"""

import os
import re
import sys
import requests

# ---- Config ----
BASE_DIR = "Unuusual_memory"
RELEVANT_DIR = os.path.join(BASE_DIR, "Relevant")
LINKS_DIR = os.path.join(BASE_DIR, "Links")
OUT_DIR = os.path.join(BASE_DIR, "DURATION")

API_KEY = os.environ.get("YOUTUBE_API")
DRY_RUN = os.environ.get("DRY_RUN") == "1"

# ---- Utility Logging ----
def log(msg):
    print(msg, flush=True)

def err(msg):
    print(msg, file=sys.stderr, flush=True)

# ---- Slug normalization ----
_slug_cleanup_re = re.compile(r'[^a-z0-9]+')

def normalize_slug(s: str) -> str:
    s = s.lower()
    s = _slug_cleanup_re.sub("_", s)
    s = re.sub(r'_+', '_', s).strip('_')
    return s

# ---- Patterns ----
RELEVANT_RE = re.compile(
    r'^\s*(\d+)_([A-Za-z0-9])_([^.]+)\.txt\s*$',
    re.IGNORECASE
)

LINKS_RE = re.compile(
    r'^\s*(\d+)[_\s]+([^.]+)\.txt\s*$',
    re.IGNORECASE
)

def parse_relevant_name(name: str):
    m = RELEVANT_RE.match(name)
    if not m:
        return None
    num = int(m.group(1))
    slot_token = m.group(2)
    raw_slug = m.group(3)

    slot_index = int(slot_token) - 1 if slot_token.isdigit() else ord(slot_token.lower()) - ord('a')
    slot_index = max(slot_index, 0)

    slug_norm = normalize_slug(raw_slug)
    return num, slot_index, slug_norm

def parse_links_name(name: str):
    m = LINKS_RE.match(name)
    if not m:
        return None
    num = int(m.group(1))
    raw_slug = m.group(2)
    slug_norm = normalize_slug(raw_slug)
    return num, slug_norm

def load_links(path: str):
    links = []
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            raw = line.strip()
            if raw and not raw.startswith("#"):
                links.append(raw)
    return links

def get_video_id(url: str):
    m = re.search(r'(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})', url)
    return m.group(1) if m else None

def fetch_duration_iso(video_id: str):
    if DRY_RUN:
        return "PT0S"
    api_url = (
        "https://www.googleapis.com/youtube/v3/videos"
        f"?part=contentDetails&id={video_id}&key={API_KEY}"
    )
    try:
        r = requests.get(api_url, timeout=20)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        err(f"API error for {video_id}: {e}")
        return None

    items = data.get("items", [])
    if not items:
        return None
    return items[0]["contentDetails"].get("duration")

def iso_to_seconds(duration_iso: str):
    m = re.match(r'^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$', duration_iso)
    if not m:
        return None
    h, mi, s = int(m.group(1) or 0), int(m.group(2) or 0), int(m.group(3) or 0)
    return h * 3600 + mi * 60 + s

def build_links_lookup():
    lookup = {}
    for fname in sorted(os.listdir(LINKS_DIR)):
        if not fname.lower().endswith(".txt"):
            continue
        parsed = parse_links_name(fname)
        if parsed:
            num, slug_norm = parsed
            lookup[(num, slug_norm)] = os.path.join(LINKS_DIR, fname)
    return lookup

def process_one(relevant_fname, links_lookup):
    parsed = parse_relevant_name(relevant_fname)
    if not parsed:
        return False
    num, slot_index, slug_norm = parsed
    links_path = links_lookup.get((num, slug_norm))
    if not links_path:
        return False

    links = load_links(links_path)
    if slot_index >= len(links):
        return False

    link_url = links[slot_index]
    video_id = get_video_id(link_url)
    if not video_id:
        return False

    duration_iso = fetch_duration_iso(video_id)
    if not duration_iso:
        return False

    duration_seconds = iso_to_seconds(duration_iso)
    out_path = os.path.join(OUT_DIR, relevant_fname)

    try:
        with open(out_path, "w", encoding="utf-8") as out_f:
            out_f.write(f"{link_url}\n")
            out_f.write(f"Duration_ISO: {duration_iso}\n")
            if duration_seconds is not None:
                out_f.write(f"Duration_seconds: {duration_seconds}\n")
    except Exception as e:
        err(f"Write error: {e}")
        return False

    return True

def main():
    if not os.path.isdir(RELEVANT_DIR) or not os.path.isdir(LINKS_DIR):
        err("Missing required directories.")
        sys.exit(1)

    os.makedirs(OUT_DIR, exist_ok=True)

    links_lookup = build_links_lookup()
    relevant_files = [f for f in sorted(os.listdir(RELEVANT_DIR)) if f.lower().endswith(".txt")]

    processed = sum(1 for rf in relevant_files if process_one(rf, links_lookup))
    failed = len(relevant_files) - processed

    log(f"✅ Done: {processed} processed, {failed} failed.")

if __name__ == "__main__":
    main()
