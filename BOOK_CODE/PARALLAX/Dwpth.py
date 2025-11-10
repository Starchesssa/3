from transformers import pipeline
from PIL import Image
import torch

# 1️⃣ Load the pipeline
# Using small version for low resource usage
pipe = pipeline(
    task="depth-estimation",
    model="depth-anything/Depth-Anything-V2-Small-hf",
    device="cpu"  # change to 0 if GPU is available
)

# 2️⃣ Load your local image
image_path = "BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg"
image = Image.open(image_path)

# 3️⃣ Run depth inference
print("Generating depth map... please wait.")
result = pipe(image)
depth = result["depth"]

# 4️⃣ Save the depth map as an image
depth_output_path = "BOOK_CODE/PARALLAX/depth-map-new-york.png"
depth.save(depth_output_path)

print(f"✅ Depth map saved at: {depth_output_path}")
