
from manim import *

class BannerAnimation(Scene):
    def construct(self):
        # Load and display background image
        image = ImageMobject("images (68).jpeg")
        image.scale_to_fit_height(config.frame_height)  # Fit the screen
        self.add(image)

        # Create text at bottom-left corner
        text = Text("5. Samsung S25 Ultra", font_size=36)
        text.to_corner(DOWN + LEFT)  # Bottom-left corner

        # Animate the text
        self.play(Write(text, run_time=2))
        self.wait(2)
