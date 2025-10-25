
import cv2
import numpy as np
import os
import random

def create_parallax_effect(image_path, output_path, duration=7, fps=30, zoom_factor=1.2, parallax_intensity=0.6):
    """
    Generates a 2.5D parallax video using 5 concentric circular layers around the image center.
    """
    print(f"Starting parallax video generation...")
    print(f"Input image: {image_path}")
    print(f"Output video: {output_path}")

    if not os.path.exists(image_path):
        print(f"Error: Input image not found at '{image_path}'")
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

    # --- Define 5 concentric circular layers ---
    max_radius = int(min(w, h) / 2)
    radii = np.linspace(max_radius * 0.2, max_radius, 5)  # 5 circles from center outward
    circles = []

    for r in radii:
        circles.append({
            'radius': int(r),
            'depth': random.uniform(0.2, 0.9)  # each ring has slightly different depth
        })

    # --- Setup Video Writer ---
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video_writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
    if not video_writer.isOpened():
        print("Error: Could not open video writer.")
        return

    # --- Generate frames ---
    for i in range(total_frames):
        frame = np.zeros_like(image)
        progress = i / (total_frames - 1) if total_frames > 1 else 0

        # Zoom the full image
        zoom = 1.0 + (zoom_factor - 1.0) * progress
        zoomed_img = cv2.resize(image, (int(w * zoom), int(h * zoom)))
        x_off = (zoomed_img.shape[1] - w) // 2
        y_off = (zoomed_img.shape[0] - h) // 2
        frame[:] = zoomed_img[y_off:y_off + h, x_off:x_off + w]

        # Apply parallax for each circular ring
        for idx, c in enumerate(reversed(circles)):  # outermost first
            radius = c['radius']
            depth = c['depth']

            # Movement (rings move outward slightly)
            shift = int(parallax_intensity * depth * 50 * progress)

            # Create circular mask for this layer
            mask = np.zeros((h, w), np.uint8)
            cv2.circle(mask, center, radius, 255, -1)

            if idx < len(circles) - 1:
                cv2.circle(mask, center, circles[idx + 1]['radius'], 0, -1)

            # Extract ring
            ring = cv2.bitwise_and(image, image, mask=mask)

            # Move ring slightly (simulate depth)
            M = np.float32([[1, 0, shift], [0, 1, shift]])
            moved_ring = cv2.warpAffine(ring, M, (w, h))

            # Mask blending
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
