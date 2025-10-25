
import cv2
import numpy as np
import random
import os

def create_parallax_effect(image_path, output_path, duration=7, fps=30, grid_size=(20, 12), zoom_factor=1.8, parallax_intensity=0.7):
    """
    Generates a 2.5D geometric parallax video from a single image using OpenCV.

    Args:
        image_path (str): The full path to the source image.
        output_path (str): The full path where the output MP4 video will be saved.
        duration (int): The desired length of the video in seconds.
        fps (int): The frames per second for the output video.
        grid_size (tuple): A (columns, rows) tuple for slicing the image.
        zoom_factor (float): The final magnification of the image (e.g., 1.8 means 180% zoom).
        parallax_intensity (float): Controls how much the slices spread apart. 0.0 to 1.0.
    """
    # --- 1. Setup and File Handling ---
    print(f"Starting parallax video generation...")
    print(f"Input image: {image_path}")
    print(f"Output video: {output_path}")

    # Check if the input image exists
    if not os.path.exists(image_path):
        print(f"Error: Input image not found at '{image_path}'")
        return

    # Automatically create the output directory if it doesn't exist
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        print(f"Ensured output directory exists: '{output_dir}'")

    # Load the source image
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Failed to load the image. Check if the file is a valid image.")
        return

    height, width, _ = image.shape
    center_x, center_y = width / 2, height / 2
    total_frames = duration * fps

    # --- 2. Slice the Image and Assign Depth ---
    print(f"Slicing image into a {grid_size[0]}x{grid_size[1]} grid...")
    cols, rows = grid_size
    slice_w = width // cols
    slice_h = height // rows
    
    slices = []
    for r in range(rows):
        for c in range(cols):
            x = c * slice_w
            y = r * slice_h
            
            slice_img = image[y:y+slice_h, x:x+slice_w]
            
            # Assign a random depth (closer to 1.0 is further away)
            # Squaring the random number biases the distribution towards the background,
            # making the foreground parallax "pop" more.
            depth = (random.random() ** 2) * 0.9 + 0.1  # Range [0.1, 1.0]

            slices.append({
                'img': slice_img,
                'orig_center_x': x + slice_w / 2,
                'orig_center_y': y + slice_h / 2,
                'orig_w': slice_w,
                'orig_h': slice_h,
                'depth': depth
            })

    # --- 3. Setup Video Writer ---
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video_writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    if not video_writer.isOpened():
        print("Error: Could not open video writer. Check permissions or codecs.")
        return
        
    print(f"Generating {total_frames} frames for a {duration}s video at {fps}fps...")

    # --- 4. Generate Each Frame ---
    for i in range(total_frames):
        # Create a black canvas for the current frame
        frame = np.zeros_like(image)
        
        # Progress of the animation from 0.0 to 1.0
        progress = i / (total_frames - 1) if total_frames > 1 else 0

        # Sort slices by depth to draw background elements first
        slices.sort(key=lambda s: s['depth'], reverse=True)

        for s in slices:
            # Calculate the current scale based on the animation's progress
            current_scale = 1.0 + (zoom_factor - 1.0) * progress

            # Calculate the parallax shift
            # Slices closer to the camera (lower depth) move more
            parallax_factor = (1.0 - s['depth']) * parallax_intensity

            # Vector from the image center to the slice's original center
            vec_x = s['orig_center_x'] - center_x
            vec_y = s['orig_center_y'] - center_y
            
            # The parallax offset pushes the slice away from the center
            offset_x = vec_x * parallax_factor * progress
            offset_y = vec_y * parallax_factor * progress

            # Calculate the new size of the slice
            new_w = int(s['orig_w'] * current_scale)
            new_h = int(s['orig_h'] * current_scale)

            # Calculate the new center position: start with the original vector, scale it, then add the parallax offset
            new_center_x = center_x + vec_x * current_scale + offset_x
            new_center_y = center_y + vec_y * current_scale + offset_y
            
            # Convert center position to top-left corner for drawing
            new_x = int(new_center_x - new_w / 2)
            new_y = int(new_center_y - new_h / 2)
            
            # Resize the slice image and paste it onto the frame
            if new_w > 0 and new_h > 0:
                resized_slice = cv2.resize(s['img'], (new_w, new_h), interpolation=cv2.INTER_LINEAR)
                
                # This complex part handles pasting the slice correctly, even if it goes off-screen
                x1, y1 = max(0, new_x), max(0, new_y)
                x2, y2 = min(width, new_x + new_w), min(height, new_y + new_h)
                
                sx1, sy1 = max(0, -new_x), max(0, -new_y)
                sx2, sy2 = sx1 + (x2 - x1), sy1 + (y2 - y1)

                if x2 > x1 and y2 > y1:
                    frame[y1:y2, x1:x2] = resized_slice[sy1:sy2, sx1:sx2]

        video_writer.write(frame)
        # Update progress in the console
        print(f"\rProgress: [{int((i+1)/total_frames * 100)}%] {'=' * (int((i+1)/total_frames*20))}{' ' * (20 - int((i+1)/total_frames*20))} {i+1}/{total_frames}", end="")

    # --- 5. Finalize ---
    video_writer.release()
    print(f"\nVideo generation complete. Saved to: {output_path}")

# --- Main Execution Block ---
if __name__ == '__main__':
    # Define the input and output paths as requested
    input_image_file = 'BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg'
    output_video_file = 'BOOK_CODE/PARALLAX/output_cv2_parallax.mp4'
    
    # Note: Ensure you have the input image at the specified path relative to where you run this script.
    # If the image is not found, you will get an error message.
    
    create_parallax_effect(
        image_path=input_image_file,
        output_path=output_video_file
    )
