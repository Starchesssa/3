
#!/usr/bin/env python3
"""
Unusual_download.py
-------------------
Minimal-dependency, Tor-friendly, tolerant filename parsing, 180s clip.

Reads:
  Unuusual_memory/QUALIFY/qualified.txt  lines like:
      Group 3: 3(e)_levitating_smart_lamp.txt
      Group 5: 5(d)_robot_litter_box.txt

Looks up links in:
  Unuusual_memory/Links/<group>_*.txt    (we match group only: "3_" "5_" etc)

Selects link index based on letter: a=0, b=1, c=2 ...

Downloads full video (simple yt-dlp command, Tor proxy if enabled), then trims
locally to first MAX_SECONDS (default 180s) using ffmpeg. Local trim avoids
extra YouTube requests and reduces bot/consent challenge issues.

Outputs:
  Vid/group_<group>.mp4

Environment (optional):
  TOR=1              use socks5 proxy (default 1)
  MAX_SECONDS=180    trim length
  SKIP_EXISTING=1    skip if final file exists
  VERBOSE=1          extra logs
  STRICT=0           exit nonzero if nothing processed
  INTER_VIDEO_SLEEP=2  seconds between downloads

No external Python packages required (requests, socks, etc. removed).
"""

import os
import re
import sys
import time
import shlex
import glob
import subprocess

# ------------------------------------------------------------------
# PATHS
# ------------------------------------------------------------------
BASE_DIR       = "Unuusual_memory"
QUALIFY_PATH   = os.path.join(BASE_DIR, "QUALIFY", "qualified.txt")
LINKS_DIR      = os.path.join(BASE_DIR, "Links")   # <-- requested
OUTPUT_DIR     = "Vid"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ------------------------------------------------------------------
# ENV VARS
# ------------------------------------------------------------------
def _truthy(x): return str(x).strip().lower() in ("1","true","yes","on")

VERBOSE        = _truthy(os.environ.get("VERBOSE", "1"))
STRICT         = _truthy(os.environ.get("STRICT",  "0"))
TOR_ENABLED    = _truthy(os.environ.get("TOR",     "1"))    # default ON
SKIP_EXISTING  = _truthy(os.environ.get("SKIP_EXISTING", "1"))

try:
    MAX_SECONDS = int(os.environ.get("MAX_SECONDS", "180"))
except ValueError:
    MAX_SECONDS = 180

try:
    INTER_VIDEO_SLEEP = float(os.environ.get("INTER_VIDEO_SLEEP", "2"))
except ValueError:
    INTER_VIDEO_SLEEP = 2.0

def log(msg): print(msg, flush=True)
def vlog(msg):
    if VERBOSE: log(msg)
def err(msg): print(msg, file=sys.stderr, flush=True)

# ------------------------------------------------------------------
# TOR OPS (system-level; no Python deps)
# ------------------------------------------------------------------
def tor_installed():
    return subprocess.run(["which", "tor"], capture_output=True).returncode == 0

def restart_tor():
    log("[tor] Restarting Tor...")
    subprocess.run(["sudo","service","tor","restart"], check=False)
    time.sleep(5)

def start_tor():
    if not TOR_ENABLED:
        vlog("[tor] disabled (TOR=0)")
        return
    log("[tor] Ensuring Tor is installed/running...")
    if not tor_installed():
        vlog("[tor] installing tor...")
        subprocess.run(["sudo","apt-get","update"], check=False)
        subprocess.run(["sudo","apt-get","install","-y","tor"], check=False)
    subprocess.run(["sudo","service","tor","start"], check=False)
    # quick check (non-fatal)
    try:
        cp = subprocess.run(
            ["curl","--socks5","127.0.0.1:9050","-sSf","https://check.torproject.org/"],
            capture_output=True, text=True, timeout=10
        )
        if "Congratulations" in (cp.stdout or ""):
            log("[✓] Tor appears active.")
        else:
            vlog("[tor] check did not confirm activity.")
    except Exception as e:
        vlog(f"[tor] check skipped: {e}")

# ------------------------------------------------------------------
# QUALIFY LINE PARSE
#   "Group 3: 3(e)_levitating_smart_lamp.txt"
# ------------------------------------------------------------------
QUALIFY_LINE_RE = re.compile(r'^\s*Group\s+(\d+)\s*:\s*(.+?)\s*$', re.IGNORECASE)

def parse_qualify_line(line: str):
    m = QUALIFY_LINE_RE.match(line)
    if not m:
        return None
    return int(m.group(1)), m.group(2).strip()

# ------------------------------------------------------------------
# WINNER FILENAME PARSE (tolerant)
# Accept: "3(e)_levitating_smart_lamp.txt", "3(e) levitating smart lamp .txt", etc.
# We only NEED the group number + letter; we ignore slug for matching.
# ------------------------------------------------------------------
WINNER_TOL_RE = re.compile(r'^\s*(\d+)\s*\s*([a-z0-9])\s*', re.IGNORECASE)

def parse_winner_filename(fname: str):
    m = WINNER_TOL_RE.match(fname)
    if not m:
        return None
    grp = int(m.group(1))
    letter = m.group(2).lower()
    return grp, letter

def letter_to_index(letter: str) -> int:
    if letter.isdigit():
        # if letter accidentally numeric, treat 1->0 etc
        return max(0, int(letter) - 1)
    return ord(letter.lower()) - ord('a')

# ------------------------------------------------------------------
# FIND LINKS FILE (match by group only)
# We do not depend on slug. We take FIRST file starting with "<group>_"
# If none found, we try case-insens fallback scanning numeric prefix.
# ------------------------------------------------------------------
def find_links_file_for_group(group_num: int):
    prefix = f"{group_num}_"
    # exact prefix match first
    for fn in os.listdir(LINKS_DIR):
        if not fn.lower().endswith(".txt"):
            continue
        if fn.startswith(prefix):
            return os.path.join(LINKS_DIR, fn)
    # fallback: any file whose leading digits == group_num
    for fn in os.listdir(LINKS_DIR):
        if not fn.lower().endswith(".txt"):
            continue
        # collect leading digits
        j=0
        while j < len(fn) and fn[j].isdigit():
            j+=1
        if j == 0: continue
        if int(fn[:j]) == group_num:
            return os.path.join(LINKS_DIR, fn)
    return None

# ------------------------------------------------------------------
# LOAD LINKS
# ------------------------------------------------------------------
def load_links(path: str):
    links = []
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                s = line.strip()
                if not s or s.startswith("#"): continue
                links.append(s)
    except Exception as e:
        err(f"[links] error {path}: {e}")
    return links

# ------------------------------------------------------------------
# YT-DLP DOWNLOAD (simple progressive MP4 merge)
# ------------------------------------------------------------------
def yt_dlp_download(url: str, out_template: str):
    cmd = [
        "yt-dlp",
        "--merge-output-format", "mp4",
        "-o", out_template,
        url
    ]
    if TOR_ENABLED:
        cmd[1:1] = ["--proxy", "socks5://127.0.0.1:9050"]  # insert after yt-dlp
    vlog(f"[yt-dlp] {' '.join(shlex.quote(c) for c in cmd)}")
    # We retry & restart Tor between attempts if failing
    for attempt in range(1,4):
        try:
            subprocess.run(cmd, check=True)
            return True
        except subprocess.CalledProcessError as e:
            err(f"[yt-dlp] download fail attempt {attempt}/3: {e}")
            if TOR_ENABLED:
                restart_tor()
            if attempt < 3:
                time.sleep(5)
    return False

# ------------------------------------------------------------------
# LOCATE DOWNLOADED FILE FOR GROUP (any ext) AFTER yt-dlp
# out_template is Vid/group_<group>.%(ext)s so glob works.
# ------------------------------------------------------------------
def find_downloaded_file(group_num: int):
    pattern = os.path.join(OUTPUT_DIR, f"group_{group_num}.*")
    matches = glob.glob(pattern)
    if not matches:
        return None
    # pick largest file
    matches.sort(key=lambda p: os.path.getsize(p), reverse=True)
    return matches[0]

# ------------------------------------------------------------------
# TRIM TO MAX_SECONDS (ffmpeg local)
# Safe: ffmpeg will just stop early if shorter; so we always run trim.
# ------------------------------------------------------------------
def trim_to_max(group_num: int):
    src = find_downloaded_file(group_num)
    if not src:
        err(f"[trim] no src for group {group_num}")
        return False
    dest = os.path.join(OUTPUT_DIR, f"group_{group_num}.mp4")

    # quick copy trim
    cmd = ["ffmpeg", "-y", "-i", src, "-t", str(MAX_SECONDS), "-c", "copy", dest]
    vlog(f"[trim] {' '.join(shlex.quote(c) for c in cmd)}")
    ok = subprocess.run(cmd).returncode == 0

    if not ok or not os.path.isfile(dest):
        vlog("[trim] copy failed, trying re-encode")
        cmd2 = ["ffmpeg", "-y", "-i", src, "-t", str(MAX_SECONDS),
                "-c:v", "libx264", "-c:a", "aac", dest]
        subprocess.run(cmd2)

    return os.path.isfile(dest)

# ------------------------------------------------------------------
# MAIN
# ------------------------------------------------------------------
def main():
    log("=== Unusual_download.py (group-match + Tor + 180s local trim) ===")
    log(f"TOR_ENABLED   = {TOR_ENABLED}")
    log(f"MAX_SECONDS   = {MAX_SECONDS}")
    log(f"SKIP_EXISTING = {SKIP_EXISTING}")
    log(f"VERBOSE       = {VERBOSE}")

    if not os.path.isfile(QUALIFY_PATH):
        err(f"❌ qualified.txt missing: {QUALIFY_PATH}")
        if STRICT: sys.exit(1)
        return
    if not os.path.isdir(LINKS_DIR):
        err(f"❌ Links directory missing: {LINKS_DIR}")
        if STRICT: sys.exit(1)
        return

    if TOR_ENABLED:
        start_tor()

    with open(QUALIFY_PATH, "r", encoding="utf-8", errors="ignore") as f:
        lines = [ln.strip() for ln in f if ln.strip()]

    processed = failed = 0

    for line in lines:
        vlog(f"\n[line] {line!r}")
        parsed = parse_qualify_line(line)
        if not parsed:
            err(f"[!] bad line: {line}")
            failed += 1
            continue
        group_from_line, winner_fname = parsed

        pw = parse_winner_filename(winner_fname)
        if not pw:
            err(f"[!] cannot parse winner filename: {winner_fname}")
            failed += 1
            continue
        grp_from_fname, letter = pw

        # authoritative: group from line
        if grp_from_fname != group_from_line:
            vlog(f"[warn] mismatch (line={group_from_line}, fname={grp_from_fname}); using {group_from_line}")
        group_num = group_from_line

        idx = letter_to_index(letter)
        vlog(f" -> group={group_num} letter={letter} idx={idx}")

        links_path = find_links_file_for_group(group_num)
        if not links_path:
            err(f"[!] no Links file found for group {group_num}")
            failed += 1
            continue
        vlog(f" -> links file: {links_path}")

        links = load_links(links_path)
        if not links:
            err(f"[!] empty Links file: {links_path}")
            failed += 1
            continue
        if idx >= len(links):
            err(f"[!] index {idx} out of range; links file has {len(links)} entries")
            failed += 1
            continue

        url = links[idx]
        log(f"  ✓ URL: {url}")

        out_template = os.path.join(OUTPUT_DIR, f"group_{group_num}.%(ext)s")
        final_mp4 = os.path.join(OUTPUT_DIR, f"group_{group_num}.mp4")

        if SKIP_EXISTING and os.path.isfile(final_mp4):
            log(f"[skip] already have {final_mp4}")
            processed += 1
            continue

        ok = yt_dlp_download(url, out_template)
        if not ok:
            err(f"[!] download failed group {group_num}")
            failed += 1
            continue

        if trim_to_max(group_num):
            processed += 1
        else:
            failed += 1

        time.sleep(INTER_VIDEO_SLEEP)

    log("\n=== Download summary ===")
    log(f"Processed OK: {processed}")
    log(f"Failed:      {failed}")
    if STRICT and processed == 0:
        sys.exit(1)
    log("[✓] Done.")

if __name__ == "__main__":
    main()
