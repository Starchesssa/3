
import os
import subprocess

os.makedirs("No_Face_Videos", exist_ok=True)
os.makedirs("Temp_Segments", exist_ok=True)

for txt_file in os.listdir("Unuusual_memory/NO_FACE"):
    if not txt_file.startswith("group_") or not txt_file.endswith(".txt"):
        continue

    base = txt_file[:-4]
    video_path = f"Processed_Vid/{base}.mp4"

    if not os.path.isfile(video_path):
        print(f"⚠️ Skipping {base} - video not found.")
        continue

    print(f"🎬 Processing {base}")

    seg_num = 1
    concat_list_path = f"Temp_Segments/{base}_concat_list.txt"
    with open(concat_list_path, "w") as concat_list, open(f"Unuusual_memory/NO_FACE/{txt_file}", "r") as f:
        for raw_line in f:
            line = raw_line.strip().replace('\ufeff', '').replace('\r', '')
            print(f"📄 Raw line: [{line}]")

            if not (len(line) == 11 and line[2] == ':' and line[5] == '-' and line[8] == ':'):
                print(f"⏭️ Skipping invalid line: '{line}'")
                continue

            start, end = line.split('-')
            print(f"✂️ Cutting segment from '{start}' to '{end}'")

            seg_filename = f"Temp_Segments/{base}_seg_{seg_num}.mp4"
            subprocess.run([
                "ffmpeg", "-y", "-ss", start, "-to", end, "-i", video_path,
                "-c", "copy", seg_filename
            ], check=True)

            concat_list.write(f"file '{os.path.basename(seg_filename)}'\n")
            seg_num += 1

    if os.path.getsize(concat_list_path) > 0:
        print(f"🔗 Concatenating segments for {base}...")
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_list_path, "-c", "copy",
            f"No_Face_Videos/{base}_noface.mp4"
        ], check=True)
        print(f"✅ Finished processing {base}")
    else:
        print(f"⚠️ No valid segments for {base}, skipping.")
