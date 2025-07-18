
#!/usr/bin/env python3
"""
Unusual_faces.py

Scan a directory tree for .mp4 files. For each, look for a matching JSON
metadata file (same basename, .json extension) that contains per-frame
object detections. Extract time segments where the "person" confidence is
*below* a threshold, cut those segments from the source video with ffmpeg,
and concatenate them into an "_unusual.mp4" output in the target folder.

Designed to work in CI (GitHub Actions). If command-line args are omitted,
the script falls back to environment variables (VIDEO_DIR, TIMELINE_DIR)
and then to hardcoded defaults ("Final_Videos", "Timeline").
"""

import os
import sys
import json
import shutil
import tempfile
import subprocess
from pathlib import Path
from typing import List, Tuple, Optional

# ------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------
# Default threshold; override with env THRESHOLD or CLI in future
THRESHOLD = float(os.environ.get("THRESHOLD", "0.5"))

# Debug verbosity; set DEBUG=0 to quiet
DEBUG = os.environ.get("DEBUG", "1") not in ("0", "false", "False", "")


# ------------------------------------------------------------------
# Debug helpers
# ------------------------------------------------------------------
def dbg(msg: str) -> None:
    if DEBUG:
        print(f"[DBG] {msg}", flush=True)


def info(msg: str) -> None:
    print(f"[INFO] {msg}", flush=True)


def warn(msg: str) -> None:
    print(f"[WARN] {msg}", flush=True)


def err(msg: str) -> None:
    print(f"[ERROR] {msg}", file=sys.stderr, flush=True)


# ------------------------------------------------------------------
# Metadata parsing
# ------------------------------------------------------------------
def extract_segments_from_metadata(meta_path: str, threshold: float) -> List[Tuple[float, float]]:
    """
    Given a metadata JSON file with object detection results, return segments
    where *person* confidence < threshold. Each segment is (start_sec, end_sec).

    Expected JSON (flexible, but nominally):
    {
      "frames": [
        {
          "time": 0.033,               # seconds (float)
          "objects": [
              {"name": "person", "confidence": 0.92},
              ...
          ]
        },
        ...
      ]
    }
    """
    segments: List[Tuple[float, float]] = []

    dbg(f"Reading metadata: {meta_path}")
    try:
        with open(meta_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        err(f"Failed to read metadata {meta_path}: {e}")
        return segments

    frames = data.get("frames", [])
    if not isinstance(frames, list):
        warn(f"Metadata {meta_path} has no 'frames' list.")
        return segments

    current_segment_start: Optional[float] = None
    previous_time: Optional[float] = None

    for frame in frames:
        time_sec = frame.get("time", 0.0)
        objects = frame.get("objects", [])

        # default: assume person present @ high conf unless found lower
        person_conf = 1.0
        for obj in objects:
            if obj.get("name") == "person":
                person_conf = float(obj.get("confidence", 1.0))
                break

        if person_conf < threshold:
            if current_segment_start is None:
                current_segment_start = time_sec
        else:
            if current_segment_start is not None:
                # close segment at the *previous* time (last below-threshold frame)
                if previous_time is not None:
                    segments.append((current_segment_start, previous_time))
                current_segment_start = None

        previous_time = time_sec

    # close at end
    if current_segment_start is not None and previous_time is not None:
        segments.append((current_segment_start, previous_time))

    dbg(f"Extracted {len(segments)} segment(s) from {meta_path}.")
    for (s, e) in segments:
        dbg(f"  seg: {s:.3f} -> {e:.3f} ({e - s:.3f}s)")

    return segments


# ------------------------------------------------------------------
# ffmpeg helpers
# ------------------------------------------------------------------
def run_cmd(cmd: List[str]) -> int:
    """Run a subprocess command, echo it for debug, return returncode."""
    dbg("CMD: " + " ".join(cmd))
    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    except Exception as e:
        err(f"Failed running command: {e}")
        return 1
    if proc.stdout:
        dbg(f"STDOUT:\n{proc.stdout}")
    if proc.stderr:
        dbg(f"STDERR:\n{proc.stderr}")
    dbg(f"Return code: {proc.returncode}")
    return proc.returncode


def ffmpeg_trim_segments(input_video: str, segments: List[Tuple[float, float]], output_path: str) -> bool:
    """
    Extract given segments from input_video and concatenate them into output_path using ffmpeg.
    Returns True on (apparent) success, False otherwise.
    """
    if not segments:
        warn("No segments to process; skipping.")
        return False

    dbg(f"Preparing to cut {len(segments)} segment(s) from: {input_video}")
    temp_dir = tempfile.mkdtemp(prefix="unusual_faces_")
    part_paths: List[str] = []
    try:
        # cut each part
        for i, (start, end) in enumerate(segments):
            duration = end - start
            if duration <= 0:
                dbg(f"  seg#{i} has non-positive duration ({duration}); skipping.")
                continue
            part_file = os.path.join(temp_dir, f"part_{i:04d}.mp4")
            # note: ordering of -ss/-t/-i influences accuracy & speed; we choose accuracy
            cmd = [
                "ffmpeg",
                "-hide_banner",
                "-loglevel", "error",  # reduce noise but we print captured output if DEBUG
                "-y",
                "-i", input_video,
                "-ss", f"{start:.3f}",
                "-t", f"{duration:.3f}",
                "-c", "copy",
                part_file,
            ]
            rc = run_cmd(cmd)
            if rc != 0 or (not os.path.exists(part_file) or os.path.getsize(part_file) == 0):
                warn(f"  seg#{i} cut failed; skipping.")
                continue
            dbg(f"  seg#{i} -> {part_file}")
            part_paths.append(part_file)

        if not part_paths:
            err("All segment cuts failed; aborting concatenation.")
            return False

        # concat manifest
        manifest = os.path.join(temp_dir, "concat_list.txt")
        with open(manifest, "w", encoding="utf-8") as mf:
            for p in part_paths:
                # escape single quotes for ffmpeg concat protocol
                escaped_p = p.replace("'", "'\\''")
                mf.write(f"file '{escaped_p}'\n")
        dbg(f"Wrote concat manifest: {manifest}")

        # concat
        concat_cmd = [
            "ffmpeg",
            "-hide_banner",
            "-loglevel", "error",
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", manifest,
            "-c", "copy",
            output_path,
        ]
        rc = run_cmd(concat_cmd)
        if rc != 0:
            err("Concat failed.")
            return False

        if not os.path.exists(output_path):
            err("Concat reported success but output file missing.")
            return False

        info(f"✅ Output written: {output_path}")
        return True

    finally:
        # keep temp if DEBUG_KEEP_TEMP requested
        if os.environ.get("DEBUG_KEEP_TEMP"):
            warn(f"DEBUG_KEEP_TEMP set; temp retained: {temp_dir}")
        else:
            shutil.rmtree(temp_dir, ignore_errors=True)


# ------------------------------------------------------------------
# Directory driver
# ------------------------------------------------------------------
def process_directory(root_dir: str, output_dir: str) -> None:
    """
    For each .mp4 in root_dir (recursively), find corresponding .json metadata
    and produce an _unusual.mp4 in output_dir.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    dbg(f"Processing directory tree: {root_dir}")
    dbg(f"Output directory: {output_dir}")
    dbg(f"Threshold: {THRESHOLD}")

    processed = 0
    skipped_no_meta = 0
    skipped_no_segments = 0
    failed = 0

    for dirpath, _, filenames in os.walk(root_dir):
        for fname in filenames:
            if not fname.lower().endswith(".mp4"):
                continue

            video_path = os.path.join(dirpath, fname)
            meta_path = os.path.splitext(video_path)[0] + ".json"
            out_name = os.path.splitext(fname)[0] + "_unusual.mp4"
            out_path = os.path.join(output_dir, out_name)

            info(f"---\nVideo: {video_path}")
            if not os.path.exists(meta_path):
                warn(f"No metadata found ({meta_path}); skipping.")
                skipped_no_meta += 1
                continue

            segments = extract_segments_from_metadata(meta_path, THRESHOLD)
            if not segments:
                warn(f"No below-threshold segments; skipping output for {video_path}.")
                skipped_no_segments += 1
                continue

            ok = ffmpeg_trim_segments(video_path, segments, out_path)
            if ok:
                processed += 1
            else:
                failed += 1

    # summary
    print("\n=== Summary ===", flush=True)
    print(f"Processed videos : {processed}", flush=True)
    print(f"Skipped (no meta): {skipped_no_meta}", flush=True)
    print(f"Skipped (no segs): {skipped_no_segments}", flush=True)
    print(f"Failed           : {failed}", flush=True)


# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------
def resolve_dirs_from_args_env() -> Tuple[str, str]:
    """
    Determine root_dir & output_dir from:
      1. CLI args (highest priority)
      2. Environment vars (VIDEO_DIR, TIMELINE_DIR)
      3. Hardcoded defaults
    """
    # CLI
    if len(sys.argv) >= 3:
        root_dir = sys.argv[1]
        output_dir = sys.argv[2]
        dbg("Using CLI arguments for directories.")
        return root_dir, output_dir

    # ENV
    env_root = os.environ.get("VIDEO_DIR")
    env_out = os.environ.get("TIMELINE_DIR")
    if env_root or env_out:
        dbg("Using environment variables for directories.")
        root_dir = env_root if env_root else "Final_Videos"
        output_dir = env_out if env_out else "Timeline"
        return root_dir, output_dir

    # Defaults
    dbg("Using hardcoded defaults (no CLI args or env vars).")
    return "Final_Videos", "Timeline"


if __name__ == "__main__":
    dbg(f"sys.argv: {sys.argv}")
    root_dir, output_dir = resolve_dirs_from_args_env()
    info(f"Running Unusual_faces.py with root_dir={root_dir}  output_dir={output_dir}")
    if not os.path.isdir(root_dir):
        err(f"Input directory not found: {root_dir}")
        sys.exit(1)
    process_directory(root_dir, output_dir)
