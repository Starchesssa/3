#!/usr/bin/env python3
"""
COMP9C — Parallax Video Builder
Creates full video synced to audio using:
- Images
- Depth maps
- Timeline file
"""

import os
import random
from pathlib import Path

import numpy as np
from PIL import Image
from moviepy.editor import (
    VideoClip,
    AudioFileClip,
    concatenate_videoclips
)
import cv2


# ------------------------------
#  FOLDERS
# ------------------------------
IMG_ROOT = Path("BOOKS/Temp/IMG")
MAP_ROOT = Path("BOOKS/Temp/MAPPINGS")
AUDIO_ROOT = Path("BOOKS/Temp/TTS")
OUT_ROOT = Path("BOOKS/Temp/FINAL")
OUT_ROOT.mkdir(parents=True, exist_ok=True)


# ------------------------------
#  TIMELINE PARSER
# ------------------------------
def load_timeline(map_file: Path):
    timeline = []

    for line in map_file.read_text().splitlines():
        if "|" not in line:
            continue

        try:
            idx, start, end = line.split("|")
            idx = int(idx)
            start = float(start)
            end = float(end)
        except:
            continue

        duration = max(0, end - start)
        timeline.append((idx, duration))

    return timeline


# ------------------------------
#  PARALLAX GENERATOR
# ------------------------------
def parallax_frame(t, duration, img, depth, mode):
    h, w = img.shape[:2]

    # normalized progress 0→1
    p = t / duration

    # Strength of movement
    strength = 20

    if mode == "slide_left":
        shift = int(strength * p)
        map_x = (np.tile(np.arange(w), (h, 1)) - shift).astype(np.float32)
        map_y = np.tile(np.arange(h), (w, 1)).T.astype(np.float32)

    elif mode == "slide_right":
        shift = int(strength * p)
        map_x = (np.tile(np.arange(w), (h, 1)) + shift).astype(np.float32)
        map_y = np.tile(np.arange(h), (w, 1)).T.astype(np.float32)

    elif mode == "zoom_in":
        scale = 1 + 0.05 * p
        cx, cy = w // 2, h // 2
        map_x, map_y = cv2.getOptimalNewCameraMatrix(
            np.eye(3), None, (w, h), 0
        )[0:2]
        map_x = (np.tile(np.arange(w), (h, 1)) - cx) / scale + cx
        map_y = (np.tile(np.arange(h), (w, 1)).T - cy) / scale + cy

    elif mode == "zoom_out":
        scale = 1 - 0.05 * p
        cx, cy = w // 2, h // 2
        map_x = (np.tile(np.arange(w), (h, 1)) - cx) / scale + cx
        map_y = (np.tile(np.arange(h), (w, 1)).T - cy) / scale + cy

    elif mode == "slide_up":
        shift = int(strength * p)
        map_x = np.tile(np.arange(w), (h, 1)).astype(np.float32)
        map_y = (np.tile(np.arange(h), (w, 1)).T - shift).astype(np.float32)

    elif mode == "slide_down":
        shift = int(strength * p)
        map_x = np.tile(np.arange(w), (h, 1)).astype(np.float32)
        map_y = (np.tile(np.arange(h), (w, 1)).T + shift).astype(np.float32)

    else:
        # fail safe
        map_x = np.tile(np.arange(w), (h, 1)).astype(np.float32)
        map_y = np.tile(np.arange(h), (w, 1)).T.astype(np.float32)

    warped = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    return warped


# ------------------------------
#  CREATE CLIP FOR EACH IMAGE
# ------------------------------
def build_clip(img_path: Path, depth_path: Path, duration: float):
    img = cv2.imread(str(img_path))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    if depth_path.exists():
        depth = cv2.imread(str(depth_path), cv2.IMREAD_GRAYSCALE)
        depth = cv2.resize(depth, (img.shape[1], img.shape[0]))
    else:
        depth = np.zeros((img.shape[0], img.shape[1]), dtype=np.uint8)

    mode = random.choice([
        "slide_left", "slide_right",
        "zoom_in", "zoom_out",
        "slide_up", "slide_down"
    ])

    def make_frame(t):
        return parallax_frame(t, duration, img, depth, mode)

    return VideoClip(make_frame, duration=duration)


# ------------------------------
#  MAIN VIDEO BUILDER
# ------------------------------
def build_video(base_folder: Path):
    base = base_folder.name
    map_file = MAP_ROOT / f"{base}_timeline.txt"
    audio_file = AUDIO_ROOT / f"{base}.wav"

    if not map_file.exists():
        print(f"❌ No timeline for {base}")
        return
    if not audio_file.exists():
        print(f"❌ No audio for {base}")
        return

    timeline = load_timeline(map_file)
    clips = []

    for idx, duration in timeline:
        img_path = base_folder / f"{idx}.jpg"
        depth_path = base_folder / f"{idx}_depth.png"

        if not img_path.exists():
            print(f"⚠ Missing image: {img_path}")
            continue

        print(f"🎬 Clip {idx}: {duration:.2f}s")
        clip = build_clip(img_path, depth_path, duration)
        clips.append(clip)

    if not clips:
        print(f"⚠ No clips for {base}")
        return

    final = concatenate_videoclips(clips, method="compose")

    audio = AudioFileClip(str(audio_file))
    final = final.set_audio(audio)

    out_path = OUT_ROOT / f"{base}.mp4"
    final.write_videofile(str(out_path), fps=30, codec="libx264", audio_codec="aac")

    print(f"✅ Exported: {out_path}")


# ------------------------------
#  EXECUTE
# ------------------------------
def main():
    bases = [f for f in IMG_ROOT.iterdir() if f.is_dir()]

    for folder in bases:
        build_video(folder)


if __name__ == "__main__":
    main()
