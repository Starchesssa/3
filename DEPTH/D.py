import cv2
import numpy as np
import os

# ===============================
# CONFIGURATION
# ===============================
image_path = "public/1.jpg"
depth_path = "public/1.png"
output_dir = "output_clean_particles"
os.makedirs(output_dir, exist_ok=True)

FPS = 30
DURATION_SEC = 10
NUM_FRAMES = FPS * DURATION_SEC

# Load Images
img = cv2.imread(image_path)
depth_raw = cv2.imread(depth_path, cv2.IMREAD_GRAYSCALE)

if img is None or depth_raw is None:
    print("❌ Error: Could not find image or depth map.")
    quit()

# Resize depth to match image exactly
h, w = img.shape[:2]
depth_raw = cv2.resize(depth_raw, (w, h))

# Normalize depth (0.0 = Far, 1.0 = Near)
depth_norm = depth_raw.astype(np.float32) / 255.0

# ===============================
# UTILITIES
# ===============================

def ease_in_out_sine(t):
    """Makes motion start slow, speed up, then end slow."""
    return -(np.cos(np.pi * t) - 1) / 2

def overlay_fine_dust(curr_img, time_step, cam_shift_x, cam_shift_y):
    """
    Creates very fine, subtle dust particles.
    """
    overlay = curr_img.copy()
    
    # Consistent random seed so particles don't jitter randomly between frames
    np.random.seed(42) 
    
    # Number of particles
    num_particles = 100 
    
    for i in range(num_particles):
        # Random properties
        p_x_start = np.random.randint(0, w)
        p_y_start = np.random.randint(0, h)
        p_depth = np.random.rand() # 0.0 (far) to 1.0 (close)
        
        # 1. CONSTANT DRIFT (Wind)
        drift_x = time_step * (15 * p_depth) 
        drift_y = time_step * (5 * p_depth)

        # 2. CAMERA REACTION (Parallax)
        # Particles move opposite to camera movement
        parallax_x = -cam_shift_x * (p_depth * 2.0) 
        parallax_y = -cam_shift_y * (p_depth * 2.0)

        final_x = int((p_x_start + drift_x + parallax_x) % w)
        final_y = int((p_y_start + drift_y + parallax_y) % h)
        
        # Draw TINY particle (Size = 1 pixel)
        # Color: White
        # Opacity: Based on depth (closer = more visible)
        opacity = 0.2 + (p_depth * 0.4) # Range 0.2 to 0.6 opacity
        
        bg_color = overlay[final_y, final_x].astype(float)
        particle_color = np.array([255, 255, 255])
        
        # Blend
        blended = (opacity * particle_color + (1 - opacity) * bg_color).astype(np.uint8)
        
        # Set pixel directly
        overlay[final_y, final_x] = blended

    return overlay

# ===============================
# WARPING ENGINE
# ===============================
def generate_frame(mx, my, zoom):
    
    # 1. PARALLAX DISPLACEMENT
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    
    # Near pixels move according to mx/my
    map_x = (grid_x - (depth_norm * mx)).astype(np.float32)
    map_y = (grid_y - (depth_norm * my)).astype(np.float32)
    
    warped = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR, cv2.BORDER_REFLECT)
    
    # 2. SAFETY CROP
    # Minimal zoom (1.02) to cut off the messy edges from warping
    real_zoom = zoom * 1.02
    
    cw = int(w / real_zoom)
    ch = int(h / real_zoom)
    cx, cy = w // 2, h // 2
    
    crop = warped[cy - ch//2 : cy + ch//2, cx - cw//2 : cx + cw//2]
    
    if crop.size == 0: return warped
    final = cv2.resize(crop, (w, h), interpolation=cv2.INTER_LINEAR)
    
    return final

# ===============================
# STYLES
# ===============================

# Style 1: "Clean Float"
# Gentle horizontal movement. Crisp image.
def style_clean_float(progress, frame_idx):
    p = ease_in_out_sine(progress)
    
    # Move left to right
    shift_x = np.sin(p * np.pi) * 15 
    shift_y = 0
    zoom = 1.0 # No extra zoom
    
    frame = generate_frame(shift_x, shift_y, zoom)
    frame = overlay_fine_dust(frame, progress, shift_x, shift_y)
    return frame

# Style 2: "Depth Pulse"
# Moves forward and backward slightly.
def style_depth_pulse(progress, frame_idx):
    p = ease_in_out_sine(progress)
    
    # Zoom In then Out
    zoom = 1.0 + (np.sin(p * np.pi) * 0.05)
    
    # Perspective shift (Vertigo feel but subtle)
    shift_x = np.sin(p * np.pi) * -10
    
    frame = generate_frame(shift_x, 0, zoom)
    frame = overlay_fine_dust(frame, progress, shift_x, 0)
    return frame

# Style 3: "Diagonal Slide"
# Dynamic diagonal movement
def style_diagonal(progress, frame_idx):
    p = ease_in_out_sine(progress)
    
    shift_x = np.sin(p * np.pi) * 12
    shift_y = np.sin(p * np.pi) * 8
    
    zoom = 1.02 # Static slight zoom
    
    frame = generate_frame(shift_x, shift_y, zoom)
    frame = overlay_fine_dust(frame, progress, shift_x, shift_y)
    return frame

# ===============================
# SAVE FUNCTION
# ===============================
def save_video(style_func, filename):
    path = os.path.join(output_dir, filename)
    print(f"🎬 Rendering {filename}...")
    
    out = cv2.VideoWriter(path, cv2.VideoWriter_fourcc(*'mp4v'), FPS, (w, h))
    
    for i in range(NUM_FRAMES):
        progress = i / NUM_FRAMES 
        frame = style_func(progress, i)
        out.write(frame)
        
    out.release()
    print(f"✅ Saved {path}")

# ===============================
# RUN
# ===============================
save_video(style_clean_float, "1_Clean_Float.mp4")
save_video(style_depth_pulse, "2_Depth_Pulse.mp4")
save_video(style_diagonal,    "3_Diagonal_Slide.mp4")

print(f"\n✨ Done! Clean, crisp videos saved in '{output_dir}'")
