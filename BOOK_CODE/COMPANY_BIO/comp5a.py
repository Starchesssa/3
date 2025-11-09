
import re

def reset_word_timestamps(file_path, output_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    pattern = r'(\d+\.\d+)\s*-->\s*(\d+\.\d+)\s*:\s*(.*)'
    fragments = []
    for line in lines:
        match = re.match(pattern, line.strip())
        if match:
            start, end, text = float(match.group(1)), float(match.group(2)), match.group(3).strip()
            if text:
                fragments.append((start, end, text))

    sentences = []
    current_sentence = []
    sentence_start_time = None

    for i, (start, end, word) in enumerate(fragments):
        if sentence_start_time is None:
            sentence_start_time = start

        # Adjust word timestamps relative to sentence start
        relative_start = start - sentence_start_time
        relative_end = end - sentence_start_time
        current_sentence.append((relative_start, relative_end, word))

        # If word ends with sentence punctuation, close sentence
        if word.endswith(('.', '!', '?')):
            sentences.append(current_sentence)
            current_sentence = []
            sentence_start_time = None

    # Handle last sentence if no punctuation at end
    if current_sentence:
        sentences.append(current_sentence)

    # Write output
    with open(output_path, 'w', encoding='utf-8') as out:
        for idx, sentence in enumerate(sentences, start=1):
            out.write(f"Sentence {idx}:\n")
            for start, end, word in sentence:
                out.write(f"{start:.2f} --> {end:.2f} : {word}\n")
            out.write("\n")

    print(f"✅ Done! Word-level timestamps reset for each sentence saved to: {output_path}")

# Example usage
reset_word_timestamps("transcript.txt", "sentence_word_reset.txt")
