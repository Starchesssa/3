import requests
import torch
import cv2
import numpy as np
from pathlib import Path

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
midas = torch.hub.load("intel-isl/MiDaS", "DPT_Hybrid")
midas.to("cpu")
midas.eval()

# Load the transforms
transform = torch.hub.load("intel-isl/MiDaS", "transforms").dpt_transform

# ========== Step 3: Estimate depth ==========
print("[3] Estimating depth map...")
img = cv2.imread(str(img_path))
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# Apply transforms and add batch dimension
input_batch = transform(img_rgb).unsqueeze(0).to("cpu")

# Predict depth
with torch.no_grad():
    prediction = midas(input_batch)
    # Interpolate prediction to match original image size
    prediction_resized = torch.nn.functional.interpolate(
        prediction.unsqueeze(1),
        size=(img.shape[0], img.shape[1]),
        mode="bicubic",
        align_corners=False
    ).squeeze()

depth_map = prediction_resized.cpu().numpy()

# Normalize depth map for visualization
depth_min, depth_max = depth_map.min(), depth_map.max()
depth_vis = ((depth_map - depth_min) / (depth_max - depth_min) * 255).astype(np.uint8)

# Save grayscale depth map
cv2.imwrite("depth_map.png", depth_vis)
print("Depth map saved as depth_map.png")

# Optional: save colorized depth map
depth_color = cv2.applyColorMap(depth_vis, cv2.COLORMAP_JET)
cv2.imwrite("depth_map_color.png", depth_color)
print("Colorized depth map saved as depth_map_color.png")

# ========== Step 4: Finish ==========
print("✅ Done! You now have:")
print("- Original input image (input_image.jpg)")
print("- Grayscale depth map (depth_map.png)")
print("- Colorized depth map (depth_map_color.png)")
