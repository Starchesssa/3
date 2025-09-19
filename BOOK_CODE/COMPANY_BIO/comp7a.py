
import os
import subprocess
import time
from pathlib import Path
from google import genai

# === Configuration ===
VIDEO_TSX_DIR = Path("BOOKS/Temp/VIDEO_TSX")
MODEL = "gemini-2.5-pro"

# === Load Gemini API keys ===
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5"),
]
API_KEYS = [k for k in API_KEYS if k]
if not API_KEYS:
    raise ValueError("❌ No GEMINI_API keys found.")

# === Helpers ===
def run_esbuild(file_path: Path) -> str:
    """Run esbuild on TSX file and return error log (empty string if success)."""
    try:
        subprocess.check_output(
            ["npx", "esbuild", str(file_path), "--bundle", "--outfile=out.js"],
            stderr=subprocess.STDOUT
        )
        return ""  # success
    except subprocess.CalledProcessError as e:
        return e.output.decode()

def ask_ai(prompt: str, api_index: int) -> (str, int):
    """Send prompt to Gemini, rotate API keys if needed."""
    while True:
        for attempt in range(len(API_KEYS)):
            key = API_KEYS[(api_index + attempt) % len(API_KEYS)]
            try:
                client = genai.Client(api_key=key)
                response = client.models.generate_content(
                    model=MODEL,
                    contents=[{"role": "user", "parts": [{"text": prompt}]}]
                )
                text = getattr(response, "text", None)
                if text is None:
                    try:
                        text = response.output[0].content[0].text
                    except Exception:
                        text = str(response)
                print(f"✅ Success with API#{(api_index + attempt) % len(API_KEYS) + 1}")
                return text.strip(), (api_index + attempt + 1) % len(API_KEYS)
            except Exception as e:
                print(f"⚠️ API#{(api_index + attempt) % len(API_KEYS) + 1} failed: {e}")
                time.sleep(2)
        print("🔄 All keys failed this round, retrying...")

def process_tsx(file_path: Path, api_index: int) -> int:
    """Validate & auto-rewrite TSX file until success."""
    attempt = 1
    while True:
        print(f"\n▶️ Checking {file_path.name} (attempt {attempt})")
        error_log = run_esbuild(file_path)

        if not error_log:
            print(f"✅ {file_path.name} built successfully!")
            return api_index
        else:
            print(f"❌ Error in {file_path.name}, asking AI to fix...")

            code_content = file_path.read_text(encoding="utf-8")
            repair_prompt = f"""
The following TSX code:

{code_content}

Was used to make a video using Remotion. It failed to compile with the following error:

{error_log}

Please rewrite the full correct version of this TSX code so that it compiles without errors.
"""
            fixed_code, api_index = ask_ai(repair_prompt, api_index)

            # Save the fixed code back to the same file
            file_path.write_text(fixed_code, encoding="utf-8")
            print(f"🛠 AI returned corrected code for {file_path.name}, retrying build...")
            attempt += 1

# === Main Execution ===
tsx_files = [f for f in VIDEO_TSX_DIR.glob("*.tsx") if f.is_file()]

if not tsx_files:
    print(f"❌ No TSX files found in {VIDEO_TSX_DIR}")
    exit()

api_index = 0
for tsx_file in tsx_files:
    api_index = process_tsx(tsx_file, api_index)

print("\n✅ All TSX files validated and corrected if needed!")
