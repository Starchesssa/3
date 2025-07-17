
#!/usr/bin/env python3
"""
Unusual_duration.py (Debug Version)

Goal:
Match files in:
  Unuusual_memory/Relevant/<num>(<letter>)_<slug>.txt
to
  Unuusual_memory/Links/<num>_<slug>.txt

Letter index: a=0, b=1, c=2, d=3, ...

Then fetch YouTube duration for the matching link and write:
  Unuusual_memory/DURATION/<same relevant filename>.txt

Debug logging is extremely verbose to diagnose matching failures.
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
DRY_RUN = os.environ.get("DRY_RUN") == "1"  # skip API calls if set

# ---- Utility Logging ----
def log(msg):
    print(msg, flush=True)

def err(msg):
    print(msg, file=sys.stderr, flush=True)

# ---- Check env ----
if not DRY_RUN and not API_KEY:
    err("❌ ERROR: env var YOUTUBE_API not set (and DRY_RUN not enabled).")
    sys.exit(1)

# Ensure output dir
os.makedirs(OUT_DIR, exist_ok=True)

# ---- Slug normalization ----
_slug_cleanup_re = re.compile(r'[^a-z0-9]+')

def normalize_slug(s: str) -> str:
    s = s.lower()
    s = _slug_cleanup_re.sub("_", s)
    s = re.sub(r'_+', '_', s).strip('_')
    return s

# ---- Parse patterns ----
# Relevant: 26(a)_robot_window_cleaner.txt
RELEVANT_RE = re.compile(
    r'^\s*(\d+)\s*\s*([A-Za-z0-9])\s*\s*[_\s]+(.+?)\s*\.txt\s*$',
    re.IGNORECASE
)

# Links: 26_robot_window_cleaner.txt  (allow spaces/underscores between num & slug)
LINKS_RE = re.compile(
    r'^\s*(\d+)\s*[_\s]+(.+?)\s*\.txt\s*$',
    re.IGNORECASE
)

def parse_relevant_name(name: str):
    log(f"  [parse_relevant_name] raw='{name}'")
    m = RELEVANT_RE.match(name)
    if not m:
        log("    -> no match")
        return None
    num = int(m.group(1))
    slot_token = m.group(2)
    raw_slug = m.group(3)
    log(f"    extracted: num={num}, slot_token='{slot_token}', raw_slug='{raw_slug}'")

    # letter or digit
    if slot_token.isdigit():
        slot_index = int(slot_token) - 1  # 1-based digits -> 0-based index
    else:
        slot_index = ord(slot_token.lower()) - ord('a')

    if slot_index < 0:
        log(f"    slot_index computed negative ({slot_index}) -> forcing 0")
        slot_index = 0

    slug_norm = normalize_slug(raw_slug)
    log(f"    slug_norm='{slug_norm}', slot_index={slot_index}")
    return num, slot_index, slug_norm

def parse_links_name(name: str):
    log(f"  [parse_links_name] raw='{name}'")
    m = LINKS_RE.match(name)
    if not m:
        log("    -> no match")
        return None
    num = int(m.group(1))
    raw_slug = m.group(2)
    slug_norm = normalize_slug(raw_slug)
    log(f"    extracted: num={num}, slug_norm='{slug_norm}'")
    return num, slug_norm

def load_links(path: str):
    log(f"    [load_links] reading: {path}")
    links = []
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for ln, line in enumerate(f, start=1):
            raw = line.strip()
            if not raw:
                log(f"      line {ln}: blank -> skip")
                continue
            if raw.startswith("#"):
                log(f"      line {ln}: comment -> skip")
                continue
            log(f"      line {ln}: link='{raw}'")
            links.append(raw)
    log(f"    -> loaded {len(links)} usable links")
    return links

def get_video_id(url: str):
    log(f"    [get_video_id] url='{url}'")
    # watch?v=VIDEOID
    m = re.search(r'(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})', url)
    if not m:
        log("      -> no video id found")
        return None
    vid = m.group(1)
    log(f"      -> video_id='{vid}'")
    return vid

def fetch_duration_iso(video_id: str):
    if DRY_RUN:
        log(f"    [fetch_duration_iso] DRY_RUN=1 -> skipping API call for {video_id}")
        return "PT0S"  # dummy
    api_url = (
        "https://www.googleapis.com/youtube/v3/videos"
        f"?part=contentDetails&id={video_id}&key={API_KEY}"
    )
    log(f"    [fetch_duration_iso] GET {api_url}")
    try:
        r = requests.get(api_url, timeout=20)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        err(f"❌ API error for {video_id}: {e}")
        return None

    items = data.get("items", [])
    if not items:
        err(f"❌ No API items for {video_id}")
        return None

    dur_iso = items[0]["contentDetails"].get("duration")
    log(f"      -> duration_iso='{dur_iso}'")
    return dur_iso

def iso_to_seconds(duration_iso: str):
    log(f"    [iso_to_seconds] iso='{duration_iso}'")
    m = re.match(r'^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$', duration_iso)
    if not m:
        log("      -> parse fail (return None)")
        return None
    h = int(m.group(1) or 0)
    mi = int(m.group(2) or 0)
    s = int(m.group(3) or 0)
    total = h * 3600 + mi * 60 + s
    log(f"      -> total_seconds={total}")
    return total

def build_links_lookup():
    """
    Scan LINKS_DIR and map (num, slug_norm) -> fullpath
    """
    log(f"\n[build_links_lookup] scanning: {LINKS_DIR}")
    lookup = {}
    for fname in sorted(os.listdir(LINKS_DIR)):
        if not fname.lower().endswith(".txt"):
            log(f"  skip (not .txt): {fname}")
            continue
        parsed = parse_links_name(fname)
        if not parsed:
            log(f"  skip (name didn't match pattern): {fname}")
            continue
        num, slug_norm = parsed
        path = os.path.join(LINKS_DIR, fname)
        key = (num, slug_norm)
        if key in lookup:
            log(f"  ⚠️ duplicate key {key} -> overwriting with {fname}")
        lookup[key] = path
    log(f"[build_links_lookup] total mapped: {len(lookup)}")
    return lookup

def process_one(relevant_fname, links_lookup):
    log(f"\n[process_one] Relevant file: {relevant_fname}")
    parsed = parse_relevant_name(relevant_fname)
    if not parsed:
        log(f"  ❌ unmatched Relevant name pattern -> skip")
        return False

    num, slot_index, slug_norm = parsed
    key = (num, slug_norm)
    log(f"  -> looking for Links key={key}")

    links_path = links_lookup.get(key)
    if not links_path:
        log(f"  ❌ no Links file found for {key}")
        return False

    log(f"  -> found Links file: {links_path}")
    links = load_links(links_path)

    if slot_index >= len(links):
        log(f"  ❌ slot_index {slot_index} out of range; links available={len(links)}")
        return False

    link_url = links[slot_index]
    log(f"  -> selected link[{slot_index}]={link_url}")

    vid = get_video_id(link_url)
    if not vid:
        log(f"  ❌ could not parse video id from link")
        return False

    dur_iso = fetch_duration_iso(vid)
    if not dur_iso:
        log(f"  ❌ API did not return duration for {vid}")
        return False

    dur_sec = iso_to_seconds(dur_iso)

    out_path = os.path.join(OUT_DIR, relevant_fname)
    log(f"  -> writing: {out_path}")
    try:
        with open(out_path, "w", encoding="utf-8") as out_f:
            out_f.write(f"{link_url}\n")
            out_f.write(f"Duration_ISO: {dur_iso}\n")
            if dur_sec is not None:
                out_f.write(f"Duration_seconds: {dur_sec}\n")
    except Exception as e:
        err(f"  ❌ write failed: {e}")
        return False

    log(f"  ✅ success: {relevant_fname} ({dur_iso}, {dur_sec}s)")
    return True

def main():
    log(f"=== Unusual_duration.py Debug Run ===")
    log(f"BASE_DIR     = {BASE_DIR}")
    log(f"RELEVANT_DIR = {RELEVANT_DIR}")
    log(f"LINKS_DIR    = {LINKS_DIR}")
    log(f"OUT_DIR      = {OUT_DIR}")
    log(f"DRY_RUN      = {DRY_RUN}")
    log(f"API_KEY set? = {'YES' if API_KEY else 'NO'}")

    if not os.path.isdir(RELEVANT_DIR):
        err(f"❌ Missing dir: {RELEVANT_DIR}")
        sys.exit(1)
    if not os.path.isdir(LINKS_DIR):
        err(f"❌ Missing dir: {LINKS_DIR}")
        sys.exit(1)

    # Build lookup
    links_lookup = build_links_lookup()

    # List Relevant files
    relevant_files = [f for f in sorted(os.listdir(RELEVANT_DIR)) if f.lower().endswith(".txt")]
    log(f"\nFound {len(relevant_files)} Relevant *.txt files:")
    for f in relevant_files:
        log(f"  - {f}")

    processed = 0
    failed = 0

    for rf in relevant_files:
        ok = process_one(rf, links_lookup)
        if ok:
            processed += 1
        else:
            failed += 1

    log(f"\n=== Done ===")
    log(f"Processed OK: {processed}")
    log(f"Failed:       {failed}")

    # Exit non-zero if failures? (optional)
    # sys.exit(1 if failed else 0)

if __name__ == "__main__":
    main()
