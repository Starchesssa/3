import cv2
import numpy as np
import os

# ===============================
# CONFIGURATION
# ===============================
pairs = [
    {"image": "public/1.jpg", "depth": "public/1.png"},
    {"image": "public/2.jpg", "depth": "public/2.png"},
    {"image": "public/3.jpg", "depth": "public/3.png"},
    {"image": "public/4.jpeg", "depth": "public/4.png"},
    {"image": "public/5.jpeg", "depth": "public/5.png"},
    {"image": "public/6.jpeg", "depth": "public/6.png"},
]

output_dir = "output_videos"
os.makedirs(output_dir, exist_ok=True)

# ===============================
# FUNCTION: Animate One Image
# ===============================
def animate_depth(image_path, depth_path, output_path, num_frames=90):
    print(f"🎬 Processing {image_path} + {depth_path}")

    # Load image and depth map
    img = cv2.imread(image_path)
    depth = cv2.imread(depth_path, cv2.IMREAD_GRAYSCALE)

    if img is None or depth is None:
        print(f"⚠️ Skipping {image_path} — missing image or depth map.")
        return

    # Resize depth to match image
    depth = cv2.resize(depth, (img.shape[1], img.shape[0]))

    # Smooth and normalize depth
    depth = cv2.GaussianBlur(depth, (25, 25), 0)
    depth = depth.astype(np.float32) / 255.0

    h, w = img.shape[:2]
    frames = []

    # Generate animation frames
    for i in range(num_frames):
        # oscillate camera motion left-right and zoom
        angle = (i / num_frames) * 2 * np.pi
        shift_x = np.sin(angle) * 0.05  # left-right motion
        shift_y = np.cos(angle) * 0.03  # up-down motion
        zoom = 1 + 0.1 * np.sin(angle / 2)  # smooth zoom in-out

        # build coordinate maps
        map_x, map_y = np.meshgrid(np.arange(w), np.arange(h))
        depth_offset_x = (depth - 0.5) * shift_x * w
        depth_offset_y = (depth - 0.5) * shift_y * h
        map_x = (map_x + depth_offset_x).astype(np.float32)
        map_y = (map_y + depth_offset_y).astype(np.float32)

        # warp the image
        warped = cv2.remap(img, map_x, map_y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

        # zoom (crop and resize)
        center_x, center_y = w // 2, h // 2
        zoom_w, zoom_h = int(w / zoom), int(h / zoom)
        x1, y1 = center_x - zoom_w // 2, center_y - zoom_h // 2
        x2, y2 = x1 + zoom_w, y1 + zoom_h
        cropped = warped[max(y1, 0):min(y2, h), max(x1, 0):min(x2, w)]
        frame = cv2.resize(cropped, (w, h))

        frames.append(frame)

    # Save as video
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), 30, (w, h))
    for f in frames:
        out.write(f)
    out.release()

    print(f"✅ Saved {output_path}")

# ===============================
# MAIN LOOP
# ===============================
for idx, p in enumerate(pairs, 1):
    out_file = os.path.join(output_dir, f"anim_{idx}.mp4")
    animate_depth(p["image"], p["depth"], out_file)

print("🎉 All animations done! Check the 'output_videos' folder.")
