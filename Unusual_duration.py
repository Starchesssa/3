
#!/usr/bin/env python3
"""
Unusual_duration.py
-------------------
Match messy "Relevant" filenames to "Links" filenames, pick the correct
YouTube URL by letter index, fetch duration via YouTube Data API, and write
duration files into Unuusual_memory/DURATION/.

Env:
  YOUTUBE_API = your API key (required unless DRY_RUN=1)
  DRY_RUN     = "1" to skip API calls (testing)
  VERBOSE     = "1" for extra logs
"""

import os
import re
import sys
import requests

# ------------------------------------------------------------------
# Config paths
# ------------------------------------------------------------------
BASE_DIR      = "Unuusual_memory"
RELEVANT_DIR  = os.path.join(BASE_DIR, "Relevant")
LINKS_DIR     = os.path.join(BASE_DIR, "Links")
OUT_DIR       = os.path.join(BASE_DIR, "DURATION")

API_KEY  = os.environ.get("YOUTUBE_API")
DRY_RUN  = os.environ.get("DRY_RUN") == "1"
VERBOSE  = os.environ.get("VERBOSE") == "1"

# ------------------------------------------------------------------
# Logging
# ------------------------------------------------------------------
def log(msg):
    print(msg, flush=True)

def vlog(msg):
    if VERBOSE:
        log(msg)

def err(msg):
    print(msg, file=sys.stderr, flush=True)


# ------------------------------------------------------------------
# Slug canonicalization
# Turn any string into lowercase alphanumeric words joined by single "_"
# This lets dirty names like "robot  window-cleaner .TXT" match.
# ------------------------------------------------------------------
_slug_cleanup_re = re.compile(r'[^a-z0-9]+')

def canon_slug(s: str) -> str:
    s = s.lower()
    s = _slug_cleanup_re.sub("_", s)
    s = re.sub(r'_+', '_', s).strip('_')
    return s


# ------------------------------------------------------------------
# Filename parsing helpers (no complex regex)
# ------------------------------------------------------------------
def strip_ext(name: str) -> str:
    """Remove .txt (case-insensitive) + surrounding spaces/dots."""
    return re.sub(r'\.[tT][xX][tT]\s*$', '', name.strip())


def parse_relevant_filename(fname: str):
    """
    Parse e.g. '1(a)_robot_window_cleaner.txt' (messy allowed)
    Returns (num:int, slot_index:int, slug_norm:str) or None.
    """
    raw = fname
    name = strip_ext(raw)

    # Step 1: leading number
    i = 0
    while i < len(name) and name[i].isdigit():
        i += 1
    if i == 0:
        vlog(f"  [parse_relevant] no leading number in {fname!r}")
        return None
    num = int(name[:i])
    rest = name[i:].lstrip()

    # Step 2: expect '(' then slot token then ')'
    if not rest.startswith("("):
        vlog(f"  [parse_relevant] missing '(' after num in {fname!r}")
        return None
    rest = rest[1:]  # drop '('
    j = rest.find(")")
    if j == -1:
        vlog(f"  [parse_relevant] missing ')' in {fname!r}")
        return None
    slot_token = rest[:j].strip()
    if not slot_token:
        vlog(f"  [parse_relevant] empty slot token in {fname!r}")
        return None
    slot_token = slot_token[0]  # first char only
    rest = rest[j+1:].lstrip()  # after ')'

    # Step 3: expect underscore or space before slug
    # Accept any punctuation; find first underscore; else use rest
    if rest.startswith("_") or rest.startswith("-"):
        rest = rest[1:]
    elif rest and rest[0].isspace():
        rest = rest.lstrip()

    slug_raw = rest  # all remaining characters are slug raw
    slug_norm = canon_slug(slug_raw)

    # slot index
    if slot_token.isdigit():
        slot_index = int(slot_token) - 1  # 1->0
    else:
        slot_index = ord(slot_token.lower()) - ord('a')
    if slot_index < 0:
        slot_index = 0

    vlog(f"  [parse_relevant] {fname!r} -> num={num}, slot='{slot_token}', idx={slot_index}, slug='{slug_norm}'")
    return num, slot_index, slug_norm


def parse_links_filename(fname: str):
    """
    Parse e.g. '1_robot_window_cleaner.txt' (messy allowed)
    Returns (num:int, slug_norm:str) or None.
    """
    raw = fname
    name = strip_ext(raw)

    # number
    i = 0
    while i < len(name) and name[i].isdigit():
        i += 1
    if i == 0:
        vlog(f"  [parse_links] no leading num in {fname!r}")
        return None
    num = int(name[:i])
    rest = name[i:].lstrip(" _-")

    slug_norm = canon_slug(rest)
    vlog(f"  [parse_links] {fname!r} -> num={num}, slug='{slug_norm}'")
    return num, slug_norm


# ------------------------------------------------------------------
# Links loader
# ------------------------------------------------------------------
def load_links(path: str):
    links = []
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for ln, line in enumerate(f, 1):
            s = line.strip()
            if not s or s.startswith("#"):
                continue
            links.append(s)
    return links


# ------------------------------------------------------------------
# Extract YouTube video ID
# ------------------------------------------------------------------
_vid_re = re.compile(r'(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})')

def extract_video_id(url: str):
    m = _vid_re.search(url)
    return m.group(1) if m else None


# ------------------------------------------------------------------
# YouTube API duration lookup
# ------------------------------------------------------------------
def fetch_duration_iso(video_id: str):
    if DRY_RUN:
        vlog(f"    [API] DRY_RUN -> skip duration for {video_id}")
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
        err(f"❌ API error for {video_id}: {e}")
        return None

    items = data.get("items", [])
    if not items:
        err(f"❌ No items returned for video {video_id}")
        return None

    return items[0]["contentDetails"].get("duration")


def iso_to_seconds(duration_iso: str):
    m = re.match(r'^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$', duration_iso)
    if not m:
        return None
    h = int(m.group(1) or 0)
    mi = int(m.group(2) or 0)
    s = int(m.group(3) or 0)
    return h * 3600 + mi * 60 + s


# ------------------------------------------------------------------
# Build lookup: (num, slug) -> path to links file
# ------------------------------------------------------------------
def build_links_lookup():
    lookup = {}
    try:
        names = sorted(os.listdir(LINKS_DIR))
    except FileNotFoundError:
        err(f"❌ Links dir missing: {LINKS_DIR}")
        return lookup

    for fname in names:
        if not fname.lower().endswith(".txt"):
            continue
        parsed = parse_links_filename(fname)
        if not parsed:
            continue
        num, slug_norm = parsed
        lookup[(num, slug_norm)] = os.path.join(LINKS_DIR, fname)
    vlog(f"[build_links_lookup] mapped {len(lookup)} link files")
    return lookup


# ------------------------------------------------------------------
# Process one Relevant file
# ------------------------------------------------------------------
def process_relevant_file(fname: str, links_lookup: dict) -> bool:
    log(f"\n[process] Relevant: {fname}")
    rel_parsed = parse_relevant_filename(fname)
    if not rel_parsed:
        log(f"  ❌ cannot parse Relevant name; skipping")
        return False
    num, slot_index, slug_norm = rel_parsed

    key = (num, slug_norm)
    vlog(f"  -> key={key}")
    links_path = links_lookup.get(key)
    if not links_path:
        log(f"  ❌ no Links match for {key}")
        return False

    vlog(f"  -> Links file: {links_path}")
    links = load_links(links_path)
    if not links:
        log(f"  ❌ Links file empty: {links_path}")
        return False

    if slot_index >= len(links):
        log(f"  ❌ slot_index {slot_index} out of range; links={len(links)}")
        return False

    url = links[slot_index]
    log(f"  -> picked link[{slot_index}]={url}")

    vid = extract_video_id(url)
    if not vid:
        log("  ❌ cannot extract YouTube video ID from URL")
        return False

    dur_iso = fetch_duration_iso(vid)
    if not dur_iso:
        log(f"  ❌ failed to fetch duration for {vid}")
        return False

    dur_sec = iso_to_seconds(dur_iso)

    out_path = os.path.join(OUT_DIR, fname)
    try:
        with open(out_path, "w", encoding="utf-8") as out_f:
            out_f.write(f"{url}\n")
            out_f.write(f"Duration_ISO: {dur_iso}\n")
            if dur_sec is not None:
                out_f.write(f"Duration_seconds: {dur_sec}\n")
    except Exception as e:
        err(f"  ❌ write failed: {e}")
        return False

    log(f"  ✅ wrote {out_path} ({dur_iso}, {dur_sec}s)")
    return True


# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------
def main():
    log("=== Unusual_duration.py ===")
    log(f"RELEVANT_DIR = {RELEVANT_DIR}")
    log(f"LINKS_DIR    = {LINKS_DIR}")
    log(f"OUT_DIR      = {OUT_DIR}")
    log(f"DRY_RUN      = {DRY_RUN}")
    log(f"VERBOSE      = {VERBOSE}")
    log(f"API_KEY set? = {'YES' if API_KEY else 'NO (DRY_RUN ok)'}")

    if not os.path.isdir(RELEVANT_DIR):
        err(f"❌ Missing dir: {RELEVANT_DIR}")
        sys.exit(1)
    if not os.path.isdir(LINKS_DIR):
        err(f"❌ Missing dir: {LINKS_DIR}")
        sys.exit(1)

    links_lookup = build_links_lookup()

    rel_files = [f for f in sorted(os.listdir(RELEVANT_DIR)) if f.lower().endswith(".txt")]
    log(f"\nFound {len(rel_files)} Relevant .txt files:")
    for f in rel_files:
        log(f" - {f!r}")

    ok = fail = 0
    for fname in rel_files:
        if process_relevant_file(fname, links_lookup):
            ok += 1
        else:
            fail += 1

    log("\n=== Summary ===")
    log(f"OK:   {ok}")
    log(f"Fail: {fail}")
    # exit code optional:
    # sys.exit(1 if fail else 0)


if __name__ == "__main__":
    main()
