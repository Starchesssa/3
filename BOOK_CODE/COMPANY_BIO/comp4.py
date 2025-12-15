
import os
import re
import struct
import mimetypes
import time
from google import genai
from google.genai import types

# ===============================
# Paths
# ===============================
SCRIPT_DIR = "BOOKS/Temp/SCRIPT/COMPANY_BIO"
OUTPUT_DIR = "BOOKS/Temp/TTS"
TONE_INSTRUCTION = "Read like you are telling a story to a friend:\n\n"

# ===============================
# Load API key (KABAJU7 ONLY)
# ===============================
API_KEY = os.environ.get("KABAJU7")

if not API_KEY:
    raise ValueError("❌ KABAJU7 API key not found in environment variables.")

API_KEYS = [API_KEY]  # kept as list for retry compatibility

# ===============================
# Helpers
# ===============================

def parse_script(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read().strip()


def is_heading(line: str) -> bool:
    cleaned = line.strip()
    if not cleaned:
        return False
    letters_only = re.sub(r"[^A-Za-z]+", "", cleaned)
    if not letters_only:
        return False
    return letters_only.isupper()


def split_into_sections(script_text):
    lines = script_text.split("\n")
    sections = {}
    current_heading = None
    current_body = []

    for line in lines:
        if is_heading(line):
            if current_heading is not None:
                sections[current_heading] = "\n".join(current_body).strip()
            current_heading = line.strip()
            current_body = []
        else:
            current_body.append(line)

    if current_heading is not None:
        sections[current_heading] = "\n".join(current_body).strip()

    return sections


def save_binary_file(file_name, data):
    with open(file_name, "wb") as f:
        f.write(data)
    print(f"💾 Audio saved to: {file_name}")


def parse_audio_mime_type(mime_type: str) -> dict:
    bits_per_sample = 16
    rate = 24000

    parts = mime_type.split(";")
    for part in parts:
        part = part.strip()
        if part.lower().startswith("rate="):
            try:
                rate = int(part.split("=", 1)[1])
            except Exception:
                pass
        elif part.startswith("audio/L"):
            try:
                bits_per_sample = int(part.split("L", 1)[1])
            except Exception:
                pass

    return {"bits_per_sample": bits_per_sample, "rate": rate}


def convert_to_wav(audio_data: bytes, mime_type: str) -> bytes:
    params = parse_audio_mime_type(mime_type)

    bits_per_sample = params["bits_per_sample"]
    sample_rate = params["rate"]
    num_channels = 1

    bytes_per_sample = bits_per_sample // 8
    block_align = num_channels * bytes_per_sample
    byte_rate = sample_rate * block_align
    data_size = len(audio_data)
    chunk_size = 36 + data_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        chunk_size,
        b"WAVE",
        b"fmt ",
        16,
        1,
        num_channels,
        sample_rate,
        byte_rate,
        block_align,
        bits_per_sample,
        b"data",
        data_size,
    )

    return header + audio_data


# ===============================
# TTS with Retry Logic (KABAJU7)
# ===============================

def generate_tts(api_keys, combined_script, output_filename, delay=10):
    max_attempts = 2  # same key retried twice

    for attempt in range(max_attempts):
        api_key = api_keys[0]
        print(f"🔁 Attempt {attempt + 1}/{max_attempts} using KABAJU7")

        try:
            client = genai.Client(api_key=api_key)

            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=combined_script)],
                )
            ]

            config = types.GenerateContentConfig(
                response_modalities=["audio"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name="Enceladus"
                        )
                    )
                ),
            )

            for chunk in client.models.generate_content_stream(
                model="gemini-2.5-pro-preview-tts",
                contents=contents,
                config=config,
            ):
                if (
                    chunk.candidates
                    and chunk.candidates[0].content
                    and chunk.candidates[0].content.parts
                ):
                    part = chunk.candidates[0].content.parts[0]
                    if part.inline_data and part.inline_data.data:
                        audio_data = part.inline_data.data
                        ext = mimetypes.guess_extension(
                            part.inline_data.mime_type
                        )

                        if ext is None:
                            audio_data = convert_to_wav(
                                audio_data, part.inline_data.mime_type
                            )
                            ext = ".wav"

                        save_binary_file(output_filename, audio_data)
                        return True

            print("⚠️ No audio returned from model")

        except Exception as e:
            print(f"❌ Error: {e}")

        if attempt < max_attempts - 1:
            print(f"⏳ Waiting {delay}s before retry...")
            time.sleep(delay)

    print(f"❌ Failed to generate audio: {output_filename}")
    return False


# ===============================
# Main
# ===============================

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

    section_num = 1

    for heading, body in sections.items():
        safe_heading = heading.replace(" ", "_")
        output_filename = os.path.join(
            OUTPUT_DIR, f"{section_num}_{safe_heading}.wav"
        )

        combined_script = TONE_INSTRUCTION + body.strip()

        print(f"\n🎤 Section {section_num}: {heading}")
        print("➡️ Using KABAJU7 API key")

        generate_tts(API_KEYS, combined_script, output_filename)

        section_num += 1


if __name__ == "__main__":
    main()
