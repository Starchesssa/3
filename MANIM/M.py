from manim import *
import os

class PNGZDepthSequence(ThreeDScene):
    def construct(self):
        # Camera setup
        phi_angle = 70 * DEGREES
        theta_angle = -90 * DEGREES
        camera_distance = 20

        self.set_camera_orientation(
            phi=phi_angle,
            theta=theta_angle,
            distance=camera_distance
        )

        # Load PNGs
        img_dir = "MANIM/Imag_samples"
        image_files = sorted(
            f for f in os.listdir(img_dir) if f.endswith(".png")
        )

        if not image_files:
            raise Exception("No PNG files found!")

        z_step = 5
        img_scale = 2.8
        fly_time = 2.5

        current_z = 0

        # Loop twice
        for _ in range(2):
            for img in image_files:
                im = ImageMobject(os.path.join(img_dir, img))
                im.scale(img_scale)
                im.move_to(ORIGIN + OUT * current_z)  # Z-axis placement

                self.add(im)
                self.play(FadeIn(im), run_time=0.5)

                # Move camera along Z
                self.move_camera(
                    phi=phi_angle,
                    theta=theta_angle,
                    distance=camera_distance,
                    focal_point=ORIGIN + OUT * current_z,
                    run_time=fly_time
                )

                self.wait(0.3)

                current_z += z_step

        self.wait(1)
