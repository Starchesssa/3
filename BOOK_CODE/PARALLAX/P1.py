
import cv2
import numpy as np
import os

def ease_in_out(t):
    """Smooth easing function for natural motion."""
    return 3*t**2 - 2*t**3

def create_parallax_forward(image_path, output_path, layers=5, duration=15, fps=30, max_zoom=1.5):
    """
    Create a parallax effect by slicing the image into concentric circles
    and moving each layer forward toward the camera (scaling up) over time.
    """
    if not os.path.exists(image_path):
        print(f"Error: Input image not found: {image_path}")
        return

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    img = cv2.imread(image_path)
    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    total_frames = duration * fps

    # --- Define concentric circular layers (outermost first) ---
    max_radius = int(min(w, h)/2 * 0.95)
    min_radius = int(max_radius * 0.15)
    radii = np.linspace(max_radius, min_radius, layers)

    # Precompute masks for each layer
    masks = []
    for i, r in enumerate(radii):
        mask = np.zeros((h, w), np.uint8)
        outer_r = int(r)
        inner_r = int(radii[i+1]) if i+1 < layers else 0
        cv2.circle(mask, center, outer_r, 255, -1)
        if inner_r > 0:
            cv2.circle(mask, center, inner_r, 0, -1)
        masks.append(mask)

    # --- Setup video writer ---
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video_writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
    if not video_writer.isOpened():
        print("Error: Could not open video writer.")
        return

    # --- Generate frames ---
    for frame_idx in range(total_frames):
        frame = np.zeros_like(img)
        progress = ease_in_out(frame_idx / (total_frames-1))

        # Animate each layer (outermost moves first)
        for layer_idx, mask in enumerate(masks):
            # Layer animation timing (outermost starts first)
            layer_start = layer_idx / layers
            layer_end = (layer_idx + 1) / layers
            if progress < layer_start:
                continue  # not yet reached this layer
            layer_progress = (progress - layer_start) / (layer_end - layer_start)
            layer_progress = min(max(layer_progress, 0), 1)
            layer_progress = ease_in_out(layer_progress)

            # Compute zoom for this layer
            zoom = 1.0 + (max_zoom - 1.0) * layer_progress
            zoomed_img = cv2.resize(img, (int(w*zoom), int(h*zoom)))
            x_off = (zoomed_img.shape[1]-w)//2
            y_off = (zoomed_img.shape[0]-h)//2
            zoomed_img = zoomed_img[y_off:y_off+h, x_off:x_off+w]

            # Apply mask to layer
            layer_img = cv2.bitwise_and(zoomed_img, zoomed_img, mask=mask)
            inv_mask = cv2.bitwise_not(mask)
            frame = cv2.bitwise_and(frame, frame, mask=inv_mask)
            frame = cv2.bitwise_or(frame, layer_img)

        video_writer.write(frame)
        print(f"\rProgress: {frame_idx+1}/{total_frames}", end="")

    video_writer.release()
    print(f"\nVideo saved to: {output_path}")


# --- Main Execution ---
if __name__ == '__main__':
    input_image_file = 'BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg'
    output_video_file = 'BOOK_CODE/PARALLAX/output_cv2_parallax.mp4'

    create_parallax_forward(
        image_path=input_image_file,
        output_path=output_video_file,
        layers=5,
        duration=15,
        fps=30,
        max_zoom=1.5
    )
