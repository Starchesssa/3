
import cv2
import torch
import numpy as np
import matplotlib.pyplot as plt
from torchvision import transforms
from fastdepth import FastDepth  # Make sure you have a FastDepth implementation

# -----------------------------
# 1. Load your image
# -----------------------------
img_path = "assets/images/amazon_box_foreground.png"
img = cv2.imread(img_path)
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
h, w, _ = img.shape

# -----------------------------
# 2. Preprocess for FastDepth
# -----------------------------
# Resize and normalize as required by FastDepth
input_size = (224, 224)  # FastDepth default input
img_resized = cv2.resize(img_rgb, input_size)
img_tensor = transforms.ToTensor()(img_resized).unsqueeze(0)  # 1x3xHxW

# -----------------------------
# 3. Load FastDepth Model
# -----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = FastDepth(backbone="mobilenet")  # Lightweight version
model.to(device)
model.eval()

# -----------------------------
# 4. Predict depth
# -----------------------------
with torch.no_grad():
    depth_pred = model(img_tensor.to(device))
    depth_pred = torch.nn.functional.interpolate(
        depth_pred.unsqueeze(1),
        size=(h, w),
        mode="bilinear",
        align_corners=False
    ).squeeze().cpu().numpy()

# -----------------------------
# 5. Normalize and visualize depth
# -----------------------------
depth_normalized = cv2.normalize(depth_pred, None, 0, 255, cv2.NORM_MINMAX)
depth_normalized = depth_normalized.astype(np.uint8)

plt.figure(figsize=(10,5))
plt.subplot(1,2,1)
plt.imshow(img_rgb)
plt.title("Original Image")
plt.axis("off")

plt.subplot(1,2,2)
plt.imshow(depth_normalized, cmap="plasma")
plt.title("Predicted Depth Map")
plt.axis("off")
plt.show()

# Save depth map
cv2.imwrite("assets/images/amazon_box_depth.png", depth_normalized)
print("Depth map saved as amazon_box_depth.png")
