import cv2
import numpy as np
import os

# ===============================
# CONFIGURATION
# ===============================
image_path = "public/1.jpg"
depth_path = "public/1.png"
output_dir = "output_cinematic_action"
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
# 1. ENHANCED PARTICLE SYSTEM
# ===============================
def overlay_action_dust(curr_img, time_step, shift_x, shift_y):
    """
    Particles now move faster to match the aggressive camera moves.
    """
    overlay = curr_img.copy()
    np.random.seed(101) # Seed for consistency
    
    num_particles = 150 # More particles for density
    
    for i in range(num_particles):
        p_x_start = np.random.randint(0, w)
        p_y_start = np.random.randint(0, h)
        p_depth = np.random.rand() # 0.0 to 1.0
        
        # Aggressive Drift (Wind)
        drift_x = time_step * (40 * p_depth) 
        
        # Parallax Reaction (Particles move opposite to camera)
        # Multiplied by 4.0 for stronger 3D feeling
        para_x = -shift_x * (p_depth * 4.0) 
        para_y = -shift_y * (p_depth * 4.0)

        final_x = int((p_x_start + drift_x + para_x) % w)
        final_y = int((p_y_start + para_y) % h)
        
        # Draw Particle
        # Size 1 or 2 pixels max
        size = 1 if np.random.rand() > 0.5 else 2
        
        # Brightness based on depth
        opacity = 0.3 + (p_depth * 0.5)
        
        bg = overlay[final_y, final_x].astype(float)
        white = np.array([255, 255, 255])
        
        blended = (opacity * white + (1 - opacity) * bg).astype(np.uint8)
        overlay[final_y, final_x] = blended

    return overlay

# ===============================
# 2. SMART WARP ENGINE (The Hole Solver)
# ===============================
def smart_warp(mx, my, extra_zoom=0.0):
    """
    mx, my: How many pixels you want to shift (Amplitude)
    extra_zoom: Additional cinematic zoom on top of safety zoom
    """
    
    # 1. CALCULATE DISPLACEMENT
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    
    # Calculate the shift for every pixel
    map_x = (grid_x - (depth_norm * mx)).astype(np.float32)
    map_y = (grid_y - (depth_norm * my)).astype(np.float32)
    
    # Perform the warp (this creates messy edges)
    warped = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR, cv2.BORDER_REFLECT)
    
    # 2. AUTO-CALCULATE SAFETY CROP
    # If we move 50 pixels, we must crop at least 50 pixels to hide the gap.
    # We calculate the max possible displacement.
    max_shift_x = abs(mx)
    max_shift_y = abs(my)
    
    # Calculate percentage of image to crop
    crop_ratio_x = max_shift_x / w
    crop_ratio_y = max_shift_y / h
    
    # Determine base zoom needed to hide holes
    safety_zoom = 1.0 + max(crop_ratio_x, crop_ratio_y) + 0.02 # +2% buffer
    
    # Apply user requested zoom ON TOP of safety zoom
    total_zoom = safety_zoom + extra_zoom
    
    # 3. APPLY CROP & RESIZE
    cw = int(w / total_zoom)
    ch = int(h / total_zoom)
    cx, cy = w // 2, h // 2
    
    crop = warped[cy - ch//2 : cy + ch//2, cx - cw//2 : cx + cw//2]
    
    if crop.size == 0: return warped
    final = cv2.resize(crop, (w, h), interpolation=cv2.INTER_LINEAR)
    
    return final

# ===============================
# 3. EASING
# ===============================
def ease_in_out_quad(t):
    return 2 * t * t if t < 0.5 else 1 - pow(-2 * t + 2, 2) / 2

# ===============================
# 4. CINEMATIC STYLES
# ===============================

# STYLE 1: "THE VERTIGO" (Dolly Zoom)
# This is the coolest effect. Background grows, Foreground stays similar.
def style_vertigo(p, i):
    smooth = ease_in_out_quad(p)
    
    # 1. Move Camera BACKWARDS (Negative Shift)
    # We shift X and Y based on depth
    move_strength = 60 # HUGE movement (60 pixels)
    shift_x = -(smooth * move_strength) 
    
    # 2. Zoom Lens IN
    # We zoom in to counter-act the backward movement
    zoom_strength = smooth * 0.3 # 30% Zoom in
    
    frame = smart_warp(shift_x, 0, zoom_strength)
    frame = overlay_action_dust(frame, p, shift_x, 0)
    return frame

# STYLE 2: "CINEMATIC PUSH"
# Camera physically moves forward into the scene.
# Everything expands, but near objects expand FASTER.
def style_cinematic_push(p, i):
    smooth = ease_in_out_quad(p)
    
    # 1. Expansion effect (fake Z-movement)
    # We use scale for this.
    zoom_strength = smooth * 0.25 # Zoom in
    
    # 2. Slight Parallax shift to sell the 3D
    shift_x = np.sin(p * np.pi) * 20 # 20px wobble
    shift_y = np.cos(p * np.pi) * 10
    
    frame = smart_warp(shift_x, shift_y, zoom_strength)
    frame = overlay_action_dust(frame, p, shift_x, shift_y)
    return frame

# STYLE 3: "AGGRESSIVE SLIDE"
# Fast sideways movement to show off parallax layers.
def style_aggressive_slide(p, i):
    smooth = ease_in_out_quad(p)
    
    # Move Left to Right strongly
    # 80 Pixels is a LOT. Smart warp will auto-crop to hide holes.
    shift_x = np.sin(p * np.pi) * 80 
    
    # Slight vertical bob
    shift_y = np.sin(p * np.pi * 2) * 10
    
    # No extra zoom needed, smart_warp handles the cropping
    frame = smart_warp(shift_x, shift_y, 0.0)
    frame = overlay_action_dust(frame, p, shift_x, shift_y)
    return frame

# ===============================
# RENDER
# ===============================
def save_video(style_func, filename):
    path = os.path.join(output_dir, filename)
    print(f"🎬 Rendering {filename}...")
    out = cv2.VideoWriter(path, cv2.VideoWriter_fourcc(*'mp4v'), FPS, (w, h))
    for i in range(NUM_FRAMES):
        out.write(style_func(i / NUM_FRAMES, i))
    out.release()
    print(f"✅ Saved {path}")

# Run
save_video(style_vertigo, "1_Vertigo_Effect.mp4")
save_video(style_cinematic_push, "2_Cinematic_Push.mp4")
save_video(style_aggressive_slide, "3_Aggressive_Slide.mp4")

print(f"\n✨ Generated High-Action videos in '{output_dir}'")
