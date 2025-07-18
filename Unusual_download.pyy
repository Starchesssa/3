
#!/usr/bin/env python3
"""
Unusual_download.py
-------------------
Read winners from Unuusual_memory/QUALIFY/qualified.txt and download the
corresponding YouTube videos using yt-dlp. Uses Tor proxy if enabled.

Expected qualified.txt lines:
  Group 3: 3(a)_levitating_smart_lamp.txt
  Group 29: 29(g)_smart_plant_watering.txt

From each filename:
  - Extract group number (leading digits)
  - Extract slot letter (inside first parentheses) -> choose link index
  - Ignore slug messiness (spaces/underscores tolerated)

Links are looked up in:
  Unuusual_memory/Links/<group>_<slug>.txt   (messy names tolerated)

Download output:
  Vid/group_<group>.%(ext)s

ENV (all optional):
  VERBOSE=1            extra logs
  STRICT=1             exit non-zero if nothing downloaded
  TOR=1                use Tor socks5://127.0.0.1:9050 proxy (default ON)
  TOR_RESTART_EACH=1   restart Tor before each download

Requires: yt-dlp (and Tor if TOR=1)
"""

import os
import re
import sys
import time
import subprocess

# ------------------------------------------------------------------
# Paths
# ------------------------------------------------------------------
BASE_DIR     = "Unuusual_memory"
QUALIFY_PATH = os.path.join(BASE_DIR, "QUALIFY", "qualified.txt")
LINKS_DIR    = os.path.join(BASE_DIR, "Links")  # <-- confirmed correct
OUTPUT_DIR   = "Vid"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ------------------------------------------------------------------
# ENV
# ------------------------------------------------------------------
def _truthy(x):
    return str(x).strip().lower() in ("1", "true", "yes", "on")

VERBOSE          = _truthy(os.environ.get("VERBOSE", "1"))
STRICT           = _truthy(os.environ.get("STRICT", "0"))
TOR_ENABLED      = _truthy(os.environ.get("TOR", "1"))
TOR_RESTART_EACH = _truthy(os.environ.get("TOR_RESTART_EACH", "0"))

def log(msg): print(msg, flush=True)
def vlog(msg):
    if VERBOSE: log(msg)
def err(msg): print(msg, file=sys.stderr, flush=True)

# ------------------------------------------------------------------
# Shell helper
# ------------------------------------------------------------------
def run_command(cmd, desc="command", retries=1, delay=5, fatal=True):
    for attempt in range(1, retries + 1):
        vlog(f"[cmd] {desc} ({attempt}/{retries}): {' '.join(cmd)}")
        try:
            subprocess.run(cmd, check=True)
            return True
        except subprocess.CalledProcessError as e:
            err(f"[cmd] FAIL {desc}: {e}")
            if attempt < retries:
                time.sleep(delay)
    if fatal:
        err(f"[cmd] giving up: {desc}")
        sys.exit(1)
    return False

# ------------------------------------------------------------------
# Tor helpers
# ------------------------------------------------------------------
def tor_installed():
    return subprocess.run(["which", "tor"], capture_output=True).returncode == 0

def restart_tor():
    log("[tor] Restarting Tor...")
    run_command(["sudo", "service", "tor", "restart"], "restart tor", retries=1, fatal=False)
    time.sleep(5)

def start_tor():
    if not TOR_ENABLED:
        vlog("[tor] disabled (TOR=0)")
        return
    log("[tor] Ensuring Tor is running...")
    if not tor_installed():
        log("[tor] Installing Tor...")
        run_command(["sudo", "apt-get", "update"], "apt update", retries=1, fatal=False)
        run_command(["sudo", "apt-get", "install", "-y", "tor"], "apt install tor", retries=1, fatal=False)
    run_command(["sudo", "service", "tor", "start"], "start tor", retries=1, fatal=False)

# ------------------------------------------------------------------
# Parse qualified lines: "Group N: filename"
# ------------------------------------------------------------------
QUALIFY_LINE_RE = re.compile(r'^\s*Group\s+(\d+)\s*:\s*(.+?)\s*$', re.IGNORECASE)

def parse_qualify_line(line: str):
    m = QUALIFY_LINE_RE.match(line)
    if not m:
        return None
    return int(m.group(1)), m.group(2).strip()

# ------------------------------------------------------------------
# Extract group/slot/slug from filename (tolerant)
# e.g. "1 (a)_robot window_cleaner .txt"
# ------------------------------------------------------------------
def parse_winner_filename(fname: str):
    noext = re.sub(r'\.[tT][xX][tT]\s*$', '', fname.strip())
    # group number
    i = 0
    while i < len(noext) and noext[i].isdigit():
        i += 1
    if i == 0:
        return None
    group_num = int(noext[:i])
    rest = noext[i:]
    # first (...) chunk
    o = rest.find('(')
    c = rest.find(')', o + 1) if o != -1 else -1
    if o == -1 or c == -1:
        return None
    slot_token = rest[o + 1:c].strip()[:1]  # first char
    slug_raw = rest[c + 1:].strip().lstrip("_- ")
    return group_num, slot_token, slug_raw

def slot_to_index(slot_token: str) -> int:
    if slot_token.isdigit():
        return max(0, int(slot_token) - 1)
    return max(0, ord(slot_token.lower()) - ord('a'))

# ------------------------------------------------------------------
# Find links file
# First try direct "<group>_<slug>.txt"; if not found, scan any file starting with "<group>"
# and pick the shortest (most likely).
# ------------------------------------------------------------------
_slug_clean = re.compile(r'[^a-z0-9]+')

def canon_slug(s: str) -> str:
    s = s.lower()
    s = _slug_clean.sub("_", s)
    s = re.sub(r'_+', '_', s).strip('_')
    return s

def find_links_file(group_num: int, slug_hint: str):
    wanted_slug = canon_slug(slug_hint)

    # try exact constructed path
    direct = os.path.join(LINKS_DIR, f"{group_num}_{slug_hint}.txt")
    if os.path.isfile(direct):
        return direct

    # scan for canonical slug match
    for fname in os.listdir(LINKS_DIR):
        if not fname.lower().endswith(".txt"):
            continue
        # leading number
        j = 0
        while j < len(fname) and fname[j].isdigit():
            j += 1
        if j == 0:
            continue
        if int(fname[:j]) != group_num:
            continue
        slug_part = re.sub(r'\.[tT][xX][tT]$', '', fname[j:]).lstrip("_- ")
        if canon_slug(slug_part) == wanted_slug:
            return os.path.join(LINKS_DIR, fname)

    # fallback: any file starting with group num
    candidates = [f for f in os.listdir(LINKS_DIR)
                  if f.lower().endswith(".txt") and f.startswith(str(group_num))]
    if candidates:
        candidates.sort(key=len)
        return os.path.join(LINKS_DIR, candidates[0])

    return None

# ------------------------------------------------------------------
# Load links from a link file
# ------------------------------------------------------------------
def load_links(path: str):
    links = []
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                s = line.strip()
                if not s or s.startswith("#"):
                    continue
                links.append(s)
    except Exception as e:
        err(f"[links] ERROR {path}: {e}")
    return links

# ------------------------------------------------------------------
# yt-dlp download
# ------------------------------------------------------------------
def download_video(link: str, group_num: int):
    out_template = os.path.join(OUTPUT_DIR, f"group_{group_num}.%(ext)s")
    cmd = ["yt-dlp", "--merge-output-format", "mp4", "-o", out_template, link]
    if TOR_ENABLED:
        cmd[1:1] = ["--proxy", "socks5://127.0.0.1:9050"]  # insert proxy
    log(f"[dl] Group {group_num} -> {link}")
    ok = run_command(cmd, desc=f"download group {group_num}", retries=3, delay=7, fatal=False)
    if not ok:
        err(f"[dl] FAILED after retries (group {group_num})")
        if STRICT:
            sys.exit(1)
    else:
        log(f"[dl] ✓ downloaded group {group_num}")

# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------
def main():
    log("=== Unusual_download.py ===")
    log(f"QUALIFY_PATH = {QUALIFY_PATH}")
    log(f"LINKS_DIR    = {LINKS_DIR}")
    log(f"OUTPUT_DIR   = {OUTPUT_DIR}")
    log(f"TOR_ENABLED  = {TOR_ENABLED}")
    log(f"VERBOSE={VERBOSE} STRICT={STRICT} TOR_RESTART_EACH={TOR_RESTART_EACH}")

    if not os.path.isdir(LINKS_DIR):
        err(f"❌ Links directory not found: {LINKS_DIR}")
        if STRICT: sys.exit(1)
        return

    if not os.path.isfile(QUALIFY_PATH):
        err(f"❌ qualified.txt missing: {QUALIFY_PATH}")
        if STRICT: sys.exit(1)
        return

    if TOR_ENABLED:
        start_tor()

    with open(QUALIFY_PATH, "r", encoding="utf-8", errors="ignore") as f:
        raw_lines = [ln.strip() for ln in f if ln.strip()]

    if not raw_lines:
        log("[!] qualified.txt is empty; nothing to download.")
        if STRICT: sys.exit(1)
        return

    processed = failed = 0

    for line in raw_lines:
        vlog(f"\n[line] {line!r}")
        parsed = parse_qualify_line(line)
        if not parsed:
            vlog("  ✖ cannot parse 'Group N:' pattern -> skip")
            failed += 1
            continue
        group_num_line, fname = parsed

        p2 = parse_winner_filename(fname)
        if not p2:
            err(f"  ✖ cannot parse winner filename: {fname!r}")
            failed += 1
            continue
        group_num, slot_token, slug_raw = p2

        # sanity
        if group_num != group_num_line:
            vlog(f"  ⚠ group mismatch (line={group_num_line}, parsed={group_num}); using line value.")
            group_num = group_num_line

        idx = slot_to_index(slot_token)
        vlog(f"  -> group={group_num}, slot={slot_token!r}(idx={idx}), slug_hint='{slug_raw}'")

        links_path = find_links_file(group_num, slug_raw)
        if not links_path:
            err(f"  ✖ no links file for group {group_num} ({slug_raw!r})")
            failed += 1
            continue
        vlog(f"  -> links file: {links_path}")

        links = load_links(links_path)
        if not links:
            err(f"  ✖ links file empty: {links_path}")
            failed += 1
            continue

        if idx >= len(links):
            err(f"  ✖ index {idx} >= {len(links)} links in {links_path}")
            failed += 1
            continue

        link_url = links[idx]
        log(f"  ✓ selected link: {link_url}")

        if TOR_ENABLED and TOR_RESTART_EACH:
            restart_tor()

        download_video(link_url, group_num)
        processed += 1

    log("\n=== Download summary ===")
    log(f"Processed OK: {processed}")
    log(f"Failed:      {failed}")
    if STRICT and processed == 0:
        sys.exit(1)
    log("[✓] Done.")
    

if __name__ == "__main__":
    main()
