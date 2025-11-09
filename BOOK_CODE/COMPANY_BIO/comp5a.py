import os
import re
import sys

# Get directories from environment variables
INPUT_DIR = os.getenv("INPUT_DIR", "BOOKS/Temp/STT")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "BOOKS/Temp/Sentences")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def parse_line(line):
    """
    Parse a single line like '0.00 --> 0.66 : Imagine' into (start, end, word)
    """
    match = re.match(r"([\d.]+)\s*-->\s*([\d.]+)\s*:\s*(.+)", line.strip())
    if match:
        start, end, word = match.groups()
        return float(start), float(end), word
    return None

def process_file(input_path, output_path):
    with open(input_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    words = [parse_line(l) for l in lines if parse_line(l)]
    
    if not words:
        print(f"⚠️  No valid lines found in {input_path}")
        return

    # Group words into sentences using punctuation (.!?)
    sentences = []
    current_sentence = []
    sentence_start = 0.0

    for start, end, word in words:
        if not current_sentence:
            sentence_start = start
        current_sentence.append((start, end, word))
        if re.search(r"[.!?]$", word):
            sentences.append(current_sentence)
            current_sentence = []

    if current_sentence:
        sentences.append(current_sentence)  # Add remaining words as last sentence

    # Write output file
    with open(output_path, "w", encoding="utf-8") as f:
        for i, sentence in enumerate(sentences, start=1):
            # Reset timestamps for this sentence to start at 0
            first_start = sentence[0][0]
            for start, end, word in sentence:
                start_adj = start - first_start
                end_adj = end - first_start
                f.write(f"{start_adj:.2f} --> {end_adj:.2f} : {word}\n")
            f.write("\n")  # Separate sentences

def main():
    txt_files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(".txt")]

    if not txt_files:
        print(f"⚠️  No .txt files found in {INPUT_DIR}")
        return

    for txt_file in txt_files:
        input_path = os.path.join(INPUT_DIR, txt_file)
        output_path = os.path.join(OUTPUT_DIR, txt_file)
        process_file(input_path, output_path)
        print(f"✅ Processed {txt_file} -> {output_path}")

if __name__ == "__main__":
    main()
