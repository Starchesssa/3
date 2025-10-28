
import json
from aep_parser.parsers.project import parse_project

# Input and output paths
aep_path = "BOOK_CODE/PARALLAX/Spaced Out Final.aep"
output_path = "BOOK_CODE/PARALLAX/Spaced_Out_Final.json"

def main():
    print("🔍 Parsing AEP file...")
    try:
        project_data = parse_project(aep_path)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(project_data.to_dict(), f, indent=2)
        print(f"✅ Parsed data saved to: {output_path}")
    except Exception as e:
        print(f"❌ Error parsing AEP: {e}")

if __name__ == "__main__":
    main()
