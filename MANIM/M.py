from manim import *
import os

class PNGZDepthSequence(ThreeDScene):
    def construct(self):
        # Camera setup
        self.set_camera_orientation(phi=70*DEGREES, theta=-90*DEGREES)

        # Load PNGs
        img_dir = "MANIM/Imag_samples"
        image_files = sorted(f for f in os.listdir(img_dir) if f.endswith(".png"))
        if not image_files:
            raise Exception("No PNG files found!")

        z_step = 5
        img_scale = 2.8
        fly_time = 2.5
        current_z = 0

        for img in image_files:
            im = ImageMobject(os.path.join(img_dir, img)).scale(img_scale)
            im.move_to([0, 0, current_z])
            self.add(im)

            # Fade in and hold
            self.play(FadeIn(im), run_time=1)
            self.wait(2.5)

            # Camera glides forward
            self.play(
                self.camera.frame.animate.move_to([0, 0, current_z]),
                run_time=fly_time
            )

            current_z += z_step

        self.wait(1)
