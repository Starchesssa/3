
#!/usr/bin/env python3
"""
Ultra-tolerant Smart Gadget Qualifier

Reads rating files from Unuusual_memory/RATING/.
Each filename is assumed to BEGIN with an integer group number,
followed somewhere by a '(' and a ')' containing a letter or digit.

We IGNORE the rest of the filename for grouping logic.
We do NOT depend on slug cleanliness anymore.

Tie-break:
  1) Higher score (parsed from "Overall Score: X/Y" in file text)
  2) Longer duration_seconds from Unuusual_memory/DURATION/<same filename>.txt
  3) Earlier slot letter (a<b<c...) / digit order

Outputs:
  Unuusual_memory/QUALIFY/qualified.txt
  Format: "Group N: <original filename>"

Env:
  VERBOSE=1     extra logs
  STRICT=1      exit 1 if no groups processed
  SHOW_CONTENT=1  dump file contents (debug heavy)
"""

import os
import re
import sys

# ------------------------------------------------------------------
# Paths
# ------------------------------------------------------------------
BASE_DIR      = "Unuusual_memory"
RATING_DIR    = os.path.join(BASE_DIR, "RATING")
DURATION_DIR  = os.path.join(BASE_DIR, "DURATION")
QUALIFY_DIR   = os.path.join(BASE_DIR, "QUALIFY")
OUT_PATH      = os.path.join(QUALIFY_DIR, "qualified.txt")

# ------------------------------------------------------------------
# ENV
# ------------------------------------------------------------------
def _truthy(x):
    return str(x).strip().lower() in ("1", "true", "yes", "on")

VERBOSE      = _truthy(os.environ.get("VERBOSE", "1"))
STRICT       = _truthy(os.environ.get("STRICT", "0"))
SHOW_CONTENT = _truthy(os.environ.get("SHOW_CONTENT", "0"))

def log(msg): print(msg, flush=True)
def vlog(msg):
    if VERBOSE: log(msg)
def err(msg): print(msg, file=sys.stderr, flush=True)

# ------------------------------------------------------------------
# Filename parsing (ULTRA tolerant)
# ------------------------------------------------------------------
def parse_filename_tolerant(name: str):
    """
    Extract group number (leading digits) and slot token (first char inside first parens)
    from a messy filename like '  12 ( b ) _whatever .TXT'.
    Returns (group_num:int, slot_token:str) or None.
    """
    raw = name.strip()

    # Strip trailing extension (case-insensitive, allow spaces)
    noext = re.sub(r'\.[tT][xX][tT]\s*$', '', raw)

    # 1. Leading number
    i = 0
    while i < len(noext) and noext[i].isdigit():
        i += 1
    if i == 0:
        vlog(f"  [parse] no leading number in {name!r}")
        return None
    group_num = int(noext[:i])
    remainder = noext[i:]

    # 2. Find first '(' and next ')'
    o = remainder.find('(')
    if o == -1:
        vlog(f"  [parse] no '(' in {name!r}")
        return None
    c = remainder.find(')', o + 1)
    if c == -1:
        vlog(f"  [parse] no ')' after '(' in {name!r}")
        return None

    slot_area = remainder[o + 1 : c].strip()
    if not slot_area:
        vlog(f"  [parse] empty slot between () in {name!r}")
        return None

    slot_token = slot_area[0]  # take first char
    vlog(f"  [parse] OK {name!r} -> group={group_num}, slot={slot_token!r}")
    return group_num, slot_token

def slot_index(slot_token: str) -> int:
    """Map letter/digit to a sortable index. Digits are 1-based -> 0-based."""
    if slot_token.isdigit():
        return max(0, int(slot_token) - 1)
    return max(0, ord(slot_token.lower()) - ord('a'))

# ------------------------------------------------------------------
# Score parsing
# Accepts combos like:
#   Overall Score: 8/10
#   overall score - 7 / 10
#   OVERALL SCORE 6 of 10
# ------------------------------------------------------------------
SCORE_RE = re.compile(
    r'overall\s*score\s*[:\-]?\s*(\d+)\s*(?:/|of)\s*(\d+)',
    re.IGNORECASE
)

def extract_score(path: str):
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except Exception as e:
        err(f"  [score] ERROR reading {path}: {e}")
        return None

    if SHOW_CONTENT:
        vlog(f"--- RATING CONTENT {path} ---\n{text}\n--- END ---")

    m = SCORE_RE.search(text)
    if not m:
        vlog(f"  [score] no 'Overall Score' in {path}")
        return None

    num   = int(m.group(1))
    denom = int(m.group(2))
    if denom <= 0:
        denom = 10
    score10 = round((num / denom) * 10)
    score10 = max(0, min(10, score10))
    vlog(f"  [score] {path}: {num}/{denom} -> {score10}/10")
    return score10

# ------------------------------------------------------------------
# Duration parsing
# ------------------------------------------------------------------
DUR_SECS_RE = re.compile(r'Duration_seconds\s*:\s*(\d+)', re.IGNORECASE)
DUR_ISO_RE  = re.compile(r'Duration_ISO\s*:\s*(PT\S+)', re.IGNORECASE)

def parse_iso_duration(iso: str):
    m = re.match(r'^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$', iso.strip())
    if not m:
        return None
    h  = int(m.group(1) or 0)
    mi = int(m.group(2) or 0)
    s  = int(m.group(3) or 0)
    return h*3600 + mi*60 + s

def get_duration_seconds_for_filename(fname: str):
    """
    Reads DURATION/<fname>.txt and returns seconds (int >=0).
    Missing or unparseable -> 0.
    """
    path = os.path.join(DURATION_DIR, fname)
    if not os.path.isfile(path):
        vlog(f"  [dur] missing duration file: {path}")
        return 0

    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except Exception as e:
        err(f"  [dur] ERROR reading {path}: {e}")
        return 0

    if SHOW_CONTENT:
        vlog(f"--- DURATION CONTENT {path} ---\n{text}\n--- END ---")

    m = DUR_SECS_RE.search(text)
    if m:
        secs = int(m.group(1))
        vlog(f"  [dur] seconds={secs} ({path})")
        return secs

    m = DUR_ISO_RE.search(text)
    if m:
        iso = m.group(1)
        secs = parse_iso_duration(iso)
        if secs is not None:
            vlog(f"  [dur] parsed {iso} -> {secs}s ({path})")
            return secs

    vlog(f"  [dur] no duration parsed in {path}")
    return 0

# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------
def main():
    log("=== Smart Gadget Qualifier (Ultra-Tolerant) ===")
    log(f"RATING_DIR   = {RATING_DIR}")
    log(f"DURATION_DIR = {DURATION_DIR}")
    log(f"QUALIFY_DIR  = {QUALIFY_DIR}")
    log(f"OUT_PATH     = {OUT_PATH}")
    log(f"VERBOSE={VERBOSE} STRICT={STRICT} SHOW_CONTENT={SHOW_CONTENT}")

    # Dir checks
    if not os.path.isdir(RATING_DIR):
        err(f"❌ Missing RATING dir: {RATING_DIR}")
        if STRICT: sys.exit(1)
        return
    if not os.path.isdir(DURATION_DIR):
        vlog(f"⚠️ DURATION dir missing: {DURATION_DIR} (durations=0)")
    os.makedirs(QUALIFY_DIR, exist_ok=True)

    # Collect rating files
    rating_files = [f for f in os.listdir(RATING_DIR) if f.lower().endswith(".txt")]
    rating_files.sort()

    log(f"\nFound {len(rating_files)} rating files:")
    for f in rating_files:
        vlog(f" - {f!r}")

    # Build group entries
    groups = {}
    parsed_count = 0

    for fname in rating_files:
        vlog(f"\n[scan] {fname!r}")
        parsed = parse_filename_tolerant(fname)
        if not parsed:
            vlog("  ✖ cannot parse -> skip")
            continue

        parsed_count += 1
        group_num, slot_token = parsed
        idx = slot_index(slot_token)

        rating_path = os.path.join(RATING_DIR, fname)
        score = extract_score(rating_path)
        if score is None:
            vlog("  ⚠ no score; using 0")
            score = 0

        duration = get_duration_seconds_for_filename(fname)

        vlog(f"  -> group={group_num}, slot={slot_token!r}(idx={idx}), score={score}, duration={duration}s")
        groups.setdefault(group_num, []).append((score, duration, idx, fname))

    log(f"\nParsed {parsed_count} filenames into {len(groups)} groups.")

    if not groups:
        log("⚠ No valid groups. Writing empty file.")
        with open(OUT_PATH, "w", encoding="utf-8") as f:
            f.write("")
        if STRICT:
            sys.exit(1)
        return

    # Choose winners
    log("\nSelecting winners (score > duration > letter)...")
    winners = []
    for group_num in sorted(groups.keys()):
        entries = groups[group_num]
        # sort: score desc, duration desc, idx asc (a<b<c)
        entries.sort(key=lambda t: (-t[0], -t[1], t[2], t[3]))
        top = entries[0]
        score, duration, idx, fname = top
        log(f"  Group {group_num}: {fname} (score {score}/10, {duration}s)")
        winners.append((group_num, score, duration, fname))

    # Write output
    try:
        with open(OUT_PATH, "w", encoding="utf-8") as out_f:
            for group_num, score, duration, fname in winners:
                out_f.write(f"Group {group_num}: {fname}\n")
        log(f"\n✅ Wrote {OUT_PATH} with {len(winners)} groups.")
    except Exception as e:
        err(f"❌ Write failed: {e}")
        if STRICT: sys.exit(1)
        return

    if VERBOSE:
        log("\n--- Qualified Summary ---")
        for group_num, score, duration, fname in winners:
            log(f"Group {group_num}: {fname} (score {score}/10, {duration}s)")


if __name__ == "__main__":
    main()
