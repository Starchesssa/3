
import cv2
import numpy as np
import os
import math

def ease_in_out(t):
    """Smooth easing function for natural motion."""
    return 3 * t**2 - 2 * t**3

def create_parallax_effect(image_path, output_path, duration=15, fps=30, zoom_factor=1.2, parallax_intensity=1.2):
    """
    Creates a cinematic parallax video using 5 spaced concentric circular layers filling the image.
    The outermost layer animates first, then each inner layer smoothly follows.
    """
    print(f"Starting parallax video generation...")
    print(f"Input image: {image_path}")
    print(f"Output video: {output_path}")

    if not os.path.exists(image_path):
        print(f"Error: Input image not found.")
        return

    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Failed to load the image.")
        return

    h, w, _ = image.shape
    center = (w // 2, h // 2)
    total_frames = duration * fps

    # --- Define 5 spaced circles filling the entire image ---
    max_radius = int(min(w, h) / 2 * 0.95)  # slightly smaller than full edge
    min_radius = int(max_radius * 0.15)      # leave some space at center
    radii = np.linspace(min_radius, max_radius, 5)

    circles = []
    for idx, r in enumerate(reversed(radii)):  # outermost first
        circles.append({
            'radius_inner': int(r * 0.8),   # inner boundary
            'radius_outer': int(r),         # outer boundary
            'depth': (idx + 1) / 5.0        # deeper = slower
        })

    # --- Setup video writer ---
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video_writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
    if not video_writer.isOpened():
        print("Error: Could not open video writer.")
        return

    # --- Generate frames ---
    print(f"Generating {total_frames} frames...")
    for i in range(total_frames):
        frame = np.zeros_like(image)
        progress = i / (total_frames - 1)
        eased_progress = ease_in_out(progress)

        # Base zoom
        zoom = 1.0 + (zoom_factor - 1.0) * eased_progress
        zoomed_img = cv2.resize(image, (int(w * zoom), int(h * zoom)))
        x_off = (zoomed_img.shape[1] - w) // 2
        y_off = (zoomed_img.shape[0] - h) // 2
        frame[:] = zoomed_img[y_off:y_off + h, x_off:x_off + w]

        # Animate each circle (outermost starts first)
        for c in circles:
            # Delay based on depth (outermost starts earlier)
            layer_progress = np.clip((eased_progress - (1 - c['depth']) * 0.5) / 0.5, 0, 1)
            layer_eased = ease_in_out(layer_progress)

            # Movement (outward)
            shift = int(parallax_intensity * (1 - c['depth']) * 100 * layer_eased)

            # Create ring mask
            mask = np.zeros((h, w), np.uint8)
            cv2.circle(mask, center, c['radius_outer'], 255, -1)
            cv2.circle(mask, center, c['radius_inner'], 0, -1)

            ring = cv2.bitwise_and(image, image, mask=mask)

            # Move ring outward (both X & Y)
            M = np.float32([[1, 0, shift], [0, 1, shift]])
            moved_ring = cv2.warpAffine(ring, M, (w, h))
            mask_moved = cv2.warpAffine(mask, M, (w, h))

            inv_mask = cv2.bitwise_not(mask_moved)
            frame = cv2.bitwise_and(frame, frame, mask=inv_mask)
            frame = cv2.bitwise_or(frame, moved_ring)

        video_writer.write(frame)
        print(f"\rProgress: {i + 1}/{total_frames}", end="")

    video_writer.release()
    print(f"\nVideo generation complete. Saved to: {output_path}")


# --- Main Execution Block ---
if __name__ == '__main__':
    input_image_file = 'BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg'
    output_video_file = 'BOOK_CODE/PARALLAX/output_cv2_parallax.mp4'
    
    create_parallax_effect(
        image_path=input_image_file,
        output_path=output_video_file
    )
