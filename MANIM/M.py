
from manim import *
import os
import numpy as np

class PNGZDepthSequence(ThreeDScene):
    def construct(self):
        # ---------- Camera setup ----------
        self.set_camera_orientation(phi=70 * DEGREES, theta=-90 * DEGREES)
        self.begin_ambient_camera_rotation(0.01)  # optional slow rotation

        # ---------- Load PNGs ----------
        img_dir = "MANIM/Imag_samples"
        image_files = sorted(f for f in os.listdir(img_dir) if f.endswith(".png"))

        if not image_files:
            raise Exception("No PNG files found!")

        z_step = 5       # distance between images
        img_scale = 2.8
        fly_time = 2.5

        current_z = 0

        # Loop twice
        for _ in range(2):
            for img in image_files:
                im = ImageMobject(os.path.join(img_dir, img))
                im.scale(img_scale)
                im.move_to(ORIGIN + OUT * current_z)

                self.add(im)
                self.play(FadeIn(im), run_time=0.5)

                # Move camera along Z in full XYZ
                self.move_camera(
                    frame_center=ORIGIN + OUT * current_z,
                    added_anims=[],
                    run_time=fly_time
                )

                self.wait(0.3)
                current_z += z_step

        self.wait(1)
