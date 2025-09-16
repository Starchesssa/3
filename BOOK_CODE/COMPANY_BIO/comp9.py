import os
import re
import time
import requests
from rembg import remove

PROMPTS_DIR = "BOOKS/Temp/PROMPTS"
OUTPUT_DIR = "assets/images"
SKIP_EXISTING = True   # set False if you want to always re-generate
os.makedirs(OUTPUT_DIR, exist_ok=True)

# regex to find a filename token in a line (no spaces inside token)
FNAME_RE = re.compile(r'([^\s"\'`<>\\/,{}]+?\.(?:jpe?g|jpeg|png))', re.IGNORECASE)

def clean_filename(token: str) -> str:
    """Return a safe basename, trim trailing punctuation/quotes."""
    if not token:
        return ""
    token = token.strip().strip('\'"')
    # strip trailing punctuation that sometimes appears: ,.;:)
    token = re.sub(r'[,:;\.\}]+$', '', token)
    # keep only basename to avoid directories
    token = os.path.basename(token)
    return token

def generate_image(prompt, save_path, retries=3, delay=5, timeout=30):
    """Download image from pollinations.ai into save_path. Returns True on success."""
    url = f"https://image.pollinations.ai/prompt/{prompt.replace(' ', '%20')}"
    for attempt in range(1, retries+1):
        try:
            resp = requests.get(url, stream=True, timeout=timeout)
            if resp.status_code == 200:
                os.makedirs(os.path.dirname(save_path) or ".", exist_ok=True)
                with open(save_path, "wb") as fh:
                    for chunk in resp.iter_content(1024):
                        if not chunk:
                            break
                        fh.write(chunk)
                print(f"✅ Saved: {save_path}")
                return True
            else:
                print(f"❌ HTTP {resp.status_code} for prompt (attempt {attempt}): {prompt[:80]}...")
        except Exception as e:
            print(f"⚠️ Error (attempt {attempt}): {e}")
        if attempt < retries:
            time.sleep(delay)
            print(f"🔄 Retrying in {delay}s...")
    print(f"❌ Giving up on prompt: {prompt[:80]}...")
    return False

def remove_bg(jpg_path, png_path):
    """Remove background (rembg) and save PNG."""
    try:
        with open(jpg_path, "rb") as f:
            inp = f.read()
        out = remove(inp)
        os.makedirs(os.path.dirname(png_path) or ".", exist_ok=True)
        with open(png_path, "wb") as f:
            f.write(out)
        print(f"🧹 Removed background → {png_path}")
        return True
    except Exception as e:
        print(f"⚠️ Background removal failed for {jpg_path}: {e}")
        return False

def process_txt_file(txt_path):
    with open(txt_path, "r", encoding="utf-8") as fh:
        raw_lines = [ln.rstrip("\n") for ln in fh]

    i = 0
    created = 0
    while i < len(raw_lines):
        line = raw_lines[i].strip()
        if not line:
            i += 1
            continue

        m = FNAME_RE.search(line)
        if not m:
            # not a filename line -> skip
            i += 1
            continue

        token = m.group(1)
        filename = clean_filename(token)
        if not filename:
            print(f"⚠️ Couldn't clean filename token {token!r} on line {i+1}; skipping.")
            i += 1
            continue

        # determine description: remainder of same line after token OR next non-empty non-filename line
        remainder = line[m.end():].strip()
        description = None
        if remainder and not FNAME_RE.search(remainder):
            description = remainder
            i += 1  # consumed this line only (filename+description same line)
        else:
            # look for next non-empty line
            j = i + 1
            while j < len(raw_lines) and raw_lines[j].strip() == "":
                j += 1
            if j >= len(raw_lines):
                print(f"⚠️ No description found after filename {filename!r} (end of file). Skipping.")
                i = j
                continue
            # if the next non-empty line looks like a filename token, we treat it as missing description
            if FNAME_RE.search(raw_lines[j]):
                print(f"⚠️ Next line after filename {filename!r} also looks like a filename; skipping this pair.")
                i = j
                continue
            description = raw_lines[j].strip()
            i = j + 1

        # final safety
        filename = os.path.basename(filename)
        save_path = os.path.join(OUTPUT_DIR, filename)
        ext = os.path.splitext(filename)[1].lower()

        print(f"Found -> filename: {filename!r}  prompt: {description[:80]!r}")

        if SKIP_EXISTING and os.path.exists(save_path):
            print(f"⏭️ Skipping existing file: {save_path}")
            continue

        try:
            if ext in (".jpg", ".jpeg"):
                if generate_image(description, save_path):
                    created += 1

            elif ext == ".png":
                base = os.path.splitext(filename)[0]
                temp_jpg = os.path.join(OUTPUT_DIR, base + "_temp.jpg")
                if generate_image(description, temp_jpg):
                    if remove_bg(temp_jpg, save_path):
                        try:
                            os.remove(temp_jpg)
                        except Exception:
                            pass
                        created += 1

            else:
                # unknown extension: save as JPG with base name
                base = os.path.splitext(filename)[0]
                out_jpg = os.path.join(OUTPUT_DIR, base + ".jpg")
                if generate_image(description, out_jpg):
                    created += 1

        except Exception as e:
            print(f"❌ Error while generating {filename}: {e}")

    return created

# --- main ---
txt_files = sorted([f for f in os.listdir(PROMPTS_DIR) if f.lower().endswith(".txt")])
if not txt_files:
    print("⚠️ No .txt files found in", PROMPTS_DIR)
else:
    total_created = 0
    for idx, tf in enumerate(txt_files, start=1):
        print(f"\n📄 ({idx}/{len(txt_files)}) Processing: {tf}")
        path = os.path.join(PROMPTS_DIR, tf)
        created = process_txt_file(path)
        print(f"➡️ Created {created} images from {tf}")
        total_created += created

    print(f"\n🎉 Done — total images created: {total_created}")
