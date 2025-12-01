
#!/usr/bin/env python3
"""
parse_timeline.py

- Reads each .txt file in BOOKS/Temp/PROMPTS/
- Extracts timeline entries in the format:
  1.(0.00-9.79)- description
- Saves a simple timeline file per prompts file:
  BOOKS/Temp/MAPPINGS/<base>_timeline.txt
"""

import re
from pathlib import Path

PROMPTS_DIR = Path("BOOKS/Temp/PROMPTS")
OUT_DIR = Path("BOOKS/Temp/MAPPINGS")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# regex for timeline lines
TIMELINE_RE = re.compile(r'^\s*(\d+)\.\(\s*([0-9]+(?:\.[0-9]+)?)\s*-\s*([0-9]+(?:\.[0-9]+)?)\s*\)\s*-\s*(.+)$')

def parse_prompts_file(file_path):
    """Parse timeline lines into list of dicts"""
    items = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s:
                continue
            m = TIMELINE_RE.match(s)
            if not m:
                print(f"⚠️ Unrecognized line (skipping): {s}")
                continue
            idx = int(m.group(1))
            start = float(m.group(2))
            end = float(m.group(3))
            text = m.group(4).strip()
            items.append({
                "index": idx,
                "start": start,
                "end": end,
                "text": text
            })
    return items

def main():
    txt_files = list(PROMPTS_DIR.glob("*.txt"))
    if not txt_files:
        print("❌ No prompts files found in", PROMPTS_DIR)
        return

    for txt_file in txt_files:
        print(f"📄 Parsing: {txt_file.name}")
        timeline = parse_prompts_file(txt_file)
        if not timeline:
            print(f"⚠️ No timeline entries found in {txt_file.name}")
            continue

        out_file = OUT_DIR / f"{txt_file.stem}_timeline.txt"
        with open(out_file, "w", encoding="utf-8") as f:
            for item in timeline:
                # just save index, start, end in seconds
                f.write(f"{item['index']}: {item['start']} - {item['end']}\n")
        print(f"💾 Saved timeline: {out_file}")

if __name__ == "__main__":
    main()
