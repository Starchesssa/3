
#!/usr/bin/env python3
"""
Unusual_qualify.py
------------------
Select the top-rated entry per group from Unuusual_memory/RATING/.
Tie-break by longest duration from Unuusual_memory/DURATION/.
If still tied, choose earliest letter (a < b < c ...).

Verbose diagnostics are printed so GitHub Actions logs always show what happened.

ENV VARS:
  VERBOSE=1     Print extra diagnostics (default: ON if in CI, else OFF)
  STRICT=1      Exit with code 1 if *no* groups processed
  SHOW_CONTENT=1  Print score & duration file excerpts (debug heavy)
"""

import os
import re
import sys

# ------------------------------------------------------------------
# Config paths
# ------------------------------------------------------------------
BASE_DIR      = "Unuusual_memory"
RATING_DIR    = os.path.join(BASE_DIR, "RATING")
DURATION_DIR  = os.path.join(BASE_DIR, "DURATION")
QUALIFY_DIR   = os.path.join(BASE_DIR, "QUALIFY")
OUT_PATH      = os.path.join(QUALIFY_DIR, "qualified.txt")

# ------------------------------------------------------------------
# Env settings
# ------------------------------------------------------------------
def _truthy(x):
    return str(x).strip().lower() in ("1", "true", "yes", "on")

VERBOSE      = _truthy(os.environ.get("VERBOSE", "1"))  # default ON
STRICT       = _truthy(os.environ.get("STRICT", "0"))
SHOW_CONTENT = _truthy(os.environ.get("SHOW_CONTENT", "0"))

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
# Filename parsing
# Expect things like: 12(a)_smart_widget.txt  (spaces tolerated)
# ------------------------------------------------------------------
FNAME_RE = re.compile(
    r'^\s*(\d+)\s*\s*([A-Za-z0-9])\s*\s*[_\s]+(.+?)\s*\.txt\s*$',
    re.IGNORECASE
)

def parse_filename(name: str):
    """
    Parse rating filename -> (group_num:int, slot_token:str).
    Returns None if not parseable.
    """
    m = FNAME_RE.match(name)
    if not m:
        return None
    group_num  = int(m.group(1))
    slot_token = m.group(2)[0]
    return group_num, slot_token

def slot_index(slot_token: str) -> int:
    """Map a/b/c -> 0/1/2 ; digits -> 1-based -> 0-based."""
    if slot_token.isdigit():
        return max(0, int(slot_token) - 1)
    return max(0, ord(slot_token.lower()) - ord('a'))

# ------------------------------------------------------------------
# Score parsing
# Looks for line fragment "Overall Score: 8/10" or similar.
# Accept "overall score - 9 / 10", "... 6 of 10" etc.
# ------------------------------------------------------------------
SCORE_RE = re.compile(
    r'overall\s*score\s*[:\-]?\s*(\d+)\s*(?:/|of)\s*(\d+)',
    re.IGNORECASE
)

def extract_score(path: str):
    """
    Return int 0..10 or None if no score found.
    """
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except Exception as e:
        err(f"  [extract_score] ERROR reading {path}: {e}")
        return None

    if SHOW_CONTENT:
        vlog(f"--- RATING FILE CONTENT ({path}) ---\n{text}\n--- END ---")

    m = SCORE_RE.search(text)
    if not m:
        vlog(f"  [extract_score] no 'Overall Score' pattern in {path}")
        return None

    num   = int(m.group(1))
    denom = int(m.group(2))
    if denom <= 0:
        denom = 10

    score10 = round((num / denom) * 10)
    score10 = max(0, min(10, score10))
    vlog(f"  [extract_score] {path}: raw={num}/{denom} -> score10={score10}")
    return score10

# ------------------------------------------------------------------
# Duration parsing
# We expect DURATION file lines like:
#   Duration_seconds: 392
#   Duration_ISO: PT6M32S
# If seconds missing, try ISO parse.
# ------------------------------------------------------------------
DUR_SECS_RE = re.compile(r'Duration_seconds\s*:\s*(\d+)', re.IGNORECASE)
DUR_ISO_RE  = re.compile(r'Duration_ISO\s*:\s*(PT\S+)', re.IGNORECASE)

def parse_iso_duration(iso: str):
    """Parse minimal YouTube-style ISO 8601 into seconds."""
    m = re.match(r'^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$', iso.strip())
    if not m:
        return None
    h  = int(m.group(1) or 0)
    mi = int(m.group(2) or 0)
    s  = int(m.group(3) or 0)
    return h * 3600 + mi * 60 + s

def get_duration_seconds_for_filename(fname: str):
    """
    Given rating filename, read matching file in DURATION_DIR.
    Return seconds (int >=0). Missing/parse fail -> 0.
    """
    path = os.path.join(DURATION_DIR, fname)
    if not os.path.isfile(path):
        vlog(f"  [duration] no duration file: {path}")
        return 0

    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except Exception as e:
        err(f"  [duration] ERROR reading {path}: {e}")
        return 0

    if SHOW_CONTENT:
        vlog(f"--- DURATION FILE CONTENT ({path}) ---\n{text}\n--- END ---")

    m = DUR_SECS_RE.search(text)
    if m:
        secs = int(m.group(1))
        vlog(f"  [duration] {fname}: Duration_seconds={secs}")
        return secs

    m = DUR_ISO_RE.search(text)
    if m:
        iso = m.group(1)
        secs = parse_iso_duration(iso)
        if secs is not None:
            vlog(f"  [duration] {fname}: parsed {iso} -> {secs}s")
            return secs

    vlog(f"  [duration] {fname}: no parseable duration -> 0")
    return 0

# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------
def main():
    log("=== Smart Gadget Qualifier ===")
    log(f"RATING_DIR   = {RATING_DIR}")
    log(f"DURATION_DIR = {DURATION_DIR}")
    log(f"QUALIFY_DIR  = {QUALIFY_DIR}")
    log(f"OUT_PATH     = {OUT_PATH}")
    log(f"VERBOSE={VERBOSE}  STRICT={STRICT}  SHOW_CONTENT={SHOW_CONTENT}")

    # Dir checks
    if not os.path.isdir(RATING_DIR):
        err(f"❌ Missing RATING dir: {RATING_DIR}")
        if STRICT:
            sys.exit(1)
        return
    if not os.path.isdir(DURATION_DIR):
        vlog(f"⚠️ DURATION dir missing: {DURATION_DIR} (durations will default to 0)")
    os.makedirs(QUALIFY_DIR, exist_ok=True)

    # Gather rating files
    rating_files = [f for f in os.listdir(RATING_DIR) if f.lower().endswith(".txt")]
    rating_files.sort()

    log(f"\nFound {len(rating_files)} rating files.")
    for f in rating_files:
        vlog(f" - {f!r}")

    # Build groups: group_num -> list of (score, duration, slot_idx, filename)
    groups = {}
    parsed_count = 0

    for fname in rating_files:
        vlog(f"\n[scan] file: {fname}")
        parsed = parse_filename(fname)
        if not parsed:
            vlog(f"  ✖ filename not parseable -> skip")
            continue
        parsed_count += 1
        group_num, slot_token = parsed
        idx = slot_index(slot_token)
        rating_path = os.path.join(RATING_DIR, fname)

        score = extract_score(rating_path)
        if score is None:
            vlog(f"  ⚠ no score found; default 0")
            score = 0

        duration_sec = get_duration_seconds_for_filename(fname)

        vlog(f"  -> group={group_num}, idx={idx}, score={score}, duration={duration_sec}s")
        groups.setdefault(group_num, []).append((score, duration_sec, idx, fname))

    log(f"\nParsed {parsed_count} valid rating filenames into {len(groups)} groups.")

    if not groups:
        log("⚠ No groups found. Nothing to qualify.")
        # Still write empty file so step doesn’t fail unexpectedly
        with open(OUT_PATH, "w", encoding="utf-8") as out_f:
            out_f.write("")  # empty
        log(f"🟡 Wrote empty {OUT_PATH} (0 groups).")
        if STRICT:
            sys.exit(1)
        return

    # Decide winners
    winners = []
    log("\nSelecting winners...")
    for group_num in sorted(groups.keys()):
        entries = groups[group_num]
        # Sort: score desc, duration desc, idx asc, name asc
        entries.sort(key=lambda t: (-t[0], -t[1], t[2], t[3]))
        top = entries[0]
        score, duration_sec, idx, fname = top
        log(f"  Group {group_num}: winner={fname} score={score}/10 duration={duration_sec}s")
        winners.append((group_num, score, duration_sec, fname))

    # Write output file
    try:
        with open(OUT_PATH, "w", encoding="utf-8") as out_f:
            for group_num, score, duration_sec, fname in winners:
                out_f.write(f"Group {group_num}: {fname}\n")
        log(f"\n✅ Wrote {OUT_PATH} with {len(winners)} groups.")
    except Exception as e:
        err(f"❌ Failed to write {OUT_PATH}: {e}")
        if STRICT:
            sys.exit(1)
        return

    if VERBOSE:
        log("\n--- Final Qualified List ---")
        for group_num, score, duration_sec, fname in winners:
            log(f"Group {group_num}: {fname} (score {score}/10, {duration_sec}s)")

if __name__ == "__main__":
    main()
