
import os
import subprocess

os.makedirs("No_Face_Videos", exist_ok=True)
os.makedirs("Temp_Segments", exist_ok=True)

for noface in os.listdir("Unuusual_memory/NO_FACE"):
    if not noface.endswith(".txt"):
        continue

    base = noface[:-4]
    video = f"Processed_Vid/{base}.mp4"
    noface_path = f"Unuusual_memory/NO_FACE/{noface}"

    if not os.path.exists(video):
        print(f"⚠️ Skipping {base} - video not found.")
        continue

    print(f"🎬 Processing {base}")

    seg_num = 1
    concat_list = f"Temp_Segments/{base}_concat_list.txt"
    with open(concat_list, "w") as cl:
        with open(noface_path, "r", encoding="utf-8-sig") as f:
            for rawline in f:
                line = rawline.strip().replace('\r', '')
                print(f"📄 Raw line: [{line}]")

                if not line or not (":" in line and "-" in line):
                    print(f"⏭️ Skipping invalid line: '{line}'")
                    continue

                start, end = line.split('-')

                if start == end:
                    print(f"⏭️ Skipping zero-duration segment: {start} to {end}")
                    continue

                print(f"✂️ Cutting segment from '{start}' to '{end}'")
                seg_file = f"Temp_Segments/{base}_seg_{seg_num}.mp4"

                try:
                    subprocess.run([
                        "ffmpeg", "-y",
                        "-ss", start,
                        "-to", end,
                        "-i", video,
                        "-c", "copy",
                        seg_file
                    ], check=True)
                    cl.write(f"file '{os.path.basename(seg_file)}'\n")
                    seg_num += 1
                except subprocess.CalledProcessError as e:
                    print(f"❌ FFmpeg error on segment {start} to {end}: {e}")
                    continue

    if os.path.getsize(concat_list) > 0:
        print(f"🔗 Concatenating segments for {base}...")
        subprocess.run([
            "ffmpeg", "-y",
            "-f", "concat", "-safe", "0",
            "-i", concat_list,
            "-c", "copy",
            f"No_Face_Videos/{base}_noface.mp4"
        ], check=True)
        print(f"✅ Finished processing {base}")
    else:
        print(f"⚠️ No valid segments for {base}, skipping.")
