
import os
import re
import struct
import mimetypes
import time
from google import genai
from google.genai import types

# ✅ Paths
SCRIPT_DIR = "BOOKS/Temp/SCRIPT/COMPANY_BIO"
OUTPUT_DIR = "BOOKS/Temp/TTS"
TONE_INSTRUCTION = "Read like you are telling a story to a friend :\n\n"

# Load API keys
API_KEYS = [
    os.environ.get("GEMINI_API"),
    os.environ.get("GEMINI_API2"),
    os.environ.get("GEMINI_API3"),
    os.environ.get("GEMINI_API4"),
    os.environ.get("GEMINI_API5"),
]
API_KEYS = [k for k in API_KEYS if k]
if not API_KEYS:
    raise ValueError("❌ No API keys found.")

# === Helpers ===

def parse_script(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read().strip()


def is_heading(line: str) -> bool:
    """
    Heading = any ALL-CAPS line (A–Z only), but can contain:
    numbers, spaces, punctuation.
    """
    cleaned = line.strip()
    if not cleaned:
        return False

    # Remove spaces + punctuation for checking
    letters_only = re.sub(r"[^A-Za-z]+", "", cleaned)
    if not letters_only:
        return False

    return letters_only.isupper()


def split_into_sections(script_text):
    """
    Split script into sections where headings are ALL-CAPS lines.
    Returns: Ordered dict-like list of (heading, content)
    """

    lines = script_text.split("\n")
    sections = {}
    current_heading = None
    current_body = []

    for line in lines:
        if is_heading(line):
            # Save previous section
            if current_heading is not None:
                sections[current_heading] = "\n".join(current_body).strip()

            # Start new section
            current_heading = line.strip()
            current_body = []
        else:
            current_body.append(line)

    # Save last section
    if current_heading is not None:
        sections[current_heading] = "\n".join(current_body).strip()

    return sections


def save_binary_file(file_name, data):
    with open(file_name, "wb") as f:
        f.write(data)
    print(f"💾 Audio saved to: {file_name}")


def convert_to_wav(audio_data: bytes, mime_type: str) -> bytes:
    parameters = parse_audio_mime_type(mime_type)
    bits_per_sample = parameters["bits_per_sample"]
    sample_rate = parameters["rate"]
    num_channels = 1
    data_size = len(audio_data)
    bytes_per_sample = bits_per_sample // 8
    block_align = num_channels * bytes_per_sample
    byte_rate = sample_rate * block_align
    chunk_size = 36 + data_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF", chunk_size, b"WAVE", b"fmt ", 16, 1,
        num_channels, sample_rate, byte_rate,
        block_align, bits_per_sample, b"data", data_size
    )
    return header + audio_data


def parse_audio_mime_type(mime_type: str) -> dict:
    bits_per_sample = 16
    rate = 24000
    parts = mime_type.split(";")
    for param in parts:
        param = param.strip()
        if param.lower().startswith("rate="):
            try:
                rate = int(param.split("=", 1)[1])
            except Exception:
                pass
        elif param.startswith("audio/L"):
            try:
                bits_per_sample = int(param.split("L", 1)[1])
            except Exception:
                pass
    return {"bits_per_sample": bits_per_sample, "rate": rate}


def generate_tts(api_key, combined_script, output_filename, retries=5, delay=10):
    for attempt in range(1, retries + 1):
        try:
            client = genai.Client(api_key=api_key)
            
            contents = [types.Content(role="user", parts=[types.Part.from_text(text=combined_script)])]
            
            config = types.GenerateContentConfig(
                response_modalities=["audio"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Enceladus")
                    )
                ),
            )
            for chunk in client.models.generate_content_stream(
                model="gemini-2.5-flash-preview-tts", contents=contents, config=config
            ):
                if (
                    chunk.candidates
                    and chunk.candidates[0].content
                    and chunk.candidates[0].content.parts
                ):
                    part = chunk.candidates[0].content.parts[0]
                    if part.inline_data and part.inline_data.data:
                        audio_data = part.inline_data.data
                        file_extension = mimetypes.guess_extension(part.inline_data.mime_type)
                        if file_extension is None:
                            file_extension = ".wav"
                            audio_data = convert_to_wav(audio_data, part.inline_data.mime_type)
                        save_binary_file(output_filename, audio_data)
                        return
            print(f"⚠️ Failed to generate audio on attempt {attempt}")
        except Exception as e:
            print(f"❌ Error on attempt {attempt}: {e}")
        if attempt < retries:
            print(f"Retrying after {delay} seconds...")
            time.sleep(delay)
    print(f"Giving up after {retries} attempts for {output_filename}")


# === Main ===

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    txt_files = [f for f in os.listdir(SCRIPT_DIR) if f.endswith(".txt")]
    if not txt_files:
        print("❌ No .txt script files found.")
        return

    selected_file = txt_files[0]
    print(f"📖 Selected script file: {selected_file}")

    script_text = parse_script(os.path.join(SCRIPT_DIR, selected_file))
    sections = split_into_sections(script_text)

    api_key = API_KEYS[0]

    # Number and save
    section_num = 1
    for heading, body in sections.items():
        safe_heading = heading.replace(" ", "_")
        output_filename = os.path.join(OUTPUT_DIR, f"{section_num}_{safe_heading}.wav")

        combined_script = TONE_INSTRUCTION + body.strip()

        print(f"[{api_key[:8]}...] Generating TTS for section: {heading}")
        generate_tts(api_key, combined_script, output_filename)

        section_num += 1


if __name__ == "__main__":
    main()
