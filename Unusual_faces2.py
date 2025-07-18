
#!/usr/bin/env python3
"""
face_timeline.py
----------------
Analyze each video in VIDEO_DIR (default: Vid/) and determine for every second
(0..N) if any frame within that second contains a face.

- Uses MediaPipe Face Detection with MIN_CONFIDENCE (default 0.5)
- Stops at MAX_ANALYZE_SECONDS (default 180)
- Outputs timeline text files in TIMELINE_DIR (default: Timeline/)

Timeline format:
    total_seconds_analyzed: <int>
    video_duration_est: <int>
    seconds_truncated_to: <int>
    ---
    0: face
    1: no_face
    2: face
    ...
"""

import os
import sys
import math
import cv2
import mediapipe as mp

# ---------------- ENV CONFIG ----------------
def _truthy(x): return str(x).strip().lower() in ("1","true","yes","on")

VIDEO_DIR       = os.environ.get("VIDEO_DIR", "Vid")
TIMELINE_DIR    = os.environ.get("TIMELINE_DIR", "Timeline")
MAX_ANALYZE_SEC = int(os.environ.get("MAX_ANALYZE_SECONDS", "180"))
MIN_CONF        = float(os.environ.get("MIN_CONFIDENCE", "0.5"))
SKIP_EXISTING   = _truthy(os.environ.get("SKIP_EXISTING", "1"))
VERBOSE         = _truthy(os.environ.get("VERBOSE", "1"))

os.makedirs(TIMELINE_DIR, exist_ok=True)

def vlog(msg):
    if VERBOSE:
        print(msg, flush=True)

def err(msg):
    print(msg, file=sys.stderr, flush=True)

# ---------------- FACE DETECTOR ----------------
mp_face = mp.solutions.face_detection

def detect_faces_bgr(image_bgr, detector):
    """Run mediapipe face detector on a single BGR frame."""
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    image_rgb.flags.writeable = False
    results = detector.process(image_rgb)
    count = 0
    if results.detections:
        for det in results.detections:
            if det.score and det.score[0] >= MIN_CONF:
                count += 1
    return count

# ---------------- PER-VIDEO ANALYSIS ----------------
def analyze_video(video_path, timeline_path):
    vlog(f"\n[video] {video_path}")

    if SKIP_EXISTING and os.path.isfile(timeline_path):
        vlog(f"[skip] timeline exists: {timeline_path}")
        return True

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        err(f"[!] cannot open video: {video_path}")
        return False

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 30.0
        vlog(f"[warn] invalid FPS -> fallback to {fps}")

    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    duration_sec_est = None
    if frame_count and frame_count > 0:
        duration_sec_est = frame_count / fps

    # Determine max seconds to analyze
    if duration_sec_est is not None:
        max_seconds = min(duration_sec_est, MAX_ANALYZE_SEC)
    else:
        max_seconds = MAX_ANALYZE_SEC

    max_seconds_int = int(math.floor(max_seconds))
    vlog(f"  fps={fps:.3f} frames={frame_count} dur_est={duration_sec_est} analyze<= {max_seconds_int}s")

    sec_results = {}  # second_index -> bool face
    for s in range(0, max_seconds_int + 1):
        sec_results[s] = False  # initialize all as no_face

    with mp_face.FaceDetection(model_selection=0, min_detection_confidence=MIN_CONF) as detector:
        while True:
            ok, frame = cap.read()
            if not ok:
                break

            pos_msec = cap.get(cv2.CAP_PROP_POS_MSEC)
            if pos_msec is None:
                pos_frames = cap.get(cv2.CAP_PROP_POS_FRAMES)
                pos_msec = (pos_frames / fps) * 1000.0

            cur_sec = int(pos_msec / 1000.0)

            # Stop if beyond analysis limit
            if cur_sec > max_seconds_int:
                break

            # Detect faces in every frame
            n_faces = detect_faces_bgr(frame, detector)
            if n_faces > 0:
                sec_results[cur_sec] = True

        cap.release()

    # Write timeline file
    try:
        with open(timeline_path, "w", encoding="utf-8") as f:
            f.write(f"total_seconds_analyzed: {len(sec_results)}\n")
            if duration_sec_est is not None:
                f.write(f"video_duration_est: {int(duration_sec_est)}\n")
            f.write(f"seconds_truncated_to: {max_seconds_int}\n")
            f.write("---\n")
            for s in range(0, max_seconds_int + 1):
                f.write(f"{s}: {'face' if sec_results[s] else 'no_face'}\n")
        vlog(f"[write] {timeline_path}")
        return True
    except Exception as e:
        err(f"[write] fail {timeline_path}: {e}")
        return False

# ---------------- SCAN VIDEO DIR ----------------
def main():
    print("=== face_timeline.py ===")
    print(f"VIDEO_DIR       = {VIDEO_DIR}")
    print(f"TIMELINE_DIR    = {TIMELINE_DIR}")
    print(f"MAX_ANALYZE_SEC = {MAX_ANALYZE_SEC}")
    print(f"MIN_CONF        = {MIN_CONF}")
    print(f"SKIP_EXISTING   = {SKIP_EXISTING}")
    print(f"VERBOSE         = {VERBOSE}")

    if not os.path.isdir(VIDEO_DIR):
        err(f"❌ VIDEO_DIR not found: {VIDEO_DIR}")
        sys.exit(1)

    videos = [fn for fn in os.listdir(VIDEO_DIR)
              if fn.lower().endswith((".mp4", ".mov", ".m4v", ".mkv", ".webm"))]

    if not videos:
        err("[!] No video files found.")
        return

    ok_total = fail_total = 0
    for vid in sorted(videos):
        in_path = os.path.join(VIDEO_DIR, vid)
        base, _ = os.path.splitext(vid)
        out_path = os.path.join(TIMELINE_DIR, base + ".txt")
        if analyze_video(in_path, out_path):
            ok_total += 1
        else:
            fail_total += 1

    print("\n=== Summary ===")
    print(f"Timelines OK : {ok_total}")
    print(f"Failed       : {fail_total}")

if __name__ == "__main__":
    main()
