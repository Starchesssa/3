
from manim import *

class CompoundingHabits(Scene):
    def construct(self):
        # --- Seed of Change ---
        seed = Circle(radius=0.15, color=YELLOW, fill_opacity=1).shift(DOWN*2)
        self.play(FadeIn(seed))
        self.wait(0.5)

        # --- Growth into Sapling ---
        sapling = Line(seed.get_center(), seed.get_center() + UP*1.5, color=GREEN, stroke_width=6)
        self.play(Transform(seed, sapling))
        self.wait(0.5)

        # --- Gradual growth over years ---
        growth = sapling.copy()
        for i in range(1, 11):
            new_growth = growth.copy().scale(1 + i*0.05)
            self.play(Transform(growth, new_growth), run_time=0.4)
            self.wait(0.1)

        # --- Branching (compounding effect) ---
        tree = VGroup(growth)
        def add_branches(branch, depth=3):
            if depth == 0:
                return VGroup()
            branches_group = VGroup()
            for angle in [-PI/4, PI/6, PI/3]:
                new_branch = Line(
                    branch.get_end(),
                    branch.get_end() + rotate_vector(branch.get_vector(), angle)*0.7,
                    color=GREEN,
                    stroke_width=max(branch.get_stroke_width()*0.7, 1)
                )
                branches_group.add(new_branch)
                branches_group.add(*add_branches(new_branch, depth-1))
            return branches_group

        branches = add_branches(growth, depth=3)
        tree.add(branches)
        self.play(Create(branches), run_time=2)

        # --- Final flourish ---
        final_text = Text("Remarkable Results", font_size=48, color=GREEN).to_corner(UP)
        self.play(Write(final_text))
        self.wait(2)
