
import cv2
import numpy as np
import os
import random

def create_parallax_effect(image_path, output_path, duration=7, fps=30, zoom_factor=1.2, parallax_intensity=0.5):
    """
    Generates a 2.5D parallax video using 5 circular slices around the center of the image.
    """
    # --- 1. Setup ---
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
        print(f"Error: Failed to load the image. Check if the file is a valid image.")
        return

    h, w, _ = image.shape
    center = (w // 2, h // 2)
    total_frames = duration * fps

    # --- 2. Define 5 circular slices ---
    circle_radius = min(w, h) // 6
    angles = [0, 72, 144, 216, 288]
    circles = []

    for angle in angles:
        rad = np.deg2rad(angle)
        offset_x = int(np.cos(rad) * circle_radius * 1.5)
        offset_y = int(np.sin(rad) * circle_radius * 1.5)
        circles.append({
            'center': (center[0] + offset_x, center[1] + offset_y),
            'radius': circle_radius,
            'depth': random.uniform(0.3, 0.8)
        })

    # --- 3. Setup Video Writer ---
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video_writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
    if not video_writer.isOpened():
        print("Error: Could not open video writer.")
        return

    # --- 4. Generate frames ---
    for i in range(total_frames):
        frame = np.zeros_like(image)
        progress = i / (total_frames - 1) if total_frames > 1 else 0

        # Zoom center image
        zoom = 1.0 + (zoom_factor - 1.0) * progress
        center_img = cv2.resize(image, (int(w*zoom), int(h*zoom)))
        x_off = (center_img.shape[1] - w) // 2
        y_off = (center_img.shape[0] - h) // 2
        frame[:] = center_img[y_off:y_off+h, x_off:x_off+w]

        # Draw circular slices with parallax
        for c in circles:
            dx = int((c['center'][0]-center[0]) * c['depth'] * parallax_intensity * progress)
            dy = int((c['center'][1]-center[1]) * c['depth'] * parallax_intensity * progress)

            mask = np.zeros((h, w), np.uint8)
            cv2.circle(mask, c['center'], c['radius'], 255, -1)
            slice_img = cv2.bitwise_and(image, image, mask=mask)

            M = np.float32([[1, 0, dx], [0, 1, dy]])
            moved_slice = cv2.warpAffine(slice_img, M, (w, h))
            mask_moved = cv2.warpAffine(mask, M, (w, h))
            inv_mask = cv2.bitwise_not(mask_moved)

            frame = cv2.bitwise_and(frame, frame, mask=inv_mask)
            frame = cv2.bitwise_or(frame, moved_slice)

        video_writer.write(frame)
        print(f"\rProgress: {i+1}/{total_frames}", end="")

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
