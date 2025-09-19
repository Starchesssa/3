from manim import *

class ParallaxScene(ThreeDScene):
    def construct(self):
        # Background, Midground, Foreground
        bg = Rectangle(width=14, height=8).set_fill(BLUE, opacity=1).move_to([0,0,-4])
        mid = Rectangle(width=10, height=6).set_fill(GREEN, opacity=1).move_to([0,0,-2])
        fg = Rectangle(width=6, height=4).set_fill(RED, opacity=1).move_to([0,0,0])

        self.add(bg, mid, fg)

        # Set initial camera orientation
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES, distance=10)

        # Animate camera movement for parallax
        self.move_camera(phi=75*DEGREES, theta=60*DEGREES, distance=10, run_time=2)
        self.wait(1)
        self.move_camera(phi=75*DEGREES, theta=-30*DEGREES, distance=10, run_time=2)
        self.wait(1)
