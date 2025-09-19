
from manim import *

class ChalkboardAnimation(Scene):
    def construct(self):
        self.camera.background_color = BLACK

        # 0.00 - 0.46: Key
        key = Star(color=YELLOW).scale(1.5).to_edge(UP)
        self.play(GrowFromCenter(key), run_time=0.46)
        self.wait(0.1)
        
        # 0.46 - 0.88: Lesson
        lesson_box = Rectangle(width=4, height=2, color=WHITE).next_to(key, DOWN)
        self.play(DrawBorderThenFill(lesson_box), run_time=0.42)
        self.wait(0.1)
        
        # 1.48 - 2.08: Ignore short-term reality
        # Example: two lines, short-term fluctuates, long-term trend
        axes = Axes(x_range=[0,5], y_range=[0,10])
        short_term = axes.plot_line_graph([0,1,2,3,4,5], [2,4,1,3,2,4], line_color=RED)
        long_term = axes.plot_line_graph([0,1,2,3,4,5], [1,2,3,4,5,6], line_color=GREEN)
        self.play(Create(axes), Create(short_term), Create(long_term), run_time=0.6)
        self.wait(0.1)
