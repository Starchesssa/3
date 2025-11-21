import cv2
import numpy as np
import os

# ---------- Configuration ----------
img_dir = "public/"
out_dir = os.path.join(img_dir, "stylized_cool")
os.makedirs(out_dir, exist_ok=True)

images = [
    "copilot_image_1751920705398.jpeg",
    "image (1).webp",
    "images (37).jpeg",
    "images (38).jpeg",
    "then-the-crash-begins-billions-of-dollars-vanish-in-days-companies-that-were-worth-millions-becom (1).jpg"
]

# ============================================================
# 🔥 1. VECTOR POSTERIZATION (8-color)
# ============================================================
def vector_posterize(img, k=8):
    Z = img.reshape((-1,3))
    Z = np.float32(Z)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 25, 1)
    K = k
    _, label, center = cv2.kmeans(
        Z, K, None, criteria, 12, cv2.KMEANS_PP_CENTERS
    )

    center = np.uint8(center)
    res = center[label.flatten()]
    poster = res.reshape(img.shape)
    return poster

# ============================================================
# 🔥 2. CINEMATIC BLUE–GOLD GRADING
# ============================================================
def gold_blue_grade(img):
    b, g, r = cv2.split(img)

    # Push shadows to teal/blue
    b = cv2.add(b, 25)
    g = cv2.subtract(g, 10)
    r = cv2.subtract(r, 25)

    # Push highlights to gold
    r = cv2.add(r, 40)
    g = cv2.add(g, 25)

    return cv2.merge((b, g, r))

# ============================================================
# 🔥 3. EDGE GLOW (Futuristic Highlight Outline)
# ============================================================
def edge_glow(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 80, 160)
    edges = cv2.GaussianBlur(edges, (7,7), 0)

    glow = cv2.applyColorMap(edges, cv2.COLORMAP_TWILIGHT)
    glow = cv2.GaussianBlur(glow, (9,9), 0)

    return cv2.addWeighted(img, 1.0, glow, 0.25, 0)

# ============================================================
# 🔥 4. CLARITY BOOST (High-Pass Filter)
# ============================================================
def clarity_boost(img):
    blur = cv2.GaussianBlur(img, (0,0), 3)
    sharp = cv2.addWeighted(img, 1.8, blur, -0.8, 0)
    return sharp

# ============================================================
# 🔥 5. BLOOM EFFECT (Subtle cinematic glow)
# ============================================================
def bloom(img):
    blur = cv2.GaussianBlur(img, (25,25), 0)
    return cv2.addWeighted(img, 1.0, blur, 0.2, 0)

# ============================================================
# 🔥 FULL PIPELINE: Vector + Grade + Glow + Clarity + Bloom
# ============================================================
def cool_style(img):
    # Step 1: Vector stylization
    poster = vector_posterize(img, k=8)

    # Step 2: Cinematic grading
    graded = gold_blue_grade(poster)

    # Step 3: Edge glow highlight
    glow = edge_glow(graded)

    # Step 4: Clarity
    clarity = clarity_boost(glow)

    # Step 5: Bloom
    final = bloom(clarity)

    return final

# ============================================================
# 🔥 PROCESS IMAGES
# ============================================================
for fname in images:
    path = os.path.join(img_dir, fname)
    img = cv2.imread(path)
    if img is None:
        print(f"⚠️ Could not load {fname}, skipping")
        continue

    print(f"🎨 Processing: {fname}")

    styled = cool_style(img)

    base, ext = os.path.splitext(fname)
    out_path = os.path.join(out_dir, f"{base}_COOL.png")
    cv2.imwrite(out_path, styled)

    print(f"✅ Saved: {out_path}")

print("\n🚀 ALL DONE! Check your cool stylized images in:")
print(out_dir)
