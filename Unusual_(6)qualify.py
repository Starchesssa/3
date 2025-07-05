
import os
import re

rating_dir = "Unuusual_memory/RATING"
face_dir = "Unuusual_memory/FACE DETECTION"
qualify_dir = "Unuusual_memory/QUALIFY"
os.makedirs(qualify_dir, exist_ok=True)

# Gather rating files
rating_files = [f for f in os.listdir(rating_dir) if f.endswith('.txt')]

# Group rating files by their group prefix (e.g., 1, 2, etc.)
groups = {}
for filename in rating_files:
    group_number = filename.split('(')[0]
    groups.setdefault(group_number, []).append(filename)

qualified_gadgets = {}

for group_number, files in groups.items():
    candidates = []
    
    # Check ratings first
    for filename in sorted(files):
        with open(os.path.join(rating_dir, filename), 'r') as f:
            content = f.read()
            match = re.search(r'Overall Score:\s*(\d+(?:\.\d+)?)/10', content)
            if match:
                score = float(match.group(1))
                if score >= 9.0:
                    candidates.append((score, filename))
    
    # No valid high rating
    if not candidates:
        print(f"❌ Group {group_number} has no high-rated gadgets (9+/10)")
        continue
    
    # Sort by rating (higher first), then by filename (alphabetically)
    candidates.sort(key=lambda x: (-x[0], x[1]))
    
    # Check Face Detection (rich visuals rule)
    for score, filename in candidates:
        face_file_path = os.path.join(face_dir, filename)
        if not os.path.exists(face_file_path):
            print(f"⚠️ Missing face detection file for {filename}")
            continue
        
        with open(face_file_path, 'r') as f:
            lines = f.readlines()[1:]  # Skip first line
            total_no_face_seconds = 0
            
            for line in lines:
                time_match = re.match(r'(\d{2}:\d{2})-(\d{2}:\d{2}):\s*(Face|No face)', line.strip())
                if time_match:
                    start, end, label = time_match.groups()
                    start_sec = int(start.split(':')[0]) * 60 + int(start.split(':')[1])
                    end_sec = int(end.split(':')[0]) * 60 + int(end.split(':')[1])
                    duration = end_sec - start_sec
                    if label == "No face":
                        total_no_face_seconds += duration
            
            if total_no_face_seconds > 29:
                qualified_gadgets[group_number] = filename
                print(f"✅ Group {group_number} qualified with {filename} (No face seconds: {total_no_face_seconds})")
                break  # Found the qualifying gadget
            else:
                print(f"⛔ Disqualified {filename} (No face seconds: {total_no_face_seconds})")
    else:
        if group_number not in qualified_gadgets:
            print(f"❌ No gadget qualified in Group {group_number}")

# Save results
qualify_file_path = os.path.join(qualify_dir, 'qualified.txt')
with open(qualify_file_path, 'w') as f:
    for group, gadget in qualified_gadgets.items():
        f.write(f"Group {group}: {gadget}\n")

print(f"\n🎯 Saved qualified gadgets to '{qualify_file_path}'")
