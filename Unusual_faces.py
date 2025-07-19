
#!/usr/bin/env python3
"""
Unusual_faces.py  (Real-time MediaPipe version, NO JSON)

For each video (recursively under VIDEO_DIR):
  * Run MediaPipe face detection (sample every FRAME_STRIDE frames).
  * Mark frames "unusual" if NO face with confidence >= THRESHOLD is present.
  * Build continuous unusual time segments (merge small gaps, drop tiny segments).
  * Cut those segments from the source using ffmpeg and concatenate into
        <basename>_unusual.mp4
    written to TIMELINE_DIR.

Environment Variables (optional):
    VIDEO_DIR (default: Final_Videos)
    TIMELINE_DIR (default: Timeline)
    THRESHOLD (default: 0.5)       # Face confidence threshold
    MIN_CONFIDENCE (alias for THRESHOLD if you prefer naming)
    FRAME_STRIDE (default: 1)      # Analyze every Nth frame
    MAX_ANALYZE_SECONDS (default: 0 -> no cap)
    MIN_SEG_DUR (default: 0.40)    # Minimum unusual segment length in seconds
    MERGE_GAP_SEC (default: 0.20)  # Merge gaps <= this
    REENCODE (default: 0)          # 1: re-encode segments, 0: stream copy
    SKIP_EXISTING (default: 1)
    DEBUG (default: 1)
    MODEL_SELECTION (default: 0)
    DEBUG_KEEP_TEMP (unset)        # keep temp parts if set

Requires:
    pip install mediapipe opencv-python ffmpeg (ffmpeg binary in PATH)
"""

import os
import sys
import math
import shutil
import tempfile
import subprocess
from pathlib import Path
from typing import List, Tuple

# -------------------- ENV --------------------
def _truthy(v): return str(v).strip().lower() in ("1", "true", "yes", "on")

VIDEO_DIR        = os.environ.get("VIDEO_DIR", "Final_Videos")
OUTPUT_DIR       = os.environ.get("TIMELINE_DIR", "Timeline")
# Allow either THRESHOLD or MIN_CONFIDENCE naming
THRESHOLD        = float(os.environ.get("THRESHOLD",
                         os.environ.get("MIN_CONFIDENCE", "0.5")))
FRAME_STRIDE     = int(os.environ.get("FRAME_STRIDE", "1"))
MAX_ANALYZE_SEC  = float(os.environ.get("MAX_ANALYZE_SECONDS", "0"))
MIN_SEG_DUR      = float(os.environ.get("MIN_SEG_DUR", "0.40"))
MERGE_GAP_SEC    = float(os.environ.get("MERGE_GAP_SEC", "0.20"))
REENCODE         = _truthy(os.environ.get("REENCODE", "0"))
SKIP_EXISTING    = _truthy(os.environ.get("SKIP_EXISTING", "1"))
DEBUG            = _truthy(os.environ.get("DEBUG", "1"))
MODEL_SELECTION  = int(os.environ.get("MODEL_SELECTION", "0"))

Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

# -------------------- LOGGING --------------------
def dbg(msg: str):
    if DEBUG:
        print(f"[DBG] {msg}", flush=True)

def info(msg: str):
    print(f"[INFO] {msg}", flush=True)

def warn(msg: str):
    print(f"[WARN] {msg}", flush=True)

def err(msg: str):
    print(f"[ERROR] {msg}", file=sys.stderr, flush=True)

# -------------------- IMPORTS --------------------
try:
    import cv2
except ImportError:
    err("opencv-python not installed. Run: pip install opencv-python")
    sys.exit(1)

try:
    import mediapipe as mp
except ImportError:
    err("mediapipe not installed. Run: pip install mediapipe")
    sys.exit(1)

mp_face = mp.solutions.face_detection

# -------------------- FACE CHECK --------------------
def frame_is_usual(frame, detector) -> bool:
    """
    Returns True if there is at least one face with score >= THRESHOLD.
    Otherwise returns False (meaning it's an 'unusual' frame for our logic).
    """
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    rgb.flags.writeable = False
    res = detector.process(rgb)
    if res.detections:
        for d in res.detections:
            if d.score and d.score[0] is not None and d.score[0] >= THRESHOLD:
                return True
    return False

# -------------------- SEGMENT MERGING --------------------
def merge_segments(segments: List[Tuple[float, float]],
                   merge_gap: float,
                   min_len: float) -> List[Tuple[float, float]]:
    if not segments:
        return []
    segments = sorted(segments)
    merged = []
    cur_s, cur_e = segments[0]
    for s, e in segments[1:]:
        if s - cur_e <= merge_gap:
            cur_e = max(cur_e, e)
        else:
            if (cur_e - cur_s) >= min_len:
                merged.append((cur_s, cur_e))
            cur_s, cur_e = s, e
    if (cur_e - cur_s) >= min_len:
        merged.append((cur_s, cur_e))
    return merged

# -------------------- ANALYZE VIDEO --------------------
def find_unusual_segments(video_path: str) -> List[Tuple[float, float]]:
    """
    Analyze video and return list of (start, end) for unusual (no-face/low-face) segments.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        err(f"Cannot open video: {video_path}")
        return []

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps < 1e-3:
        fps = 30.0
        warn(f"Invalid FPS detected; assuming {fps}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    est_dur = total_frames / fps if total_frames > 0 else None
    analyze_limit = est_dur if est_dur is not None else float('inf')
    if MAX_ANALYZE_SEC > 0:
        analyze_limit = min(analyze_limit, MAX_ANALYZE_SEC)

    dbg(f"Video: fps={fps:.3f} frames={total_frames} est_dur={est_dur} analyze<= {analyze_limit:.3f}s")

    unusual_segments_raw: List[Tuple[float, float]] = []
    in_unusual = False
    seg_start = 0.0

    frame_idx = 0
    processed_frames = 0

    with mp_face.FaceDetection(
        model_selection=MODEL_SELECTION,
        min_detection_confidence=THRESHOLD  # we use same threshold; internal pass
    ) as detector:

        while True:
            ok, frame = cap.read()
            if not ok:
                break

            t = frame_idx / fps
            if t > analyze_limit:
                dbg("Reached analyze limit.")
                break

            if frame_idx % FRAME_STRIDE == 0:
                processed_frames += 1
                usual = frame_is_usual(frame, detector)  # True if face present above threshold
                if not usual:
                    if not in_unusual:
                        in_unusual = True
                        seg_start = t
                else:
                    if in_unusual:
                        unusual_segments_raw.append((seg_start, t))
                        in_unusual = False

            frame_idx += 1

    if in_unusual:
        end_t = min(analyze_limit, frame_idx / fps)
        unusual_segments_raw.append((seg_start, end_t))

    cap.release()

    dbg(f"Raw unusual segments: {len(unusual_segments_raw)}")
    for s, e in unusual_segments_raw:
        dbg(f"  raw {s:.3f}->{e:.3f} ({e - s:.3f}s)")

    merged = merge_segments(unusual_segments_raw, MERGE_GAP_SEC, MIN_SEG_DUR)

    dbg(f"Merged unusual segments: {len(merged)}")
    for s, e in merged:
        dbg(f"  merged {s:.3f}->{e:.3f} ({e - s:.3f}s)")

    return merged

# -------------------- FFMPEG HELPERS --------------------
def run_cmd(cmd: List[str]) -> int:
    dbg("CMD: " + " ".join(cmd))
    try:
        p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    except Exception as e:
        err(f"Subprocess failed: {e}")
        return 1
    if DEBUG and p.stdout:
        print(p.stdout)
    if DEBUG and p.stderr:
        print(p.stderr)
    return p.returncode

def build_unusual_video(src: str, segments: List[Tuple[float, float]], out_path: str) -> bool:
    if not segments:
        warn("No unusual segments to cut.")
        return False

    temp_dir = tempfile.mkdtemp(prefix="unusual_parts_")
    part_files = []

    try:
        for idx, (start, end) in enumerate(segments):
            dur = end - start
            if dur <= 0:
                continue
            part = os.path.join(temp_dir, f"part_{idx:04d}.mp4")
            if REENCODE:
                cmd = [
                    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-ss", f"{start:.6f}", "-t", f"{dur:.6f}",
                    "-i", src,
                    "-c:v", "libx264", "-preset", "fast", "-crf", "23",
                    "-c:a", "aac", "-b:a", "128k",
                    part
                ]
            else:
                cmd = [
                    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-ss", f"{start:.6f}", "-t", f"{dur:.6f}",
                    "-i", src,
                    "-c", "copy",
                    part
                ]
            rc = run_cmd(cmd)
            if rc != 0 or not os.path.exists(part) or os.path.getsize(part) == 0:
                warn(f"Cut failed for segment {idx} ({start:.3f}-{end:.3f}); skipped.")
                continue
            part_files.append(part)

        if not part_files:
            err("All cuts failed; nothing to concatenate.")
            return False

        manifest = os.path.join(temp_dir, "concat.txt")
        with open(manifest, "w", encoding="utf-8") as mf:
            for pf in part_files:
                mf.write(f"file '{pf.replace(\"'\", \"'\\\\''\")}'\n")

        if REENCODE:
            concat_cmd = [
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-f", "concat", "-safe", "0", "-i", manifest,
                "-c:v", "libx264", "-preset", "fast", "-crf", "23",
                "-c:a", "aac", "-b:a", "128k",
                out_path
            ]
        else:
            concat_cmd = [
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-f", "concat", "-safe", "0", "-i", manifest,
                "-c", "copy",
                out_path
            ]
        rc = run_cmd(concat_cmd)
        if rc != 0:
            err("Concat failed.")
            return False

        if not os.path.exists(out_path):
            err("Output missing after concat.")
            return False

        info(f"✅ Created: {out_path}")
        return True
    finally:
        if os.environ.get("DEBUG_KEEP_TEMP"):
            warn(f"Keeping temp dir: {temp_dir}")
        else:
            shutil.rmtree(temp_dir, ignore_errors=True)

# -------------------- DRIVER --------------------
def process_directory(root: str, out_dir: str):
    processed = 0
    skipped_existing = 0
    skipped_empty = 0
    failed = 0

    for dirpath, _, files in os.walk(root):
        for fname in files:
            if not fname.lower().endswith((".mp4", ".mov", ".m4v", ".mkv", ".webm")):
                continue
            video_path = os.path.join(dirpath, fname)
            base = os.path.splitext(os.path.basename(fname))[0]
            output_path = os.path.join(out_dir, base + "_unusual.mp4")

            info(f"---\nVideo: {video_path}")
            if SKIP_EXISTING and os.path.exists(output_path):
                warn(f"Exists (skip): {output_path}")
                skipped_existing += 1
                continue

            segments = find_unusual_segments(video_path)
            if not segments:
                warn("No unusual segments detected.")
                skipped_empty += 1
                continue

            if build_unusual_video(video_path, segments, output_path):
                processed += 1
            else:
                failed += 1

    print("\n=== Summary ===")
    print(f"Processed outputs : {processed}")
    print(f"Skipped existing  : {skipped_existing}")
    print(f"Skipped (no segs) : {skipped_empty}")
    print(f"Failed            : {failed}")

# -------------------- MAIN --------------------
def main():
    info("Running Unusual_faces.py (real-time MediaPipe, NO JSON)")
    info(f"VIDEO_DIR        = {VIDEO_DIR}")
    info(f"TIMELINE_DIR     = {OUTPUT_DIR}")
    info(f"THRESHOLD        = {THRESHOLD}")
    info(f"FRAME_STRIDE     = {FRAME_STRRIDE := FRAME_STRIDE}")
    info(f"MAX_ANALYZE_SEC  = {MAX_ANALYZE_SEC}")
    info(f"MIN_SEG_DUR      = {MIN_SEG_DUR}")
    info(f"MERGE_GAP_SEC    = {MERGE_GAP_SEC}")
    info(f"REENCODE         = {REENCODE}")
    info(f"MODEL_SELECTION  = {MODEL_SELECTION}")
    info(f"SKIP_EXISTING    = {SKIP_EXISTING}")
    info(f"DEBUG            = {DEBUG}")

    if not os.path.isdir(VIDEO_DIR):
        err(f"Input directory not found: {VIDEO_DIR}")
        sys.exit(1)

    process_directory(VIDEO_DIR, OUTPUT_DIR)

if __name__ == "__main__":
    main()
