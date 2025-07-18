
#!/usr/bin/env python3
"""
Unusual_download.py (robust multi-mode)
--------------------------------------
Reads from:
  Unuusual_memory/QUALIFY/qualified.txt     (Group lines -> winner filenames)
  Unuusual_memory/Links/                     (group link files)
  Unuusual_memory/DURATION/                  (per-winner duration info)

Downloads highest available quality (respecting VIDEO_ONLY preference),
clips to MAX_SECONDS when needed (mode controlled by CLIP_METHOD),
supports Tor, retries, and skip-existing.

ENV (all optional):
  VERBOSE=1
  STRICT=0
  TOR=0
  TOR_RESTART_EACH=0
  MAX_SECONDS=180
  SKIP_EXISTING=1
  VIDEO_ONLY=1        # 1=prefer video-only, 0=prefer best full (video+audio)
  CLIP_METHOD=native  # native|local|none

Output files:
  Vid/group_<group>.mp4
"""

import os
import re
import sys
import time
import shlex
import glob
import subprocess

# ------------------------------------------------------------------
# Paths
# ------------------------------------------------------------------
BASE_DIR       = "Unuusual_memory"
QUALIFY_PATH   = os.path.join(BASE_DIR, "QUALIFY", "qualified.txt")
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
TOR_ENABLED      = _truthy(os.environ.get("TOR", "0"))
TOR_RESTART_EACH = _truthy(os.environ.get("TOR_RESTART_EACH", "0"))
SKIP_EXISTING    = _truthy(os.environ.get("SKIP_EXISTING", "1"))
VIDEO_ONLY       = _truthy(os.environ.get("VIDEO_ONLY", "1"))

CLIP_METHOD      = os.environ.get("CLIP_METHOD", "native").strip().lower()
if CLIP_METHOD not in ("native", "local", "none"):
    CLIP_METHOD = "native"

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
def run_command(cmd, desc="command", retries=1, delay=5, fatal=True, timeout=None, capture=False, text=True):
    """
    Run shell command list with retries.
    If capture=True, returns (ok, stdout, stderr).
    Else returns True/False.
    """
    for attempt in range(1, retries + 1):
        vlog(f"[cmd] {desc} ({attempt}/{retries}): {' '.join(shlex.quote(c) for c in cmd)}")
        try:
            if capture:
                cp = subprocess.run(cmd, check=True, text=text, capture_output=True, timeout=timeout)
                return True, cp.stdout, cp.stderr
            else:
                subprocess.run(cmd, check=True, timeout=timeout)
                return True
        except subprocess.CalledProcessError as e:
            err(f"[cmd] FAIL {desc}: {e}")
            if attempt < retries:
                time.sleep(delay)
    if fatal:
        err(f"[cmd] giving up: {desc}")
        sys.exit(1)
    if capture:
        return False, "", ""
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
    if not m: return None
    return int(m.group(1)), m.group(2).strip()

# ------------------------------------------------------------------
# Extract group/slot/slug from filename (tolerant)
# ------------------------------------------------------------------
def parse_winner_filename(fname: str):
    noext = re.sub(r'\.[tT][xX][tT]\s*$', '', fname.strip())
    i = 0
    while i < len(noext) and noext[i].isdigit():
        i += 1
    if i == 0:
        return None
    group_num = int(noext[:i])
    rest = noext[i:]
    o = rest.find('(')
    c = rest.find(')', o + 1) if o != -1 else -1
    if o == -1 or c == -1:
        return None
    slot_token = rest[o + 1:c].strip()[:1]
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
        if j == 0: continue
        if int(fname[:j]) != group_num: continue
        slug_part = re.sub(r'\.[tT][xX][tT]$', '', fname[j:]).lstrip("_- ")
        if canon_slug(slug_part) == wanted_slug:
            return os.path.join(LINKS_DIR, fname)
    # fallback group match shortest
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
                if not s or s.startswith("#"): continue
                links.append(s)
    except Exception as e:
        err(f"[links] ERROR {path}: {e}")
    return links

# ------------------------------------------------------------------
# Duration lookup from DURATION/<winner_filename>.txt
# ------------------------------------------------------------------
DUR_SECS_RE = re.compile(r'Duration_seconds\s*:\s*(\d+)', re.IGNORECASE)
DUR_ISO_RE  = re.compile(r'Duration_ISO\s*:\s*(PT\S+)', re.IGNORECASE)

def parse_iso_duration(iso: str):
    m = re.match(r'^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$', iso.strip())
    if not m: return None
    h = int(m.group(1) or 0)
    mi = int(m.group(2) or 0)
    s = int(m.group(3) or 0)
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

# ------------------------------------------------------------------
# seconds -> HH:MM:SS
# ------------------------------------------------------------------
def seconds_to_hhmmss(n: int) -> str:
    if n <= 0: n = 1
    h = n // 3600
    m = (n % 3600) // 60
    s = n % 60
    return f"{h:02d}:{m:02d}:{s:02d}"

# ------------------------------------------------------------------
# Format selector builder
# ------------------------------------------------------------------
def build_format_selector():
    """
    Build a yt-dlp -f selector string based on VIDEO_ONLY preference.
    We want highest quality available, but try mp4 <=4k if possible, else anything.
    """
    if VIDEO_ONLY:
        # prefer mp4 video-only, any height; fallback to any video-only; fallback to best
        # note: quoting is handled by shell list; no spaces inside alt parts
        return "bv*[ext=mp4]/bv*/bestvideo/best"
    else:
        # prefer best quality with audio; fallback video-only
        return "bestvideo*+bestaudio/best/bv*/bestvideo"
    
# ------------------------------------------------------------------
# Download using yt-dlp native clip mode (download-sections)
# ------------------------------------------------------------------
def yt_dlp_native_clip(url: str, group_num: int, end_secs: int | None):
    """
    Use yt-dlp to download only the needed time slice (if end_secs set),
    or full video if None.
    """
    out_template = os.path.join(OUTPUT_DIR, f"group_{group_num}.%(ext)s")
    fmt = build_format_selector()

    cmd = ["yt-dlp"]
    if TOR_ENABLED:
        cmd += ["--proxy", "socks5h://127.0.0.1:9050"]
    # make yt-dlp do segmenting itself (avoid ffmpeg network)
    cmd += ["--hls-prefer-native"]

    cmd += ["-f", fmt, "--recode-video", "mp4"]

    if end_secs is not None:
        section = f"*0:00-{seconds_to_hhmmss(end_secs)}"
        cmd += ["--download-sections", section]

    cmd += ["-o", out_template, url]

    vlog(f"[debug] yt-dlp-native cmd: {' '.join(shlex.quote(c) for c in cmd)}")
    ok = run_command(cmd, desc=f"download group {group_num}", retries=3, delay=7, fatal=False)
    if not ok:
        err(f"[dl] native clip fail group {group_num}")
        return False

    _ensure_mp4(group_num)
    return True

# ------------------------------------------------------------------
# Download full then local trim
# ------------------------------------------------------------------
def yt_dlp_full(url: str, group_num: int):
    out_template = os.path.join(OUTPUT_DIR, f"group_{group_num}_full.%(ext)s")
    fmt = build_format_selector()

    cmd = ["yt-dlp"]
    if TOR_ENABLED:
        cmd += ["--proxy", "socks5h://127.0.0.1:9050"]
    cmd += ["--hls-prefer-native"]
    cmd += ["-f", fmt, "--recode-video", "mp4", "-o", out_template, url]

    vlog(f"[debug] yt-dlp-full cmd: {' '.join(shlex.quote(c) for c in cmd)}")
    ok = run_command(cmd, desc=f"download full group {group_num}", retries=3, delay=7, fatal=False)
    if not ok:
        err(f"[dl] full download fail group {group_num}")
        return False
    return True

def _find_full_download(group_num: int):
    pattern = os.path.join(OUTPUT_DIR, f"group_{group_num}_full.*")
    matches = glob.glob(pattern)
    if not matches:
        # maybe recode wrote mp4 without _full
        alt = os.path.join(OUTPUT_DIR, f"group_{group_num}.mp4")
        if os.path.isfile(alt):
            return alt
        return None
    # largest
    matches.sort(key=lambda p: os.path.getsize(p) if os.path.exists(p) else 0, reverse=True)
    return matches[0]

def _ensure_mp4(group_num: int):
    """
    After yt-dlp run, ensure final mp4 present as Vid/group_<group>.mp4.
    Rename if necessary.
    """
    target = os.path.join(OUTPUT_DIR, f"group_{group_num}.mp4")
    if os.path.isfile(target):
        return target
    # try any extension
    prefix = os.path.join(OUTPUT_DIR, f"group_{group_num}.")
    candidates = [os.path.join(OUTPUT_DIR, fn) for fn in os.listdir(OUTPUT_DIR)
                  if fn.startswith(f"group_{group_num}.")]
    if not candidates:
        return None
    # pick first non-mp4; rename
    src = candidates[0]
    try:
        os.replace(src, target)
    except Exception as e:
        vlog(f"[rename] warn: {src}->{target}: {e}")
    return target

def local_trim(group_num: int, end_secs: int):
    """
    Trim downloaded full file to end_secs.
    """
    src = _find_full_download(group_num)
    if not src:
        err(f"[trim] no full file for group {group_num}")
        return False
    dest = os.path.join(OUTPUT_DIR, f"group_{group_num}.mp4")
    # copy-try (fast, but may fail keyframes)
    cmd = ["ffmpeg", "-y", "-i", src, "-t", str(end_secs), "-c", "copy", dest]
    vlog(f"[debug] ffmpeg copy trim: {' '.join(shlex.quote(c) for c in cmd)}")
    ok = run_command(cmd, desc=f"ffmpeg trim copy group {group_num}", retries=1, fatal=False)
    if not ok or not os.path.isfile(dest):
        vlog("[trim] copy failed, re-encode fallback")
        cmd2 = ["ffmpeg", "-y", "-i", src, "-t", str(end_secs), "-c:v", "libx264", "-c:a", "aac", dest]
        run_command(cmd2, desc=f"ffmpeg trim encode group {group_num}", retries=1, fatal=False)
    # we keep full file for debug; uncomment to delete:
    # if os.path.exists(src) and src != dest:
    #     os.remove(src)
    return True

# ------------------------------------------------------------------
# Main per-video logic
# ------------------------------------------------------------------
def process_video(url: str, group_num: int, duration_secs: int | None):
    """
    Decide clip vs full & handle according to CLIP_METHOD.
    """
    final_mp4 = os.path.join(OUTPUT_DIR, f"group_{group_num}.mp4")
    if SKIP_EXISTING and os.path.isfile(final_mp4):
        log(f"[skip] already exists: {final_mp4}")
        return True

    # Determine whether we need to clip
    need_clip = False
    if CLIP_METHOD == "none":
        need_clip = False
    elif duration_secs is None:
        # unknown -> assume maybe large → clip
        need_clip = (CLIP_METHOD != "none")
    else:
        need_clip = (duration_secs > MAX_SECONDS)

    # Branch
    if CLIP_METHOD == "native":
        # clip at source if needed, else full native
        end = MAX_SECONDS if need_clip else None
        return yt_dlp_native_clip(url, group_num, end)

    elif CLIP_METHOD == "local":
        # always full download, then optional local trim
        if not yt_dlp_full(url, group_num):
            return False
        if need_clip:
            return local_trim(group_num, MAX_SECONDS)
        else:
            # rename _full.* to final if no trim
            src = _find_full_download(group_num)
            if src:
                dest = os.path.join(OUTPUT_DIR, f"group_{group_num}.mp4")
                if src != dest:
                    try: os.replace(src, dest)
                    except Exception as e: vlog(f"[rename] warn: {e}")
            return True

    elif CLIP_METHOD == "none":
        return yt_dlp_native_clip(url, group_num, None)

    else:
        err(f"[conf] unknown CLIP_METHOD {CLIP_METHOD}")
        return False

# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------
def main():
    log("=== Unusual_download.py (robust) ===")
    log(f"QUALIFY_PATH    = {QUALIFY_PATH}")
    log(f"LINKS_DIR       = {LINKS_DIR}")
    log(f"DURATION_DIR    = {DURATION_DIR}")
    log(f"OUTPUT_DIR      = {OUTPUT_DIR}")
    log(f"TOR_ENABLED     = {TOR_ENABLED}")
    log(f"MAX_SECONDS     = {MAX_SECONDS}")
    log(f"CLIP_METHOD     = {CLIP_METHOD}")
    log(f"VIDEO_ONLY      = {VIDEO_ONLY}")
    log(f"SKIP_EXISTING   = {SKIP_EXISTING}")
    log(f"VERBOSE={VERBOSE} STRICT={STRICT} TOR_RESTART_EACH={TOR_RESTART_EACH}")

    if not os.path.isdir(LINKS_DIR):
        err(f"❌ Links directory not found: {LINKS_DIR}")
        if STRICT: sys.exit(1)
        return

    if not os.path.isdir(DURATION_DIR):
        vlog(f"⚠️ DURATION dir missing: {DURATION_DIR} (durations unknown)")

    if not os.path.isfile(QUALIFY_PATH):
        err(f"❌ qualified.txt missing: {QUALIFY_PATH}")
        if STRICT: sys.exit(1)
        return

    if TOR_ENABLED:
        start_tor()

    with open(QUALIFY_PATH, "r", encoding="utf-8", errors="ignore") as f:
        raw_lines = [ln.strip() for ln in f if ln.strip()]

    if not raw_lines:
        log("[!] qualified.txt empty; nothing to download.")
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

        # prefer group_num from line
        if group_num != group_num_line:
            vlog(f"  ⚠ group mismatch (line={group_num_line}, parsed={group_num}); using line value")
            group_num = group_num_line

        idx = slot_to_index(slot_token)
        vlog(f"  -> group={group_num}, slot={slot_token!r}(idx={idx}), slug='{slug_raw}'")

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

        # duration lookup
        dur_secs = read_duration_seconds_for_winner(fname)

        if TOR_ENABLED and TOR_RESTART_EACH:
            restart_tor()

        if process_video(url, group_num, dur_secs):
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
