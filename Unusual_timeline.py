
import os
import re
from pathlib import Path

# Directory paths
SCRIPT_DIR = "Unuusual_memory/SCRIPT"
TRANSCRIPT_DIR = "Unuusual_memory/TRANSCRIPT"
TIMELINE_FILE = "Unuusual_memory/TIMELINE/Timeline.txt"

# Helper to extract product script
def extract_script(text):
    match = re.search(r'Script:\s*(.+)', text, re.DOTALL)
    return match.group(1).strip() if match else ""

# Helper to load transcript words and timestamps
def load_transcript(filepath):
    timeline = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split(": ", 1)
            if len(parts) == 2:
                time_range, word = parts
                timeline.append((time_range, word.strip()))
    return timeline

# Improved word-level sliding window matching
def find_best_match_exact(script_words, transcript, threshold=0.85):
    transcript_words = [w for _, w in transcript]
    best_match = None
    best_start = None
    best_end = None
    best_ratio = 0

    for i in range(len(transcript_words) - len(script_words) + 1):
        window = transcript_words[i:i + len(script_words)]
        match_count = sum(1 for a, b in zip(script_words, window) if a.lower() == b.lower())
        match_ratio = match_count / len(script_words)

        if match_ratio > best_ratio:
            best_ratio = match_ratio
            best_start = i
            best_end = i + len(script_words) - 1

    if best_ratio >= threshold:
        start_time = transcript[best_start][0].split('-')[0]
        end_time = transcript[best_end][0].split('-')[1]
        return start_time, end_time, best_ratio
    else:
        return None, None, best_ratio

# Main script
timeline_results = []
for script_file in os.listdir(SCRIPT_DIR):
    if not script_file.startswith("group_") or not script_file.endswith(".txt"):
        continue

    group_name = Path(script_file).stem.replace("group_", "Group ")
    with open(os.path.join(SCRIPT_DIR, script_file), "r", encoding="utf-8") as f:
        content = f.read()
    script_text = extract_script(content)
    script_words = script_text.split()

    best_match = None
    best_times = (None, None)
    best_file = None

    # Search all transcripts
    for transcript_file in os.listdir(TRANSCRIPT_DIR):
        if not transcript_file.endswith(".txt"):
            continue
        transcript_path = os.path.join(TRANSCRIPT_DIR, transcript_file)
        transcript = load_transcript(transcript_path)

        start_time, end_time, ratio = find_best_match_exact(script_words, transcript)
        if start_time and ratio > (best_match[2] if best_match else 0):
            best_match = (start_time, end_time, ratio)
            best_times = (start_time, end_time)
            best_file = transcript_file

    if best_times[0] and best_times[1]:
        timeline_results.append(f"{group_name}: {best_times[0]}-{best_times[1]}")
    else:
        timeline_results.append(f"{group_name}: Timeline not found")

# Save timeline
os.makedirs(os.path.dirname(TIMELINE_FILE), exist_ok=True)
with open(TIMELINE_FILE, "w", encoding="utf-8") as f:
    for line in timeline_results:
        f.write(line + "\n")

print(f"Timeline extraction complete. Saved to {TIMELINE_FILE}")
