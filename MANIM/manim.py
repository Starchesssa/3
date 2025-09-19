
from manim import *
import random
import os

class ImageParallaxScene(ThreeDScene):
    def construct(self):
        # --- Load images from assets/images ---
        image_folder = "assets/images"
        image_files = [
            f for f in os.listdir(image_folder)
            if f.endswith((".png", ".jpg", ".jpeg"))
        ]

        # Pick random images for background, midground, foreground
        bg_file = os.path.join(image_folder, random.choice(image_files))
        mid_file = os.path.join(image_folder, random.choice(image_files))
        fg_file = os.path.join(image_folder, random.choice(image_files))

        # Create ImageMobjects
        bg_img = ImageMobject(bg_file).scale(4).move_to([0,0,-4])
        mid_img = ImageMobject(mid_file).scale(2.5).move_to([0,0,-2])
        fg_img = ImageMobject(fg_file).scale(1.5).move_to([0,0,0])

        # Add images to scene
        self.add(bg_img, mid_img, fg_img)

        # --- Add some text overlay ---
        text = Text("Parallax Demo", font_size=60, color=WHITE).to_edge(UP)
        self.add_fixed_in_frame_mobjects(text)  # Keeps text in 2D overlay

        # --- Set initial camera orientation ---
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES, distance=10)

        # --- Animate camera for smooth parallax ---
        self.begin_ambient_camera_rotation(rate=0.1)  # subtle continuous rotation
        self.move_camera(phi=75*DEGREES, theta=60*DEGREES, distance=10, run_time=3, added_anims=[text.animate.shift(UP*0.2)])
        self.wait(1)
        self.move_camera(phi=75*DEGREES, theta=-30*DEGREES, distance=10, run_time=3, added_anims=[text.animate.shift(DOWN*0.2)])
        self.wait(1)
        self.stop_ambient_camera_rotation()

        # --- Optional: slight foreground zoom ---
        self.play(fg_img.animate.scale(1.2), run_time=2, rate_func=there_and_back)

        self.wait(1)
