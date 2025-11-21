
import cv2
import numpy as np
import os

# ---------- Directories ----------
img_dir = "public/IMG"
out_dir = "public/IMG_style"
os.makedirs(out_dir, exist_ok=True)

# File types to process
valid_ext = (".jpg", ".jpeg", ".png", ".webp")

# ============================================================
# 🔥 1. VECTOR POSTERIZATION (8-color)
# ============================================================
def vector_posterize(img, k=8):
    Z = img.reshape((-1,3))
    Z = np.float32(Z)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 25, 1)
    _, label, center = cv2.kmeans(
        Z, k, None, criteria, 12, cv2.KMEANS_PP_CENTERS
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

    b = cv2.add(b, 25)
    g = cv2.subtract(g, 10)
    r = cv2.subtract(r, 25)

    r = cv2.add(r, 40)
    g = cv2.add(g, 25)

    return cv2.merge((b, g, r))

# ============================================================
# 🔥 3. EDGE GLOW (Futuristic Outline)
# ============================================================
def edge_glow(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 80, 160)
    edges = cv2.GaussianBlur(edges, (7,7), 0)

    glow = cv2.applyColorMap(edges, cv2.COLORMAP_TWILIGHT)
    glow = cv2.GaussianBlur(glow, (9,9), 0)

    return cv2.addWeighted(img, 1.0, glow, 0.25, 0)

# ============================================================
# 🔥 4. CLARITY BOOST
# ============================================================
def clarity_boost(img):
    blur = cv2.GaussianBlur(img, (0,0), 3)
    return cv2.addWeighted(img, 1.8, blur, -0.8, 0)

# ============================================================
# 🔥 5. BLOOM EFFECT
# ============================================================
def bloom(img):
    blur = cv2.GaussianBlur(img, (25,25), 0)
    return cv2.addWeighted(img, 1.0, blur, 0.2, 0)

# ============================================================
# 🔥 FULL STYLE PIPELINE
# ============================================================
def cool_style(img):
    poster = vector_posterize(img, k=8)
    graded = gold_blue_grade(poster)
    glow = edge_glow(graded)
    clarity = clarity_boost(glow)
    final = bloom(clarity)
    return final

# ============================================================
# 🔥 PROCESS ALL IMAGES IN DIRECTORY
# ============================================================
files = [f for f in os.listdir(img_dir) if f.lower().endswith(valid_ext)]

if not files:
    print("⚠️ No images found in public/IMG/")
else:
    print(f"📸 Found {len(files)} images. Processing...")

for fname in files:
    input_path = os.path.join(img_dir, fname)
    img = cv2.imread(input_path)

    if img is None:
        print(f"⚠️ Could not read: {fname}")
        continue

    print(f"🎨 Processing: {fname}")

    styled = cool_style(img)

    base, _ = os.path.splitext(fname)
    output_path = os.path.join(out_dir, f"{base}_style.png")
    cv2.imwrite(output_path, styled)

    print(f"✅ Saved → {output_path}")

print("\n🚀 DONE! Check your folder:")
print(out_dir)
