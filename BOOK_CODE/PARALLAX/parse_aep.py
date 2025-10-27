from aep_parser import AEPFile
import json, os

input_file = "BOOK_CODE/PARALLAX/Spaced Out Final.aep"
output_dir = "BOOK_CODE/PARALLAX/outputs"
os.makedirs(output_dir, exist_ok=True)

aep = AEPFile(input_file)
data = aep.parse()

with open(f"{output_dir}/parsed.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("✅ Parsed AE project and saved to outputs/parsed.json")
