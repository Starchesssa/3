import cv2
import numpy as np
import os
import random

# ===============================
# CONFIGURATION
# ===============================
image_path = "public/1.jpg"
depth_path = "public/1.png"
output_dir = "output_videos"
os.makedirs(output_dir, exist_ok=True)

FPS = 30
DURATION_SEC = 10  # Reduced to 10s per style for better pacing
NUM_FRAMES = FPS * DURATION_SEC

# Load Images
img = cv2.imread(image_path)
depth_raw = cv2.imread(depth_path, cv2.IMREAD_GRAYSCALE)

if img is None or depth_raw is None:
    print("❌ Error: Could not find image or depth map.")
    quit()

# Resize depth to match image
h, w = img.shape[:2]
depth_raw = cv2.resize(depth_raw, (w, h))

# Normalize depth (0.0 = Far, 1.0 = Near)
# We invert if necessary (Standard: White=Near, Black=Far)
depth_norm = depth_raw.astype(np.float32) / 255.0

# Pre-calculate a blurred version of the image for Depth of Field effects
img_blurred = cv2.GaussianBlur(img, (21, 21), 0)

# ===============================
# UTILITIES: EASING & FX
# ===============================

def ease_in_out_sine(t):
    """Smooths motion: Slow start -> Fast middle -> Slow end"""
    return -(np.cos(np.pi * t) - 1) / 2

def apply_depth_of_field(curr_img, curr_depth, focus_depth, intensity=1.0):
    """
    Simulates a camera lens. Areas far from 'focus_depth' get blurry.
    """
    # Calculate distance from focus plane
    diff = np.abs(curr_depth - focus_depth)
    
    # Create mask: 0 = sharp, 1 = blur
    # We steepen the curve to make the focus plane distinct
    blur_mask = np.clip(diff * 3.5 * intensity, 0, 1)
    
    # Expand dims for 3 channels
    blur_mask = np.dstack([blur_mask]*3)
    
    # Blend sharp image and pre-blurred image
    # result = sharp * (1-mask) + blur * mask
    final = (curr_img * (1.0 - blur_mask) + img_blurred * blur_mask).astype(np.uint8)
    return final

def apply_vignette(curr_img):
    """Adds subtle darkness to corners to frame the shot."""
    Y, X = np.ogrid[:h, :w]
    center_y, center_x = h / 2, w / 2
    dist_from_center = np.sqrt((X - center_x)**2 + (Y - center_y)**2)
    
    # Create gradient mask
    mask = 1 - (dist_from_center / (np.sqrt(h**2 + w**2)/1.2))
    mask = np.clip(mask, 0, 1)
    mask = np.dstack([mask]*3)
    
    return (curr_img * mask).astype(np.uint8)

def overlay_particles(curr_img, frame_idx, shift_x, shift_y):
    """Adds floating dust particles for parallax depth cue."""
    overlay = curr_img.copy()
    np.random.seed(42) # Consistent random
    
    # Generate 50 particles
    for p in range(50):
        # Random start pos
        px = np.random.randint(0, w)
        py = np.random.randint(0, h)
        p_depth = np.random.rand() # 0 to 1
        
        # Move particles based on camera shift (Parallax)
        # Closer particles (high p_depth) move more than background
        move_x = int(shift_x * p_depth * 100) 
        move_y = int(shift_y * p_depth * 100)
        
        # Drift over time
        drift_x = int(frame_idx * (p_depth * 2 - 1))
        
        final_x = (px + move_x + drift_x) % w
        final_y = (py + move_y) % h
        
        # Draw particle (white dot with varying opacity)
        cv2.circle(overlay, (final_x, final_y), int(p_depth*3), (255, 255, 255), -1)
        
    # Blend particles lightly
    return cv2.addWeighted(curr_img, 0.8, overlay, 0.2, 0)

# ===============================
# CORE WARPING ENGINE
# ===============================
def generate_frame(mx, my, zoom, focus_pt):
    """
    mx, my: Movement amplitude in X and Y
    zoom: Scalar (e.g., 1.0 to 1.1)
    focus_pt: 0.0 (far) to 1.0 (near)
    """
    
    # 1. DISPLACEMENT (PARALLAX)
    # We create a grid
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    
    # Shift pixels based on depth. 
    # Near pixels (1.0) shift MORE than far pixels (0.0).
    disp_x = (depth_norm) * mx
    disp_y = (depth_norm) * my
    
    map_x = (grid_x - disp_x).astype(np.float32)
    map_y = (grid_y - disp_y).astype(np.float32)
    
    # Remap generates the warped image
    warped = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR, cv2.BORDER_REFLECT)
    warped_depth = cv2.remap(depth_norm, map_x, map_y, cv2.INTER_LINEAR, cv2.BORDER_REFLECT)

    # 2. ZOOM CROP
    cw, ch = int(w / zoom), int(h / zoom)
    cx, cy = w // 2, h // 2
    
    # Crop center
    crop_img = warped[cy - ch//2 : cy + ch//2, cx - cw//2 : cx + cw//2]
    crop_depth = warped_depth[cy - ch//2 : cy + ch//2, cx - cw//2 : cx + cw//2]
    
    # Resize back to original
    final_img = cv2.resize(crop_img, (w, h), interpolation=cv2.INTER_LINEAR)
    final_depth = cv2.resize(crop_depth, (w, h), interpolation=cv2.INTER_LINEAR)

    # 3. APPLY DEPTH OF FIELD
    final_img = apply_depth_of_field(final_img, final_depth, focus_pt)
    
    # 4. APPLY VIGNETTE
    final_img = apply_vignette(final_img)

    return final_img

# ===============================
# VIDEO SAVER
# ===============================
def save_video(generator_func, filename):
    path = os.path.join(output_dir, filename)
    out = cv2.VideoWriter(path, cv2.VideoWriter_fourcc(*'mp4v'), FPS, (w, h))
    print(f"🎬 Rendering {filename}...")
    
    for i in range(NUM_FRAMES):
        progress = i / NUM_FRAMES # 0.0 to 1.0
        frame = generator_func(progress, i)
        out.write(frame)
        
    out.release()
    print(f"✅ Finished {path}")

# ===============================
# STYLE DEFINITIONS
# ===============================

# 1. THE "CINEMATIC PUSH"
# Slow dolly in, Focus shifts from Foreground to Background
def style_cinematic_push(p, i):
    # Easing
    smooth_p = ease_in_out_sine(p)
    
    # Movement
    zoom = 1.0 + (smooth_p * 0.15) # Zoom in 15%
    shift_x = np.sin(p * np.pi) * 10 # Subtle arc x
    
    # Focus Pull: Starts at near (1.0), goes to far (0.2)
    focus = 1.0 - (smooth_p * 0.8)
    
    frame = generate_frame(shift_x, 0, zoom, focus)
    return frame

# 2. THE "VERTIGO" (Dolly Zoom)
# Zoom IN, but Warp OUT (or vice versa). Makes background expand.
def style_vertigo(p, i):
    smooth_p = ease_in_out_sine(p)
    
    # Zoom increases
    zoom = 1.0 + (smooth_p * 0.3)
    
    # Perspective shifts inversely (simulating moving camera back)
    # We shift X heavily based on depth to stretch perspective
    mx = (smooth_p * -40) 
    
    # Keep focus purely on the subject (assumed near 0.8 depth)
    focus = 0.8
    
    frame = generate_frame(mx, 0, zoom, focus)
    return frame

# 3. HANDHELD ATMOSPHERE
# Adds particles and "breathes" (subtle movement)
def style_handheld(p, i):
    # Oscillate gently
    mx = np.sin(p * 2 * np.pi) * 15
    my = np.cos(p * 4 * np.pi) * 10
    
    zoom = 1.05 + np.sin(p * 2 * np.pi) * 0.02
    
    # Focus hunts slightly
    focus = 0.7 + np.sin(p * 10) * 0.1
    
    frame = generate_frame(mx, my, zoom, focus)
    
    # Add Particles on top
    frame = overlay_particles(frame, i, mx/w, my/h)
    return frame

# ===============================
# RUN
# ===============================
save_video(style_cinematic_push, "1_Cinematic_Push.mp4")
save_video(style_vertigo, "2_Vertigo_Effect.mp4")
save_video(style_handheld, "3_Handheld_Particles.mp4")

print("✨ All cinematic videos generated!")
