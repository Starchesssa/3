
import cv2
import numpy as np
import os

# ===============================
# CONFIGURATION
# ===============================
image_path = "public/1.jpg"
depth_path = "public/1.png"
output_dir = "output_videos"
os.makedirs(output_dir, exist_ok=True)

FPS = 30
DURATION_SEC = 8  # 8 seconds is a good loop time
NUM_FRAMES = FPS * DURATION_SEC

# ===============================
# SETUP
# ===============================
print("⚡ Initializing Pro-FX Engine...")

img = cv2.imread(image_path)
depth_raw = cv2.imread(depth_path, cv2.IMREAD_GRAYSCALE)

if img is None or depth_raw is None:
    print("❌ Error: Missing files.")
    quit()

h, w = img.shape[:2]
depth_raw = cv2.resize(depth_raw, (w, h))
depth_norm = depth_raw.astype(np.float32) / 255.0

# Pre-generate noise for Film Grain (Optimization)
noise_overlay = np.random.normal(0, 15, (h, w, 3)).astype(np.uint8)

# ===============================
# UTILITIES
# ===============================

def ease_in_out_cubic(t):
    return 4 * t * t * t if t < 0.5 else 1 - pow(-2 * t + 2, 3) / 2

def add_film_grain(image):
    """Adds cinematic noise to make it look less digital."""
    # Generate random noise per frame for "alive" look
    noise = np.random.normal(0, 8, image.shape).astype(np.int16) # Strength 8
    noisy_img = image.astype(np.int16) + noise
    return np.clip(noisy_img, 0, 255).astype(np.uint8)

def inpaint_edges(warped_img):
    """
    Detects black edges caused by warping and fills them 
    using 'Telea' inpainting (similar to Photoshop Content-Aware).
    """
    # 1. Convert to gray to find black spots
    gray = cv2.cvtColor(warped_img, cv2.COLOR_BGR2GRAY)
    
    # 2. Create mask: pixels that are essentially black (0)
    # We use a threshold of 1 in case of compression noise
    _, mask = cv2.threshold(gray, 1, 255, cv2.THRESH_BINARY_INV)
    
    # Check if we have holes to fill
    if cv2.countNonZero(mask) > 0:
        # 3. Inpaint (Radius 3 pixels)
        # INPAINT_TELEA is faster, INPAINT_NS is smoother.
        fixed = cv2.inpaint(warped_img, mask, 3, cv2.INPAINT_TELEA)
        return fixed
    return warped_img

# ===============================
# THE PRO WARP ENGINE (RGB SPLIT)
# ===============================
def generate_rgb_split_frame(mx, my, zoom):
    """
    Warps R, G, and B channels separately to create Chromatic Aberration.
    Also handles zooming and inpainting.
    """
    
    # 1. SPLIT CHANNELS
    b_ch, g_ch, r_ch = cv2.split(img)
    
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    
    # 2. DEFINE DISPLACEMENT FOR EACH COLOR
    # Red moves slightly more, Blue slightly less -> 3D Glasses effect
    def get_map(channel_shift_x, channel_shift_y):
        map_x = (grid_x - (depth_norm * channel_shift_x)).astype(np.float32)
        map_y = (grid_y - (depth_norm * channel_shift_y)).astype(np.float32)
        return map_x, map_y

    # Red Channel: 100% Strength
    rx, ry = get_map(mx * 1.0, my * 1.0)
    warped_r = cv2.remap(r_ch, rx, ry, cv2.INTER_LINEAR, cv2.BORDER_CONSTANT, borderValue=0)
    
    # Green Channel: 95% Strength
    gx, gy = get_map(mx * 0.95, my * 0.95)
    warped_g = cv2.remap(g_ch, gx, gy, cv2.INTER_LINEAR, cv2.BORDER_CONSTANT, borderValue=0)
    
    # Blue Channel: 90% Strength
    bx, by = get_map(mx * 0.90, my * 0.90)
    warped_b = cv2.remap(b_ch, bx, by, cv2.INTER_LINEAR, cv2.BORDER_CONSTANT, borderValue=0)
    
    # 3. MERGE CHANNELS
    merged = cv2.merge([warped_b, warped_g, warped_r])
    
    # 4. INPAINT HOLES
    # We fill the black gaps created by the warping
    inpainted = inpaint_edges(merged)
    
    # 5. ZOOM (Standard crop to frame it)
    if zoom > 1.0:
        cw, ch = int(w / zoom), int(h / zoom)
        cx, cy = w // 2, h // 2
        crop = inpainted[cy - ch//2 : cy + ch//2, cx - cw//2 : cx + cw//2]
        final = cv2.resize(crop, (w, h), interpolation=cv2.INTER_LINEAR)
    else:
        final = inpainted
        
    # 6. ADD FILM GRAIN
    final = add_film_grain(final)
    
    return final

# ===============================
# STYLES
# ===============================

# STYLE 1: "The 3D Glitch"
# Fast, aggressive movement with RGB splitting. 
# Looks like a high-end music video.
def style_glitch_3d(p, i):
    # Easing
    t = ease_in_out_cubic(p)
    
    # Loop the motion: Go Left -> Right -> Left
    # Use Sine for smooth oscillation
    amplitude = 60 # Pixels
    shift_x = np.sin(p * 2 * np.pi) * amplitude
    
    # Slight Vertical Bob
    shift_y = np.cos(p * 2 * np.pi) * 10
    
    # Dynamic Zoom (Punch in on the beat)
    zoom = 1.05 + (np.sin(p * 2 * np.pi) * 0.05)
    
    return generate_rgb_split_frame(shift_x, shift_y, zoom)

# STYLE 2: "The Hitchcock Pulse"
# Deep Z-space warping.
def style_hitchcock(p, i):
    t = ease_in_out_cubic(p)
    
    # Zoom way in
    zoom = 1.0 + (t * 0.3)
    
    # Shift X based on depth (Perspective warp)
    shift_x = -(t * 40)
    
    return generate_rgb_split_frame(shift_x, 0, zoom)

# ===============================
# RENDER LOOP
# ===============================
def save_video(style_func, filename):
    path = os.path.join(output_dir, filename)
    print(f"🎬 Rendering {filename} (This may take longer due to Inpainting)...")
    
    out = cv2.VideoWriter(path, cv2.VideoWriter_fourcc(*'mp4v'), FPS, (w, h))
    
    for i in range(NUM_FRAMES):
        # Progress bar
        if i % 30 == 0: print(f"   Frame {i}/{NUM_FRAMES}")
        
        frame = style_func(i / NUM_FRAMES, i)
        out.write(frame)
        
    out.release()
    print(f"✅ Saved {path}")

# Run
save_video(style_glitch_3d, "1_Pro_RGB_Glitch.mp4")
save_video(style_hitchcock, "2_Pro_Hitchcock.mp4")

print(f"\n✨ DONE. Check '{output_dir}'. Note how the RGB split hides the fake 3D look!")
