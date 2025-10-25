
import cv2
import numpy as np

# --- CONFIG ---
VIDEO_SIZE = (1280, 720)
VIDEO_DURATION = 5
VIDEO_FPS = 30
OUTPUT_FILENAME = "BOOK_CODE/PARALLAX/output_cv2_parallax.mp4"
SOURCE_IMAGE = "BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg"
NUM_SLICES = 4          # number of circular slices
MAX_OFFSET = 0.2
MAX_ZOOM = 0.4

# --- LOAD IMAGE ---
img = cv2.imread(SOURCE_IMAGE)
if img is None:
    raise FileNotFoundError(SOURCE_IMAGE)

img = cv2.resize(img, VIDEO_SIZE)
h, w, _ = img.shape
center = np.array([w//2, h//2])
max_radius = np.linalg.norm(center)

# --- CREATE CIRCULAR MASKS ---
slices = []
radii = np.linspace(0, max_radius, NUM_SLICES+1)  # divide into NUM_SLICES layers

for i in range(NUM_SLICES):
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.circle(mask, tuple(center.astype(int)), int(radii[i+1]), 255, -1)
    if i > 0:
        cv2.circle(mask, tuple(center.astype(int)), int(radii[i]), 255, -1)
        mask = cv2.subtract(mask, mask) + cv2.bitwise_not(cv2.bitwise_not(mask))
        mask = cv2.subtract(mask, cv2.bitwise_not(mask))
        mask = cv2.subtract(mask, cv2.circle(np.zeros_like(mask), tuple(center.astype(int)), int(radii[i]), 255, -1))
    slices.append(cv2.bitwise_and(img, img, mask=mask))

# --- VIDEO WRITER ---
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(OUTPUT_FILENAME, fourcc, VIDEO_FPS, (w, h))
total_frames = int(VIDEO_DURATION * VIDEO_FPS)

print("Rendering circular parallax animation...")

# --- ANIMATION LOOP ---
for f in range(total_frames):
    t = f / total_frames
    frame = np.zeros_like(img)

    for idx, sl in enumerate(slices):
        offset = MAX_OFFSET * (idx+1) * w * t
        zoom = 1 + MAX_ZOOM * (1 - idx/NUM_SLICES) * t

        new_w = int(sl.shape[1] * zoom)
        new_h = int(sl.shape[0] * zoom)
        resized = cv2.resize(sl, (new_w, new_h))

        # center the slice
        x = int(center[0] - new_w/2 + offset)
        y = int(center[1] - new_h/2 + offset/2)

        x1, y1 = max(0, x), max(0, y)
        x2 = min(w, x + new_w)
        y2 = min(h, y + new_h)

        sub_img = resized[0:y2 - y1, 0:x2 - x1]
        frame[y1:y2, x1:x2] = sub_img

    out.write(frame)

out.release()
print(f"✅ Circular parallax video saved: {OUTPUT_FILENAME}")
