
#!/usr/bin/env python3
import os
import sys
import cv2
import math
import uuid
import tempfile
import subprocess
import mediapipe as mp

# ------------ CONFIG ------------
VIDEO_DIR = os.environ.get("VIDEO_DIR", "Final_Videos")
OUTPUT_DIR = os.environ.get("OUTPUT_DIR", "Final_Videos_Clean")
MAX_ANALYZE_SEC = int(os.environ.get("MAX_ANALYZE_SECONDS", "180"))  # cap analysis (set big number to ignore)
MIN_CONF = float(os.environ.get("MIN_CONFIDENCE", "0.5"))
VERBOSE = True  # simple always-on logging; could also read an env

os.makedirs(OUTPUT_DIR, exist_ok=True)

mp_face = mp.solutions.face_detection


# ------------ LOG HELPERS ------------
def vlog(msg: str) -> None:
    if VERBOSE:
        print(msg, flush=True)


def warn(msg: str) -> None:
    print(f"[WARN] {msg}", flush=True)


def err(msg: str) -> None:
    print(f"[ERROR] {msg}", file=sys.stderr, flush=True)


# ------------ FACE DETECTION ------------
def detect_faces(frame_bgr, detector) -> bool:
    """Return True if ≥1 face at or above MIN_CONF."""
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    rgb.flags.writeable = False
    results = detector.process(rgb)
    if results.detections:
        for det in results.detections:
            if det.score and det.score[0] >= MIN_CONF:
                return True
    return False


# ------------ ANALYZE VIDEO (1 sample per second) ------------
def build_face_timeline(video_path: str):
    """
    Sample the *first frame encountered in each whole second* (0,1,2,...)
    until MAX_ANALYZE_SEC or end of video. Returns:

        timeline: list of (sec_int, has_face_bool)
        fps: float
        duration_est: float (seconds, best guess)
        analyze_limit_int: int seconds actually analyzed
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        err(f"Cannot open {video_path}")
        return [], 0.0, 0.0, 0

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 30.0
        warn(f"Invalid FPS -> fallback {fps}")

    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    duration_est = frame_count / fps if frame_count and frame_count > 0 else None

    # limit analysis
    if duration_est is not None:
        analyze_limit = min(duration_est, MAX_ANALYZE_SEC)
    else:
        analyze_limit = float(MAX_ANALYZE_SEC)
    analyze_limit_int = int(math.floor(analyze_limit))

    vlog(f"  fps={fps:.3f} frames={frame_count} est_dur={duration_est} analyze≤{analyze_limit_int}s")

    timeline = []
    current_sec = -1

    with mp_face.FaceDetection(model_selection=0, min_detection_confidence=MIN_CONF) as detector:
        while True:
            ok, frame = cap.read()
            if not ok:
                break

            # Use position in ms; fallback frame math if needed
            pos_msec = cap.get(cv2.CAP_PROP_POS_MSEC)
            if not pos_msec or pos_msec < 0:
                pos_frames = cap.get(cv2.CAP_PROP_POS_FRAMES)  # 1-based after read
                pos_msec = ((pos_frames - 1) / fps) * 1000.0

            sec = int(pos_msec / 1000.0)

            if sec > analyze_limit_int:
                break

            if sec != current_sec:
                current_sec = sec
                has_face = detect_faces(frame, detector)
                timeline.append((sec, has_face))

    cap.release()
    return timeline, fps, (duration_est if duration_est is not None else analyze_limit), analyze_limit_int


# ------------ TIMELINE → NO-FACE RANGES ------------
def extract_no_face_ranges(timeline, analyze_limit_int):
    """
    timeline = list of (sec_int, has_face_bool)
    Return merged [(start_sec, end_sec)] *half-open* ranges (end exclusive).
    """
    ranges = []
    start = None

    # walk timeline in order
    for s, has_face in timeline:
        if not has_face:
            if start is None:
                start = s
        else:
            if start is not None:
                ranges.append((start, s))  # end at current second where face found
                start = None

    if start is not None:
        ranges.append((start, analyze_limit_int))

    # Filter out zero or negative length
    ranges = [(a, b) for (a, b) in ranges if b > a]
    return ranges


# ------------ CUT RANGES USING TEMP FILES ------------
def ffmpeg_trim_segments(input_path, ranges, output_path):
    """
    Trim each no-face range to a separate temp MP4 (stream copy),
    then concat them into output_path. More robust than inpoint/outpoint.
    """
    if not ranges:
        warn("No ranges to keep; skipping ffmpeg.")
        return False

    temp_dir = tempfile.mkdtemp(prefix="noface_")
    part_paths = []

    # create each part
    for idx, (start, end) in enumerate(ranges):
        part = os.path.join(temp_dir, f"part_{idx:04d}.mp4")
        # Use accurate seek: put -ss *before* -i for speed but may clip; to be safe use after -i
        # We'll use after -i for accuracy because segments may start mid-GOP.
        cmd = [
            "ffmpeg", "-hide_banner", "-loglevel", "error",
            "-y",
            "-i", input_path,
            "-ss", f"{start:.3f}",
            "-to", f"{end:.3f}",
            "-c", "copy",
            part,
        ]
        vlog(f"  ffmpeg cut seg#{idx} {start:.3f}-{end:.3f}")
        r = subprocess.run(cmd)
        if r.returncode != 0 or (not os.path.exists(part)):
            warn(f"    seg#{idx} cut failed; skipping.")
            continue
        part_paths.append(part)

    if not part_paths:
        err("All segment cuts failed; abort concatenation.")
        return False

    # build concat manifest
    manifest = os.path.join(temp_dir, "concat_list.txt")
    with open(manifest, "w", encoding="utf-8") as mf:
        for p in part_paths:
            # escape single quotes for ffmpeg concat
            mf.write(f"file '{p.replace(\"'\", \"'\\\\''\")}'\n")

    cmd_concat = [
        "ffmpeg", "-hide_banner", "-loglevel", "error",
        "-y",
        "-f", "concat", "-safe", "0",
        "-i", manifest,
        "-c", "copy",
        output_path,
    ]
    vlog(f"  ffmpeg concat -> {output_path}")
    r = subprocess.run(cmd_concat)
    if r.returncode != 0:
        err("Concat failed.")
        return False

    return True


# ------------ REPORT WRITER ------------
def write_report(report_path, duration_full, analyze_limit_int, kept_ranges):
    kept_duration = sum(end - start for start, end in kept_ranges)
    removed = analyze_limit_int - kept_duration
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(f"Original Duration (est): {int(duration_full)} sec\n")
        f.write(f"Analyzed Up To: {analyze_limit_int} sec\n")
        f.write(f"Kept (no-face): {kept_duration} sec\n")
        f.write(f"Removed (face): {removed} sec\n")
        f.write("--- ranges kept ---\n")
        for s, e in kept_ranges:
            f.write(f"{s}-{e} sec\n")


# ------------ PER-VIDEO DRIVER ------------
def process_video(video_path):
    base = os.path.splitext(os.path.basename(video_path))[0]
    out_video = os.path.join(OUTPUT_DIR, base + "_clean.mp4")
    out_report = os.path.join(OUTPUT_DIR, base + "_report.txt")

    vlog(f"\n=== Processing {video_path} ===")
    timeline, fps, duration_est, analyze_limit_int = build_face_timeline(video_path)

    if not timeline:
        err("No timeline (video open or read error). Skipping.")
        return False

    ranges = extract_no_face_ranges(timeline, analyze_limit_int)
    if not ranges:
        warn("All analyzed seconds contain faces; nothing to keep.")
        write_report(out_report, duration_est, analyze_limit_int, [])
        return False

    ok = ffmpeg_trim_segments(video_path, ranges, out_video)
    write_report(out_report, duration_est, analyze_limit_int, ranges)

    if ok:
        vlog(f"✅ Saved cleaned video: {out_video}")
    else:
        err(f"❌ Failed to produce cleaned video for {video_path}")
    return ok


# ------------ MAIN ------------
def main():
    if not os.path.isdir(VIDEO_DIR):
        err(f"VIDEO_DIR not found: {VIDEO_DIR}")
        sys.exit(1)

    videos = [
        f for f in os.listdir(VIDEO_DIR)
        if f.lower().endswith((".mp4", ".mov", ".mkv", ".m4v", ".webm"))
    ]
    if not videos:
        err("No videos found.")
        return

    ok_total = fail_total = 0
    for vid in sorted(videos):
        in_path = os.path.join(VIDEO_DIR, vid)
        if process_video(in_path):
            ok_total += 1
        else:
            fail_total += 1

    print("\n=== Summary ===")
    print(f"OK    : {ok_total}")
    print(f"Failed: {fail_total}")


if __name__ == "__main__":
    main()
