
from manim import *

class ParallaxScene(ThreeDScene):
    def construct(self):
        # Load background as a rectangle
        bg = Rectangle(width=14, height=8).set_fill(BLUE, opacity=1).move_to([0,0,-4])
        
        # Midground
        mid = Rectangle(width=10, height=6).set_fill(GREEN, opacity=1).move_to([0,0,-2])
        
        # Foreground
        fg = Rectangle(width=6, height=4).set_fill(RED, opacity=1).move_to([0,0,0])
        
        self.add(bg, mid, fg)
        
        # Camera start
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
        
        # Animate camera move = parallax effect
        self.play(self.camera.frame.animate.move_to([2,0,0]).set_euler_angles(theta=60*DEGREES))
        self.wait(1)
        self.play(self.camera.frame.animate.move_to([-2,0,0]).set_euler_angles(theta=-30*DEGREES))
        self.wait(1)
