
from manim import *
import os

class PNGZDepthSequence(ThreeDScene):
    def construct(self):
        # Camera setup
        self.set_camera_orientation(phi=75*DEGREES, theta=0*DEGREES)
        self.begin_ambient_camera_rotation(rate=0.03)

        img_dir = "MANIM/Imag_samples"
        image_files = sorted(f for f in os.listdir(img_dir) if f.endswith(".png"))
        if not image_files:
            raise Exception("No PNG files found!")

        z_step = 5
        img_scale = 2.8
        fade_time = 1
        hold_time = 1.5
        fly_time = 2.5

        current_z = 0
        last_image = None

        for img in image_files:
            im = (
                ImageMobject(os.path.join(img_dir, img))
                .scale(img_scale)
                .move_to([0, 0, current_z])
            )

            self.add(im)
            self.play(FadeIn(im), run_time=fade_time)
            self.wait(hold_time)

            # ✅ Camera moves forward (version-safe)
            self.move_camera(
                frame_center=[0, 0, current_z + z_step],
                run_time=fly_time
            )

            if last_image:
                self.remove(last_image)

            last_image = im
            current_z += z_step

        self.wait(1)
