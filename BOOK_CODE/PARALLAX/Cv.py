import cv2
import numpy as np
import os

# ---------- Configuration ----------
img_dir = "public/"
out_dir = os.path.join(img_dir, "stylized")
os.makedirs(out_dir, exist_ok=True)

# ======= TWO-COLOR PALETTE =======
palette = np.array([
    [255, 180, 0],  # Yellowish Orange
    [0, 0, 0],      # Black
], dtype=np.uint8)

# List of images to process
images = [
    "copilot_image_1751920705398.jpeg",
    "image (1).webp",
    "images (37).jpeg",
    "images (38).jpeg",
    "then-the-crash-begins-billions-of-dollars-vanish-in-days-companies-that-were-worth-millions-becom (1).jpg"
]

# ---------- Utility Functions ----------

def smooth_edges(img, sigma_s=60, sigma_r=0.4):
    """Make everything curvy using edge-preserving filter"""
    return cv2.edgePreservingFilter(img, flags=1, sigma_s=sigma_s, sigma_r=sigma_r)

def quantize_colors(img, palette):
    """Force image to ONLY 2 colors"""
    Z = img.reshape((-1,3)).astype(np.float32)
    distances = np.linalg.norm(Z[:,None,:] - palette[None,:,:], axis=2)
    nearest_idx = np.argmin(distances, axis=1)
    res = palette[nearest_idx].reshape(img.shape)
    return res.astype(np.uint8)

def add_soft_edges(img):
    """Add subtle soft outlines"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (7,7), 0)
    edges = cv2.Canny(blur, 50, 150)
    edges = cv2.dilate(edges, np.ones((3,3), np.uint8))
    edges = cv2.GaussianBlur(edges, (5,5), 0)
    edges_colored = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    return cv2.subtract(img, edges_colored // 3)

def two_color_style(img, palette):
    """Full 2-color transformation"""
    img_curvy = smooth_edges(img)
    img_two = quantize_colors(img_curvy, palette)
    img_final = add_soft_edges(img_two)
    return img_final

# ---------- Process Images ----------
for fname in images:
    path = os.path.join(img_dir, fname)
    img = cv2.imread(path)
    if img is None:
        print(f"⚠️ Could not load {fname}, skipping")
        continue

    base_name, ext = os.path.splitext(fname)

    # Apply 2-color conversion
    result = two_color_style(img, palette)
    cv2.imwrite(os.path.join(out_dir, f"{base_name}_2color.png"), result)

    print(f"✅ Processed {fname}")

print(f"🎨 All images processed! Check the folder: {out_dir}")
