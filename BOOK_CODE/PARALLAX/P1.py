
import cv2
import numpy as np
import os

def ease_in_out(t):
    """Smooth easing function for cinematic motion."""
    return 3*t**2 - 2*t**3

def create_concentric_parallax(image_path, output_path, duration=15, fps=30, layers=5, zoom_factor=1.5):
    """
    Creates a 3D-like tunnel animation through 5 concentric circular layers toward the center.
    """
    if not os.path.exists(image_path):
        print("Error: Input image not found.")
        return

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    image = cv2.imread(image_path)
    if image is None:
        print("Error: Failed to load the image.")
        return

    h, w, _ = image.shape
    center = (w // 2, h // 2)
    total_frames = duration * fps

    # Define concentric layers (outermost to innermost)
    max_radius = int(min(w,h)/2 * 0.95)
    min_radius = int(max_radius * 0.15)
    radii = np.linspace(max_radius, min_radius, layers)

    # Setup video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video_writer = cv2.VideoWriter(output_path, fourcc, fps, (w,h))

    for i in range(total_frames):
        frame = np.zeros_like(image)
        progress = ease_in_out(i/(total_frames-1))

        for idx, radius in enumerate(radii):
            # Calculate layer visibility (outermost first)
            layer_start = idx / layers
            layer_end = (idx+1) / layers
            if progress < layer_start:
                continue  # not yet reached this layer
            layer_progress = (progress - layer_start)/(layer_end - layer_start)
            layer_progress = min(max(layer_progress,0),1)
            layer_progress = ease_in_out(layer_progress)

            # Zoom factor for this layer
            zoom = 1.0 + (zoom_factor-1.0)*(1-layer_progress)
            zoomed_img = cv2.resize(image, (int(w*zoom), int(h*zoom)))
            x_off = (zoomed_img.shape[1]-w)//2
            y_off = (zoomed_img.shape[0]-h)//2
            zoomed_img = zoomed_img[y_off:y_off+h, x_off:x_off+w]

            # Create circular mask for this layer
            mask = np.zeros((h,w), np.uint8)
            outer_r = int(radius)
            inner_r = int(radii[idx+1]) if idx+1 < layers else 0
            cv2.circle(mask, center, outer_r, 255, -1)
            if inner_r > 0:
                cv2.circle(mask, center, inner_r, 0, -1)

            ring = cv2.bitwise_and(zoomed_img, zoomed_img, mask=mask)

            # Merge layer into frame
            inv_mask = cv2.bitwise_not(mask)
            frame = cv2.bitwise_and(frame, frame, mask=inv_mask)
            frame = cv2.bitwise_or(frame, ring)

        video_writer.write(frame)
        print(f"\rProgress: {i+1}/{total_frames}", end="")

    video_writer.release()
    print(f"\nVideo saved to: {output_path}")


# --- Main Execution ---
if __name__ == '__main__':
    input_image_file = 'BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg'
    output_video_file = 'BOOK_CODE/PARALLAX/output_cv2_parallax.mp4'

    create_concentric_parallax(
        image_path=input_image_file,
        output_path=output_video_file,
        duration=15,
        fps=30,
        layers=5,
        zoom_factor=1.5
    )
