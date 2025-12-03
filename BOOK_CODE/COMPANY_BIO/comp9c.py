#!/usr/bin/env python3
"""
COMP9C: Depth-based parallax video builder (FFmpeg concat)

Structure assumptions:
- Timelines: BOOKS/Temp/MAPPINGS/*.txt
  each line example:
    1 | 0.00 --> 9.40 | description...
- Images & depth maps: BOOKS/Temp/IMG/<base>/
    image candidates: 1_image.jpg, 1.jpg, 1.png
    depth candidates: 1_depth.png, 1_depth.jpg, 1.png
- Audio (optional): BOOKS/Temp/TTS/<base>.wav
- Output: BOOKS/Temp/OUTPUT/<base>.mp4

Install requirements:
    pip install opencv-python numpy

ffmpeg must be installed and available on PATH.
"""

import re
import math
import shutil
import subprocess
from pathlib import Path
import cv2
import numpy as np

# --- Config ---
BASE = Path("BOOKS/Temp")
TIMELINE_DIR = BASE / "MAPPINGS"
IMG_ROOT = BASE / "IMG"
AUDIO_ROOT = BASE / "TTS"
OUT_ROOT = BASE / "OUTPUT"
TMP_ROOT = BASE / "TMP_COMP9C"
FPS = 30
DEFAULT_SIZE = (1280, 720)  # width x height
MIN_MOTIONS = 3
MAX_MOTIONS = 6

# Motion presets (name, params)
MOTION_PRESETS = [
    ("slide_left", {"amp_px": 80}),
    ("slide_right", {"amp_px": 80}),
    ("slide_up", {"amp_px": 60}),
    ("slide_down", {"amp_px": 60}),
    ("zoom_in", {"zoom": 1.10}),
    ("zoom_out", {"zoom": 0.92}),
    ("rotate_cw", {"deg": 2.5}),
    ("rotate_ccw", {"deg": -2.5}),
]

# Flexible parser regex: index | start --> end | description
LINE_RE = re.compile(r'^\s*(\d+)\s*\|\s*([\d\.]+)\s*(?:-|-->|→|--)\s*([\d\.]+)\s*\|\s*(.*)$')

# --- Helpers ---


def parse_timeline_file(path: Path):
    items = []
    text = path.read_text(encoding="utf-8")
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        m = LINE_RE.match(line)
        if not m:
            # try looser parse: "1 | 0.00 --> 9.40 | ...", with arrows and spaces
            parts = line.split("|")
            if len(parts) >= 2:
                try:
                    idx = int(parts[0].strip())
                    times = parts[1].strip()
                    # support "0.00 --> 9.40" or "0.00 - 9.40"
                    times = times.replace(">", "").replace("-", "->")
                    if "->" in times:
                        s, e = times.split("->", 1)
                    elif "-->" in times:
                        s, e = times.split("-->", 1)
                    elif "-" in times:
                        s, e = times.split("-", 1)
                    else:
                        print(f" ⚠ Unable to parse times for line: {line}")
                        continue
                    start = float(s.strip())
                    end = float(e.strip())
                    desc = parts[2].strip() if len(parts) >= 3 else ""
                    items.append({"index": idx, "start": start, "end": end, "desc": desc})
                    continue
                except Exception:
                    print(f" ⚠ Skipping unrecognized line: {line}")
                    continue
            else:
                print(f" ⚠ Skipping unrecognized line: {line}")
                continue
        idx = int(m.group(1))
        start = float(m.group(2))
        end = float(m.group(3))
        desc = m.group(4).strip()
        items.append({"index": idx, "start": start, "end": end, "desc": desc})
    # sort by start time
    items.sort(key=lambda x: x["start"])
    return items


IMG_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".bmp"]


def find_image(img_folder: Path, idx: int):
    # common names
    for ext in IMG_EXTS:
        p = img_folder / f"{idx}_image{ext}"
        if p.exists():
            return p
    # fallback: idx.ext or idx-*.ext or idx_*.ext
    for child in img_folder.iterdir():
        if not child.is_file():
            continue
        stem = child.stem.lower()
        if stem.startswith(f"{idx}_") or stem.startswith(f"{idx}-") or stem == str(idx):
            if child.suffix.lower() in IMG_EXTS:
                return child
        # also accept files that start with index and have more text
        if child.name.lower().startswith(f"{idx}"):
            if child.suffix.lower() in IMG_EXTS:
                return child
    return None


def find_depth(img_folder: Path, idx: int):
    candidates = [f"{idx}_depth.png", f"{idx}_depth.jpg", f"{idx}.png", f"{idx}.jpg", f"{idx}_depth.jpeg"]
    for c in candidates:
        p = img_folder / c
        if p.exists():
            return p
    # fallback: any png that starts with idx
    for child in img_folder.iterdir():
        if not child.is_file():
            continue
        if child.suffix.lower() in [".png", ".jpg", ".jpeg"]:
            if child.name.lower().startswith(f"{idx}_") or child.name.lower().startswith(f"{idx}."):
                # prefer png but accept jpg
                return child
    return None


def prepare_image_and_depth(img_path: Path, depth_path: Path, target_size=DEFAULT_SIZE):
    img_bgr = cv2.imread(str(img_path))
    if img_bgr is None:
        raise FileNotFoundError(f"Image not readable: {img_path}")
    h, w = img_bgr.shape[:2]
    tw, th = target_size
    # resize image to target size (force)
    img_bgr = cv2.resize(img_bgr, (tw, th), interpolation=cv2.INTER_AREA)

    if depth_path is None or not depth_path.exists():
        raise FileNotFoundError(f"Depth missing for {img_path}")
    depth = cv2.imread(str(depth_path), cv2.IMREAD_GRAYSCALE)
    if depth is None:
        raise FileNotFoundError(f"Depth unreadable: {depth_path}")
    depth = cv2.resize(depth, (tw, th), interpolation=cv2.INTER_AREA)
    depth_norm = depth.astype(np.float32) / 255.0
    depth_norm = np.clip(depth_norm, 0.0, 1.0)
    return img_bgr, depth_norm


def ease(t):
    # ease in-out smooth
    return (1 - math.cos(math.pi * t)) / 2.0


def smart_warp_and_crop(img, depth_norm, shift_x, shift_y, extra_zoom=1.0):
    h, w = img.shape[:2]
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    map_x = (grid_x - (depth_norm * shift_x)).astype(np.float32)
    map_y = (grid_y - (depth_norm * shift_y)).astype(np.float32)
    warped = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

    # safety crop
    max_shift_x = abs(shift_x)
    max_shift_y = abs(shift_y)
    crop_ratio_x = max_shift_x / w
    crop_ratio_y = max_shift_y / h
    safety_zoom = 1.0 + max(crop_ratio_x, crop_ratio_y) + 0.02
    total_zoom = safety_zoom * extra_zoom
    if total_zoom <= 1.001:
        return warped
    cw = int(w / total_zoom)
    ch = int(h / total_zoom)
    cx, cy = w // 2, h // 2
    x1 = max(0, cx - cw // 2)
    y1 = max(0, cy - ch // 2)
    x2 = x1 + cw
    y2 = y1 + ch
    crop = warped[y1:y2, x1:x2]
    if crop.size == 0:
        return warped
    final = cv2.resize(crop, (w, h), interpolation=cv2.INTER_LINEAR)
    return final


def apply_rotation(frame, angle_deg):
    if abs(angle_deg) < 0.001:
        return frame
    h, w = frame.shape[:2]
    m = cv2.getRotationMatrix2D((w / 2, h / 2), angle_deg, 1.0)
    rotated = cv2.warpAffine(frame, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return rotated


def generate_motion_frames(img_bgr, depth_norm, motion, frames_count):
    frames = []
    h, w = img_bgr.shape[:2]

    # base params
    if motion == "slide_left":
        amp_x = -MOTION_PRESETS[0][1]["amp_px"]
        amp_y = 0
        zoom = 1.0
        rot = 0.0
    elif motion == "slide_right":
        amp_x = MOTION_PRESETS[1][1]["amp_px"]
        amp_y = 0
        zoom = 1.0
        rot = 0.0
    elif motion == "slide_up":
        amp_x = 0
        amp_y = -MOTION_PRESETS[2][1]["amp_px"]
        zoom = 1.0
        rot = 0.0
    elif motion == "slide_down":
        amp_x = 0
        amp_y = MOTION_PRESETS[3][1]["amp_px"]
        zoom = 1.0
        rot = 0.0
    elif motion == "zoom_in":
        amp_x = 0
        amp_y = 0
        zoom = MOTION_PRESETS[4][1]["zoom"]
        rot = 0.0
    elif motion == "zoom_out":
        amp_x = 0
        amp_y = 0
        zoom = MOTION_PRESETS[5][1]["zoom"]
        rot = 0.0
    elif motion == "rotate_cw":
        amp_x = 0
        amp_y = 0
        zoom = 1.02
        rot = MOTION_PRESETS[6][1]["deg"]
    elif motion == "rotate_ccw":
        amp_x = 0
        amp_y = 0
        zoom = 1.02
        rot = MOTION_PRESETS[7][1]["deg"]
    else:
        amp_x = 0
        amp_y = 0
        zoom = 1.0
        rot = 0.0

    for i in range(frames_count):
        t = i / max(1, frames_count - 1)
        s = ease(t)  # 0..1 ease
        # displacement follows a sin curve so it goes out-and-back
        sinp = math.sin(t * math.pi)
        shift_x = amp_x * sinp
        shift_y = amp_y * sinp
        cur_zoom = 1.0 + (zoom - 1.0) * sinp
        cur_rot = rot * sinp
        frame = smart_warp_and_crop(img_bgr, depth_norm, shift_x, shift_y, extra_zoom=cur_zoom)
        if abs(cur_rot) > 0.001:
            frame = apply_rotation(frame, cur_rot)
        frames.append(frame)
    return frames


# --- Main processing per timeline (base) ---
def process_base(tl_path: Path):
    base_name = tl_path.stem
    # If your timeline files have suffix like "..._timeline_timeline", it's fine; it will use that as folder name.
    img_folder = IMG_ROOT / base_name
    if not img_folder.exists():
        print(f"⚠ Image folder not found for timeline {tl_path.name}: expected {img_folder}")
        return

    print(f"\n=== Processing timeline: {tl_path.name}  → images in {img_folder} ===")
    items = parse_timeline_file(tl_path)
    if not items:
        print(" ⚠ No valid timeline lines. Skipping.")
        return

    # prepare temp folder
    tmp = TMP_ROOT / base_name
    if tmp.exists():
        shutil.rmtree(tmp)
    tmp.mkdir(parents=True, exist_ok=True)

    seg_files = []

    # Deterministic seed for motion choice
    seed = sum(ord(c) for c in base_name) % 1000

    for it in items:
        idx = it["index"]
        start = it["start"]
        end = it["end"]
        duration = max(0.01, end - start)
        frames_needed = max(1, int(round(duration * FPS)))
        print(f" → Item {idx}: {duration:.2f}s → {frames_needed} frames")

        img_path = find_image(img_folder, idx)
        depth_path = find_depth(img_folder, idx)

        if img_path is None:
            print(f"   ⚠ Missing image for index {idx} in {img_folder}. Skipping item.")
            # create empty black video segment so timeline keeps alignment
            black = np.zeros((DEFAULT_SIZE[1], DEFAULT_SIZE[0], 3), dtype=np.uint8)
            seg_out = tmp / f"seg_{idx:03d}.mp4"
            vw = cv2.VideoWriter(str(seg_out), cv2.VideoWriter_fourcc(*"mp4v"), FPS, DEFAULT_SIZE)
            for _ in range(frames_needed):
                vw.write(black)
            vw.release()
            seg_files.append(str(seg_out))
            continue

        if depth_path is None:
            print(f"   ⚠ Depth map missing for image {img_path.name}. Skipping item.")
            # we could fall back to a simple static video using the image (no parallax)
            # create static frames from image resized
            img_bgr = cv2.imread(str(img_path))
            img_bgr = cv2.resize(img_bgr, (DEFAULT_SIZE[0], DEFAULT_SIZE[1]), interpolation=cv2.INTER_AREA)
            seg_out = tmp / f"seg_{idx:03d}.mp4"
            vw = cv2.VideoWriter(str(seg_out), cv2.VideoWriter_fourcc(*"mp4v"), FPS, (DEFAULT_SIZE[0], DEFAULT_SIZE[1]))
            for _ in range(frames_needed):
                vw.write(img_bgr)
            vw.release()
            seg_files.append(str(seg_out))
            continue

        try:
            img_bgr, depth_norm = prepare_image_and_depth(img_path, depth_path, target_size=DEFAULT_SIZE)
        except Exception as e:
            print(f"   ❌ Failed to prepare image/depth for {img_path.name}: {e}")
            continue

        # choose number of motions based on duration (longer durations -> more motions)
        motions_count = min(MAX_MOTIONS, max(MIN_MOTIONS, int(round(duration / 3.0))))
        motions = []
        for m_i in range(motions_count):
            motions.append(MOTION_PRESETS[(seed + idx + m_i) % len(MOTION_PRESETS)][0])

        # split frames across motions approximately equally
        per_motion = [frames_needed // motions_count] * motions_count
        remainder = frames_needed - sum(per_motion)
        # distribute remainder to first motions
        for i in range(remainder):
            per_motion[i] += 1

        # generate frames by concatenating motion frames
        all_frames = []
        for mi, motion in enumerate(motions):
            fc = per_motion[mi]
            if fc <= 0:
                continue
            mframes = generate_motion_frames(img_bgr, depth_norm, motion, fc)
            all_frames.extend(mframes)

        # safety: if mismatch, trim or pad
        if len(all_frames) > frames_needed:
            all_frames = all_frames[:frames_needed]
        elif len(all_frames) < frames_needed:
            # pad by repeating last frame
            last = all_frames[-1] if all_frames else np.zeros((DEFAULT_SIZE[1], DEFAULT_SIZE[0], 3), dtype=np.uint8)
            while len(all_frames) < frames_needed:
                all_frames.append(last.copy())

        # write segment file
        seg_out = tmp / f"seg_{idx:03d}.mp4"
        vw = cv2.VideoWriter(str(seg_out), cv2.VideoWriter_fourcc(*"mp4v"), FPS, (DEFAULT_SIZE[0], DEFAULT_SIZE[1]))
        for f in all_frames:
            vw.write(f)
        vw.release()
        seg_files.append(str(seg_out))
        print(f"   ✔ segment saved: {seg_out} ({len(all_frames)} frames)")

    # create concat list
    concat_txt = tmp / "concat_list.txt"
    with open(concat_txt, "w", encoding="utf-8") as f:
        for s in seg_files:
            f.write(f"file '{s}'\n")

    concatted = tmp / "concatted.mp4"
    ff_cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_txt), "-c", "copy", str(concatted)
    ]
    print(" → Concatenating segments with ffmpeg...")
    subprocess.run(ff_cmd, check=True)

    # merge audio if exists
    audio_file = AUDIO_ROOT / f"{base_name}.wav"
    final_out_folder = OUT_ROOT
    final_out_folder.mkdir(parents=True, exist_ok=True)
    final_out = final_out_folder / f"{base_name}.mp4"
    if audio_file.exists():
        print(f" → Merging audio {audio_file.name} into video...")
        merge_cmd = [
            "ffmpeg", "-y", "-i", str(concatted), "-i", str(audio_file),
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", str(final_out)
        ]
        subprocess.run(merge_cmd, check=True)
    else:
        print(" → No audio found; copying concatted video to output.")
        shutil.copy2(concatted, final_out)

    print(f"✅ Final video saved: {final_out}")
    # (optional) cleanup tmp per base if desired
    # shutil.rmtree(tmp)


def main():
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    TMP_ROOT.mkdir(parents=True, exist_ok=True)

    timeline_files = sorted(TIMELINE_DIR.glob("*.txt"))
    if not timeline_files:
        print(f"❌ No timeline files in {TIMELINE_DIR}.")
        return

    for tl in timeline_files:
        try:
            process_base(tl)
        except subprocess.CalledProcessError as e:
            print(f"❌ ffmpeg failed on {tl.name}: {e}")
        except Exception as e:
            print(f"❌ Error processing {tl.name}: {e}")


if __name__ == "__main__":
    main()
