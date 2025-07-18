
#!/usr/bin/env python3
"""
Unusual_download.py (uses precomputed durations)
------------------------------------------------
Reads winners from Unuusual_memory/QUALIFY/qualified.txt.
For each winner:
  - Parse group number + slot letter.
  - Find the corresponding Links file in Unuusual_memory/Links/.
  - Select the correct YouTube URL (a=0, b=1, ...).
  - Look up Duration_seconds in Unuusual_memory/DURATION/<winner_filename>.txt.
  - If duration > MAX_SECONDS (default 180), download only first MAX_SECONDS.
    Otherwise download full video.
  - Video-only (best video stream) + recode to MP4.

Output: Vid/group_<group>.mp4

ENV (optional):
  VERBOSE=1            extra logs
  STRICT=1             exit non-zero if nothing downloaded
  TOR=1                route through socks5://127.0.0.1:9050 (default ON)
  TOR_RESTART_EACH=1   restart Tor before each download
  MAX_SECONDS=180      clip length cap
  SKIP_EXISTING=1      skip download if Vid/group_<group>.mp4 exists

Dependencies: yt-dlp, ffmpeg, tor (if TOR=1).
"""

import os
import re
import sys
import time
import shlex
import subprocess

# ------------------------------------------------------------------
# Paths
# ------------------------------------------------------------------
BASE_DIR       = "Unuusual_memory"
QUALIFY_DIR    = os.path.join(BASE_DIR, "QUALIFY")
QUALIFY_PATH   = os.path.join(QUALIFY_DIR, "qualified.txt")
LINKS_DIR      = os.path.join(BASE_DIR, "Links")
DURATION_DIR   = os.path.join(BASE_DIR, "DURATION")
OUTPUT_DIR     = "Vid"
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
SKIP_EXISTING    = _truthy(os.environ.get("SKIP_EXISTING", "1"))

try:
    MAX_SECONDS = int(os.environ.get("MAX_SECONDS", "180"))
except ValueError:
    MAX_SECONDS = 180

def log(msg): print(msg, flush=True)
def vlog(msg):
    if VERBOSE: log(msg)
def err(msg): print(msg, file=sys.stderr, flush=True)

# ------------------------------------------------------------------
# Shell helper
# ------------------------------------------------------------------
def run_command(cmd, desc="command", retries=1, delay=5, fatal=True, timeout=None):
    """
    Run a shell command list with retries.
    """
    for attempt in range(1, retries + 1):
        vlog(f"[cmd] {desc} ({attempt}/{retries}): {' '.join(shlex.quote(c) for c in cmd)}")
        try:
            subprocess.run(cmd, check=True, timeout=timeout)
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
# ------------------------------------------------------------------
_slug_clean = re.compile(r'[^a-z0-9]+')

def canon_slug(s: str) -> str:
    s = s.lower()
    s = _slug_clean.sub("_", s)
    s = re.sub(r'_+', '_', s).strip('_')
    return s

def find_links_file(group_num: int, slug_hint: str):
    wanted_slug = canon_slug(slug_hint)

    # try exact path
    direct = os.path.join(LINKS_DIR, f"{group_num}_{slug_hint}.txt")
    if os.path.isfile(direct):
        return direct

    # canonical match
    for fname in os.listdir(LINKS_DIR):
        if not fname.lower().endswith(".txt"):
            continue
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

    # fallback any group match
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
# Duration lookup from DURATION dir
# File format example:
#   https://www.youtube.com/watch?v=eHgGqIWipSU
#   Duration_ISO: PT6M32S
#   Duration_seconds: 392
# ------------------------------------------------------------------
DUR_SECS_RE = re.compile(r'Duration_seconds\s*:\s*(\d+)', re.IGNORECASE)
DUR_ISO_RE  = re.compile(r'Duration_ISO\s*:\s*(PT\S+)', re.IGNORECASE)

def parse_iso_duration(iso: str):
    m = re.match(r'^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$', iso.strip())
    if not m:
        return None
    h = int(m.group(1) or 0)
    mi = int(m.group(2) or 0)
    s = int(m.group(3) or 0)
    return h*3600 + mi*60 + s

def read_duration_seconds_for_winner(fname: str):
    """
    fname is the winner filename (e.g., '1(a)_robot_window_cleaner.txt').
    We'll look for DURATION/<fname>.
    Returns int seconds or None if missing.
    """
    path = os.path.join(DURATION_DIR, fname)
    if not os.path.isfile(path):
        vlog(f"[dur] missing {path}")
        return None
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            txt = f.read()
    except Exception as e:
        err(f"[dur] read error {path}: {e}")
        return None

    m = DUR_SECS_RE.search(txt)
    if m:
        secs = int(m.group(1))
        vlog(f"[dur] {fname}: {secs}s")
        return secs

    m = DUR_ISO_RE.search(txt)
    if m:
        secs = parse_iso_duration(m.group(1))
        vlog(f"[dur] {fname}: parsed ISO -> {secs}s")
        return secs

    vlog(f"[dur] no duration parse in {fname}")
    return None

# ------------------------------------------------------------------
# Format HH:MM:SS for yt-dlp sections
# ------------------------------------------------------------------
def seconds_to_hhmmss(n: int) -> str:
    if n <= 0: n = 1
    h = n // 3600
    m = (n % 3600) // 60
    s = n % 60
    return f"{h:02d}:{m:02d}:{s:02d}"

# ------------------------------------------------------------------
# yt-dlp download (full or clipped)
# ------------------------------------------------------------------
def run_yt_dlp(url: str, group_num: int, clip_end_secs: int | None):
    """
    Download video-only. If clip_end_secs is not None, apply --download-sections.
    """
    out_template = os.path.join(OUTPUT_DIR, f"group_{group_num}.%(ext)s")
    cmd = ["yt-dlp"]

    if TOR_ENABLED:
        cmd += ["--proxy", "socks5://127.0.0.1:9050"]

    cmd += [
        "-f", "bv*",            # best video-only
        "--recode-video", "mp4" # ensure mp4 output
    ]

    if clip_end_secs is not None:
        section = f"*0:00-{seconds_to_hhmmss(clip_end_secs)}"
        cmd += ["--download-sections", section]

    cmd += [
        "-o", out_template,
        url
    ]

    log(f"[dl] Group {group_num} -> {url}" +
        (f" (clip 0-{clip_end_secs}s)" if clip_end_secs is not None else " (full)"))

    ok = run_command(cmd, desc=f"download group {group_num}", retries=3, delay=7, fatal=False)
    if not ok:
        err(f"[dl] FAILED group {group_num}")
        return False

    # ensure final mp4 exists (recode handles container)
    final_path = os.path.join(OUTPUT_DIR, f"group_{group_num}.mp4")
    if not os.path.isfile(final_path):
        # yt-dlp might output a different extension if recode failed;
        # don't treat as hard failure, but log
        vlog(f"[dl] warn: expected {final_path} not found (check outputs).")
    return True

# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------
def main():
    log("=== Unusual_download.py (precomputed durations) ===")
    log(f"QUALIFY_PATH    = {QUALIFY_PATH}")
    log(f"LINKS_DIR       = {LINKS_DIR}")
    log(f"DURATION_DIR    = {DURATION_DIR}")
    log(f"OUTPUT_DIR      = {OUTPUT_DIR}")
    log(f"TOR_ENABLED     = {TOR_ENABLED}")
    log(f"MAX_SECONDS     = {MAX_SECONDS}")
    log(f"SKIP_EXISTING   = {SKIP_EXISTING}")
    log(f"VERBOSE={VERBOSE} STRICT={STRICT} TOR_RESTART_EACH={TOR_RESTART_EACH}")

    # sanity dirs
    if not os.path.isdir(LINKS_DIR):
        err(f"❌ Links directory not found: {LINKS_DIR}")
        if STRICT: sys.exit(1)
        return
    if not os.path.isdir(DURATION_DIR):
        vlog(f"⚠️ DURATION directory missing ({DURATION_DIR}); will assume unknown durations.")

    if not os.path.isfile(QUALIFY_PATH):
        err(f"❌ qualified.txt missing: {QUALIFY_PATH}")
        if STRICT: sys.exit(1)
        return

    if TOR_ENABLED:
        start_tor()

    # load winners
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
        group_num_line, fname = parsed  # fname = winner filename (e.g., '1(a)_robot_window_cleaner.txt')

        p2 = parse_winner_filename(fname)
        if not p2:
            err(f"  ✖ cannot parse winner filename: {fname!r}")
            failed += 1
            continue
        group_num, slot_token, slug_raw = p2

        # prefer group_num from line
        if group_num != group_num_line:
            vlog(f"  ⚠ group mismatch (line={group_num_line}, parsed={group_num}); using line value")
            group_num = group_num_line

        final_mp4 = os.path.join(OUTPUT_DIR, f"group_{group_num}.mp4")
        if SKIP_EXISTING and os.path.isfile(final_mp4):
            log(f"[skip] already exists: {final_mp4}")
            processed += 1
            continue

        idx = slot_to_index(slot_token)
        vlog(f"  -> group={group_num}, slot={slot_token!r}(idx={idx}), slug_hint='{slug_raw}'")

        # locate links file
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

        url = links[idx]
        log(f"  ✓ selected link: {url}")

        # read precomputed duration from DURATION/<winner_filename>.txt
        dur_secs = read_duration_seconds_for_winner(fname)
        if dur_secs is None:
            vlog(f"  [dur] unknown -> treat as >MAX; will clip to {MAX_SECONDS}")
            clip_end = MAX_SECONDS
        else:
            # decide full vs clip
            if dur_secs > MAX_SECONDS:
                clip_end = MAX_SECONDS
                vlog(f"  [dur] {dur_secs}s > {MAX_SECONDS}s -> clip")
            else:
                clip_end = None  # full download
                vlog(f"  [dur] {dur_secs}s <= {MAX_SECONDS}s -> full")

        if TOR_ENABLED and TOR_RESTART_EACH:
            restart_tor()

        if run_yt_dlp(url, group_num, clip_end):
            processed += 1
        else:
            failed += 1

    log("\n=== Download summary ===")
    log(f"Processed OK: {processed}")
    log(f"Failed:      {failed}")
    if STRICT and processed == 0:
        sys.exit(1)
    log("[✓] Done.")
    

if __name__ == "__main__":
    main()
