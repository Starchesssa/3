
#!/usr/bin/env python3
"""
Unusual_faces.py
Recursively scan a directory for .mp4 files, extract segments where the "person" confidence is below a threshold,
and concatenate those segments into a single output video using ffmpeg.
"""

import os
import sys
import subprocess
from pathlib import Path
import json
import tempfile
import shutil
from typing import List, Tuple

# threshold for detection confidence
THRESHOLD = 0.5

def extract_segments_from_metadata(meta_path: str, threshold: float) -> List[Tuple[float, float]]:
    """
    Given a metadata JSON file with object detection results, return segments where person confidence < threshold.
    Each segment is represented as (start_time, end_time) in seconds.
    """
    segments = []
    try:
        with open(meta_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Failed to read metadata {meta_path}: {e}")
        return segments

    # Assuming structure: data["frames"] = list of frames with "time" and "objects"
    current_segment_start = None
    previous_time = None

    for frame in data.get("frames", []):
        time_sec = frame.get("time", 0)
        objects = frame.get("objects", [])
        # find person object confidence
        person_conf = 1.0
        for obj in objects:
            if obj.get("name") == "person":
                person_conf = obj.get("confidence", 1.0)
                break
        if person_conf < threshold:
            if current_segment_start is None:
                current_segment_start = time_sec
        else:
            if current_segment_start is not None:
                # close segment
                if previous_time is not None:
                    segments.append((current_segment_start, previous_time))
                current_segment_start = None
        previous_time = time_sec

    if current_segment_start is not None and previous_time is not None:
        segments.append((current_segment_start, previous_time))

    return segments


def ffmpeg_trim_segments(input_video: str, segments: List[Tuple[float, float]], output_path: str):
    """
    Extract given segments from input_video and concatenate them into output_path using ffmpeg.
    """
    if not segments:
        print("No segments to process.")
        return

    temp_dir = tempfile.mkdtemp(prefix="unusual_faces_")
    part_paths = []
    try:
        for i, (start, end) in enumerate(segments):
            duration = end - start
            if duration <= 0:
                continue
            part_file = os.path.join(temp_dir, f"part_{i:04d}.mp4")
            cmd = [
                "ffmpeg",
                "-y",
                "-i", input_video,
                "-ss", str(start),
                "-t", str(duration),
                "-c", "copy",
                part_file
            ]
            subprocess.run(cmd, check=False)
            part_paths.append(part_file)

        if not part_paths:
            print("No valid segments extracted.")
            return

        # build concat manifest
        manifest = os.path.join(temp_dir, "concat_list.txt")
        with open(manifest, "w", encoding="utf-8") as mf:
            for p in part_paths:
                # escape single quotes for ffmpeg concat
                escaped_p = p.replace("'", "'\\''")
                mf.write(f"file '{escaped_p}'\n")

        concat_cmd = [
            "ffmpeg",
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", manifest,
            "-c", "copy",
            output_path
        ]
        subprocess.run(concat_cmd, check=False)
        print(f"Output written to {output_path}")
    finally:
        shutil.rmtree(temp_dir)


def process_directory(root_dir: str, output_dir: str):
    """
    For each .mp4 in root_dir, find corresponding .json metadata and create a processed video.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    for dirpath, _, filenames in os.walk(root_dir):
        for fname in filenames:
            if fname.lower().endswith(".mp4"):
                video_path = os.path.join(dirpath, fname)
                meta_path = os.path.splitext(video_path)[0] + ".json"
                if not os.path.exists(meta_path):
                    print(f"No metadata for {video_path}, skipping.")
                    continue
                print(f"Processing {video_path} with {meta_path}")
                segments = extract_segments_from_metadata(meta_path, THRESHOLD)
                out_name = os.path.splitext(fname)[0] + "_unusual.mp4"
                out_path = os.path.join(output_dir, out_name)
                ffmpeg_trim_segments(video_path, segments, out_path)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python Unusual_faces.py <root_video_dir> <output_dir>")
        sys.exit(1)
    root_dir = sys.argv[1]
    output_dir = sys.argv[2]
    process_directory(root_dir, output_dir)
