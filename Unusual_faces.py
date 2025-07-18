
#!/usr/bin/env python3
"""
face_cut_ffmpeg_eachframe.py

Scan every frame in each video under VIDEO_DIR (default: Final_Videos/),
detect faces using MediaPipe Face Detection, build precise time segments
(start_sec -> end_sec) for all moments when *at least one* face is present,
optionally merge short gaps, and cut those segments out to a new video using ffmpeg
(stream copy: no re-encode).

Env vars (all optional):
  VIDEO_DIR         = directory of input videos (default: Final_Videos)
  OUTPUT_DIR        = where to write cut clips       (default: Face_Clips)
  MIN_CONFIDENCE    = 0.5  (MediaPipe detection conf threshold)
  MAX_ANALYZE_SECONDS = 180 (cap analysis to first N seconds; use large value to ignore)
  MERGE_GAP_SEC     = 0.25 (merge segments separated by <= this gap)
  VERBOSE           = 1    (print logs)
"""

import os
import sys
import math
import tempfile
import subprocess

import cv2
import mediapipe as mp


# ---------------- ENV ----------------
def _truthy(x):
    return str(x).strip().lower() in ("1", "true", "yes", "on")


VIDEO_DIR          = os.environ.get("VIDEO_DIR", "Final_Videos")
OUTPUT_DIR         = os.environ.get("OUTPUT_DIR", "Face_Clips")
MIN_CONF           = float(os.environ.get("MIN_CONFIDENCE", "0.5"))
MAX_ANALYZE_SEC    = float(os.environ.get("MAX_ANALYZE_SECONDS", "180"))
MERGE_GAP_SEC      = float(os.environ.get("MERGE_GAP_SEC", "0.25"))
VERBOSE            = _truthy(os.environ.get("VERBOSE", "1"))

os.makedirs(OUTPUT_DIR, exist_ok=True)

mp_face = mp.solutions.face_detection


def vlog(msg):
    if VERBOSE:
        print(msg, flush=True)


def err(msg):
    print(msg, file=sys.stderr, flush=True)


# ---------------- FACE DETECTION ----------------
def detect_face(frame_bgr, detector):
    """Return True if ≥1 face meeting MIN_CONF in frame."""
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    rgb.flags.writeable = False
    result = detector.process(rgb)
    if result.detections:
        for d in result.detections:
            if d.score and d.score[0] >= MIN_CONF:
                return True
    return False


# ---------------- SEGMENT BUILDING ----------------
def get_face_segments_every_frame(video_path):
    """
    Scan EVERY frame. Return list of (start_sec, end_sec) floats where faces detected.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        err(f"[!] cannot open {video_path}")
        return []

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 30.0
        vlog(f"[warn] invalid FPS -> fallback {fps}")

    total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    duration_est = total_frames / fps if total_frames and total_frames > 0 else None

    # analysis cap
    analyze_until = MAX_ANALYZE_SEC
    if duration_est is not None:
        analyze_until = min(duration_est, MAX_ANALYZE_SEC)

    vlog(f"  fps={fps:.3f} frames={total_frames} dur_est={duration_est} analyze<= {analyze_until:.3f}s")

    segments = []
    in_segment = False
    seg_start = None

    with mp_face.FaceDetection(model_selection=0, min_detection_confidence=MIN_CONF) as detector:
        while True:
            ok, frame = cap.read()
            if not ok:
                break

            # current timestamp from frame index (faster/more reliable than POS_MSEC in some codecs)
            frame_idx = cap.get(cv2.CAP_PROP_POS_FRAMES) - 1  # because pos points to next frame
            t = frame_idx / fps

            if t > analyze_until:
                break

            has_face = detect_face(frame, detector)

            if has_face and not in_segment:
                in_segment = True
                seg_start = t

            elif not has_face and in_segment:
                in_segment = False
                seg_end = t  # end at current t where no face; we stop right before
                segments.append((seg_start, seg_end))

        # close final open segment
        if in_segment:
            # if we know duration, clip; else clip at analyze_until
            seg_end = analyze_until
            segments.append((seg_start, seg_end))

    cap.release()
    return merge_segments(segments, MERGE_GAP_SEC)


def merge_segments(segments, gap):
    """Merge segments whose gap <= gap seconds."""
    if not segments:
        return []
    segments = sorted(segments, key=lambda x: x[0])
    merged = [list(segments[0])]
    for s, e in segments[1:]:
        last = merged[-1]
        if s - last[1] <= gap:
            # extend
            if e > last[1]:
                last[1] = e
        else:
            merged.append([s, e])
    return [(float(a), float(b)) for a, b in merged if b > a]


# ---------------- FFMPEG CUT ----------------
def ffmpeg_cut_concat(video_path, segments, out_path):
    """
    For each (start, end) segment, cut via -ss/-to -c copy to temp parts, then concat.
    """
    if not segments:
        err("[ffmpeg] no segments; skipping cut.")
        return False

    # build temp segment files
    tmp_list = []
    tmp_manifest = tempfile.NamedTemporaryFile(delete=False, suffix=".txt")
    tmp_manifest_path = tmp_manifest.name
    tmp_manifest.close()

    try:
        for i, (s, e) in enumerate(segments):
            part_path = f"{tmp_manifest_path}_part{i}.mp4"
            # Use precise start & duration (end - start) to avoid keyframe drift; -accurate_seek with -ss before -i seeks fast (keyframe), so we use -ss after -i for accuracy
            cmd = [
                "ffmpeg", "-y",
                "-i", video_path,
                "-ss", f"{s:.3f}",
                "-to", f"{e:.3f}",
                "-c", "copy",
                part_path,
            ]
            vlog(f"[ffmpeg] cut {i}: {s:.3f}-{e:.3f}")
            r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if r.returncode != 0:
                err(f"[ffmpeg] cut failed seg#{i}: {r.stderr.decode(errors='ignore')[:500]}")
                continue
            tmp_list.append(part_path)

        if not tmp_list:
            err("[ffmpeg] no successful parts; abort concat.")
            return False

        with open(tmp_manifest_path, "w") as mf:
            for p in tmp_list:
                mf.write(f"file '{p}'\n")

        cmd_concat = [
            "ffmpeg", "-y",
            "-f", "concat", "-safe", "0",
            "-i", tmp_manifest_path,
            "-c", "copy",
            out_path,
        ]
        vlog(f"[ffmpeg] concat -> {out_path}")
        r = subprocess.run(cmd_concat, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if r.returncode != 0:
            err(f"[ffmpeg] concat failed: {r.stderr.decode(errors='ignore')[:500]}")
            return False

        return True

    finally:
        # cleanup
        try:
            os.remove(tmp_manifest_path)
        except OSError:
            pass
        for p in tmp_list:
            try:
                os.remove(p)
            except OSError:
                pass


# ---------------- MAIN ----------------
def main():
    print("=== face_cut_ffmpeg_eachframe.py ===")
    print(f"VIDEO_DIR       = {VIDEO_DIR}")
    print(f"OUTPUT_DIR      = {OUTPUT_DIR}")
    print(f"MIN_CONF        = {MIN_CONF}")
    print(f"MAX_ANALYZE_SEC = {MAX_ANALYZE_SEC}")
    print(f"MERGE_GAP_SEC   = {MERGE_GAP_SEC}")
    print(f"VERBOSE         = {VERBOSE}")

    if not os.path.isdir(VIDEO_DIR):
        err(f"❌ VIDEO_DIR not found: {VIDEO_DIR}")
        sys.exit(1)

    videos = [
        fn for fn in os.listdir(VIDEO_DIR)
        if fn.lower().endswith((".mp4", ".mov", ".m4v", ".mkv", ".webm"))
    ]
    if not videos:
        err("[!] No video files found.")
        return

    for vid in sorted(videos):
        in_path = os.path.join(VIDEO_DIR, vid)
        base, _ = os.path.splitext(vid)
        out_path = os.path.join(OUTPUT_DIR, base + "_faces.mp4")

        print(f"\n--- {vid} ---")
        segments = get_face_segments_every_frame(in_path)
        if not segments:
            print("No faces detected; skipping cut.")
            continue

        print(f"Segments ({len(segments)}): {[(round(a,2), round(b,2)) for a,b in segments]}")
        ok = ffmpeg_cut_concat(in_path, segments, out_path)
        if ok:
            print(f"✅ Saved: {out_path}")
        else:
            print(f"❌ Failed: {out_path}")


if __name__ == "__main__":
    main()
