#!/usr/bin/env python3
"""
sync_map.py

Usage:
    python3 sync_map.py

What it does:
- For each WAV in BOOKS/Temp/TTS:
    - Find corresponding PROMPTS .txt in BOOKS/Temp/PROMPTS by matching base filename
    - Parse timeline entries (format: 1.(0.00-9.79)- description ...)
    - Find images in BOOKS/Temp/IMG/<base_name>/ named like '<index>_image.jpg' (or png)
    - Compute durations and validate vs audio length
    - If final prompt end < audio length, extend last image to audio end
    - Save mapping JSON and a helper ffmpeg shell script for building the final video
"""

import os
import re
import json
import wave
import contextlib
from pathlib import Path

BASE = Path("BOOKS/Temp")
TTS_DIR = BASE / "TTS"
PROMPTS_DIR = BASE / "PROMPTS"
IMG_DIR = BASE / "IMG"
OUT_DIR = BASE / "MAPPINGS"
IMG_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".bmp"]

OUT_DIR.mkdir(parents=True, exist_ok=True)

TIMELINE_RE = re.compile(r'^\s*(\d+)\.\(\s*([0-9]+(?:\.[0-9]+)?)\s*-\s*([0-9]+(?:\.[0-9]+)?)\s*\)\s*-\s*(.+)$')

def get_wav_duration(path):
    """Return duration in seconds as float using wave module."""
    try:
        with contextlib.closing(wave.open(str(path), 'rb')) as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            duration = frames / float(rate)
            return float(duration)
    except Exception as e:
        raise RuntimeError(f"Failed to read WAV duration for {path}: {e}")

def parse_prompts_file(path):
    """
    Parse prompt file lines into list of dicts:
    [{ 'index': int, 'start': float, 'end': float, 'text': str }, ...]
    Lines that don't match the pattern are ignored (but printed).
    """
    items = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s:
                continue
            m = TIMELINE_RE.match(s)
            if not m:
                # Try a relaxed parse if line begins with e.g. "1.(0.00-9.40)- ..."
                # otherwise warn and skip
                print(f"⚠️  Unrecognized prompt line format (skipping): {s}")
                continue
            idx = int(m.group(1))
            start = float(m.group(2))
            end = float(m.group(3))
            text = m.group(4).strip()
            if end < start:
                print(f"⚠️  Prompt {idx} has end < start, swapping: {start} -> {end}")
                start, end = end, start
            items.append({"index": idx, "start": start, "end": end, "text": text})
    # sort by index / start just in case
    items.sort(key=lambda x: (x["index"], x["start"]))
    return items

def find_image_for_index(img_root_folder: Path, index: int):
    """
    Look for files like '1_image.jpg' or '1_image.png' or '<index>_image.*' or '<index>.*'
    Returns Path or None.
    """
    if not img_root_folder.exists():
        return None
    # exact pattern <index>_image.<ext>
    for ext in IMG_EXTS:
        p = img_root_folder / f"{index}_image{ext}"
        if p.exists():
            return p
    # fallback patterns
    for child in img_root_folder.iterdir():
        name = child.name.lower()
        if not child.is_file():
            continue
        if name.startswith(f"{index}_") or name.startswith(f"{index}.") or name.startswith(f"{index}-"):
            return child
        # also accept "<index>-image.*" or "<index>image.*"
        if f"{index}image" in name.replace("_", "").replace("-", "").replace(".", ""):
            return child
    # try to find by numeric prefix anywhere
    for child in img_root_folder.iterdir():
        if not child.is_file(): continue
        m = re.match(r'^(\d+)', child.name)
        if m and int(m.group(1)) == index:
            return child
    return None

def build_mapping_for_pair(wav_path: Path, prompts_path: Path):
    base = wav_path.stem
    print(f"\n=== Processing: {base} ===")
    # durations
    duration = get_wav_duration(wav_path)
    print(f"Audio duration (sec): {duration:.3f}")

    prompts = parse_prompts_file(prompts_path)
    if not prompts:
        raise RuntimeError(f"No timeline prompts parsed from {prompts_path}")

    # image folder expected: BOOKS/Temp/IMG/<base>/
    img_folder = IMG_DIR / base
    mapping = {
        "base": base,
        "audio": str(wav_path),
        "audio_duration": duration,
        "items": []
    }

    for p in prompts:
        idx = p["index"]
        start = float(p["start"])
        end = float(p["end"])
        img_path = find_image_for_index(img_folder, idx)
        if img_path is None:
            print(f"⚠️  No image found for prompt index {idx} in {img_folder}. Will still include entry with image=null")
            img_str = None
        else:
            img_str = str(img_path)
        mapping["items"].append({
            "index": idx,
            "start": start,
            "end": end,
            "duration": round(end - start, 3),
            "prompt": p["text"],
            "image": img_str
        })

    # Validate timeline coverage vs audio duration
    last_end = mapping["items"][-1]["end"]
    epsilon = 0.5  # seconds tolerance
    if abs(last_end - duration) <= epsilon:
        print(f"✔ Timeline end ({last_end:.3f}s) is within {epsilon}s of audio duration ({duration:.3f}s).")
        # optionally update last end to exact audio duration for exactness
        mapping["items"][-1]["end"] = round(duration, 3)
        mapping["items"][-1]["duration"] = round(duration - mapping["items"][-1]["start"], 3)
    elif last_end < duration - epsilon:
        # audio is longer than last_end — extend last image to audio end
        print(f"⚠️ Timeline ends at {last_end:.3f}s but audio is longer ({duration:.3f}s). Extending last image to audio end.")
        mapping["items"][-1]["end"] = round(duration, 3)
        mapping["items"][-1]["duration"] = round(duration - mapping["items"][-1]["start"], 3)
    elif last_end > duration + epsilon:
        # timeline longer than audio
        print(f"⚠️ Timeline's last end {last_end:.3f}s is longer than audio duration {duration:.3f}s.")
        print(" → I will truncate the last prompt to the audio duration.")
        mapping["items"][-1]["end"] = round(duration, 3)
        mapping["items"][-1]["duration"] = round(duration - mapping["items"][-1]["start"], 3)

    # Double-check no negative durations
    for it in mapping["items"]:
        if it["duration"] <= 0:
            raise RuntimeError(f"Invalid duration for item {it['index']}: start {it['start']} end {it['end']}")

    # Save mapping
    out_json = OUT_DIR / f"{base}.json"
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2)
    print(f"💾 Saved mapping JSON: {out_json}")

    # Prepare FFmpeg helper script (not executed here)
    ffsh = OUT_DIR / f"{base}_ffmpeg.sh"
    lines = [
        "#!/bin/sh",
        "# Helper ffmpeg commands to render the video. Run this in a shell that has ffmpeg installed.",
        "# This script will create per-image segments and then concatenate them, then add audio.",
        "",
        "set -e",
        f"BASE='{base}'",
        "TMPDIR='temp_video_segments'",
        "mkdir -p \"$TMPDIR\"",
        ""
    ]
    seg_files = []
    for it in mapping["items"]:
        img = it["image"]
        idx = it["index"]
        dur = it["duration"]
        seg = f"$TMPDIR/seg_{idx:02d}.mp4"
        seg_files.append(seg)
        if img is None:
            # placeholder: create a blank segment (black)
            lines.append(f"ffmpeg -y -f lavfi -i color=black:s=1280x720:d={dur} -vf \"scale=1280:720\" -c:v libx264 -t {dur} -pix_fmt yuv420p -r 25 {seg}")
        else:
            # keep scale to 1280x720; adjust if you prefer
            lines.append(f"ffmpeg -y -loop 1 -i '{img}' -c:v libx264 -t {dur} -pix_fmt yuv420p -vf \"scale=1280:720\" -r 25 {seg}")
    # create concat list
    concat_txt = "$TMPDIR/concat_list.txt"
    lines.append("")
    lines.append(f"echo -n > {concat_txt}")
    for s in seg_files:
        lines.append(f"echo \"file '{s}'\" >> {concat_txt}")
    lines.append("")
    lines.append(f"ffmpeg -y -f concat -safe 0 -i {concat_txt} -c copy $TMPDIR/concatted.mp4")
    lines.append(f"ffmpeg -y -i $TMPDIR/concatted.mp4 -i '{wav_path}' -c:v copy -c:a aac -b:a 192k -shortest '{base}_final.mp4'")
    lines.append("")
    lines.append("echo 'Done. Output: '\"'${BASE}_final.mp4'\"")
    with open(ffsh, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    os.chmod(ffsh, 0o755)
    print(f"💾 Saved ffmpeg helper script: {ffsh}")

    return mapping

def main():
    # find all wav files
    wav_files = sorted([p for p in TTS_DIR.glob("*.wav")])
    if not wav_files:
        print("❌ No WAV files found in", TTS_DIR)
        return

    processed = []
    for wav in wav_files:
        base = wav.stem
        # try to find matching prompts file by base name
        possible = PROMPTS_DIR / (base + ".txt")
        if not possible.exists():
            # try variant no sanitize
            alt = None
            for p in PROMPTS_DIR.glob("*.txt"):
                if p.stem == base:
                    alt = p
                    break
            if alt is None:
                print(f"⚠️ No prompt file found matching WAV '{wav.name}'. Skipping.")
                continue
            else:
                possible = alt

        try:
            mapping = build_mapping_for_pair(wav, possible)
            processed.append(mapping["base"])
        except Exception as e:
            print(f"❌ Failed processing {wav.name}: {e}")

    print("\n=== Summary ===")
    if processed:
        for b in processed:
            print(" -", b)
        print(f"\nMappings saved to: {OUT_DIR}")
    else:
        print("No mappings created.")

if __name__ == "__main__":
    main()
