
#!/usr/bin/env python3
"""
DepthMap Engine v1 — Generate depth maps for all images in:
BOOKS/Temp/IMG/<base>/

Depth maps are saved next to each image as:
<index>_depth.png

Requirements:
    pip install transformers pillow torch
"""

import os
from pathlib import Path
from PIL import Image
from transformers import pipeline

IMG_ROOT = Path("BOOKS/Temp/IMG")

# ----------------------------
# Load depth model
# ----------------------------
print("🔄 Loading DepthAnything model...")
pipe = pipeline(
    task="depth-estimation",
    model="depth-anything/Depth-Anything-V2-Small-hf",
    device="cpu"   # use 0 if GPU exists
)
print("✅ Model loaded.\n")

# ----------------------------
# Allowed image extensions
# ----------------------------
IMG_EXTS = [".jpg", ".jpeg", ".png", ".webp"]

def generate_depth_for_folder(folder: Path):
    print(f"\n📁 Folder: {folder.name}")

    files = list(folder.iterdir())
    image_files = [f for f in files if f.suffix.lower() in IMG_EXTS]

    if not image_files:
        print(" ⚠️ No images found, skipping.")
        return

    for img_path in sorted(image_files):
        name = img_path.name
        stem = img_path.stem

        # Expected indexed image name: 1_image.jpg → index = 1
        index = None
        parts = stem.split("_")
        if parts and parts[0].isdigit():
            index = int(parts[0])

        # If index not found → skip
        if index is None:
            print(f" ⚠️ Skipping unindexed file: {name}")
            continue

        depth_out = folder / f"{index}_depth.png"

        # Skip if depth exists
        if depth_out.exists():
            print(f" ✔ Depth exists: {depth_out.name} (skipped)")
            continue

        print(f" 🖼️ Processing: {name}")

        try:
            image = Image.open(img_path)
        except Exception as e:
            print(f" ❌ Failed to open {name}: {e}")
            continue

        try:
            result = pipe(image)
            depth = result["depth"]
            depth.save(depth_out)
            print(f"    ✅ Saved: {depth_out.name}")
        except Exception as e:
            print(f"    ⚠️ Error processing {name}: {e}")

# ----------------------------
# MAIN
# ----------------------------
def main():
    if not IMG_ROOT.exists():
        print(f"❌ IMG folder not found: {IMG_ROOT}")
        return

    bases = [f for f in IMG_ROOT.iterdir() if f.is_dir()]
    if not bases:
        print(f"❌ No folders in {IMG_ROOT}")
        return

    print("🚀 Starting depth map generation...")
    for folder in sorted(bases):
        generate_depth_for_folder(folder)

    print("\n🎉 All depth maps generated successfully!")

if __name__ == "__main__":
    main()
