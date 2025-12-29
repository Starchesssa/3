from manim import *
import os

class PNGZDepthSequence(ThreeDScene):
    def construct(self):
        # ---------- Camera setup ----------
        self.set_camera_orientation(
            phi=70 * DEGREES,
            theta=-90 * DEGREES,
            focal_distance=10
        )

        # ---------- Load PNGs ----------
        img_dir = "MANIM/Imag_samples"
        image_files = sorted(
            f for f in os.listdir(img_dir) if f.endswith(".png")
        )

        if not image_files:
            raise Exception("No PNG files found!")

        z_step = 5        # distance between images
        img_scale = 2.8   # image size
        fly_time = 2.5    # time per image

        current_z = 0

        # Start camera behind
        self.camera.frame.move_to(ORIGIN + OUT * 6)

        # ---------- Loop twice ----------
        for _ in range(2):
            for img in image_files:
                im = ImageMobject(os.path.join(img_dir, img))
                im.scale(img_scale)
                im.move_to(ORIGIN + IN * current_z)

                self.add(im)

                # Move camera forward to the image
                self.play(
                    self.camera.frame.animate.move_to(
                        ORIGIN + IN * current_z
                    ),
                    run_time=fly_time,
                    rate_func=smooth
                )

                self.wait(0.3)

                # Remove image before next one
                self.remove(im)

                current_z += z_step

        self.wait(1)
