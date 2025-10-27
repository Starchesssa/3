
import os
import json
from aep_parser import parse_aep

# Input and output paths
input_file = "BOOK_CODE/PARALLAX/Spaced Out Final.aep"
output_dir = "BOOK_CODE/PARALLAX/outputs"
os.makedirs(output_dir, exist_ok=True)

# Parse the .aep file
try:
    data = parse_aep(input_file)
    output_path = os.path.join(output_dir, "parsed.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"✅ Successfully parsed '{input_file}' and saved to '{output_path}'")

except Exception as e:
    print("❌ Error while parsing AEP file:", e)
