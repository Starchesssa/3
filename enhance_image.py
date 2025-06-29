
import os
import base64
import mimetypes
from google import genai
from google.genai import types

# ✅ CONFIGURE THESE:
API_KEY = os.environ.get("GEMINI_API")
INPUT_IMAGE = "images (68).jpeg"
OUTPUT_FOLDER = "Enhanced_images"
PROMPT = (
    "Enhance this product image by placing it in a high-end, realistic smart home setting. "
    "Keep the product photorealistic and centered, scale to 4K quality. Replace the white background "
    "with a cozy modern living room — wood or tile flooring, soft ambient lighting, and subtle tech "
    "elements in the blurred background. Maintain true proportions and colors. Add cinematic soft lighting, "
    "realistic shadows under the product, and a slight reflective surface to ground it. Avoid any artistic or cartoon styling."
)

# Setup
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
client = genai.Client(api_key=API_KEY)
model = "gemini-2.0-flash-preview-image-generation"
generate_cfg = types.GenerateContentConfig(
    response_modalities=["IMAGE"],
    response_mime_type="image/png"
)

def load_input_image(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def save_image(data: bytes, filename: str):
    with open(filename, "wb") as f:
        f.write(data)
    print(f"✅ Saved: {filename}")

def enhance_image():
    b64 = load_input_image(INPUT_IMAGE)
    contents = [
        types.Content(role="user", parts=[
            types.Part.from_bytes(mime_type="image/jpeg", data=base64.b64decode(b64)),
            types.Part.from_text(text=PROMPT)
        ])
    ]

    for i, chunk in enumerate(client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_cfg,
    )):
        cand = getattr(chunk, "candidates", None)
        if not cand:
            continue
        inline = cand[0].content.parts[0].inline_data
        if inline and inline.data:
            ext = mimetypes.guess_extension(inline.mime_type) or ".png"
            outpath = os.path.join(OUTPUT_FOLDER, f"enhanced_{i}{ext}")
            save_image(inline.data, outpath)

if __name__ == "__main__":
    enhance_image()
