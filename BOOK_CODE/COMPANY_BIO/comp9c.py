#!/usr/bin/env python3
"""
sync_depth_ffmpeg.py

Depth-based 2.5D animation engine (frame generation via OpenCV/NumPy; encoding + audio sync via ffmpeg).

Folders (based on your workflow):
- BOOKS/Temp/MAPPINGS/   -> *_timeline.txt (lines: 1 | 0.00 --> 9.40 | desc)
- BOOKS/Temp/IMG/...     -> folders with image files like 1_image.jpg and matching depth 1_depth.png
- BOOKS/Temp/TTS/        -> .wav audio files
- BOOKS/Temp/OUTPUT/     -> resulting mp4 files

High level:
- For each mapping file:
  - match image folder and audio file
  - for each timeline entry generate per-frame warped images using depth map and a preset
  - encode each entry to an mp4 via ffmpeg and add the correct audio subclip (via ffmpeg)
  - concat entry mp4s into final mp4 via ffmpeg concat demuxer
"""

import os
import re
import math
import random
import shutil
import subprocess
from pathlib import Path
from typing import Optional, List, Tuple
from tqdm import tqdm

import numpy as np
from PIL import Image, ImageOps
import cv2

# -------------------------
# Config
# -------------------------
BASE = Path("BOOKS/Temp")
MAPPINGS_DIR = BASE / "MAPPINGS"
IMG_ROOT = BASE / "IMG"
TTS_DIR = BASE / "TTS"
OUTPUT_DIR = BASE / "OUTPUT"
TMP_ROOT = BASE / "TMP_SYNC"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
TMP_ROOT.mkdir(parents=True, exist_ok=True)

W, H = 1280, 720         # default output size — lower to speed up. Change to 1920x1080 if you can.
FPS = 24
MAX_DISP = 70            # max displacement multiplier for parallax (tune for intensity)
EDGE_BLUR = 15           # blur kernel for hole-fill
SEED = 42
random.seed(SEED)

IMG_EXTS = [".jpg", ".jpeg", ".png", ".webp"]
TIMELINE_LINE_RE = re.compile(r"^\s*(\d+)\s*\|\s*([\d\.]+)\s*-->\s*([\d\.]+)\s*\|\s*(.*)$")

# -------------------------
# Utility / matching logic
# -------------------------
def normalize_token(s: str) -> str:
    return re.sub(r"[^\w\d]", "", s).lower()

def extract_caps_sig(s: str) -> str:
    return "".join(ch for ch in s if ch.isupper() or ch.isdigit())

def find_best_match_in_dir(target_name: str, items: List[Path]) -> Optional[Path]:
    if not items:
        return None
    tnorm = normalize_token(target_name)
    tcaps = extract_caps_sig(target_name)
    # exact
    for p in items:
        if normalize_token(p.stem) == tnorm:
            return p
    # contains / startswith
    for p in items:
        pn = normalize_token(p.stem)
        if tnorm and (pn.startswith(tnorm) or tnorm in pn):
            return p
    # caps signature
    if tcaps:
        for p in items:
            if extract_caps_sig(p.stem) == tcaps:
                return p
    # partial tokens
    parts = re.split(r"[_\-\s]+", target_name)
    for part in parts:
        pn = normalize_token(part)
        if not pn: continue
        for p in items:
            if pn in normalize_token(p.stem):
                return p
    return items[0]

def parse_timeline_file(path: Path):
    lines = path.read_text(encoding="utf-8").splitlines()
    entries = []
    for ln in lines:
        m = TIMELINE_LINE_RE.match(ln)
        if m:
            idx, start, end, desc = m.groups()
            entries.append({"index": int(idx), "start": float(start), "end": float(end), "desc": desc.strip()})
        else:
            print(f"⚠️ Unrecognized timeline line (skipping): {ln}")
    return entries

def find_indexed_image(folder: Path, index: int) -> Optional[Path]:
    if not folder or not folder.exists(): return None
    for ext in IMG_EXTS:
        p1 = folder / f"{index}_image{ext}"
        if p1.exists(): return p1
        p2 = folder / f"{index}{ext}"
        if p2.exists(): return p2
    for f in folder.iterdir():
        if f.is_file() and f.name.startswith(f"{index}_") and f.suffix.lower() in IMG_EXTS:
            return f
    return None

def find_depth_file(folder: Path, index: int) -> Optional[Path]:
    p = folder / f"{index}_depth.png"
    if p.exists(): return p
    for f in folder.iterdir():
        if f.is_file() and f.stem.startswith(str(index)) and f.suffix.lower() == ".png":
            return f
    return None

# -------------------------
# Depth warp / frame generation
# -------------------------
def prepare_images(img_path: Path, depth_path: Optional[Path]):
    img = Image.open(img_path).convert("RGB")
    img = ImageOps.fit(img, (W, H), method=Image.LANCZOS)
    img_np = np.array(img)
    if depth_path and depth_path.exists():
        d = Image.open(depth_path).convert("L")
        d = d.resize((W, H), Image.LANCZOS)
        depth_np = np.array(d).astype(np.float32) / 255.0
    else:
        depth_np = np.ones((H, W), dtype=np.float32) * 0.5
    return img_np, depth_np

def generate_displacement(depth: np.ndarray, tx: float, ty: float, tz: float):
    h, w = depth.shape
    xs, ys = np.meshgrid(np.arange(w), np.arange(h))
    # near objects (depth ~1) move more; use (depth) or (1-depth) depending on your depth map semantics
    # Here assume depth: 0 far, 1 near -> use depth directly
    strength = MAX_DISP * tz
    # displacement proportional to depth
    disp_x = (depth) * tx + (depth) * (strength * (0.5 - depth) * 0.02)
    disp_y = (depth) * ty + (depth) * (strength * (0.5 - depth) * 0.01)
    map_x = (xs + disp_x).astype(np.float32)
    map_y = (ys + disp_y).astype(np.float32)
    return map_x, map_y

def warp_and_fill(img_np: np.ndarray, map_x: np.ndarray, map_y: np.ndarray, original: np.ndarray):
    warped = cv2.remap(img_np, map_x, map_y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    # detect hole-ish zones - simple heuristic: near-black areas that differ from original
    gray = cv2.cvtColor(warped, cv2.COLOR_RGB2GRAY)
    mask = (gray == 0)
    if mask.any():
        blurred = cv2.GaussianBlur(original, (EDGE_BLUR|1, EDGE_BLUR|1), 0)
        warped[mask] = blurred[mask]
    return warped

def generate_frames_for_entry(img_path: Path, depth_path: Optional[Path], duration: float, preset: str, out_dir: Path):
    frames = max(1, int(math.ceil(duration * FPS)))
    img_np, depth_np = prepare_images(img_path, depth_path)
    original = img_np.copy()
    # preset motion functions
    def ease(u): return (1 - math.cos(math.pi * u)) / 2
    rnd = random.Random(int(np.sum(depth_np)*1000) + random.randint(0,99999))

    for i in range(frames):
        t = i / max(1, frames - 1)
        e = ease(t)
        if preset == "cinematic":
            tx = (10 * (1 - e)) * rnd.uniform(-1, 1)
            ty = (6 * (1 - e)) * rnd.uniform(-1, 1)
            tz = 0.8 * e
        elif preset == "float":
            tx = math.sin(t * math.pi * 2 + rnd.random()) * 18
            ty = math.cos(t * math.pi * 2 + rnd.random()) * 6
            tz = 0.4 * math.sin(t * math.pi)
        elif preset == "orbit":
            ang = t * math.pi * 2
            tx = math.cos(ang) * 24
            ty = math.sin(ang) * 10
            tz = 0.6 * (0.5 + 0.5 * math.sin(ang))
        elif preset == "dual":
            if t < 0.5:
                uu = t * 2
                tx = uu * 30
                ty = math.sin(uu * math.pi) * 8
                tz = 0.0
            else:
                uu = (t - 0.5) * 2
                tx = (1-uu) * 10
                ty = (1-uu) * 6
                tz = uu * 1.6
        else:
            tx = 0
            ty = 0
            tz = 0.4 * e

        # scale tx,ty by W/H so displacement is in pixels
        map_x, map_y = generate_displacement(depth_np, tx, ty, tz)
        warped = warp_and_fill(img_np, map_x, map_y, original)
        # ensure uint8
        frame_bgr = cv2.cvtColor(warped, cv2.COLOR_RGB2BGR)
        out_fname = out_dir / f"frame_{i:06d}.png"
        cv2.imwrite(str(out_fname), frame_bgr, [cv2.IMWRITE_PNG_COMPRESSION, 3])

# -------------------------
# FFmpeg helpers (encode + audio)
# -------------------------
def run_command(cmd: List[str]):
    # run subprocess and stream output
    print(" ".join(cmd))
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)
    for line in proc.stdout:
        print(line, end="")
    proc.wait()
    if proc.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}")

def make_video_from_frames(frames_dir: Path, fps: int, out_mp4: Path):
    # frames must be named frame_000000.png ... frame_N.png
    pattern = str(frames_dir / "frame_%06d.png")
    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(fps),
        "-i", pattern,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "18",
        str(out_mp4)
    ]
    run_command(cmd)

def extract_audio_subclip(audio_file: Path, start: float, end: float, out_wav: Path):
    # ffmpeg -i in.wav -ss start -to end -c copy out.wav  (but for safety re-encode to pcm)
    cmd = [
        "ffmpeg", "-y",
        "-i", str(audio_file),
        "-ss", f"{start:.3f}",
        "-to", f"{end:.3f}",
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "44100",
        "-ac", "2",
        str(out_wav)
    ]
    run_command(cmd)

def mux_video_audio(video_file: Path, audio_file: Path, out_file: Path):
    cmd = [
        "ffmpeg", "-y",
        "-i", str(video_file),
        "-i", str(audio_file),
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        str(out_file)
    ]
    run_command(cmd)

def concat_videos(video_files: List[Path], out_file: Path):
    list_txt = out_file.parent / (out_file.stem + "_list.txt")
    with open(list_txt, "w", encoding="utf-8") as f:
        for vf in video_files:
            f.write(f"file '{str(vf)}'\n")
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(list_txt),
        "-c", "copy",
        str(out_file)
    ]
    run_command(cmd)
    list_txt.unlink()

# -------------------------
# Main processing function
# -------------------------
def process_mapping(map_path: Path):
    print(f"\n=== Processing mapping: {map_path.name} ===")
    entries = parse_timeline_file(map_path)
    if not entries:
        print("No entries found.")
        return

    # match image folder & audio
    img_folders = [p for p in IMG_ROOT.iterdir() if p.is_dir()]
    audio_files = list(TTS_DIR.glob("*.wav"))

    match_img_folder = find_best_match_in_dir(map_path.stem, img_folders) if img_folders else None
    match_audio_file = find_best_match_in_dir(map_path.stem, audio_files) if audio_files else None

    print("Matched image folder:", match_img_folder)
    print("Matched audio file:", match_audio_file)

    temp_mapping_dir = TMP_ROOT / map_path.stem
    if temp_mapping_dir.exists():
        shutil.rmtree(temp_mapping_dir)
    temp_mapping_dir.mkdir(parents=True, exist_ok=True)

    per_entry_videos = []

    for i, e in enumerate(entries, start=1):
        idx = e["index"]; start = e["start"]; end = e["end"]; dur = max(0.05, end - start)
        print(f"\n-- Entry {idx}: {start} -> {end}  ({dur:.2f}s) --")
        img_path = find_indexed_image(match_img_folder, idx) if match_img_folder else None
        depth_path = find_depth_file(match_img_folder, idx) if match_img_folder else None

        entry_dir = temp_mapping_dir / f"entry_{i:03d}"
        entry_dir.mkdir(parents=True, exist_ok=True)

        if not img_path:
            print(f"⚠️ Missing image for index {idx}. Creating placeholder video.")
            # black video with optional audio
            black_png = entry_dir / "frame_000000.png"
            black = np.zeros((H, W, 3), dtype=np.uint8)
            cv2.imwrite(str(black_png), black)
            make_video_from_frames(entry_dir, FPS, entry_dir / "video.mp4")
            if match_audio_file:
                audio_sub = entry_dir / "audio.wav"
                extract_audio_subclip(match_audio_file, start, end, audio_sub)
                mux_video_audio(entry_dir / "video.mp4", audio_sub, entry_dir / "video_a.mp4")
                per_entry_videos.append(entry_dir / "video_a.mp4")
            else:
                per_entry_videos.append(entry_dir / "video.mp4")
            continue

        # select preset (prefer cinematic if depth exists)
        presets = ["cinematic", "float", "orbit", "dual"]
        if depth_path and depth_path.exists():
            preset = "cinematic"
        else:
            preset = random.choice(presets)

        print(f"Using preset: {preset}  (depth: {bool(depth_path)})")
        # generate frames
        try:
            generate_frames_for_entry(img_path, depth_path, dur, preset, entry_dir)
        except Exception as ex:
            print("⚠️ Frame generation failed:", ex)
            # fallback single frame
            img = Image.open(img_path).convert("RGB")
            img = ImageOps.fit(img, (W, H), method=Image.LANCZOS)
            arr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            cv2.imwrite(str(entry_dir / "frame_000000.png"), arr)

        # encode frames -> mp4
        entry_video = entry_dir / "video.mp4"
        make_video_from_frames(entry_dir, FPS, entry_video)

        # attach audio subclip if available
        if match_audio_file:
            audio_sub = entry_dir / "audio.wav"
            extract_audio_subclip(match_audio_file, start, end, audio_sub)
            entry_video_a = entry_dir / "video_a.mp4"
            mux_video_audio(entry_video, audio_sub, entry_video_a)
            per_entry_videos.append(entry_video_a)
        else:
            per_entry_videos.append(entry_video)

    # concat per_entry_videos
    final_out = OUTPUT_DIR / f"{map_path.stem}.mp4"
    print("\nConcatenating entries into final video:", final_out)
    concat_videos(per_entry_videos, final_out)

    # cleanup
    try:
        shutil.rmtree(temp_mapping_dir)
    except Exception:
        pass
    print("Done:", final_out)

# -------------------------
# MAIN
# -------------------------
def main():
    mapping_files = sorted(MAPPINGS_DIR.glob("*_timeline.txt"))
    if not mapping_files:
        print("❌ No mapping files found:", MAPPINGS_DIR)
        return
    for mf in mapping_files:
        process_mapping(mf)

if __name__ == "__main__":
    main()
