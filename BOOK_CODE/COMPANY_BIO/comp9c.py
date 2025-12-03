
import subprocess
from pathlib import Path

TIMELINE_FILE = Path("BOOK_CODE/COMPANY_BIO/timeline.txt")
IMAGES_LIST = Path("BOOK_CODE/COMPANY_BIO/images_for_ffmpeg.txt")
FINAL_VIDEO = Path("BOOK_CODE/COMPANY_BIO/final.mp4")
AUDIO_FILE = Path("BOOK_CODE/COMPANY_BIO/final_audio.mp3")  # your TTS audio

def parse_timeline():
    lines = []
    with open(TIMELINE_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if "|" not in line:
                continue
            img, sec = line.split("|")
            img = img.strip()
            sec = sec.strip()
            if not Path(img).exists():
                print(f"⚠️ Missing image: {img}")
                continue
            try:
                sec = float(sec)
            except:
                continue
            lines.append((img, sec))
    return lines


def write_ffmpeg_list(parsed):
    with open(IMAGES_LIST, "w") as f:
        for img, sec in parsed:
            f.write(f"file '{img}'\n")
            f.write(f"duration {sec}\n")

    # FFmpeg needs the last file repeated
    if parsed:
        f.write(f"file '{parsed[-1][0]}'\n")


def build_video():
    cmd = [
        "ffmpeg",
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(IMAGES_LIST),
        "-vf", "scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2",
        "-r", "30",
        "temp_no_audio.mp4"
    ]
    subprocess.run(cmd, check=True)


def add_audio():
    cmd = [
        "ffmpeg",
        "-y",
        "-i", "temp_no_audio.mp4",
        "-i", str(AUDIO_FILE),
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        str(FINAL_VIDEO)
    ]
    subprocess.run(cmd, check=True)


def main():
    print("📌 Parsing timeline...")
    parsed = parse_timeline()
    if not parsed:
        print("❌ No valid timeline entries")
        return

    print("📄 Writing ffmpeg list...")
    write_ffmpeg_list(parsed)

    print("🎬 Building video...")
    build_video()

    print("🔊 Adding audio...")
    add_audio()

    print("\n✅ DONE! Final video saved at:")
    print(FINAL_VIDEO)


if __name__ == "__main__":
    main()
