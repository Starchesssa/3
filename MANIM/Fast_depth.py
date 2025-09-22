import torch
import cv2
import numpy as np
from torchvision.transforms import Compose, Resize, ToTensor, Normalize

# --- 1. Load MiDaS model (lightweight) ---
model_type = "MiDaS_small"  # Lightweight version
midas = torch.hub.load("intel-isl/MiDaS", model_type)
midas.eval()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
midas.to(device)

# --- 2. Load input image ---
img_path = "assets/images/amazon_box_foreground.png"
img = cv2.imread(img_path)
if img is None:
    raise FileNotFoundError(f"Image not found: {img_path}")
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
h, w, _ = img.shape

# --- 3. Preprocess ---
transform = Compose([
    Resize(256),  # MiDaS_small input
    ToTensor(),
    Normalize(mean=[0.485, 0.456, 0.406],
              std=[0.229, 0.224, 0.225]),
])
input_tensor = transform(img_rgb).unsqueeze(0).to(device)

# --- 4. Predict depth ---
with torch.no_grad():
    depth = midas(input_tensor)
    depth = torch.nn.functional.interpolate(
        depth.unsqueeze(1),
        size=(h, w),
        mode="bilinear",
        align_corners=False
    ).squeeze().cpu().numpy()

# --- 5. Normalize and save depth map ---
depth_norm = cv2.normalize(depth, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
output_path = "assets/images/amazon_box_depth.png"
cv2.imwrite(output_path, depth_norm)

print(f"Depth map saved as {output_path}")
