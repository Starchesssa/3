
from manim import *
import requests, os, random

class DroneTour(ThreeDScene):
    def fetch_image(self, prompt: str, filename: str):
        """Fetch image from Pollinations AI"""
        safe_prompt = prompt.replace(" ", "%20")
        url = f"https://image.pollinations.ai/prompt/{safe_prompt}"
        response = requests.get(url)
        if response.status_code == 200:
            with open(filename, "wb") as f:
                f.write(response.content)
        else:
            print(f"❌ Failed to fetch {filename}: {response.text}")

    def construct(self):
        if not os.path.exists("tour_images"):
            os.makedirs("tour_images")

        prompts = [
            "dark mysterious cave background",
            "lush tropical jungle scenery",
            "ancient ruins hidden in forest",
            "futuristic glowing city at night",
            "mountains with fog and clouds",
            "cosmic nebula background",
            "underwater coral reef with fishes"
        ]

        layers = []
        for i, prompt in enumerate(prompts):
            filename = f"tour_images/layer{i}.png"
            if not os.path.exists(filename):  # fetch once
                self.fetch_image(prompt, filename)
            img = ImageMobject(filename).scale(4).shift(OUT*(6-i)).shift(DOWN*(i*0.5))
            layers.append(img)

        # Add all layers (deepest first)
        for layer in layers[::-1]:
            self.add(layer)

        # Camera starting position
        self.set_camera_orientation(phi=70*DEGREES, theta=40*DEGREES)
        self.move_camera(frame_center=LEFT*3 + OUT*6, run_time=3)

        # Drone-like path: weave between layers
        total_time = 0
        for i, layer in enumerate(layers):
            target_pos = ORIGIN + OUT*(2-i) + RIGHT*(i%3 - 1) + UP*((i%2)*0.5)
            zoom = 12 - i*1.2
            self.play(
                self.camera.frame.animate.move_to(target_pos).set(width=zoom),
                run_time=7
            )
            self.wait(1)
            total_time += 8

        # If total < 60s, extend with ambient parallax
        remaining = max(0, 60-total_time)
        if remaining > 0:
            self.begin_ambient_camera_rotation(rate=0.05)
            self.wait(remaining)
            self.stop_ambient_camera_rotation()
