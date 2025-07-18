
#!/usr/bin/env python3
import os
import sys
import cv2
import math
import subprocess
import mediapipe as mp

# ------------ CONFIG ------------
VIDEO_DIR = os.environ.get("VIDEO_DIR", "Final_Videos")
OUTPUT_DIR = os.environ.get("OUTPUT_DIR", "Final_Videos_Clean")
MAX_ANALYZE_SEC = int(os.environ.get("MAX_ANALYZE_SECONDS", "180"))
MIN_CONF = float(os.environ.get("MIN_CONFIDENCE", "0.5"))
VERBOSE = True

os.makedirs(OUTPUT_DIR, exist_ok=True)

mp_face = mp.solutions.face_detection

def vlog(msg):
    if VERBOSE:
        print(msg, flush=True)

# Detect faces in a frame
def detect_faces(frame, detector):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    rgb.flags.writeable = False
    results = detector.process(rgb)
    if results.detections:
        for det in results.detections:
            if det.score[0] >= MIN_CONF:
                return True
    return False

def analyze_and_cut(video_path, out_video_path, txt_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"[!] Cannot open {video_path}")
        return False

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    max_sec = min(duration, MAX_ANALYZE_SEC)
    max_sec_int = int(math.floor(max_sec))

    vlog(f"Analyzing {video_path} (fps={fps}, dur={duration:.2f}s)")

    timeline = []
    with mp_face.FaceDetection(model_selection=0, min_detection_confidence=MIN_CONF) as detector:
        current_sec = -1
        has_face = False
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            pos_msec = cap.get(cv2.CAP_PROP_POS_MSEC)
            sec = int(pos_msec / 1000.0)
            if sec > max_sec_int:
                break
            if sec != current_sec:
                current_sec = sec
                has_face = detect_faces(frame, detector)
                timeline.append((sec, has_face))
    cap.release()

    # Merge no-face segments
    no_face_ranges = []
    start = None
    for s, face in timeline:
        if not face:
            if start is None:
                start = s
        else:
            if start is not None:
                no_face_ranges.append((start, s))
                start = None
    if start is not None:
        no_face_ranges.append((start, max_sec_int))

    if not no_face_ranges:
        vlog("No clean segments. Skipping.")
        return False

    # Create FFmpeg concat file
    concat_file = out_video_path + ".txt"
    with open(concat_file, "w") as f:
        for start, end in no_face_ranges:
            f.write(f"file '{video_path}'\n")
            f.write(f"inpoint {start}\n")
            f.write(f"outpoint {end}\n")

    # Calculate stats
    kept_duration = sum(end - start for start, end in no_face_ranges)
    removed = max_sec_int - kept_duration

    # Write stats file
    with open(txt_path, "w") as f:
        f.write(f"Original Duration: {int(duration)} sec\n")
        f.write(f"Analyzed (max): {max_sec_int} sec\n")
        f.write(f"Kept: {kept_duration} sec\n")
        f.write(f"Removed (faces): {removed} sec\n")
        f.write("---\n")
        for start, end in no_face_ranges:
            f.write(f"{start}-{end} sec\n")

    # Run FFmpeg to create final video
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error",
        "-y", "-f", "concat", "-safe", "0", "-i", concat_file,
        "-c", "copy", out_video_path
    ]
    vlog(f"Running FFmpeg: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)
    vlog(f"Saved clean video: {out_video_path}")
    return True

def main():
    if not os.path.isdir(VIDEO_DIR):
        print(f"❌ VIDEO_DIR not found: {VIDEO_DIR}")
        sys.exit(1)
    videos = [f for f in os.listdir(VIDEO_DIR) if f.lower().endswith((".mp4", ".mov", ".mkv"))]
    if not videos:
        print("No videos found.")
        return
    for vid in videos:
        input_path = os.path.join(VIDEO_DIR, vid)
        base = os.path.splitext(vid)[0]
        out_video = os.path.join(OUTPUT_DIR, base + "_clean.mp4")
        out_txt = os.path.join(OUTPUT_DIR, base + "_report.txt")
        analyze_and_cut(input_path, out_video, out_txt)

if __name__ == "__main__":
    main()
