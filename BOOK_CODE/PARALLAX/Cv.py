
import cv2
import numpy as np
import os

# ---------- Configuration ----------
img_dir = "public/"  # Input images folder
out_dir = os.path.join(img_dir, "stylized")  # Output folder
os.makedirs(out_dir, exist_ok=True)

# Modern strict palette: only these colors will appear
palette = np.array([
    [255, 209, 102],  # Warm Yellow / Gold
    [245, 245, 245],  # Soft Silver / White
    [10, 10, 10]      # Deep Black
], dtype=np.uint8)

# List of images to process
images = [
    "copilot_image_1751920705398.jpeg",
    "image (1).webp",
    "images (37).jpeg",
    "images (38).jpeg",
    "then-the-crash-begins-billions-of-dollars-vanish-in-days-companies-that-were-worth-millions-becom (1).jpg"
]

# ---------- Cartoonization Functions ----------
def cartoonize_classic(img):
    """Classic cartoon style: smooth colors + strong edges"""
    color = cv2.bilateralFilter(img, d=9, sigmaColor=200, sigmaSpace=200)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.adaptiveThreshold(cv2.medianBlur(gray,5),255,
                                  cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY,9,9)
    cartoon = cv2.bitwise_and(color, color, mask=edges)
    return cartoon

def cartoonize_sketch(img):
    """Sketchy hand-drawn style"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    inv = 255 - gray
    blur = cv2.GaussianBlur(inv, (21,21), 0)
    sketch = cv2.divide(gray, 255 - blur, scale=256)
    return cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR)

def cartoonize_painterly(img):
    """Soft painterly style"""
    color = cv2.edgePreservingFilter(img, flags=1, sigma_s=60, sigma_r=0.4)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray,100,200)
    edges_colored = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    painterly = cv2.subtract(color, edges_colored // 3)
    return painterly

def cartoonize_posterized_strict(img, palette):
    """
    Posterized style: strictly only colors from palette
    """
    Z = img.reshape((-1, 3)).astype(np.int32)
    distances = np.linalg.norm(Z[:, None, :] - palette[None, :, :], axis=2)
    nearest_idx = np.argmin(distances, axis=1)
    strict_img = palette[nearest_idx].reshape(img.shape).astype(np.uint8)
    return strict_img

def cartoonize_posterized_with_edges(img, palette):
    """Posterized with strict palette + black edges"""
    strict = cartoonize_posterized_strict(img, palette)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.adaptiveThreshold(cv2.medianBlur(gray,5),255,
                                  cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY,9,9)
    edges_colored = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    # Force edges to black
    strict[edges_colored == 0] = [0,0,0]
    return strict

# ---------- Process Images ----------
for fname in images:
    path = os.path.join(img_dir, fname)
    img = cv2.imread(path)
    if img is None:
        print(f"⚠️ Could not load {fname}, skipping")
        continue

    base_name, ext = os.path.splitext(fname)
    
    # 1️⃣ Classic
    classic = cartoonize_classic(img)
    cv2.imwrite(os.path.join(out_dir, f"{base_name}_classic.png"), classic)
    
    # 2️⃣ Sketch
    sketch = cartoonize_sketch(img)
    cv2.imwrite(os.path.join(out_dir, f"{base_name}_sketch.png"), sketch)
    
    # 3️⃣ Posterized (strict palette + edges)
    poster = cartoonize_posterized_with_edges(img, palette)
    cv2.imwrite(os.path.join(out_dir, f"{base_name}_poster.png"), poster)
    
    # 4️⃣ Painterly
    painterly = cartoonize_painterly(img)
    cv2.imwrite(os.path.join(out_dir, f"{base_name}_painterly.png"), painterly)
    
    print(f"✅ Processed {fname}")

print(f"🎨 All images processed! Check the folder: {out_dir}")
