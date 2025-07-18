
#!/usr/bin/env python3
"""
face_timeline.py
----------------
Scan each *.mp4 in VIDEO_DIR (default: Final_Videos/), detect faces per second (0..N),
cap at MAX_ANALYZE_SECONDS (default 180), and save output videos with no-face frames
into Timeline/ folder.

MediaPipe Face Detection is used with configurable confidence (MIN_CONFIDENCE).

If SKIP_EXISTING=1 and output video already exists, that video is skipped.
"""

import os
import sys
import math
import cv2
import mediapipe as mp

# ---------------- ENV ----------------
def _truthy(x): 
    return str(x).strip().lower() in ("1", "true", "yes", "on")

VIDEO_DIR       = os.environ.get("VIDEO_DIR", "Final_Videos")
OUTPUT_DIR      = "Timeline"       # Save output videos here
MAX_ANALYZE_SEC = int(os.environ.get("MAX_ANALYZE_SECONDS", "180"))
MIN_CONF        = float(os.environ.get("MIN_CONFIDENCE", "0.5"))
SKIP_EXISTING   = _truthy(os.environ.get("SKIP_EXISTING", "1"))
VERBOSE         = _truthy(os.environ.get("VERBOSE", "1"))

os.makedirs(OUTPUT_DIR, exist_ok=True)

def vlog(msg):
    if VERBOSE:
        print(msg, flush=True)

def err(msg):
    print(msg, file=sys.stderr, flush=True)

# ---------------- FACE DETECTOR ----------------
mp_face = mp.solutions.face_detection

def detect_faces_bgr(image_bgr, detector):
    """
    Run mediapipe face detector on a single BGR frame.
    Returns number of detections meeting MIN_CONF.
    """
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
def analyze_video(video_path):
    base = os.path.splitext(os.path.basename(video_path))[0]
    output_path = os.path.join(OUTPUT_DIR, base + "_noface.mp4")

    vlog(f"\n[video] {video_path}")

    if SKIP_EXISTING and os.path.isfile(output_path):
        vlog(f"[skip] output video exists: {output_path}")
        return True

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        err(f"[!] cannot open video: {video_path}")
        return False

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 30.0
        vlog(f"[warn] invalid FPS -> fallback to {fps}")

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    duration_sec_est = frame_count / fps if frame_count else None

    if duration_sec_est is not None:
        max_seconds = min(duration_sec_est, MAX_ANALYZE_SEC)
    else:
        max_seconds = MAX_ANALYZE_SEC

    max_seconds_int = int(math.floor(max_seconds))
    vlog(f"  fps={fps:.3f} frames={frame_count} dur_est={duration_sec_est} analyze<= {max_seconds_int}s")

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

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
            if cur_sec > max_seconds_int:
                break

            n_faces = detect_faces_bgr(frame, detector)
            # Keep frame only if no faces detected
            if n_faces == 0:
                out.write(frame)

    cap.release()
    out.release()
    vlog(f"[output] saved no-face video: {output_path}")
    return True

# ---------------- SCAN VIDEO DIR ----------------
def main():
    print("=== face_timeline.py ===")
    print(f"VIDEO_DIR       = {VIDEO_DIR}")
    print(f"OUTPUT_DIR      = {OUTPUT_DIR}")
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
        if analyze_video(in_path):
            ok_total += 1
        else:
            fail_total += 1

    print("\n=== Summary ===")
    print(f"Videos processed: {ok_total}")
    print(f"Failed         : {fail_total}")

if __name__ == "__main__":
    main()
