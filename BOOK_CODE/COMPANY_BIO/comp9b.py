
#!/usr/bin/env python3
import os
import subprocess
import sys
from pathlib import Path

# --- Configuration ---
SOURCE_DIR = Path("BOOKS/Temp/VIDEO_FFMPEG")
OUTPUT_DIR = Path("BOOKS/Temp/VIDEO")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def run_ffmpeg_scripts():
    """Run all Python scripts in the source directory to generate videos."""
    py_files = [f for f in SOURCE_DIR.iterdir() if f.suffix == ".py"]
    if not py_files:
        print("❌ No Python files found in VIDEO_FFMPEG folder.")
        return

    for py_file in py_files:
        print(f"\n▶️ Running {py_file.name} ...")
        try:
            # Run the script
            subprocess.run([sys.executable, str(py_file)], check=True)

            # Move generated video to OUTPUT_DIR
            generated_video = SOURCE_DIR / f"{py_file.stem}_ffmpeg_output.mp4"
            if generated_video.exists():
                dest_video = OUTPUT_DIR / generated_video.name
                generated_video.rename(dest_video)
                print(f"✅ Video saved to {dest_video}")
            else:
                print(f"⚠️ No video found for {py_file.name}. Check the script.")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to run {py_file.name}: {e}")

if __name__ == "__main__":
    run_ffmpeg_scripts()
