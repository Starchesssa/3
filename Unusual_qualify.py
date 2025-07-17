
#!/usr/bin/env python3
"""
Select the top-rated entry per group (from Unuusual_memory/RATING/) and
write the winners to Unuusual_memory/QUALIFY/qualified.txt.

Tie-break: highest score wins. If scores tie, look up the corresponding
duration file in Unuusual_memory/DURATION/<same filename>.txt and choose
the *longest* duration_seconds. If still tied (missing or equal duration),
choose earliest letter (a<b<c).

Env:
  VERBOSE=1  -> extra logging
"""

import os
import re
import sys

BASE_DIR      = "Unuusual_memory"
RATING_DIR    = os.path.join(BASE_DIR, "RATING")
DURATION_DIR  = os.path.join(BASE_DIR, "DURATION")
QUALIFY_DIR   = os.path.join(BASE_DIR, "QUALIFY")
OUT_PATH      = os.path.join(QUALIFY_DIR, "qualified.txt")

VERBOSE = os.environ.get("VERBOSE") == "1"

def vlog(msg):
    if VERBOSE:
        print(msg, flush=True)

def err(msg):
    print(msg, file=sys.stderr, flush=True)

# ---------- filename parse ----------
# tolerant: <num>(<token>)_something.txt (spaces allowed)
fname_re = re.compile(r'^\s*(\d+)\s*\s*([A-Za-z0-9])\s*\s*[_\s]+(.+?)\s*\.txt\s*$', re.IGNORECASE)

def parse_filename(name: str):
    """Return (group_num:int, slot_token:str) or None."""
    m = fname_re.match(name)
    if not m:
        return None
    group_num = int(m.group(1))
    slot_token = m.group(2)[0]
    return group_num, slot_token

def slot_index(slot_token: str) -> int:
    """Map a/b/c -> 0/1/2 ; digits -> 1-based -> 0-based."""
    if slot_token.isdigit():
        return max(0, int(slot_token) - 1)
    return max(0, ord(slot_token.lower()) - ord('a'))

# ---------- score parse ----------
# Accept: Overall Score: 8/10  OR "overall score - 9 / 10"  OR "... 6 of 10"
score_re = re.compile(r'overall\s*score\s*[:\-]?\s*(\d+)\s*(?:/|of)\s*(\d+)', re.IGNORECASE)

def extract_score(path: str):
    """Return score 0-10 (int) or None if not found."""
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except Exception as e:
        err(f"Cannot read {path}: {e}")
        return None

    m = score_re.search(text)
    if not m:
        vlog(f"  [extract_score] no score in {path}")
        return None

    num = int(m.group(1))
    denom = int(m.group(2))
    if denom <= 0:
        denom = 10
    score10 = round((num / denom) * 10)
    return max(0, min(10, score10))

# ---------- duration parse ----------
# Look for "Duration_seconds: N" (preferred); fallback parse ISO
dur_secs_re = re.compile(r'Duration_seconds:\s*(\d+)', re.IGNORECASE)
dur_iso_re  = re.compile(r'Duration_ISO:\s*(PT\S+)', re.IGNORECASE)

def parse_iso_duration(iso: str):
    """Parse YouTube-style ISO 8601 PT#H#M#S to seconds."""
    m = re.match(r'^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$', iso)
    if not m:
        return None
    h = int(m.group(1) or 0)
    mi = int(m.group(2) or 0)
    s = int(m.group(3) or 0)
    return h*3600 + mi*60 + s

def get_duration_seconds_for_filename(fname: str):
    """
    Given rating filename (e.g., 1(a)_robot_window_cleaner.txt),
    check DURATION_DIR for a file with the *exact* same name.
    Return int seconds (>=0) or 0 if not found.
    """
    path = os.path.join(DURATION_DIR, fname)
    if not os.path.isfile(path):
        vlog(f"  [duration] missing {path}, using 0")
        return 0

    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except Exception as e:
        err(f"  [duration] read fail {path}: {e}")
        return 0

    # Prefer explicit seconds
    m = dur_secs_re.search(text)
    if m:
        secs = int(m.group(1))
        vlog(f"  [duration] {fname}: seconds={secs}")
        return secs

    # Fallback to ISO
    m2 = dur_iso_re.search(text)
    if m2:
        iso_val = m2.group(1).strip()
        secs = parse_iso_duration(iso_val)
        if secs is not None:
            vlog(f"  [duration] {fname}: parsed from ISO={secs}")
            return secs

    vlog(f"  [duration] no duration parsed in {fname}, using 0")
    return 0

# ---------- main ----------
def main():
    if not os.path.isdir(RATING_DIR):
        err(f"Missing directory: {RATING_DIR}")
        sys.exit(1)

    os.makedirs(QUALIFY_DIR, exist_ok=True)

    files = [f for f in os.listdir(RATING_DIR) if f.lower().endswith(".txt")]
    files.sort()

    if VERBOSE:
        print(f"Found {len(files)} rating files:")
        for f in files:
            print(f" - {f}")

    # group -> list of (score, duration, slot_idx, filename)
    groups = {}

    for fname in files:
        parsed = parse_filename(fname)
        if not parsed:
            vlog(f"Skip unparseable: {fname!r}")
            continue

        group_num, slot_token = parsed
        idx = slot_index(slot_token)

        rating_path = os.path.join(RATING_DIR, fname)
        score = extract_score(rating_path)
        if score is None:
            vlog(f"No score in {fname}; using 0")
            score = 0

        duration_sec = get_duration_seconds_for_filename(fname)

        groups.setdefault(group_num, []).append((score, duration_sec, idx, fname))

    # pick winner per group using sort: score desc, duration desc, letter idx asc
    winners = []
    for group_num, entries in groups.items():
        entries.sort(key=lambda t: (-t[0], -t[1], t[2], t[3]))
        top = entries[0]
        score, duration_sec, idx, fname = top
        winners.append((group_num, score, duration_sec, fname))

    # sort winners by group num asc
    winners.sort(key=lambda t: t[0])

    # write output
    try:
        with open(OUT_PATH, "w", encoding="utf-8") as out_f:
            for group_num, score, duration_sec, fname in winners:
                out_f.write(f"Group {group_num}: {fname}\n")
    except Exception as e:
        err(f"Failed to write {OUT_PATH}: {e}")
        sys.exit(1)

    print(f"✅ Wrote {OUT_PATH} with {len(winners)} groups.")
    if VERBOSE:
        for group_num, score, duration_sec, fname in winners:
            print(f"  Group {group_num}: {fname} (score {score}/10, {duration_sec}s)")

if __name__ == "__main__":
    main()
