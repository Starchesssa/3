
#!/usr/bin/env python3
"""
face_timeline.py
----------------
Purpose:
    For every video file in VIDEO_DIR (default: Final_Videos), detect faces using
    MediaPipe *for every frame (optionally with a stride)* and build a per-second
    timeline. A whole second is marked as "face" if **any frame** in that second
    has at least one detected face with confidence >= MIN_CONFIDENCE. Otherwise
    the second is "no_face".

    The result is written to TIMELINE_DIR as <video_basename>.txt with format:

        total_seconds_analyzed: <int>
        video_duration_est: <int>             # (if known)
        seconds_truncated_to: <int>
        ---
        0: face
        1: no_face
        2: face
        ...

Key Features / Differences from your original:
    * Aggregates across ALL frames within each second, not just the first frame.
    * If ANY frame in that second has a face => that second = 'face'.
    * Saves timeline text file; skips video if timeline already exists (unless SKIP_EXISTING=0).
    * Allows FRAME_STRIDE to speed up detection (e.g., analyze every 2nd or 3rd frame).
    * Clean error handling and verbose logging controlled by VERBOSE flag.

Environment Variables (all optional):
    VIDEO_DIR            (default: Final_Videos)
    TIMELINE_DIR         (default: Timeline)
    MAX_ANALYZE_SECONDS  (default: 180)   # 0 => no cap (analyze full video)
    MIN_CONFIDENCE       (default: 0.5)   # threshold for a face detection
    FRAME_STRIDE         (default: 1)     # analyze every Nth frame (1 = every frame)
    SKIP_EXISTING        (default: 1)     # 1 => do not re-create existing timeline
    VERBOSE              (default: 1)     # 1 => print progress
    MODEL_SELECTION      (default: 0)     # mediapipe face model (0=short-range,1=full-range)

Return Codes:
    0 on success (even if some videos failed; see per-video summary)
    Non-zero exit if VIDEO_DIR is missing.

Dependencies:
    pip install mediapipe opencv-python
    (ffmpeg not required for this script)

"""

import os
import sys
import math
import cv2
import mediapipe as mp

# ---------------- ENV ----------------
def _truthy(x):
    return str(x).strip().lower() in ("1", "true", "yes", "on")

VIDEO_DIR         = os.environ.get("VIDEO_DIR", "Final_Videos")
TIMELINE_DIR      = os.environ.get("TIMELINE_DIR", "Timeline")
MAX_ANALYZE_SEC   = int(os.environ.get("MAX_ANALYZE_SECONDS", "180"))
MIN_CONF          = float(os.environ.get("MIN_CONFIDENCE", "0.5"))
FRAME_STRIDE      = int(os.environ.get("FRAME_STRIDE", "1"))
SKIP_EXISTING     = _truthy(os.environ.get("SKIP_EXISTING", "1"))
VERBOSE           = _truthy(os.environ.get("VERBOSE", "1"))
MODEL_SELECTION   = int(os.environ.get("MODEL_SELECTION", "0"))

os.makedirs(TIMELINE_DIR, exist_ok=True)

def vlog(msg: str):
    if VERBOSE:
        print(msg, flush=True)

def err(msg: str):
    print(msg, file=sys.stderr, flush=True)

# ---------------- FACE DETECTOR ----------------
mp_face = mp.solutions.face_detection

def detect_faces_bgr(image_bgr, detector):
    """
    Run MediaPipe face detector on a single BGR frame.
    Returns number of detections meeting MIN_CONF.
    """
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    image_rgb.flags.writeable = False
    results = detector.process(image_rgb)
    count = 0
    if results.detections:
        for det in results.detections:
            if det.score and det.score[0] is not None and det.score[0] >= MIN_CONF:
                count += 1
    return count

# ---------------- PER-VIDEO ANALYSIS ----------------
def analyze_video(video_path: str, timeline_path: str) -> bool:
    """
    Analyze a single video, produce a per-second timeline file.
    A second is 'face' if ANY frame within that second has a face.
    """
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
        vlog(f"[warn] invalid FPS -> fallback to {fps:.3f}")

    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    duration_sec_est = frame_count / fps if frame_count else None

    if duration_sec_est is not None:
        if MAX_ANALYZE_SEC > 0:
            max_seconds = min(duration_sec_est, MAX_ANALYZE_SEC)
        else:
            max_seconds = duration_sec_est
    else:
        # Unknown duration; rely only on MAX_ANALYZE_SEC if set
        max_seconds = MAX_ANALYZE_SEC if MAX_ANALYZE_SEC > 0 else 0

    # If max_seconds is 0 (meaning both unknown duration and MAX_ANALYZE_SEC=0), treat as unlimited
    unlimited = (max_seconds == 0)
    max_seconds_int = int(math.floor(max_seconds)) if not unlimited else float('inf')

    vlog(f"  fps={fps:.3f} frames={frame_count} dur_est={duration_sec_est} analyze<= {'ALL' if unlimited else max_seconds_int}")

    sec_results = {}
    current_sec_index = -1
    has_face_in_current_sec = False
    grabbed_any = False

    with mp_face.FaceDetection(model_selection=MODEL_SELECTION,
                               min_detection_confidence=MIN_CONF) as detector:
        frame_index = 0
        while True:
            ok, frame = cap.read()
            if not ok:
                # Save last second result if any
                if current_sec_index != -1:
                    sec_results[current_sec_index] = has_face_in_current_sec
                break

            grabbed_any = True

            # Time from frame index (more reliable than CAP_PROP_POS_MSEC for some codecs)
            t_sec = frame_index / fps
            cur_sec = int(t_sec)

            if not unlimited and cur_sec > max_seconds_int:
                # Save the last second before breaking
                if current_sec_index != -1:
                    sec_results[current_sec_index] = has_face_in_current_sec
                break

            if cur_sec != current_sec_index:
                # New second encountered: store previous second result
                if current_sec_index != -1:
                    sec_results[current_sec_index] = has_face_in_current_sec
                current_sec_index = cur_sec
                has_face_in_current_sec = False  # reset for new second

            # Frame stride: skip detection if not the selected frame
            if FRAME_STRIDE <= 1 or (frame_index % FRAME_STRIDE == 0):
                n_faces = detect_faces_bgr(frame, detector)
                if n_faces > 0:
                    has_face_in_current_sec = True
                    # Optimization: if we *already* know this second has a face and we don't
                    # need partial counts, we could skip the rest of the frames in that second.
                    # (Optional optimization; not implemented to keep code simple.)

            frame_index += 1

    cap.release()

    if not grabbed_any:
        err(f"[!] no frames read: {video_path}")
        return False

    # Determine final range to write
    if unlimited:
        if sec_results:
            max_sec_written = max(sec_results.keys())
        else:
            max_sec_written = -1
    else:
        max_sec_written = int(math.floor(max_seconds))

    # Fill missing seconds (if any) with no_face (False)
    timeline = []
    for s in range(0, max_sec_written + 1):
        has_face = sec_results.get(s, False)
        timeline.append((s, has_face))

    try:
        with open(timeline_path, "w", encoding="utf-8") as f:
            f.write(f"total_seconds_analyzed: {len(timeline)}\n")
            if duration_sec_est is not None:
                f.write(f"video_duration_est: {int(duration_sec_est)}\n")
            if unlimited:
                # If unlimited & unknown, reflect what we actually processed
                f.write(f"seconds_truncated_to: {max_sec_written if max_sec_written >= 0 else 0}\n")
            else:
                f.write(f"seconds_truncated_to: {max_sec_written}\n")
            f.write("---\n")
            for s, has_face in timeline:
                f.write(f"{s}: {'face' if has_face else 'no_face'}\n")
        vlog(f"[write] {timeline_path}")
        return True
    except Exception as e:
        err(f"[write] fail {timeline_path}: {e}")
        return False

# ---------------- SCAN VIDEO DIR ----------------
def main():
    print("=== face_timeline.py ===")
    print(f"VIDEO_DIR          = {VIDEO_DIR}")
    print(f"TIMELINE_DIR       = {TIMELINE_DIR}")
    print(f"MAX_ANALYZE_SEC    = {MAX_ANALYZE_SEC}")
    print(f"MIN_CONF           = {MIN_CONF}")
    print(f"FRAME_STRIDE       = {FRAME_STRIDE}")
    print(f"MODEL_SELECTION    = {MODEL_SELECTION}")
    print(f"SKIP_EXISTING      = {SKIP_EXISTING}")
    print(f"VERBOSE            = {VERBOSE}")

    if not os.path.isdir(VIDEO_DIR):
        err(f"❌ VIDEO_DIR not found: {VIDEO_DIR}")
        sys.exit(1)

    videos = [fn for fn in os.listdir(VIDEO_DIR)
              if fn.lower().endswith((".mp4", ".mov", ".m4v", ".mkv", ".webm"))]

    if not videos:
        err("[!] No video files found.")
        return

    ok_total = 0
    fail_total = 0

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
