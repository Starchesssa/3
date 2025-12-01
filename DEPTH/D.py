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
# COOL VISUAL FX UTILITIES
# ===============================

def ease_in_out_sine(t):
    """Makes motion start slow, speed up, then end slow."""
    return -(np.cos(np.pi * t) - 1) / 2

def apply_vignette(curr_img):
    """Adds a cinematic dark border to frame the subject."""
    Y, X = np.ogrid[:h, :w]
    center_y, center_x = h / 2, w / 2
    
    # Calculate distance from center
    dist_from_center = np.sqrt((X - center_x)**2 + (Y - center_y)**2)
    
    # Create mask: 1.0 at center, fading to 0.4 at corners
    mask = 1 - (dist_from_center / (np.sqrt(h**2 + w**2) / 1.3))
    mask = np.clip(mask, 0.4, 1.0) # Don't make corners pitch black, just darker
    mask = np.dstack([mask] * 3)
    
    return (curr_img * mask).astype(np.uint8)

def overlay_enhanced_particles(curr_img, time_step, cam_shift_x, cam_shift_y):
    """
    Creates a multi-layered 3D particle system.
    Some particles are 'close' (fast), some are 'far' (slow).
    """
    overlay = curr_img.copy()
    
    # Seed ensures particles are deterministic (same every time we run code)
    np.random.seed(99) 
    
    # Number of particles
    num_particles = 70
    
    for i in range(num_particles):
        # Random properties for each particle
        p_x_start = np.random.randint(0, w)
        p_y_start = np.random.randint(0, h)
        p_depth = np.random.rand() # 0.0 (far) to 1.0 (close)
        p_size = np.random.randint(1, 4) # Variable size
        
        # 1. CONSTANT DRIFT (Wind)
        # Particles drift slowly to the right/down over time
        drift_x = time_step * (20 * p_depth) 
        drift_y = time_step * (10 * p_depth)

        # 2. CAMERA REACTION (Parallax)
        # If camera moves Left (negative shift), particles move Right.
        # Close particles (p_depth 1.0) move MORE than background ones.
        parallax_x = -cam_shift_x * (p_depth * 3.0) 
        parallax_y = -cam_shift_y * (p_depth * 3.0)

        # Calculate final position with wrapping (modulo)
        final_x = int((p_x_start + drift_x + parallax_x) % w)
        final_y = int((p_y_start + drift_y + parallax_y) % h)
        
        # Draw the particle
        # We use circle with negative thickness for filled
        opacity = 0.4 + (p_depth * 0.4) # Closer particles are brighter
        color = (255, 255, 255)
        
        # Manual Alpha Blending for the dot
        # Get background color
        bg_color = overlay[final_y, final_x].astype(float)
        
        # Blend: Output = Alpha * Particle + (1-Alpha) * BG
        blended = (opacity * np.array(color) + (1 - opacity) * bg_color).astype(np.uint8)
        
        cv2.circle(overlay, (final_x, final_y), p_size, blended.tolist(), -1)

    return overlay

# ===============================
# WARPING ENGINE
# ===============================
def generate_frame(mx, my, zoom):
    """
    mx, my: Movement in pixels (Parallax strength)
    zoom: Zoom factor (e.g. 1.0 to 1.2)
    """
    
    # 1. PARALLAX DISPLACEMENT
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    
    # Pixel shift formula: Shift * Depth
    # Near pixels move a lot, far pixels move little
    map_x = (grid_x - (depth_norm * mx)).astype(np.float32)
    map_y = (grid_y - (depth_norm * my)).astype(np.float32)
    
    warped = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR, cv2.BORDER_REFLECT)
    
    # 2. ZOOM & CROP
    # We always zoom slightly to hide the "messy edges" caused by warping
    real_zoom = zoom * 1.05 
    
    cw = int(w / real_zoom)
    ch = int(h / real_zoom)
    cx, cy = w // 2, h // 2
    
    crop = warped[cy - ch//2 : cy + ch//2, cx - cw//2 : cx + cw//2]
    
    # Resize back to original
    if crop.size == 0: return warped # Safety check
    final = cv2.resize(crop, (w, h), interpolation=cv2.INTER_LINEAR)
    
    # 3. ADD VIGNETTE
    final = apply_vignette(final)
    
    return final

# ===============================
# STYLES
# ===============================

# Style 1: "The Observer"
# Slow, smooth horizontal drift with floating dust. Very atmospheric.
def style_observer(progress, frame_idx):
    p = ease_in_out_sine(progress)
    
    # Camera moves left-to-right (Parallax X)
    shift_x = np.sin(p * np.pi) * 20 # 20px shift
    shift_y = np.sin(p * np.pi * 2) * 5 # Subtle bobbing
    
    # Very slow zoom in
    zoom = 1.0 + (p * 0.1)
    
    # Generate Base
    frame = generate_frame(shift_x, shift_y, zoom)
    
    # Add Particles (pass shifts so they react!)
    frame = overlay_enhanced_particles(frame, progress, shift_x, shift_y)
    
    return frame

# Style 2: "The Vertigo"
# Zoom In + Depth Shift Out. Background feels like it's expanding.
def style_vertigo(progress, frame_idx):
    p = ease_in_out_sine(progress)
    
    # Strong Zoom In
    zoom = 1.0 + (p * 0.25)
    
    # Inverse Parallax Shift (Compensates for zoom, stretching perspective)
    # The negative shift separates foreground from background
    shift_x = -(p * 30) 
    
    frame = generate_frame(shift_x, 0, zoom)
    frame = overlay_enhanced_particles(frame, progress, shift_x, 0)
    return frame

# Style 3: "3D Orbit"
# Circular camera movement. Feels like we are rotating around the subject.
def style_orbit(progress, frame_idx):
    # Continuous loop
    angle = progress * 2 * np.pi
    
    # Orbit radius
    radius = 15
    shift_x = np.cos(angle) * radius
    shift_y = np.sin(angle) * radius * 0.5 # Elliptical orbit
    
    zoom = 1.05 # Static zoom
    
    frame = generate_frame(shift_x, shift_y, zoom)
    frame = overlay_enhanced_particles(frame, progress, shift_x, shift_y)
    return frame

# ===============================
# SAVE FUNCTION
# ===============================
def save_video(style_func, filename):
    path = os.path.join(output_dir, filename)
    print(f"🎬 Rendering {filename}...")
    
    out = cv2.VideoWriter(path, cv2.VideoWriter_fourcc(*'mp4v'), FPS, (w, h))
    
    for i in range(NUM_FRAMES):
        # Progress 0.0 to 1.0
        progress = i / NUM_FRAMES 
        frame = style_func(progress, i)
        out.write(frame)
        
    out.release()
    print(f"✅ Saved to {path}")

# ===============================
# RUN ALL
# ===============================
save_video(style_observer, "Style1_Observer.mp4")
save_video(style_vertigo,  "Style2_Vertigo.mp4")
save_video(style_orbit,    "Style3_Orbit.mp4")

print("\n🎉 Done! Check the 'output_cool_noblur' folder.")
