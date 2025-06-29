
import os
import base64
import mimetypes
from google import genai
from google.genai import types

# Configuration
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
config = types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"])

def load_image(path):
    return base64.b64encode(open(path, "rb").read()).decode("utf-8")

def save_image(data: bytes, filename: str):
    with open(filename, "wb") as f:
        f.write(data)
    print(f"✅ Saved: {filename}")

def enhance_image():
    img_b64 = load_image(INPUT_IMAGE)
    contents = [
        types.Content(role="user", parts=[
            types.Part.from_bytes(mime_type="image/jpeg", data=base64.b64decode(img_b64)),
            types.Part.from_text(text=PROMPT)
        ])
    ]

    response = client.models.generate_content(model=model, contents=contents, config=config)
    for i, part in enumerate(response.candidates[0].content.parts):
        if part.inline_data:
            ext = mimetypes.guess_extension(part.inline_data.mime_type) or ".png"
            save_image(part.inline_data.data, os.path.join(OUTPUT_FOLDER, f"enhanced_{i}{ext}"))

if __name__ == "__main__":
    enhance_image()
