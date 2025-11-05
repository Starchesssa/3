
import os
import json
import re

# Directories
BASE_DIR = "BOOKS/Temp/PROMPTS"
OUTPUT_DIR = os.path.join(BASE_DIR, "Json")

# Make sure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def txt_to_json(txt_file):
    """Convert a single .txt file into JSON structure."""
    data = []
    with open(txt_file, "r", encoding="utf-8") as f:
        lines = f.read().strip().splitlines()
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        # Check if it's a filename (jpg/png etc)
        if re.match(r".*\.(jpg|jpeg|png|gif|webp)$", line, re.IGNORECASE):
            name = line
            desc_lines = []
            i += 1
            # Collect description lines until next filename
            while i < len(lines) and not re.match(r".*\.(jpg|jpeg|png|gif|webp)$", lines[i], re.IGNORECASE):
                desc_lines.append(lines[i].strip())
                i += 1
            description = " ".join(desc_lines).strip()
            data.append({"name": name, "description": description})
        else:
            i += 1
    
    return data


def process_all_txt(base_dir, output_dir):
    """Process all valid .txt files into JSON files in output_dir."""
    for file in os.listdir(base_dir):
        if file.endswith(".txt"):  # only process .txt files
            txt_path = os.path.join(base_dir, file)
            json_path = os.path.join(output_dir, file.replace(".txt", ".json"))
            
            json_data = txt_to_json(txt_path)
            
            with open(json_path, "w", encoding="utf-8") as jf:
                json.dump(json_data, jf, indent=4, ensure_ascii=False)
            
            print(f"Converted: {txt_path} -> {json_path}")


if __name__ == "__main__":
    process_all_txt(BASE_DIR, OUTPUT_DIR)
