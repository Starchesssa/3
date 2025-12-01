
import cv2
import numpy as np
import os

# ===============================
# CONFIGURATION — ONLY IMAGE 1
# ===============================
image_path = "public/1.jpg"
depth_path = "public/1.png"

output_dir = "output_videos"
os.makedirs(output_dir, exist_ok=True)

# 20 seconds × 30 FPS = 600 frames
NUM_FRAMES = 600

# ===============================
# LOAD IMAGE + DEPTH
# ===============================
img = cv2.imread(image_path)
depth = cv2.imread(depth_path, cv2.IMREAD_GRAYSCALE)

if img is None or depth is None:
    print("❌ Missing image or depth map!")
    quit()

depth = cv2.resize(depth, (img.shape[1], img.shape[0]))
depth = cv2.GaussianBlur(depth, (25, 25), 0)
depth = depth.astype(np.float32) / 255.0

h, w = img.shape[:2]

# ===============================
# VIDEO SAVER
# ===============================
def save_video(frames, name):
    path = os.path.join(output_dir, name)
    out = cv2.VideoWriter(path, cv2.VideoWriter_fourcc(*'mp4v'), 30, (w, h))
    for f in frames:
        out.write(f)
    out.release()
    print(f"✅ Saved {path}")

# ===============================
# STYLE 1 — KEN BURNS ZOOM
# ===============================
def style_kenburns(num_frames=NUM_FRAMES):
    frames = []
    for i in range(num_frames):
        zoom = 1 + (i / num_frames) * 0.2  # stronger zoom
        zoom_w = int(w / zoom)
        zoom_h = int(h / zoom)

        cx, cy = w // 2, h // 2
        x1 = cx - zoom_w // 2
        y1 = cy - zoom_h // 2
        x2 = x1 + zoom_w
        y2 = y1 + zoom_h

        crop = img[y1:y2, x1:x2]
        crop = cv2.resize(crop, (w, h))
        frames.append(crop)
    return frames

# ===============================
# STYLE 2 — PARALLAX DEPTH
# ===============================
def style_parallax(num_frames=NUM_FRAMES):
    frames = []
    for i in range(num_frames):
        angle = (i / num_frames) * 2 * np.pi * 3  # 3x faster oscillation
        shift_x = np.sin(angle) * 0.08
        shift_y = np.cos(angle) * 0.05
        zoom = 1 + 0.15 * np.sin(angle)  # stronger zoom

        map_x, map_y = np.meshgrid(np.arange(w), np.arange(h))
        map_x = (map_x + (depth - 0.5) * shift_x * w).astype(np.float32)
        map_y = (map_y + (depth - 0.5) * shift_y * h).astype(np.float32)

        warped = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR, cv2.BORDER_REFLECT)

        cx, cy = w // 2, h // 2
        zw = int(w / zoom)
        zh = int(h / zoom)
        crop = warped[cy-zh//2:cy+zh//2, cx-zw//2:cx+zw//2]
        crop = cv2.resize(crop, (w, h))
        frames.append(crop)
    return frames

# ===============================
# STYLE 3 — HORIZONTAL PARALLAX
# ===============================
def style_horizontal(num_frames=NUM_FRAMES):
    frames = []
    for i in range(num_frames):
        shift_x = np.sin((i / num_frames) * 2 * np.pi * 3) * 0.12  # faster + stronger
        map_x, map_y = np.meshgrid(np.arange(w), np.arange(h))
        map_x = (map_x + (depth - 0.5) * shift_x * w).astype(float)
        warped = cv2.remap(img, map_x.astype(np.float32), map_y.astype(np.float32),
                           cv2.INTER_LINEAR, cv2.BORDER_REFLECT)
        frames.append(warped)
    return frames

# ===============================
# STYLE 4 — VERTICAL PARALLAX
# ===============================
def style_vertical(num_frames=NUM_FRAMES):
    frames = []
    for i in range(num_frames):
        shift_y = np.cos((i / num_frames) * 2 * np.pi * 3) * 0.12
        map_x, map_y = np.meshgrid(np.arange(w), np.arange(h))
        map_y = (map_y + (depth - 0.5) * shift_y * h).astype(float)
        warped = cv2.remap(img, map_x.astype(np.float32), map_y.astype(np.float32),
                           cv2.INTER_LINEAR, cv2.BORDER_REFLECT)
        frames.append(warped)
    return frames

# ===============================
# STYLE 5 — CIRCULAR ORBIT
# ===============================
def style_orbit(num_frames=NUM_FRAMES):
    frames = []
    for i in range(num_frames):
        angle = (i / num_frames) * 2 * np.pi * 2.5  # slightly faster orbit
        shift_x = np.sin(angle) * 0.08
        shift_y = np.cos(angle) * 0.08

        map_x, map_y = np.meshgrid(np.arange(w), np.arange(h))
        map_x = (map_x + (depth - 0.5) * shift_x * w).astype(float)
        map_y = (map_y + (depth - 0.5) * shift_y * h).astype(float)

        warped = cv2.remap(img, map_x.astype(np.float32), map_y.astype(np.float32),
                           cv2.INTER_LINEAR, cv2.BORDER_REFLECT)
        frames.append(warped)
    return frames

# ===============================
# STYLE 6 — EXTREME ZOOM DEPTH
# ===============================
def style_extremezoom(num_frames=NUM_FRAMES):
    frames = []
    for i in range(num_frames):
        zoom = 1 + 0.35 * np.sin(i / 10)  # faster + stronger zoom
        zw = int(w / zoom)
        zh = int(h / zoom)

        cx, cy = w // 2, h // 2
        crop = img[cy-zh//2:cy+zh//2, cx-zw//2:cx+zw//2]
        crop = cv2.resize(crop, (w, h))

        shift_x = (depth - 0.5) * 0.07 * w
        shift_y = (depth - 0.5) * 0.07 * h

        map_x, map_y = np.meshgrid(np.arange(w), np.arange(h))
        warped = cv2.remap(crop, (map_x+shift_x).astype(np.float32),
                           (map_y+shift_y).astype(np.float32),
                           cv2.INTER_LINEAR, cv2.BORDER_REFLECT)

        frames.append(warped)
    return frames

# ===============================
# GENERATE ALL VIDEOS
# ===============================
save_video(style_kenburns(), "style1_kenburns.mp4")
save_video(style_parallax(), "style2_parallax.mp4")
save_video(style_horizontal(), "style3_horizontal.mp4")
save_video(style_vertical(), "style4_vertical.mp4")
save_video(style_orbit(), "style5_orbit.mp4")
save_video(style_extremezoom(), "style6_extremezoom.mp4")

print("🎉 All 20-second lively styles generated successfully!")
