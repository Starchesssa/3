
import os
import random
from manim import *

ASSETS_DIR = "assets/images"  # Your images directory

class ParallaxImageScene(ThreeDScene):
    def construct(self):
        # Get all images from the folder
        image_files = [
            os.path.join(ASSETS_DIR, f)
            for f in os.listdir(ASSETS_DIR)
            if f.lower().endswith((".png", ".jpg", ".jpeg"))
        ]
        if len(image_files) < 3:
            raise ValueError("Need at least 3 images for parallax layers")

        # Randomly choose images for background, midground, foreground
        bg_img = ImageMobject(random.choice(image_files)).scale_to_fit_height(8).move_to([0, 0, -4])
        mid_img = ImageMobject(random.choice(image_files)).scale_to_fit_height(6).move_to([0, 0, -2])
        fg_img = ImageMobject(random.choice(image_files)).scale_to_fit_height(4).move_to([0, 0, 0])

        # Add layers
        self.add(bg_img, mid_img, fg_img)

        # Set initial camera orientation
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES, distance=10)

        # Animate camera movement for parallax effect
        self.move_camera(phi=75*DEGREES, theta=60*DEGREES, distance=10, run_time=2)
        self.wait(1)
        self.move_camera(phi=75*DEGREES, theta=-30*DEGREES, distance=10, run_time=2)
        self.wait(1)
