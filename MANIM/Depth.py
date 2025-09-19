
import requests
import torch
import cv2
import numpy as np
from pathlib import Path
from depthflow.pipeline import DepthFlowPipeline

# ========== Step 1: Fetch image from Pollinations AI ==========
prompt = "beautiful beach sunset"  # <-- change this prompt!
print(f"[1] Fetching image from Pollinations AI with prompt: '{prompt}'")

# Build Pollinations API URL
url = f"https://image.pollinations.ai/prompt/{prompt.replace(' ', '%20')}"

# Download image
img_path = Path("input_image.jpg")
response = requests.get(url, stream=True)
if response.status_code == 200:
    with open(img_path, "wb") as f:
        for chunk in response.iter_content(1024):
            f.write(chunk)
    print(f"Downloaded image saved as {img_path}")
else:
    raise Exception(f"Failed to fetch image: {response.status_code}")

# ========== Step 2: Load MiDaS depth estimation model ==========
print("[2] Loading MiDaS depth estimation model (CPU mode)...")
midas = torch.hub.load("intel-isl/MiDaS", "DPT_Hybrid")  # smaller model = faster
midas.to("cpu")
midas.eval()

transform = torch.hub.load("intel-isl/MiDaS", "transforms").dpt_transform

# ========== Step 3: Estimate depth ==========
print("[3] Estimating depth map...")
img = cv2.imread(str(img_path))
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
input_batch = transform(img_rgb).unsqueeze(0)

with torch.no_grad():
    prediction = midas(input_batch)
    depth_map = prediction.squeeze().cpu().numpy()

# Normalize for visualization
depth_min, depth_max = depth_map.min(), depth_map.max()
depth_vis = (255 * (depth_map - depth_min) / (depth_max - depth_min)).astype("uint8")
cv2.imwrite("depth_map.png", depth_vis)
print("Depth map saved as depth_map.png")

# ========== Step 4: Run DepthFlow ==========
print("[4] Running DepthFlow to create parallax video...")

pipeline = DepthFlowPipeline(
    image_path=str(img_path),
    depth_path="depth_map.png",   # use our estimated depth
    output_path="output_video.mp4",
    steps=100,                    # number of frames (~4s @ 24fps)
    fps=24,                       # frames per second
    resolution=(720, 720),        # output resolution
    device="cpu"                  # force CPU
)

pipeline.run()
print("Video generated: output_video.mp4")

# ========== Step 5: Finish ==========
print("✅ Done! You now have:")
print("- Original input image (input_image.jpg)")
print("- Depth map visualization (depth_map.png)")
print("- Final parallax video (output_video.mp4)")
