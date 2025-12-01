
import re
from pathlib import Path

PROMPTS_DIR = Path("BOOKS/Temp/PROMPTS")
OUT_DIR = Path("BOOKS/Temp/MAPPINGS")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# FLEXIBLE REGEX THAT MATCHES ALL FORMATS
TIMELINE_REGEX = re.compile(
    r"""
    ^\s*                      # Start, whitespace allowed
    (\d+)\.?\s*               # Number like 1. or 1
    \(                        # Opening parenthesis
    \s*([\d\.]+)\s*           # Start time
    (?:-|-->|–)\s*            # Dash OR --> OR long dash
    ([\d\.]+)\s*              # End time
    \)\s*[-–]?\s*             # Closing )
    (.*)$                     # Description (optional)
    """,
    re.VERBOSE,
)

def parse_file(file_path: Path):
    print(f"📄 Parsing: {file_path.name}")

    lines = file_path.read_text(encoding="utf-8").splitlines()
    entries = []

    for line in lines:
        match = TIMELINE_REGEX.match(line)
        if match:
            index, start, end, desc = match.groups()
            entries.append(f"{index} | {start} --> {end} | {desc.strip()}")
        else:
            print(f"⚠️ Unrecognized line (skipping): {line}")

    if not entries:
        print(f"⚠️ No timeline entries found in {file_path.name}")
        return

    out_path = OUT_DIR / f"{file_path.stem}_timeline.txt"
    out_path.write_text("\n".join(entries), encoding="utf-8")
    print(f"💾 Saved timeline: {out_path}")

def main():
    for file in PROMPTS_DIR.glob("*.txt"):
        parse_file(file)

if __name__ == "__main__":
    main()
