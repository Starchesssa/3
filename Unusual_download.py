
#!/usr/bin/env python3
"""
Unusual_download.py
(Tor default, tolerant filenames, fuzzy Links match, simple mp4 download, 180s trim)

See docstring in conversation for details.
"""

import os
import re
import sys
import time
import shlex
import glob
import subprocess
import unicodedata

# ---------------- Paths ----------------
BASE_DIR       = "Unuusual_memory"
QUALIFY_PATH   = os.path.join(BASE_DIR, "QUALIFY", "qualified.txt")
LINKS_DIR      = os.path.join(BASE_DIR, "Links")          # per your request
DURATION_DIR   = os.path.join(BASE_DIR, "DURATION")
OUTPUT_DIR     = "Vid"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------- ENV ----------------
def _truthy(x): return str(x).strip().lower() in ("1","true","yes","on")

VERBOSE        = _truthy(os.environ.get("VERBOSE", "1"))
STRICT         = _truthy(os.environ.get("STRICT",  "0"))
TOR_ENABLED    = _truthy(os.environ.get("TOR",     "1"))   # default ON
SKIP_EXISTING  = _truthy(os.environ.get("SKIP_EXISTING", "1"))
ALWAYS_CLIP    = _truthy(os.environ.get("ALWAYS_CLIP", "1"))

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

# ---------------- Shell helper ----------------
def run_command(cmd, error_msg, retries=3, delay=5, restart_ip_on_fail=False, fatal=True):
    for attempt in range(1, retries+1):
        vlog(f"[cmd] {error_msg} attempt {attempt}/{retries}: {' '.join(shlex.quote(c) for c in cmd)}")
        try:
            subprocess.run(cmd, check=True)
            return True
        except subprocess.CalledProcessError as e:
            err(f"[ERROR] {error_msg}: {e}")
            if restart_ip_on_fail and TOR_ENABLED:
                restart_tor()
            if attempt < retries:
                time.sleep(delay)
            else:
                if fatal:
                    err("[✘] Giving up.")
                    sys.exit(1)
                return False

# ---------------- Tor ----------------
def tor_installed():
    return subprocess.run(["which", "tor"], capture_output=True).returncode == 0

def restart_tor():
    log("[*] Restarting Tor to get new IP...")
    run_command(["sudo","service","tor","restart"], "Failed to restart Tor", retries=1, fatal=False)
    time.sleep(5)

def start_tor():
    if not TOR_ENABLED:
        vlog("[tor] disabled (TOR=0)")
        return
    log("[*] Setting up Tor...")
    if not tor_installed():
        log("[*] Installing Tor...")
        run_command(["sudo","apt-get","update"], "Failed to update package list", fatal=False)
        run_command(["sudo","apt-get","install","-y","tor"], "Failed to install Tor", fatal=False)
    log("[*] Starting Tor service...")
    run_command(["sudo","service","tor","start"], "Failed to start Tor", fatal=False)
    try:
        result = subprocess.run(
            ["curl","--socks5","127.0.0.1:9050","https://check.torproject.org/"],
            capture_output=True, timeout=10
        )
        if b"Congratulations" in result.stdout:
            log("[✓] Tor is active.")
        else:
            log("[!] Tor check did not confirm activity.")
    except Exception as e:
        vlog(f"[!] Skipping Tor validation: {e}")

# ---------------- Duration parsing ----------------
DUR_SECS_RE = re.compile(r'Duration_seconds\s*:\s*(\d+)', re.IGNORECASE)
DUR_ISO_RE  = re.compile(r'Duration_ISO\s*:\s*(PT\S+)', re.IGNORECASE)

def parse_iso_duration(iso: str):
    m = re.match(r'^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$', iso.strip())
    if not m: return None
    h  = int(m.group(1) or 0)
    mi = int(m.group(2) or 0)
    s  = int(m.group(3) or 0)
    return h*3600 + mi*60 + s

def read_duration_seconds_for_winner(fname: str):
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

# ---------------- Qualified line parsing ----------------
QUALIFY_LINE_RE = re.compile(r'^\s*Group\s+(\d+)\s*:\s*(.+?)\s*$', re.IGNORECASE)

def parse_qualify_line(line: str):
    m = QUALIFY_LINE_RE.match(line)
    if not m:
        return None
    return int(m.group(1)), m.group(2).strip()

# ---------------- Tolerant winner filename parse ----------------
# Accept spaces, underscores, hyphens, stray dots.
WINNER_TOL_RE = re.compile(
    r'^\s*(\d+)\s*\s*([a-z0-9])\s*\s*[_\-\s]*([^.]+?)\s*\.?t[xX][tT]\s*$'
)

def normalize_slug(raw: str) -> str:
    # Normalize unicode, lower, collapse non-alnum to underscore.
    raw = unicodedata.normalize("NFKC", raw)
    raw = raw.lower()
    raw = raw.replace("__", "_")
    # Replace separators (space, slash, dash) with underscore
    raw = re.sub(r'[\s\-]+', '_', raw)
    # Remove anything not alnum or underscore
    raw = re.sub(r'[^a-z0-9_]+', '', raw)
    # collapse repeats
    raw = re.sub(r'_+', '_', raw).strip('_')
    return raw

def parse_winner_filename(fname: str):
    m = WINNER_TOL_RE.match(fname)
    if not m:
        return None
    grp, letter, slug_raw = m.groups()
    return int(grp), letter.lower(), normalize_slug(slug_raw)

def letter_to_index(letter):
    if letter.isdigit():
        return max(0, int(letter)-1)
    return ord(letter.lower()) - ord('a')

# ---------------- Fuzzy find Links file ----------------
def find_links_file(group_number: int, slug_norm: str):
    """
    Try exact match: Links/<group>_<slug_norm>.txt
    Else scan for any file starting with group_, pick best slug overlap.
    """
    direct = os.path.join(LINKS_DIR, f"{group_number}_{slug_norm}.txt")
    if os.path.isfile(direct):
        return direct

    # scan all group* files
    candidates = []
    prefix = f"{group_number}_"
    for fn in os.listdir(LINKS_DIR):
        if not fn.lower().endswith(".txt"):
            continue
        if not fn.startswith(prefix):
            continue
        full = os.path.join(LINKS_DIR, fn)
        # extract slug part after group_
        slug_part = fn[len(prefix):-4]  # strip ".txt"
        slug_part_norm = normalize_slug(slug_part)
        score = fuzzy_slug_score(slug_norm, slug_part_norm)
        candidates.append((score, full))
    if not candidates:
        return None
    # pick highest score; break ties by shortest name
    candidates.sort(key=lambda x: (-x[0], len(x[1])))
    return candidates[0][1]

def fuzzy_slug_score(a: str, b: str) -> float:
    """
    Simple overlap score: token intersection / union.
    Good enough for your dataset (robot_window_cleaner vs robotwindowcleaner etc).
    """
    ta = set(a.split('_'))
    tb = set(b.split('_'))
    if not ta and not tb:
        return 0.0
    inter = len(ta & tb)
    uni   = len(ta | tb)
    return inter / uni if uni else 0.0

# ---------------- Load links list ----------------
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

# ---------------- yt-dlp full download (simple) ----------------
def yt_dlp_full_download(link, out_template):
    cmd = [
        "yt-dlp",
        "--merge-output-format", "mp4",
        "-o", out_template,
        link
    ]
    if TOR_ENABLED:
        cmd[1:1] = ["--proxy", "socks5://127.0.0.1:9050"]
    return run_command(cmd, "Video download failed", retries=3, delay=7, restart_ip_on_fail=True, fatal=False)

# ---------------- Trim local file ----------------
def trim_local(group_num, duration_secs):
    """
    Trim to first MAX_SECONDS seconds if needed.
    If duration is None:
       trim if ALWAYS_CLIP=1 else leave full.
    """
    need_trim = False
    if duration_secs is None:
        need_trim = ALWAYS_CLIP
    else:
        need_trim = (duration_secs > MAX_SECONDS)

    pattern = os.path.join(OUTPUT_DIR, f"group_{group_num}.*")
    matches = glob.glob(pattern)
    if not matches:
        err(f"[trim] no downloaded file for group {group_num}")
        return False
    matches.sort(key=lambda p: os.path.getsize(p), reverse=True)
    src = matches[0]

    dest = os.path.join(OUTPUT_DIR, f"group_{group_num}.mp4")

    if not need_trim:
        # just normalize to mp4 if not already
        if src.lower().endswith(".mp4"):
            if src != dest:
                try: os.replace(src, dest)
                except Exception as e: vlog(f"[trim] rename warn: {e}")
            return True
        cmd = ["ffmpeg", "-y", "-i", src, "-c", "copy", dest]
        vlog(f"[trim] normalize copy: {' '.join(shlex.quote(c) for c in cmd)}")
        run_command(cmd, "ffmpeg normalize", retries=1, fatal=False)
        return True

    # need trim: start at 0
    cmd = ["ffmpeg", "-y", "-i", src, "-t", str(MAX_SECONDS), "-c", "copy", dest]
    vlog(f"[trim] ffmpeg copy trim: {' '.join(shlex.quote(c) for c in cmd)}")
    ok = run_command(cmd, "ffmpeg trim copy", retries=1, fatal=False)
    if not ok or not os.path.isfile(dest):
        vlog("[trim] copy failed, trying re-encode")
        cmd2 = ["ffmpeg", "-y", "-i", src, "-t", str(MAX_SECONDS), "-c:v", "libx264", "-c:a", "aac", dest]
        run_command(cmd2, "ffmpeg trim encode", retries=1, fatal=False)

    return True

# ---------------- Main ----------------
def main():
    log("=== Unusual_download.py (tolerant + Tor + clip) ===")
    log(f"TOR_ENABLED   = {TOR_ENABLED}")
    log(f"MAX_SECONDS   = {MAX_SECONDS}")
    log(f"ALWAYS_CLIP   = {ALWAYS_CLIP}")
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
    if not os.path.isdir(DURATION_DIR):
        vlog(f"[!] No DURATION dir: {DURATION_DIR} (durations unknown)")

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
        group_num, winner_fname = parsed

        pw = parse_winner_filename(winner_fname)
        if not pw:
            err(f"[!] cannot parse winner filename: {winner_fname}")
            failed += 1
            continue
        grp_from_fname, letter, slug_norm = pw

        if grp_from_fname != group_num:
            vlog(f"[warn] line group {group_num} != fname group {grp_from_fname}; using {group_num}")

        idx = letter_to_index(letter)
        vlog(f" -> group={group_num} slot={letter} idx={idx} slug_norm={slug_norm}")

        links_path = find_links_file(group_num, slug_norm)
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
            err(f"[!] index {idx} out of range ({len(links)}) in {links_path}")
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

        dur_secs = read_duration_seconds_for_winner(winner_fname)

        ok = yt_dlp_full_download(url, out_template)
        if not ok:
            err(f"[!] download failed group {group_num}")
            failed += 1
            continue

        if trim_local(group_num, dur_secs):
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
