
from transformers import pipeline
from PIL import Image
import torch
import os

# 1️⃣ Initialize the depth estimation model
pipe = pipeline(
    task="depth-estimation",
    model="depth-anything/Depth-Anything-V2-Small-hf",
    device="cpu"  # change to 0 if you have GPU
)

# 2️⃣ Define input and output directories
input_dir = "public"
output_dir = os.path.join(input_dir, "depth")

# Create output folder if not exists
os.makedirs(output_dir, exist_ok=True)

# 3️⃣ Loop through all .jpg and .jpeg images
for filename in os.listdir(input_dir):
    if filename.lower().endswith((".jpg", ".jpeg")):
        image_path = os.path.join(input_dir, filename)
        depth_path = os.path.join(output_dir, f"depth-{os.path.splitext(filename)[0]}.png")

        print(f"🖼️ Processing: {filename}")

        # Load image
        try:
            image = Image.open(image_path)
        except Exception as e:
            print(f"❌ Failed to open {filename}: {e}")
            continue

        # Run inference
        try:
            result = pipe(image)
            depth = result["depth"]
            depth.save(depth_path)
            print(f"✅ Saved depth map at: {depth_path}")
        except Exception as e:
            print(f"⚠️ Error processing {filename}: {e}")

print("🎉 All images processed successfully!")
